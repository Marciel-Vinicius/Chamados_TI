// frontend/src/pages/TicketDetails.jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

export default function TicketDetails() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    axios.get(`/tickets/${id}`).then(res => setTicket(res.data));
    axios.get(`/tickets/${id}/comments`).then(res => setComments(res.data));
  }, [id]);

  const submitComment = async () => {
    if (!newComment.trim()) return;
    const { data } = await axios.post(`/tickets/${id}/comments`, { content: newComment.trim() });
    setComments(prev => [...prev, data]);
    setNewComment('');
  };

  if (!ticket) return <p>Carregando…</p>;

  return (
    <div className="max-w-3xl mx-auto bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-semibold mb-4">{ticket.title}</h2>
      <p className="text-secondary mb-2">
        Categoria: {ticket.Category?.name || ticket.category} · Prioridade: {ticket.Priority?.name || ticket.priority}
      </p>
      <p className="mb-6 whitespace-pre-wrap">{ticket.description}</p>

      {ticket.attachment && (
        <div className="mb-6">
          <h3 className="font-medium mb-2">Anexo</h3>
          <a
            href={ticket.attachment}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            {ticket.attachment.split('/').pop()}
          </a>
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-3">Comentários</h3>
        {comments.length ? (
          comments.map(c => (
            <div key={c.id} className="mb-4 border-b pb-2">
              <p className="text-sm text-secondary">{c.User?.email || c.user?.name}</p>
              <p>{c.content}</p>
              <p className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleString()}</p>
            </div>
          ))
        ) : (
          <p>Nenhum comentário ainda.</p>
        )}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none"
          placeholder="Adicionar comentário"
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
        />
        <button
          onClick={submitComment}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Enviar
        </button>
      </div>
    </div>
  );
}
