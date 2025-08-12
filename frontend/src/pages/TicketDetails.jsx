// frontend/src/pages/TicketDetails.jsx
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function TicketDetails() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [newC, setNewC] = useState('');
  const [busy, setBusy] = useState(true);
  const [err, setErr] = useState('');

  const load = async () => {
    setBusy(true); setErr('');
    try {
      const [{ data: t }, { data: cs }] = await Promise.all([
        axios.get(`/tickets/${id}`),
        axios.get(`/tickets/${id}/comments`),
      ]);
      setTicket(t); setComments(cs || []);
    } catch (e) {
      setErr('Falha ao carregar.');
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const addComment = async (e) => {
    e.preventDefault();
    if (!newC.trim()) return;
    try {
      const { data } = await axios.post(`/tickets/${id}/comments`, { content: newC.trim() });
      setComments(prev => [...prev, data]);
      setNewC('');
    } catch (e) {
      alert('Falha ao comentar.');
    }
  };

  if (busy) return <div className="text-white/80">Carregando...</div>;
  if (err) return <div className="text-red-300">{err}</div>;
  if (!ticket) return <div className="text-white/80">Chamado não encontrado.</div>;

  return (
    <div className="grid md:grid-cols-3 gap-4">
      <div className="md:col-span-2 bg-white rounded-2xl shadow p-6">
        <h2 className="text-xl font-semibold mb-1">{ticket.title || '-'}</h2>
        <p className="text-gray-600 mb-4">{ticket.description || '-'}</p>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><span className="text-gray-500">ID:</span> {ticket.id}</div>
          <div><span className="text-gray-500">Status:</span> {ticket.status || '-'}</div>
          <div><span className="text-gray-500">Categoria:</span> {ticket.category || ticket?.Category?.name || '-'}</div>
          <div><span className="text-gray-500">Prioridade:</span> {ticket.priority || ticket?.Priority?.name || '-'}</div>
          <div><span className="text-gray-500">Aberto por:</span> {ticket?.User?.email || '-'}</div>
          <div><span className="text-gray-500">Criado em:</span> {ticket.createdAt ? new Date(ticket.createdAt).toLocaleString() : '-'}</div>
        </div>

        {ticket.attachment && (
          <div className="mt-4">
            <a
              href={ticket.attachment}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 hover:underline"
            >
              Ver anexo
            </a>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow p-6">
        <h3 className="font-semibold mb-3">Comentários</h3>
        <div className="space-y-3 max-h-80 overflow-auto">
          {comments.map(c => (
            <div key={c.id} className="bg-gray-50 rounded-xl p-3">
              <div className="text-sm text-gray-900">{c.content}</div>
              <div className="text-[11px] text-gray-500 mt-1">
                {c?.User?.email || '—'} • {c.createdAt ? new Date(c.createdAt).toLocaleString() : '-'}
              </div>
            </div>
          ))}
          {comments.length === 0 && <div className="text-sm text-gray-500">Sem comentários.</div>}
        </div>

        <form onSubmit={addComment} className="mt-4 space-y-2">
          <textarea
            rows={3}
            className="w-full rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            value={newC}
            onChange={(e) => setNewC(e.target.value)}
            placeholder="Escreva um comentário..."
          />
          <button className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm">
            Enviar
          </button>
        </form>
      </div>
    </div>
  );
}
