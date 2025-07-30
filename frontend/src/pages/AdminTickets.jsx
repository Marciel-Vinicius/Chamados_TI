// frontend/src/pages/AdminTickets.jsx
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';

export default function AdminTickets() {
  const [tickets, setTickets] = useState([]);
  const [selected, setSelected] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const prevTicketsCount = useRef(null);
  const API = import.meta.env.VITE_API_URL;

  // Configura token e solicita permissões de notificação
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Fetch inicial, polling e foco
  useEffect(() => {
    fetchTickets(false);
    const iv = setInterval(() => fetchTickets(true), 5000);
    const onFocus = () => fetchTickets(false);
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(iv);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  async function fetchTickets(notify) {
    try {
      const res = await axios.get(`${API}/tickets/all`);
      const list = res.data;

      // inicializa contador
      if (prevTicketsCount.current === null) {
        prevTicketsCount.current = list.length;
      }

      // notifica novos chamados
      if (
        notify &&
        Notification.permission === 'granted' &&
        list.length > prevTicketsCount.current
      ) {
        const added = list.slice(prevTicketsCount.current);
        added.forEach(t =>
          new Notification('Novo chamado recebido', {
            body: t.title
          })
        );
      }

      prevTicketsCount.current = list.length;
      setTickets(list);
      // atualiza seleção se ainda aberto anteriormente
      if (selected) {
        const updated = list.find(t => t.id === selected.id);
        if (updated) setSelected(updated);
      }
    } catch (err) {
      console.error('Erro ao buscar chamados:', err);
    }
  }

  async function selectTicket(ticket) {
    setSelected(ticket);
    setNewComment('');
    try {
      const res = await axios.get(`${API}/tickets/${ticket.id}/comments`);
      setComments(res.data);
    } catch (err) {
      console.error('Erro ao buscar comentários:', err);
      setComments([]);
    }
  }

  async function changeStatus(id, status) {
    try {
      const res = await axios.put(`${API}/tickets/${id}/status`, { status });
      // atualiza lista e detalhes
      setTickets(prev => prev.map(t => (t.id === id ? res.data : t)));
      if (selected?.id === id) {
        setSelected(res.data);
        new Notification('Status atualizado', {
          body: `Chamado "${res.data.title}" agora está ${res.data.status}`
        });
      }
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
    }
  }

  async function addComment() {
    if (!newComment.trim()) return;
    try {
      const res = await axios.post(
        `${API}/tickets/${selected.id}/comments`,
        { content: newComment }
      );
      setComments(prev => [...prev, res.data]);
      setNewComment('');
      new Notification('Comentário adicionado', {
        body: res.data.content
      });
    } catch (err) {
      console.error('Erro ao enviar comentário:', err);
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Painel TI</h2>
      <div className="flex gap-6">
        {/* Lista de chamados */}
        <div
          className="w-1/3 bg-gray-50 p-4 rounded shadow overflow-auto"
          style={{ maxHeight: '80vh' }}
        >
          {tickets.map(t => (
            <div
              key={t.id}
              onClick={() => selectTicket(t)}
              className={`mb-2 p-3 rounded cursor-pointer hover:bg-white transition ${selected?.id === t.id
                ? 'border-2 border-blue-600'
                : 'border'
                }`}
            >
              <p className="font-medium">{t.title}</p>
              <p className="text-sm text-gray-600">{t.category}</p>
              <p className="text-sm">
                <span className="font-semibold">Status:</span> {t.status}
              </p>
            </div>
          ))}
        </div>

        {/* Detalhes do chamado selecionado */}
        <div
          className="w-2/3 bg-white p-6 rounded shadow overflow-auto"
          style={{ maxHeight: '80vh' }}
        >
          {selected ? (
            <>
              <h3 className="text-xl font-semibold mb-2">{selected.title}</h3>
              <p className="text-gray-600 mb-4">
                {selected.category} • {selected.priority}
              </p>
              <p className="mb-4">{selected.description}</p>
              {selected.attachment && (
                <a
                  href={`${API}${selected.attachment}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-blue-600 underline mb-4"
                >
                  Ver Anexo
                </a>
              )}

              {/* Controle de status */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-1">
                  Alterar Status
                </label>
                <select
                  value={selected.status}
                  onChange={e =>
                    changeStatus(selected.id, e.target.value)
                  }
                  className="border px-3 py-2 rounded w-full"
                >
                  <option>Aberto</option>
                  <option>Em Andamento</option>
                  <option>Fechado</option>
                  <option>Cancelado</option>
                </select>
              </div>

              {/* Comentários */}
              <div>
                <h4 className="font-medium mb-2">Comentários</h4>
                <div className="space-y-2 mb-4 max-h-48 overflow-auto">
                  {comments.map(c => (
                    <div
                      key={c.id}
                      className="border p-3 rounded"
                    >
                      <p className="text-gray-800">
                        {c.content}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(c.createdAt).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  ))}
                  {comments.length === 0 && (
                    <p className="text-sm text-gray-500">
                      Sem comentários.
                    </p>
                  )}
                </div>
                <textarea
                  rows="3"
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  className="w-full border px-3 py-2 rounded mb-2"
                  placeholder="Escreva um comentário..."
                />
                <button
                  onClick={addComment}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                >
                  Enviar Comentário
                </button>
              </div>
            </>
          ) : (
            <p className="text-gray-500">
              Selecione um chamado para ver detalhes.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
