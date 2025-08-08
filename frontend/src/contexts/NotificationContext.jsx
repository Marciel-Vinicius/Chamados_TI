// frontend/src/contexts/NotificationContext.jsx
import { createContext, useContext, useEffect, useState, useRef } from 'react';

const NotificationContext = createContext();
export const useNotifications = () => useContext(NotificationContext);

export function NotificationProvider({ children }) {
    const [notifications, setNotifications] = useState([]);
    const retryRef = useRef(1000);

    // Retorna o JWT puro
    const getToken = () => {
        const raw = localStorage.getItem('token') || '';
        return raw.replace(/^Bearer\s+/i, '').replace(/^"|"$/g, '');
    };

    const connect = () => {
        const base = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');
        const token = getToken();
        if (!token) {
            console.warn('[SSE] não conectado: token ausente');
            return;
        }

        const es = new EventSource(`${base}/tickets/stream?token=${token}`);
        es.onopen = () => {
            console.log('[SSE] conectado');
            retryRef.current = 1000;
        };

        es.addEventListener('notify', e => {
            const payload = JSON.parse(e.data);
            setNotifications(prev => {
                // Evita duplicados pelo mesmo payload.id
                if (prev.some(n => n.id === payload.id)) return prev;
                return [
                    {
                        id: payload.id,
                        type: payload.type,
                        message:
                            payload.type === 'new-ticket'
                                ? `Novo chamado: ${payload.title}`
                                : `Comentário em chamado #${payload.ticketId}`,
                        data: payload,
                        read: false,
                        timestamp: payload.createdAt,
                    },
                    ...prev,
                ];
            });
        });

        es.onerror = () => {
            console.error('[SSE] erro, reconectando em', retryRef.current, 'ms');
            es.close();
            setTimeout(connect, retryRef.current);
            retryRef.current = Math.min(retryRef.current * 2, 60000);
        };
    };

    useEffect(connect, []);

    const markAllRead = () =>
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    const markRead = id =>
        setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));

    return (
        <NotificationContext.Provider value={{ notifications, markAllRead, markRead }}>
            {children}
        </NotificationContext.Provider>
    );
}
