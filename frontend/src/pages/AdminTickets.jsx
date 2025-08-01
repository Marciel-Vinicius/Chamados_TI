// frontend/src/pages/AdminTickets.jsx
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';

export default function AdminTickets() {
  const [tickets, setTickets] = useState([]);
  const [selected, setSelected] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [reasons, setReasons] = useState([]);
  const [newReason, setNewReason] = useState('');
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [priorities, setPriorities] = useState([]);
  const [newPriority, setNewPriority] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const prevTicketsCount = useRef(null);
  const reconnectDelay = useRef(1000);
  const esRef = useRef(null);
  const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  // util para formatar data/hora
  const formatDateTime = iso => {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      return d.toLocaleString('pt-BR', { hour12: false });
    } catch {
      return iso;
    }
  };

  // define header auth se tiver token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  // carregamento inicial e SSE
  useEffect(() => {
    fetchAll();
    fetchReasons();
    fetchCategories();
    fetchPriorities();
    setupSSE();

    const interval = setInterval(() => fetchTickets(true), 5000);
    return () => {
      clearInterval(interval);
      if (esRef.current) esRef.current.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  async function fetchAll() {
    await Promise.all([fetchTickets(false), fetchReasons(), fetchCategories(), fetchPriorities()]);
  }

  async function fetchTickets(notify) {
    try {
      const res = await axios.get(`${API}/tickets/all`);
      const list = res.data;

      if (prevTicketsCount.current === null) {
        prevTicketsCount.current = list.length;
      } else if (
        notify &&
        Notification.permission === 'granted' &&
        list.length !== prevTicketsCount.current
      ) {
        new Notification('Atualização de chamados', {
          body: `Total agora: ${list.length}`
        });
      }
      prevTicketsCount.current = list.length;

      setTickets(list);

      if (selected) {
        // atualiza detalhe se estiver aberto
        const det = await axios.get(`${API}/tickets/${selected.id}`);
        setSelected(det.data);
        const comm = await axios.get(`${API}/tickets/${selected.id}/comments`);
        setComments(comm.data);
      }
    } catch (err) {
      console.error('Erro ao atualizar chamados:', err);
      setErrorMsg('Erro ao buscar chamados. Veja console.');
      if (err.response) {
        if (err.response.status === 403) {
          setErrorMsg('Sem permissão para ver todos os chamados.');
        }
      }
    }
  }

  async function fetchReasons() {
    try {
      const res = await axios.get(`${API}/reasons`);
      setReasons(res.data);
    } catch (err) {
      console.warn('Erro ao carregar motivos', err);
    }
  }

  async function fetchCategories() {
    try {
      const res = await axios.get(`${API}/categories`);
      setCategories(res.data);
    } catch (err) {
      console.warn('Erro ao carregar categorias', err);
    }
  }

  async function fetchPriorities() {
    try {
      const res = await axios.get(`${API}/priorities`);
      setPriorities(res.data);
    } catch (err) {
      console.warn('Erro ao carregar prioridades', err);
    }
  }

  async function addReason() {
    if (!newReason.trim()) return;
    try {
      const res = await axios.post(`${API}/reasons`, { name: newReason.trim() });
      setReasons(prev => [...prev, res.data]);
      setNewReason('');
    } catch (err) {
      console.error('Erro ao adicionar motivo:', err);
    }
  }

  async function addCategory() {
    if (!newCategory.trim()) return;
    try {
      const res = await axios.post(`${API}/categories`, { name: newCategory.trim() });
      setCategories(prev => [...prev, res.data]);
      setNewCategory('');
    } catch (err) {
      console.error('Erro ao adicionar categoria:', err);
    }
  }

  async function addPriority() {
    if (!newPriority.trim()) return;
    try {
      const res = await axios.post(`${API}/priorities`, { name: newPriority.trim() });
      setPriorities(prev => [...prev, res.data]);
      setNewPriority('');
    } catch (err) {
      console.error('Erro ao adicionar prioridade:', err);
    }
  }

  async function selectTicket(ticket) {
    setSelected(null);
    try {
      const det = await axios.get(`${API}/tickets/${ticket.id}`);
      setSelected(det.data);
      const comm = await axios.get(`${API}/tickets/${ticket.id}/comments`);
      setComments(comm.data);
    } catch (err) {
      console.error('Erro ao buscar detalhes do chamado:', err);
    }
  }

  async function addComment() {
    if (!newComment.trim() || !selected) return;
    try {
      const res = await axios.post(`${API}/tickets/${selected.id}/comments`, {
        content: newComment.trim()
      });
      setComments(prev => [...prev, res.data]);
      setNewComment('');
      if (Notification.permission === 'granted') {
        new Notification('Comentário adicionado', {
          body: res.data.content
        });
      }
    } catch (err) {
      console.error('Erro ao adicionar comentário:', err);
    }
  }

  function setupSSE() {
    if (esRef.current) {
      esRef.current.close();
    }
    const token = localStorage.getItem('token');
    if (!token) return;
    const streamUrl = `${API.replace(/\/+$/, '')}/tickets/stream?token=${token}`;
    const es = new EventSource(streamUrl);
    esRef.current = es;

    es.addEventListener('notify', e => {
      try {
        const payload = JSON.parse(e.data);
        // não notifica se for comentário do próprio usuário que está logado (backend já evita em payload)
        if (Notification.permission === 'default') {
          Notification.requestPermission();
        }
        if (Notification.permission === 'granted') {
          if (payload.type === 'new-ticket') {
            new Notification('Novo chamado', {
              body: payload.ticket.title
            });
          } else if (payload.type === 'new-comment') {
            new Notification('Comentário novo', {
              body: payload.comment?.content || 'Atualização'
            });
          }
        }
        fetchTickets(true);
      } catch (err) {
        console.error('Erro ao processar SSE notify:', err);
      }
    });

    es.onerror = () => {
      es.close();
      // reconectar exponencialmente
      setTimeout(() => {
        reconnectDelay.current = Math.min(reconnectDelay.current * 2, 30000);
        setupSSE();
      }, reconnectDelay.current);
    };

    es.onopen = () => {
      reconnectDelay.current = 1000;
    };
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Painel TI</h2>

      {errorMsg && (
        <div className="mb-4 p-2 bg-red-100 text-red-800 rounded">{errorMsg}</div>
      )}

      <div className="grid grid-cols-3 gap-6 mb-6">
        {/* Motivos */}
        <div className="p-4 border rounded shadow">
          <h3 className="text-lg font-semibold mb-2">Motivos de Chamado</h3>
          <div className="flex gap-2 mb-2">
            <input
              placeholder="Novo motivo"
              value={newReason}
              onChange={e => setNewReason(e.target.value)}
              className="border px-3 py-2 rounded flex-1"
            />
            <button
              onClick={addReason}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              Adicionar
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {reasons.length
              ? reasons.map(r => (
                <div
                  key={r.id}
                  className="bg-gray-100 px-3 py-1 rounded text-sm flex items-center"
                >
                  {r.name}
                </div>
              ))
              : <div className="text-sm text-gray-500">Nenhum motivo</div>}
          </div>
        </div>

        {/* Categorias */}
        <div className="p-4 border rounded shadow">
          <h3 className="text-lg font-semibold mb-2">Categorias</h3>
          <div className="flex gap-2 mb-2">
            <input
              placeholder="Nova categoria"
              value={newCategory}
              onChange={e => setNewCategory(e.target.value)}
              className="border px-3 py-2 rounded flex-1"
            />
            <button
              onClick={addCategory}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
            >
              Adicionar
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.length
              ? categories.map(c => (
                <div
                  key={c.id}
                  className="bg-gray-100 px-3 py-1 rounded text-sm flex items-center"
                >
                  {c.name}
                </div>
              ))
              : <div className="text-sm text-gray-500">Nenhuma categoria</div>}
          </div>
        </div>

        {/* Prioridades */}
        <div className="p-4 border rounded shadow">
          <h3 className="text-lg font-semibold mb-2">Prioridades</h3>
          <div className="flex gap-2 mb-2">
            <input
              placeholder="Nova prioridade"
              value={newPriority}
              onChange={e => setNewPriority(e.target.value)}
              className="border px-3 py-2 rounded flex-1"
            />
            <button
              onClick={addPriority}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded"
            >
              Adicionar
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {priorities.length
              ? priorities.map(p => (
                <div
                  key={p.id}
                  className="bg-gray-100 px-3 py-1 rounded text-sm flex items-center"
                >
                  {p.name}
                </div>
              ))
              : <div className="text-sm text-gray-500">Nenhuma prioridade</div>}
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Lista de chamados */}
        <div className="w-1/3">
          <div className="mb-4 flex justify-between items-center">
            <div className="font-medium">Lista de Chamados</div>
          </div>
          <div className="space-y-2">
            {tickets.length ? (
              tickets.map(ticket => (
                <div
                  key={ticket.id}
                  onClick={() => selectTicket(ticket)}
                  className={`border rounded p-3 cursor-pointer flex justify-between transition ${!ticket.viewedByTI ? 'bg-yellow-50' : 'bg-white'
                    }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="font-semibold">{ticket.title}</div>
                      {!ticket.viewedByTI && (
                        <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded text-xs">
                          Novo
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      {ticket.Category ? ticket.Category.name : ticket.category} •{' '}
                      {ticket.Priority ? ticket.Priority.name : ticket.priority}
                    </div>
                    {ticket.Reason && (
                      <div className="text-xs text-gray-500">
                        Motivo: {ticket.Reason.name}
                      </div>
                    )}
                    <div className="text-xs text-gray-500">
                      Aberto em: {formatDateTime(ticket.createdAt)}
                    </div>
                  </div>
                  <div className="text-sm flex flex-col justify-between items-end">
                    <div>{ticket.status}</div>
                  </div>
                </div>
              ))
            ) : (
              <div>Nenhum chamado encontrado.</div>
            )}
          </div>
        </div>

        {/* Detalhe do chamado */}
        {selected && (
          <div className="w-2/3 border rounded p-4">
            <h3 className="text-xl font-semibold mb-2">{selected.title}</h3>
            <div className="flex gap-4 mb-3 flex-wrap">
              <div className="text-sm text-gray-600">
                {selected.Category ? selected.Category.name : selected.category} •{' '}
                {selected.Priority ? selected.Priority.name : selected.priority}
              </div>
              {selected.Reason && (
                <div className="text-sm text-gray-600">
                  Motivo: {selected.Reason.name}
                </div>
              )}
              <div className="text-sm text-gray-600">
                Aberto em: {formatDateTime(selected.createdAt)}
              </div>
              <div className="text-sm text-gray-600">
                Criador: {selected.User?.email || '—'}
              </div>
            </div>

            <p className="mb-4 whitespace-pre-wrap">{selected.description}</p>

            {selected.attachment && (
              <div className="mb-4">
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

            <div className="mb-6">
              <div className="font-medium mb-2">Comentários</div>
              {comments.map(c => (
                <div key={c.id} className="border rounded p-2 mb-2">
                  <div className="text-xs text-gray-500 mb-1 flex justify-between">
                    <div>
                      {c.User?.email || 'Usuário'} • {formatDateTime(c.createdAt)}
                    </div>
                  </div>
                  <div>{c.content}</div>
                </div>
              ))}
              <div className="flex gap-2 mt-2">
                <input
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  placeholder="Adicionar comentário"
                  className="flex-1 border px-3 py-2 rounded"
                />
                <button
                  onClick={addComment}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                  type="button"
                >
                  Enviar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
