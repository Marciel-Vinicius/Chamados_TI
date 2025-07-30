// frontend/src/pages/MyTickets.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function MyTickets() {
    const [tickets, setTickets] = useState([]);

    useEffect(() => {
        const tk = localStorage.getItem('token');
        axios.defaults.headers.common['Authorization'] = `Bearer ${tk}`;
        axios.get('/tickets').then(res => setTickets(res.data));
    }, []);

    return (
        <div>
            <h2 className="text-2xl font-semibold mb-4">Meus Chamados</h2>
            {tickets.length === 0 ? (
                <p>Nenhum chamado encontrado.</p>
            ) : (
                tickets.map(t => (
                    <Link
                        to={`/tickets/${t.id}`}
                        key={t.id}
                        className="block mb-4 p-4 border rounded hover:shadow"
                    >
                        <div className="flex justify-between">
                            <span className="font-medium">{t.title}</span>
                            <span className="text-sm text-gray-500">{t.status}</span>
                        </div>
                        <div className="text-sm text-gray-600">{t.category} • {t.priority}</div>
                    </Link>
                ))
            )}
        </div>
    );
}
