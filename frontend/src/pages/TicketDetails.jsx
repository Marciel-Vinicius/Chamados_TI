// frontend/src/pages/TicketDetails.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

export default function TicketDetails() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [status, setStatus] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    axios
      .get(`http://localhost:3000/tickets/${id}`)
      .then(res => {
        setTicket(res.data);
        setStatus(res.data.status);
      })
      .catch(err => {
        console.error('Erro ao buscar detalhes:', err);
      });
  }, [id]);

  const updateStatus = async () => {
    try {
      const res = await axios.put(
        `http://localhost:3000/tickets/${id}/status`,
        { status }
      );
      setTicket(res.data);
      setMsg('Status atualizado!');
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      setMsg('Falha ao atualizar.');
    }
  };

  if (!ticket) return <p>Carregando...</p>;

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-2">{ticket.title}</h2>
      <p className="text-gray-600 mb-4">
        {ticket.category} • {ticket.priority}
      </p>
      <p className="mb-4">{ticket.description}</p>
      {ticket.attachment && (
        <p className="mb-4">
          <a
            href={`http://localhost:3000${ticket.attachment}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            Ver anexo
          </a>
        </p>
      )}
      <p className="mb-4">
        <b>Status:</b> {ticket.status}
      </p>

      {ticket.User?.role === 'TI' && (
        <div className="space-x-2">
          <select
            value={status}
            onChange={e => setStatus(e.target.value)}
            className="border px-2 py-1 rounded"
          >
            <option>Aberto</option>
            <option>Em Andamento</option>
            <option>Fechado</option>
          </select>
          <button
            onClick={updateStatus}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
          >
            Atualizar
          </button>
        </div>
      )}

      {msg && <p className="mt-2 text-green-600">{msg}</p>}
    </div>
  );
}
