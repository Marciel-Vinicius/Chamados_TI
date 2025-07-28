import { useEffect, useState } from 'react';
import axios from 'axios';

export default function AdminTickets() {
  const [tickets, setTickets] = useState([]);
  const API = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await axios.get(`${API}/tickets/all`, {
          headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
        });
        setTickets(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAll();
  }, [API]);

  const updateStatus = async (id, status) => {
    try {
      await axios.put(
        `${API}/tickets/${id}/status`,
        { status },
        { headers: { Authorization: 'Bearer ' + localStorage.getItem('token') } }
      );
      setTickets(prev =>
        prev.map(t => (t.id === id ? { ...t, status } : t))
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <h2 className="text-2xl font-semibold mb-4">Painel de Gerenciamento</h2>
      {tickets.map(t => (
        <div
          key={t.id}
          className="bg-white p-4 rounded-lg shadow flex justify-between items-center"
        >
          <div>
            <p className="font-medium">{t.title}</p>
            <p className="text-sm text-gray-600">{t.category} — {t.priority}</p>
          </div>
          <select
            value={t.status}
            onChange={e => updateStatus(t.id, e.target.value)}
            className="border px-2 py-1 rounded"
          >
            <option>Aberto</option>
            <option>Em andamento</option>
            <option>Concluído</option>
            <option>Cancelado</option>
          </select>
        </div>
      ))}
    </div>
  );
}
