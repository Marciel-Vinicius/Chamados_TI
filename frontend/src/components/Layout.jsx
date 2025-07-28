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
        <>
            <header className="header">
                <nav className="nav">
                    <Link to="/">Chamados</Link>
                    <Link to="/create">Novo Chamado</Link>
                    <Link to="/admin">Admin TI</Link>
                </nav>
                <button onClick={handleLogout}>Logout</button>
            </header>
            <main className="main">
                {children}
            </main>
        </>
    );
}
