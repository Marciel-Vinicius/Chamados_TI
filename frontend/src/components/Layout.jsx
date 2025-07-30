// frontend/src/components/Layout.jsx
import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import axios from 'axios';

export default function Layout({ children }) {
    const navigate = useNavigate();

    // configura axios e solicita permissão de notificação uma vez
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

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
                        <Link to="/tickets" className="hover:underline">Meus Chamados</Link>
                        <Link to="/tickets/new" className="hover:underline">Abrir Chamado</Link>
                        <Link to="/admin" className="hover:underline">Painel TI</Link>
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
