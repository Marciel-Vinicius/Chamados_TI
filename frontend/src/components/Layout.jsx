import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Layout({ children }) {
    const navigate = useNavigate();

    function handleLogout() {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        navigate('/login');
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <nav className="space-x-4">
                        <Link to="/" className="text-gray-600 hover:text-blue-500">Chamados</Link>
                        <Link to="/create" className="text-gray-600 hover:text-blue-500">Novo Chamado</Link>
                        <Link to="/admin" className="text-gray-600 hover:text-blue-500">Admin TI</Link>
                    </nav>
                    <button
                        onClick={handleLogout}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                    >
                        Logout
                    </button>
                </div>
            </header>
            <main className="container mx-auto px-4 py-8">
                {children}
            </main>
        </div>
    );
}
