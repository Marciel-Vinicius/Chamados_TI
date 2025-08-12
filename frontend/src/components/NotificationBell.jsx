// frontend/src/components/NotificationBell.jsx
import { useEffect, useRef, useState } from 'react';
import { useNotifications } from '../contexts/NotificationContext';

export default function NotificationBell() {
    const { notifications, count, markAllAsRead } = useNotifications();
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const onClick = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('click', onClick);
        return () => document.removeEventListener('click', onClick);
    }, []);

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen(v => !v)}
                className="relative inline-flex items-center justify-center rounded-full p-2 hover:bg-white/10 transition"
                title="Notificações"
            >
                {/* ícone simples em SVG */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 stroke-white" fill="none" viewBox="0 0 24 24">
                    <path strokeWidth="1.5" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 21 10.5V10a9 9 0 1 0-18 0v.5a8.967 8.967 0 0 1 .69 5.272 23.85 23.85 0 0 0 5.454 1.31m5.713 0a24.255 24.255 0 0 1-11.426 0m11.426 0a3 3 0 1 1-5.713 0" />
                </svg>
                {count > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                        {count}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-96 max-w-[90vw] rounded-2xl bg-white shadow-xl ring-1 ring-black/5 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b">
                        <h4 className="font-semibold text-gray-800">Notificações</h4>
                        <button
                            onClick={() => { markAllAsRead(); setOpen(false); }}
                            className="text-sm text-blue-600 hover:underline"
                        >
                            Limpar tudo
                        </button>
                    </div>
                    <ul className="max-h-80 overflow-auto divide-y">
                        {notifications.length === 0 && (
                            <li className="px-4 py-6 text-sm text-gray-500">Sem novas notificações</li>
                        )}
                        {notifications.map((n) => (
                            <li key={n.id} className="px-4 py-3 hover:bg-gray-50">
                                <div className="flex items-start gap-3">
                                    <div className="mt-1 h-2.5 w-2.5 rounded-full bg-blue-500" />
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-900 font-medium">
                                            {n.title || n.type || 'Atualização'}
                                        </p>
                                        {n.message && (
                                            <p className="text-sm text-gray-600">{n.message}</p>
                                        )}
                                        <p className="text-[11px] text-gray-400 mt-1">
                                            {new Date(n.ts || Date.now()).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
