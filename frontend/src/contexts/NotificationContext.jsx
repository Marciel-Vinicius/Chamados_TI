// frontend/src/contexts/NotificationContext.jsx
import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';

const NotificationContext = createContext(null);

export function NotificationProvider({ children, apiBase }) {
    const [notifications, setNotifications] = useState([]);
    const idsRef = useRef(new Set()); // dedupe por id
    const esRef = useRef(null);
    const retryRef = useRef(1000); // backoff inicial 1s, máx 30s

    const token = useMemo(() => {
        const raw = localStorage.getItem('token') || '';
        return raw.replace(/^"|"$/g, ''); // sanitiza caso esteja com aspas
    }, []);

    useEffect(() => {
        if (!token) return;

        let didCancel = false;

        const connect = () => {
            const url = `${apiBase || import.meta.env.VITE_API_URL || 'http://localhost:3000'}/notifications/stream?token=${encodeURIComponent(token)}`;

            // Fecha conexão anterior (se houver)
            if (esRef.current) {
                try { esRef.current.close(); } catch { }
            }

            const es = new EventSource(url, { withCredentials: false });
            esRef.current = es;

            es.addEventListener('message', (evt) => {
                retryRef.current = 1000; // reset backoff ao receber algo

                try {
                    const data = JSON.parse(evt.data);
                    const id = data?.id || evt.lastEventId || `${Date.now()}-${Math.random()}`;
                    if (!idsRef.current.has(id)) {
                        idsRef.current.add(id);
                        setNotifications(prev => {
                            const next = [{ ...data, id, ts: Date.now() }, ...prev];
                            // mantém no máx 50 notificações
                            return next.slice(0, 50);
                        });
                    }
                } catch { }
            });

            es.onerror = () => {
                // Reconecta com backoff
                try { es.close(); } catch { }
                if (didCancel) return;
                const wait = Math.min(retryRef.current, 30000);
                setTimeout(() => connect(), wait);
                retryRef.current *= 2;
            };
        };

        connect();

        return () => {
            didCancel = true;
            try { esRef.current?.close(); } catch { }
        };
    }, [token, apiBase]);

    const markAllAsRead = () => setNotifications([]);

    const value = useMemo(() => ({
        notifications,
        count: notifications.length,
        markAllAsRead,
    }), [notifications]);

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
}

export const useNotifications = () => useContext(NotificationContext);
