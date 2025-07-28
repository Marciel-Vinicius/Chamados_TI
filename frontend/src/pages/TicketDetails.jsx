import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

export default function TicketDetails() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const API = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetch = async () => {
      try {
        const tRes = await axios.get(`${API}/tickets`, {
          headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
        });
        setTicket(tRes.data.find(t => t.id === +id));

        const cRes = await axios.get(`${API}/tickets/${id}/comments`, {
          headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
        });
        setComments(cRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetch();
  }, [API, id]);

  const role = localStorage.getItem('role');

  const changeStatus = async e => {
    try {
      await axios.put(
        `${API}/tickets/${id}/status`,
        { status: e.target.value },
        { headers: { Authorization: 'Bearer ' + localStorage.getItem('token') } }
      );
      setStatusMsg('Status atualizado com sucesso!');
      setTicket(prev => ({ ...prev, status: e.target.value }));
    } catch {
      setStatusMsg('Erro ao atualizar status.');
    }
  };

  const postComment = async () => {
    if (!newComment.trim()) return;
    try {
      const res = await axios.post(
        `${API}/tickets/${id}/comments`,
        { content: newComment },
        { headers: { Authorization: 'Bearer ' + localStorage.getItem('token') } }
      );
      setComments(prev => [...prev, res.data]);
      setNewComment('');
    } catch {
      setStatusMsg('Erro ao adicionar comentário.');
    }
  };

  if (!ticket) return <p>Carregando...</p>;

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {statusMsg && (
        <div className="p-3 bg-blue-100 text-blue-800 rounded">{statusMsg}</div>
      )}

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-semibold mb-2">{ticket.title}</h2>
        <p className="mb-2">{ticket.description}</p>
        <p className="mb-2">
          <strong>Status:</strong> {ticket.status}
        </p>
        {ticket.attachment && (
          <a
            href={`${API}${ticket.attachment}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Baixar anexo
          </a>
        )}

        {role === 'TI' && (
          <div className="mt-4">
            <label className="block font-medium mb-1">Alterar Status</label>
            <select
              value={ticket.status}
              onChange={changeStatus}
              className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option>Aberto</option>
              <option>Em andamento</option>
              <option>Concluído</option>
              <option>Cancelado</option>
            </select>
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-2">Comentários</h3>
        {comments.map(c => (
          <div key={c.id} className="mb-2 p-3 border rounded">
            {c.content}
          </div>
        ))}

        {role === 'TI' && (
          <div className="mt-4 space-y-2">
            <textarea
              rows={3}
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Digite um comentário..."
            />
            <button
              onClick={postComment}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              Adicionar Comentário
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
