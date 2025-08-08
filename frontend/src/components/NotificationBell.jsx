// frontend/src/components/NotificationBell.jsx
import { useState } from 'react';
import { useNotifications } from '../contexts/NotificationContext';

// um ícone de sino inline
const BellIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002
         6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67
         6.165 6 8.388 6 11v3.159c0 .538-.214
         1.055-.595 1.436L4 17h5m6 0v1a3 3 0
         11-6 0v-1m6 0H9" />
    </svg>
);

export default function NotificationBell() {
    const { notifications, markAllRead, markRead } = useNotifications();
    const unreadCount = notifications.filter(n => !n.read).length;
    const [open, setOpen] = useState(false);

    const toggle = () => {
        setOpen(o => !o);
        if (!open) markAllRead();
    };

    return (
        <div className="relative">
            <button onClick={toggle} className="relative p-1 focus:outline-none">
                <BellIcon />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">
                        {unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-lg z-50 overflow-auto max-h-96">
                    {notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-gray-500">
                            Sem novas notificações
                        </div>
                    ) : (
                        notifications.map(n => (
                            <div
                                key={n.id}
                                className={`p-3 border-b last:border-none ${n.read ? 'bg-gray-50' : 'bg-white'}`}
                            >
                                <p className="text-sm">{n.message}</p>
                                <p className="text-xs text-gray-400 mt-1">
                                    {new Date(n.timestamp).toLocaleString()}
                                </p>
                                {!n.read && (
                                    <button
                                        onClick={() => markRead(n.id)}
                                        className="mt-1 text-xs text-blue-600"
                                    >
                                        Marcar como lida
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
