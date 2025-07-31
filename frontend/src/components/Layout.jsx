// frontend/src/components/Layout.jsx
import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import axios from 'axios';
import { NotificationProvider } from '../contexts/NotificationContext';
import NotificationBell from './NotificationBell';

export default function Layout({ children }) {
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }, []);

    function logout() {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        navigate('/login');
    }

    return (
        <NotificationProvider>
            <div className="min-h-screen bg-gray-50">
                <header className="bg-white shadow-sm">
                    <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                        <div className="flex items-center gap-6">
                            <Link to="/tickets" className="text-xl font-semibold text-blue-600">
                                TI-Chamados
                            </Link>
                            <nav className="space-x-4">
                                <Link to="/tickets" className="hover:underline">Meus Chamados</Link>
                                <Link to="/tickets/new" className="hover:underline">Abrir Chamado</Link>
                                <Link to="/admin" className="hover:underline">Painel TI</Link>
                            </nav>
                        </div>
                        <div className="flex items-center gap-4">
                            <NotificationBell />
                            <button
                                onClick={logout}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </header>
                <main className="container mx-auto px-6 py-10">
                    <div className="bg-white rounded-2xl shadow-lg p-8">{children}</div>
                </main>
            </div>
        </NotificationProvider>
    );
}
