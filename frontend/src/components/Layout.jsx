// frontend/src/components/Layout.jsx
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import NotificationBell from './NotificationBell';
import { useEffect, useState } from 'react';

const NavLink = ({ to, label }) => {
    const { pathname } = useLocation();
    const active = pathname === to;
    return (
        <Link
            to={to}
            className={`px-3 py-1.5 rounded-xl text-sm transition ${active ? 'bg-white/20 text-white' : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
        >
            {label}
        </Link>
    );
};

function UserMenu() {
    const nav = useNavigate();
    const [open, setOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('');

    useEffect(() => {
        try {
            const u = JSON.parse(localStorage.getItem('user') || '{}');
            setEmail(u?.email || '');
            setRole(u?.role || '');
        } catch (_) { }
    }, []);

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setOpen(false);
        nav('/login', { replace: true });
        // garante encerrar SSE e estados
        setTimeout(() => window.location.reload(), 50);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setOpen(v => !v)}
                className="text-sm text-white/90 hover:text-white px-3 py-1.5 rounded-xl hover:bg-white/10 transition"
            >
                {email || 'Conta'}{role ? ` (${role})` : ''}
            </button>
            {open && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-xl ring-1 ring-black/5 overflow-hidden">
                    <div className="px-4 py-3 border-b">
                        <p className="text-sm font-semibold text-gray-800">Conta</p>
                        <p className="text-xs text-gray-500 truncate">{email || '—'}</p>
                        <p className="text-xs text-gray-500">{role || '—'}</p>
                    </div>
                    <button
                        onClick={logout}
                        className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50"
                    >
                        Sair
                    </button>
                </div>
            )}
        </div>
    );
}

export default function Layout() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <header className="sticky top-0 z-20 backdrop-blur bg-slate-900/60 border-b border-white/10">
                <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-4">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="h-9 w-9 rounded-2xl bg-white/10 flex items-center justify-center">
                            <span className="text-white font-bold">TI</span>
                        </div>
                        <span className="text-white font-semibold">Chamados</span>
                    </Link>

                    <nav className="ml-6 hidden md:flex items-center gap-2">
                        <NavLink to="/tickets" label="Meus chamados" />
                        <NavLink to="/new" label="Abrir chamado" />
                        <NavLink to="/admin" label="Admin TI" />
                        <NavLink to="/config" label="Configurações" />
                    </nav>

                    <div className="ml-auto flex items-center gap-3">
                        <NotificationBell />
                        <UserMenu />
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-6xl px-4 py-6">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 md:p-6 shadow-xl">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
