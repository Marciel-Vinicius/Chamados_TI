// frontend/src/pages/TicketDetails.jsx
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

export default function TicketDetails() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [status, setStatus] = useState('');
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState([]);
  const [msg, setMsg] = useState('');
  const prevComments = useRef(null);
  const prevStatus = useRef(null);

  // fetch inicial + polling + foco
  useEffect(() => {
    fetchAll(false);
    const iv = setInterval(() => fetchAll(true), 5000);
    const onFocus = () => fetchAll(false);
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(iv);
      window.removeEventListener('focus', onFocus);
    };
  }, [id]);

  // busca ticket + comentários em conjunto
  const fetchAll = async (notify) => {
    try {
      const [resT, resC] = await Promise.all([
        axios.get(`/tickets/${id}`),
        axios.get(`/tickets/${id}/comments`)
      ]);
      const t = resT.data;
      const cList = resC.data;

      // status
      if (prevStatus.current === null) prevStatus.current = t.status;
      if (notify && Notification.permission === 'granted' && t.status !== prevStatus.current) {
        new Notification('Status alterado', {
          body: `Chamado está agora "${t.status}".`
        });
      }
      prevStatus.current = t.status;

      // comentários
      if (prevComments.current === null) prevComments.current = cList.length;
      if (notify && Notification.permission === 'granted' && cList.length > prevComments.current) {
        const added = cList.slice(prevComments.current);
        added.forEach(c =>
          new Notification('Novo comentário', {
            body: `${c.User.email}: ${c.content}`
          })
        );
      }
      prevComments.current = cList.length;

      // atualiza estado
      setTicket(t);
      setStatus(t.status);
      setComments(cList);
    } catch (err) {
      console.error('Erro ao buscar detalhes/comentários:', err);
    }
  };

  const postComment = async () => {
    if (!newComment.trim()) return;
    try {
      await axios.post(`/tickets/${id}/comments`, { content: newComment });
      setNewComment('');
      fetchAll(false);
    } catch (err) {
      console.error('Erro ao enviar comentário:', err);
    }
  };

  const updateStatus = async () => {
    try {
      const res = await axios.put(`/tickets/${id}/status`, { status });
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
      <p className="text-gray-600 mb-4">{ticket.category} • {ticket.priority}</p>
      <p className="mb-4">{ticket.description}</p>
      {ticket.attachment && (
        <p className="mb-4">
          <a href={ticket.attachment} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
            Ver anexo
          </a>
        </p>
      )}

      {ticket.User.role === 'TI' && (
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">Alterar Status</label>
          <div className="flex items-center gap-2">
            <select value={status} onChange={e => setStatus(e.target.value)} className="border px-3 py-2 rounded">
              <option>Aberto</option>
              <option>Em Andamento</option>
              <option>Fechado</option>
              <option>Cancelado</option>
            </select>
            <button onClick={updateStatus} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
              Atualizar
            </button>
          </div>
          {msg && <p className="mt-2 text-green-600">{msg}</p>}
        </div>
      )}

      <div className="mt-6">
        <h3 className="text-lg font-medium mb-2">Comentários</h3>
        {comments.length === 0 ? (
          <p className="text-gray-500">Sem comentários.</p>
        ) : (
          comments.map(c => (
            <div key={c.id} className="border p-3 rounded mb-3">
              <p className="text-gray-800">{c.content}</p>
              <p className="text-xs text-gray-500 mt-1">{c.User.email} • {new Date(c.createdAt).toLocaleString('pt-BR')}</p>
            </div>
          ))
        )}
        <textarea
          rows="3"
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
          className="w-full border px-3 py-2 rounded mb-2"
          placeholder="Escreva um comentário..."
        />
        <button onClick={postComment} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
          Enviar Comentário
        </button>
      </div>
    </div>
  );
}
