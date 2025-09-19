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
    return `${base}/tickets/stream?token=${encodeURIComponent(token)}`;
};

export function NotificationProvider({ children, onEvent }) {
    const [notifications, setNotifications] = useState([]);
    const esRef = useRef(null);
    const retryRef = useRef(1000); // backoff (1s, 2s, 4s...)

    useEffect(() => {
        const connect = () => {
            const url = buildStreamUrl();
            const token = getCleanToken();
            if (!token) {
                console.warn('[SSE] token ausente, não conectando.');
                return;
            }
            if (esRef.current) esRef.current.close();

            const es = new EventSource(url);
            esRef.current = es;

            es.addEventListener('connected', (e) => {
                retryRef.current = 1000;
            });

            es.addEventListener('notify', (e) => {
                try {
                    const payload = JSON.parse(e.data);
                    // callback externo (toasts)
                    if (onEvent) onEvent(payload);

                    // mantemos também uma lista de notificações simples
                    setNotifications(prev => {
                        const id = Math.random().toString(36).slice(2);
                        const title = payload.type === 'new-ticket'
                            ? 'Novo chamado'
                            : payload.type === 'new-comment'
                                ? 'Novo comentário'
                                : (payload.type || 'Notificação');

                        const message = payload.type === 'new-ticket'
                            ? (payload.ticket?.title || 'Chamado criado')
                            : payload.type === 'new-comment'
                                ? `Atualização no chamado #${payload.ticketId}`
                                : '';

                        const item = { id, type: payload.type, title, message, read: false, at: Date.now() };
                        return [item, ...prev].slice(0, 100); // limite de 100
                    });
                } catch (err) {
                    console.warn('[SSE notify] erro ao parsear', err);
                }
            });

            es.addEventListener('ping', () => {/* keep-alive */ });

            es.addEventListener('error', () => {
                es.close();
                // backoff exponencial (até ~30s)
                retryRef.current = Math.min(retryRef.current * 2, 30000);
                setTimeout(connect, retryRef.current);
            });
        };

        connect();
        return () => {
            if (esRef.current) {
                esRef.current.close();
                esRef.current = null;
            }
        };
    }, [onEvent]);

    const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    const markRead = (id) => setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));

    return (
        <NotificationContext.Provider value={{ notifications, markAllRead, markRead }}>
            {children}
        </NotificationContext.Provider>
    );
}
