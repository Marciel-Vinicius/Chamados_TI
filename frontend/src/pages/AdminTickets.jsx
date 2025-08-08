// frontend/src/pages/AdminTickets.jsx
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';

export default function AdminTickets() {
  const [tickets, setTickets] = useState([]);
  const [selected, setSelected] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const prevCount = useRef(null);
  const reconnectDelay = useRef(1000);
  const esRef = useRef(null);
  const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const formatDateTime = dt => new Date(dt).toLocaleString('pt-BR');

  async function fetchTickets(notify) {
    try {
      const { data: list } = await axios.get(`${API}/tickets/all`);
      if (prevCount.current != null && notify && Notification.permission === 'granted' && list.length !== prevCount.current) {
        new Notification('Atualização de chamados', { body: `Total agora: ${list.length}` });
      }
      prevCount.current = list.length;
      setTickets(list);
      if (selected) {
        const { data: det } = await axios.get(`${API}/tickets/${selected.id}`);
        setSelected(det);
        const { data: comm } = await axios.get(`${API}/tickets/${selected.id}/comments`);
        setComments(comm);
      }
    } catch (err) {
      console.error(err);
    }
  }

  const setupSSE = () => {
    Notification.requestPermission();
    esRef.current?.close();
    const token = localStorage.getItem('token');
    if (!token) return;
    const es = new EventSource(`${API}/tickets/stream?token=${token}`);
    esRef.current = es;
    es.addEventListener('notify', e => {
      const p = JSON.parse(e.data);
      if (Notification.permission === 'granted') {
        if (p.type === 'new-ticket') new Notification('Novo chamado', { body: p.title });
        if (p.type === 'new-comment') new Notification('Comentário novo', { body: p.content });
      }
      fetchTickets(true);
    });
    es.onerror = () => {
      es.close();
      setTimeout(setupSSE, reconnectDelay.current);
      reconnectDelay.current = Math.min(reconnectDelay.current * 2, 60000);
    };
  };

  useEffect(() => {
    fetchTickets(false);
    setupSSE();
    return () => esRef.current?.close();
  }, []);

  const selectTicket = async t => {
    setSelected(t);
    const { data: comm } = await axios.get(`${API}/tickets/${t.id}/comments`);
    setComments(comm);
  };

  const addComment = async () => {
    if (!newComment.trim()) return;
    const { data } = await axios.post(`${API}/tickets/${selected.id}/comments`, { content: newComment.trim() });
    setComments(prev => [...prev, data]);
    setNewComment('');
    if (Notification.permission === 'granted') {
      new Notification('Comentário adicionado', { body: data.content });
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="lg:w-1/3 space-y-3">
        <h3 className="text-xl font-semibold">Lista de Chamados</h3>
        {tickets.length ? tickets.map(t => (
          <div
            key={t.id}
            onClick={() => selectTicket(t)}
            className={`border rounded-lg p-3 cursor-pointer transition ${!t.viewedByTI ? 'bg-yellow-50' : 'bg-white'}`}
          >
            <div className="font-medium truncate">{t.title}</div>
            <div className="text-sm text-gray-500 truncate">
              {t.Category?.name || t.category} • {t.Priority?.name || t.priority}
            </div>
            <div className="text-xs text-gray-400">{formatDateTime(t.createdAt)}</div>
            {!t.viewedByTI && <span className="ml-2 bg-yellow-200 text-yellow-800 px-2 py-1 rounded text-xs">Novo</span>}
          </div>
        )) : (
          <p className="text-gray-600">Nenhum chamado encontrado.</p>
        )}
      </div>

      {selected && (
        <div className="flex-1 bg-white shadow rounded-lg p-6">
          <h3 className="text-2xl font-semibold mb-4">{selected.title}</h3>

          <div className="mb-4">
            <label className="font-medium mr-2">Status:</label>
            <select
              value={selected.status}
              onChange={async e => {
                const { data } = await axios.put(`${API}/tickets/${selected.id}/status`, { status: e.target.value });
                setSelected(data);
                fetchTickets(false);
              }}
              className="border border-gray-300 rounded px-2 py-1"
            >
              <option value="Pendente">Pendente</option>
              <option value="Em andamento">Em andamento</option>
              <option value="Fechado">Fechado</option>
            </select>
          </div>

          <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-600">
            <span>{selected.Category?.name || selected.category} • {selected.Priority?.name || selected.priority}</span>
            {selected.Reason && <span>Motivo: {selected.Reason.name}</span>}
            <span>Aberto em: {formatDateTime(selected.createdAt)}</span>
            <span>Criador: {selected.User?.email || '—'}</span>
          </div>

          <p className="mb-6 whitespace-pre-wrap">{selected.description}</p>

          {selected.attachment && (
            <div className="mb-6">
              <a
                href={`${API}${selected.attachment}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                Ver anexo
              </a>
            </div>
          )}

          <div className="space-y-4 mb-6">
            {comments.map(c => (
              <div key={c.id} className="border-t pt-3 text-gray-700">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>{c.User?.email}</span>
                  <span>{formatDateTime(c.createdAt)}</span>
                </div>
                <p>{c.content}</p>
              </div>
            ))}
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
              onClick={addComment}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Enviar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
