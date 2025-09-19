// frontend/src/pages/TicketDetails.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';

export default function TicketDetails() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [status, setStatus] = useState('');
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState([]);
  const [msg, setMsg] = useState('');
  const { show } = useToast();

  const API = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');
  const headers = { Authorization: 'Bearer ' + localStorage.getItem('token') };

  const load = async () => {
    try {
      const res = await axios.get(`${API}/tickets/${id}`, { headers });
      setTicket(res.data);
      setStatus(res.data.status || '');

      const c = await axios.get(`${API}/tickets/${id}/comments`, { headers });
      setComments(c.data || []);
    } catch (err) {
      setMsg('Erro ao carregar ticket.');
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  const postComment = async () => {
    const content = newComment.trim();
    if (!content) return;
    try {
      await axios.post(`${API}/tickets/${id}/comments`, { content }, { headers });
      setNewComment('');
      await load();
      show('Comentário enviado.', { type: 'success', title: 'Comentário' });
    } catch (err) {
      const m = err?.response?.data?.message || 'Erro ao enviar comentário.';
      show(m, { type: 'error' });
    }
  };

  const updateStatus = async () => {
    try {
      await axios.put(`${API}/tickets/${id}`, { status }, { headers });
      await load();
      show('Status atualizado.', { type: 'success', title: 'Status' });
    } catch (err) {
      const m = err?.response?.data?.message || 'Erro ao atualizar status.';
      show(m, { type: 'error' });
    }
  };

  if (!ticket) return <div className="text-slate-500">Carregando…</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold">{ticket.title}</h1>
          <p className="text-slate-600 mt-1">{ticket.description}</p>
          <div className="mt-2 text-sm text-slate-600">
            Categoria: <b>{ticket.category?.name || ticket.category}</b> •{' '}
            Prioridade: <b>{ticket.priority?.name || ticket.priority}</b> •{' '}
            Status: <b>{ticket.status}</b>
          </div>
        </div>

        <div className="w-56">
          <label className="block text-sm font-medium mb-1">Atualizar status</label>
          <select
            className="w-full border rounded px-3 py-2 bg-white"
            value={status}
            onChange={e => setStatus(e.target.value)}
          >
            {['Aberto', 'Em Andamento', 'Fechado', 'Concluído'].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button
            onClick={updateStatus}
            className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded"
          >
            Salvar
          </button>
        </div>
      </div>

      <div>
        <h2 className="font-semibold mb-2">Comentários</h2>
        <div className="space-y-3">
          {comments.map(c => {
            // Fallbacks de alias: user | User | author | createdBy | userEmail | email
            const authorEmail =
              c.user?.email ||
              c.User?.email ||
              c.author?.email ||
              c.createdBy?.email ||
              c.userEmail ||
              c.email ||
              '—';

            const content = c.content ?? c.text ?? c.message ?? '';

            return (
              <div key={c.id} className="border rounded p-3">
                <div className="text-sm text-slate-600 mb-1">
                  {authorEmail} — {new Date(c.createdAt).toLocaleString()}
                </div>
                <div>{content}</div>
              </div>
            );
          })}
        </div>

        <div className="mt-4">
          <textarea
            rows="3"
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            className="w-full border px-3 py-2 rounded mb-2"
            placeholder="Escreva um comentário..."
          />
        </div>
        <button
          onClick={postComment}
          disabled={!newComment.trim()}
          className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded"
        >
          Enviar Comentário
        </button>
        {msg && <div className="text-sm text-red-600 mt-2">{msg}</div>}
      </div>
    </div>
  );
}
