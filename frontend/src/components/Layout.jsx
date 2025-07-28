import { NavLink, Outlet, useNavigate } from 'react-router-dom';

export default function Layout() {
    const navigate = useNavigate();
    const role = localStorage.getItem('role');

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-100">
            <header className="bg-blue-600 text-white flex items-center justify-between px-6 py-4 shadow-lg">
                <h1 className="text-2xl font-semibold">Sistema de Chamados TI</h1>
                <nav className="space-x-4">
                    <NavLink
                        to="/tickets"
                        className={({ isActive }) =>
                            (isActive ? 'underline ' : '') + 'hover:opacity-80'
                        }
                    >
                        Meus Chamados
                    </NavLink>
                    <NavLink
                        to="/tickets/new"
                        className={({ isActive }) =>
                            (isActive ? 'underline ' : '') + 'hover:opacity-80'
                        }
                    >
                        Novo Chamado
                    </NavLink>
                    {role === 'TI' && (
                        <NavLink
                            to="/admin"
                            className={({ isActive }) =>
                                (isActive ? 'underline ' : '') + 'hover:opacity-80'
                            }
                        >
                            Painel TI
                        </NavLink>
                    )}
                </nav>
                <button
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded transition"
                >
                    Logout
                </button>
            </header>

            <main className="flex-1 p-6">
                <Outlet />
            </main>
        </div>
    );
}
