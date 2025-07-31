// frontend/src/components/NotificationBell.jsx
import { useState } from 'react';
import { useNotifications } from '../contexts/NotificationContext';

export default function NotificationBell() {
    const { notifications, markAllRead, markRead } = useNotifications();
    const unread = notifications.filter(n => !n.read);
    const [open, setOpen] = useState(false);

    const handleToggle = () => {
        setOpen(o => !o);
        markAllRead();
    };

    return (
        <div className="relative">
            <button
                onClick={handleToggle}
                className="relative p-2 focus:outline-none"
                aria-label="Notificações"
            >
                <span className="text-2xl">🔔</span>
                {unread.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-1">
                        {unread.length}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-96 bg-white border rounded shadow-lg z-50">
                    <div className="flex justify-between items-center p-2 border-b">
                        <span className="font-semibold">Notificações</span>
                        <button
                            onClick={() => markAllRead()}
                            className="text-sm text-blue-600"
                        >
                            Marcar todas como lidas
                        </button>
                    </div>
                    <div className="max-h-80 overflow-auto">
                        {notifications.length === 0 && (
                            <p className="p-3 text-sm text-gray-500">
                                Sem notificações
                            </p>
                        )}
                        {notifications.map(n => (
                            <div
                                key={n.id}
                                className={`p-3 border-b flex justify-between ${n.read ? 'bg-gray-100' : 'bg-white'
                                    }`}
                            >
                                <div>
                                    {n.type === 'new-ticket' ? (
                                        <p className="text-sm">
                                            <strong>Novo Chamado:</strong> {n.ticket.title}
                                        </p>
                                    ) : (
                                        <p className="text-sm">
                                            <strong>Comentário:</strong> {n.comment.content}
                                        </p>
                                    )}
                                    <p className="text-xs text-gray-500 mt-1">
                                        {n.type === 'new-ticket'
                                            ? `Categoria: ${n.ticket.category}`
                                            : `De: ${n.comment.User?.email || 'Desconhecido'}`}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        {new Date(n.receivedAt).toLocaleTimeString('pt-BR')}
                                    </p>
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
