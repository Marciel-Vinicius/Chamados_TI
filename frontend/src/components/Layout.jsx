// frontend/src/components/Layout.jsx
import { Link, NavLink, useNavigate } from 'react-router-dom';

export default function Layout({ children }) {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login', { replace: true });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <Link to="/tickets" className="text-2xl font-bold text-blue-600">
                        TI-Chamados
                    </Link>

                    <nav className="flex space-x-6 text-gray-700 font-medium">
                        <NavLink
                            to="/tickets"
                            className={({ isActive }) =>
                                isActive ? 'text-blue-600' : 'hover:text-blue-600'
                            }
                        >
                            Meus Chamados
                        </NavLink>
                        <NavLink
                            to="/tickets/new"
                            className={({ isActive }) =>
                                isActive ? 'text-blue-600' : 'hover:text-blue-600'
                            }
                        >
                            Abrir Chamado
                        </NavLink>
                        <NavLink
                            to="/admin"
                            className={({ isActive }) =>
                                isActive ? 'text-blue-600' : 'hover:text-blue-600'
                            }
                        >
                            Painel TI
                        </NavLink>
                        <NavLink
                            to="/config-ti"
                            className={({ isActive }) =>
                                isActive ? 'text-blue-600' : 'hover:text-blue-600'
                            }
                        >
                            Configurações TI
                        </NavLink>
                    </nav>

                    <div className="flex items-center space-x-4">
                        {/* Sino de notificações simples */}
                        <button
                            onClick={() => { }}
                            className="p-2 rounded-full hover:bg-gray-200"
                            aria-label="Notificações"
                        >
                            🔔
                        </button>

                        <button
                            onClick={handleLogout}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
        </div>
    );
}
