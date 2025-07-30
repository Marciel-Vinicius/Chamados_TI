import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Layout({ children }) {
    const navigate = useNavigate();

    function logout() {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        navigate('/login');
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <Link to="/tickets" className="text-xl font-semibold text-blue-600">
                        TI‑Chamados
                    </Link>
                    <nav className="space-x-4">
                        <Link to="/tickets" className="hover:underline">
                            Meus Chamados
                        </Link>
                        <Link to="/tickets/new" className="hover:underline">
                            Abrir Chamado
                        </Link>
                        <button
                            onClick={logout}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                        >
                            Logout
                        </button>
                    </nav>
                </div>
            </header>
            <main className="container mx-auto px-6 py-10">
                <div className="bg-white rounded-2xl shadow-lg p-8">{children}</div>
            </main>
        </div>
    );
}
