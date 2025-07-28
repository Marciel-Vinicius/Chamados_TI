import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function TicketList() {
  const [tickets, setTickets] = useState([]);
  const API = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await axios.get(`${API}/tickets`, {
          headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
        });
        setTickets(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTickets();
  }, [API]);

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Meus Chamados</h2>
      {tickets.length === 0 ? (
        <p className="text-gray-600">Nenhum chamado encontrado.</p>
      ) : (
        <ul className="space-y-4">
          {tickets.map(t => (
            <li key={t.id} className="bg-white p-4 rounded-lg shadow hover:shadow-md transition">
              <Link to={`/tickets/${t.id}`} className="flex justify-between items-center">
                <span className="font-medium">{t.title}</span>
                <span
                  className={
                    'px-2 py-1 rounded text-sm ' +
                    (t.status === 'Aberto' ? 'bg-green-100 text-green-800' :
                      t.status === 'Em andamento' ? 'bg-yellow-100 text-yellow-800' :
                        t.status === 'Concluído' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800')
                  }
                >
                  {t.status}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
