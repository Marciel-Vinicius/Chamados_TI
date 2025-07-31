// frontend/src/contexts/NotificationContext.jsx
import { createContext, useContext, useEffect, useState, useRef } from 'react';

const NotificationContext = createContext();
export const useNotifications = () => useContext(NotificationContext);

const getCleanToken = () => {
    let token = localStorage.getItem('token') || '';
    token = token.trim();
    if (token.startsWith('Bearer ')) token = token.slice(7);
    if (token.startsWith('"') && token.endsWith('"')) token = token.slice(1, -1);
    return token;
};

const buildStreamUrl = () => {
    const base = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');
    const token = getCleanToken();
    if (!token) return null;
    return `${base}/tickets/stream?token=${encodeURIComponent(token)}`;
};

export function NotificationProvider({ children }) {
    const [notifications, setNotifications] = useState([]);
    const esRef = useRef(null);
    const retryRef = useRef(1000);

    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
        connect();
        return () => {
            if (esRef.current) esRef.current.close();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const connect = () => {
        const url = buildStreamUrl();
        if (!url) {
            console.warn('[SSE] nenhum token disponível, não conectando.');
            return;
        }
        console.log('[SSE] conectando em', url);
        if (esRef.current) esRef.current.close();

        const es = new EventSource(url);
        esRef.current = es;

        es.addEventListener('connected', (e) => {
            console.log('[SSE] conectado:', e.data);
            retryRef.current = 1000;
        });

        es.addEventListener('notify', (e) => {
            let data;
            try {
                data = JSON.parse(e.data);
            } catch (err) {
                console.error('[SSE] parse error:', err);
                return;
            }
            const id = Date.now().toString(36) + Math.random().toString(36, 5);
            const notification = { ...data, id, read: false, receivedAt: new Date() };
            setNotifications(prev => [notification, ...prev]);

            if ('Notification' in window && Notification.permission === 'granted') {
                let title = '';
                let body = '';
                if (data.type === 'new-ticket') {
                    title = 'Novo chamado';
                    body = data.ticket.title;
                } else if (data.type === 'new-comment') {
                    title = 'Novo comentário';
                    body = `${data.comment.User?.email || 'Alguém'}: ${data.comment.content}`;
                }
                new Notification(title, { body });
            }
        });

        es.onerror = (err) => {
            console.warn('[SSE] erro/desconectado. Reconectando em', retryRef.current, 'ms');
            es.close();
            setTimeout(() => {
                retryRef.current = Math.min(retryRef.current * 2, 30000);
                connect();
            }, retryRef.current);
        };
    };

    const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    const markRead = (id) => setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));

    return (
        <NotificationContext.Provider value={{ notifications, markAllRead, markRead }}>
            {children}
        </NotificationContext.Provider>
    );
}
