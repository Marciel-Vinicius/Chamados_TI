// frontend/src/pages/MyTickets.jsx
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function MyTickets() {
    const [tickets, setTickets] = useState([]);
    const prevCount = useRef(null);

    // fetch inicial + polling + foco
    useEffect(() => {
        fetchTickets(false);
        const iv = setInterval(() => fetchTickets(true), 5000);
        const onFocus = () => fetchTickets(false);
        window.addEventListener('focus', onFocus);
        return () => {
            clearInterval(iv);
            window.removeEventListener('focus', onFocus);
        };
    }, []);

    const fetchTickets = async (notify) => {
        try {
            const res = await axios.get('/tickets');
            const list = res.data;

            // inicializa prevCount
            if (prevCount.current === null) {
                prevCount.current = list.length;
            }

            // notificar novos
            if (notify && Notification.permission === 'granted' && list.length > prevCount.current) {
                const added = list.slice(prevCount.current);
                added.forEach(t =>
                    new Notification('Novo chamado criado', {
                        body: t.title
                    })
                );
            }

            prevCount.current = list.length;
            setTickets(list);
        } catch (err) {
            console.error('Erro ao buscar meus chamados:', err);
        }
    };

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
                        <div className="text-sm text-gray-600">
                            {t.category} • {t.priority}
                        </div>
                    </Link>
                ))
            )}
        </div>
    );
}
