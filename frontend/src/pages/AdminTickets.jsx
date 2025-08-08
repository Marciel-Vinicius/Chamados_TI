// frontend/src/pages/AdminTickets.jsx
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';

export default function AdminTickets() {
  const [tickets, setTickets] = useState([]);
  const [selected, setSelected] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const prevCount = useRef(null);
  const reconnectDelay = useRef(1000);
  const esRef = useRef(null);
  const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  // Formata data/hora em pt-BR
  const formatDateTime = iso =>
    iso
      ? new Date(iso).toLocaleString('pt-BR', { hour12: false })
      : '';

  // Define header auth
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }, []);

  // Carrega tickets + SSE + polling
  useEffect(() => {
    fetchAll();
    setupSSE();
    const iv = setInterval(() => fetchTickets(true), 5000);
    return () => {
      clearInterval(iv);
      esRef.current?.close();
    };
  }, [selected]);

  async function fetchAll() {
    await fetchTickets(false);
  }
  async function fetchTickets(notify) {
    try {
      const res = await axios.get(`${API}/tickets/all`);
      const list = res.data;

      // notificação
      if (prevCount.current != null && notify && Notification.permission === 'granted' && list.length !== prevCount.current) {
        new Notification('Atualização de chamados', { body: `Total agora: ${list.length}` });
      }
      prevCount.current = list.length;
      setTickets(list);

      // atualiza detalhe se aberto
      if (selected) {
        const det = await axios.get(`${API}/tickets/${selected.id}`);
        setSelected(det.data);
        const comm = await axios.get(`${API}/tickets/${selected.id}/comments`);
        setComments(comm.data);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(
        err.response?.status === 403
          ? 'Sem permissão para ver todos os chamados.'
          : 'Erro ao buscar chamados. Veja console.'
      );
    }
  }

  async function selectTicket(ticket) {
    setSelected(null);
    try {
      const { data: det } = await axios.get(`${API}/tickets/${ticket.id}`);
      setSelected(det);
      const { data: comm } = await axios.get(`${API}/tickets/${ticket.id}/comments`);
      setComments(comm);
    } catch (err) {
      console.error(err);
    }
  }

  async function addComment() {
    if (!newComment.trim() || !selected) return;
    try {
      const { data } = await axios.post(
        `${API}/tickets/${selected.id}/comments`,
        { content: newComment.trim() }
      );
      setComments(c => [...c, data]);
      setNewComment('');
      if (Notification.permission === 'granted') {
        new Notification('Comentário adicionado', { body: data.content });
      }
    } catch (err) {
      console.error(err);
    }
  }

  function setupSSE() {
    esRef.current?.close();
    const token = localStorage.getItem('token');
    if (!token) return;
    const es = new EventSource(`${API.replace(/\/+$/, '')}/tickets/stream?token=${token}`);
    esRef.current = es;
    es.addEventListener('notify', e => {
      const p = JSON.parse(e.data);
      if (Notification.permission === 'default') Notification.requestPermission();
      if (Notification.permission === 'granted') {
        if (p.type === 'new-ticket') {
          new Notification('Novo chamado', { body: p.ticket.title });
        } else if (p.type === 'new-comment') {
          new Notification('Comentário novo', { body: p.comment?.content || '' });
        }
      }
      fetchTickets(true);
    });
    es.onerror = () => {
      es.close();
      setTimeout(() => {
        reconnectDelay.current = Math.min(reconnectDelay.current * 2, 30000);
        setupSSE();
      }, reconnectDelay.current);
    };
    es.onopen = () => (reconnectDelay.current = 1000);
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <h2 className="text-3xl font-bold mb-6">Painel TI</h2>
      {errorMsg && (
        <div className="mb-6 p-3 bg-red-100 text-red-800 rounded-lg">{errorMsg}</div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Lista de Chamados */}
        <div className="lg:w-1/3 space-y-3">
          <h3 className="text-xl font-semibold">Lista de Chamados</h3>
          {tickets.length ? (
            tickets.map(ticket => (
              <div
                key={ticket.id}
                onClick={() => selectTicket(ticket)}
                className={`border rounded-lg p-3 cursor-pointer flex justify-between items-start transition ${!ticket.viewedByTI ? 'bg-yellow-50' : 'bg-white'
                  }`}
              >
                <div className="min-w-0">
                  <div className="font-medium truncate">{ticket.title}</div>
                  <div className="text-sm text-gray-500 truncate">
                    {ticket.Category?.name || ticket.category} •{' '}
                    {ticket.Priority?.name || ticket.priority}
                  </div>
                  <div className="text-xs text-gray-400">
                    {formatDateTime(ticket.createdAt)}
                  </div>
                </div>
                {!ticket.viewedByTI && (
                  <span className="ml-2 bg-yellow-200 text-yellow-800 px-2 py-1 rounded text-xs">
                    Novo
                  </span>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-600">Nenhum chamado encontrado.</p>
          )}
        </div>

        {/* Detalhe do Chamado */}
        {selected && (
          <div className="lg:w-2/3 bg-white border rounded-lg p-6 shadow">
            <h3 className="text-2xl font-semibold mb-4">{selected.title}</h3>
            <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-600">
              <span>
                {selected.Category?.name || selected.category} •{' '}
                {selected.Priority?.name || selected.priority}
              </span>
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
                    <span>{c.User?.email || 'Usuário'}</span>
                    <span>{formatDateTime(c.createdAt)}</span>
                  </div>
                  <p>{c.content}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
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
    </div>
  );
}
