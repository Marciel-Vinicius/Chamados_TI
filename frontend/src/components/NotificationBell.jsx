// frontend/src/components/NotificationBell.jsx
import { useState } from 'react';
import { useNotifications } from '../contexts/NotificationContext';

export default function NotificationBell() {
    const { notifications, markAllRead, markRead } = useNotifications();
    const unread = notifications.filter(n => !n.read);
    const [open, setOpen] = useState(false);

    const toggle = () => {
        setOpen(o => !o);
        markAllRead();
    };

    return (
        <div className="relative">
            <button
                onClick={toggle}
                aria-label="Abrir notificações"
                className="relative rounded-full p-2 hover:bg-white/40 transition"
            >
                <span className="text-2xl">🔔</span>
                {unread.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] leading-3 px-1.5 py-0.5 rounded-full border border-white">
                        {unread.length}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-80 bg-white/95 backdrop-blur border rounded-xl shadow-xl overflow-hidden z-50">
                    <div className="flex items-center justify-between px-3 py-2 border-b">
                        <span className="font-semibold">Notificações</span>
                        <button onClick={() => markAllRead()} className="text-sm text-blue-600">
                            Marcar todas lidas
                        </button>
                    </div>

                    <div className="max-h-64 overflow-auto">
                        {notifications.length === 0 && (
                            <p className="p-3 text-sm text-gray-500">Sem notificações</p>
                        )}

                        {notifications.map(n => (
                            <div
                                key={n.id}
                                className={`p-3 border-b flex justify-between ${n.read ? 'bg-gray-100' : 'bg-white'}`}
                            >
                                <div className="pr-3">
                                    <div className="text-sm font-medium">{n.title || n.type}</div>
                                    <div className="text-xs text-gray-600">{n.message}</div>
                                </div>
                                {!n.read && (
                                    <button
                                        onClick={() => markRead(n.id)}
                                        className="text-xs text-blue-600 self-start"
                                    >
                                        Ler
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
