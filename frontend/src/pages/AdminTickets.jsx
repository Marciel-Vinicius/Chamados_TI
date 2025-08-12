// frontend/src/pages/AdminTickets.jsx
import axios from 'axios';
import { useEffect, useRef, useState } from 'react';

export default function AdminTickets() {
  const [tickets, setTickets] = useState([]);
  const [status, setStatus] = useState('');
  const [prio, setPrio] = useState('');
  const [busy, setBusy] = useState(true);
  const [err, setErr] = useState('');
  const esRef = useRef(null);

  const fetchAll = async () => {
    setBusy(true); setErr('');
    try {
      const params = {};
      if (status) params.status = status;
      if (prio) params.priority = prio;
      const { data } = await axios.get('/tickets/all', { params });
      setTickets(data || []);
    } catch (e) {
      setErr(e?.response?.data?.message || 'Falha ao carregar TI.');
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);
  useEffect(() => { fetchAll(); }, [status, prio]);

  // SSE de tickets
  useEffect(() => {
    const raw = localStorage.getItem('token') || '';
    const token = raw.replace(/^"|"$/g, '');
    if (!token) return;

    const base = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const url = `${base}/tickets/stream?token=${encodeURIComponent(token)}`;
    try { esRef.current?.close(); } catch { }
    const es = new EventSource(url);
    esRef.current = es;

    es.addEventListener('ticket', () => {
      // chegou atualização de ticket => recarrega
      fetchAll();
    });

    es.onerror = () => {
      try { es.close(); } catch { }
      // reconecta simples
      setTimeout(() => {
        const neo = new EventSource(url);
        esRef.current = neo;
        neo.addEventListener('ticket', () => fetchAll());
      }, 2000);
    };

    return () => { try { es.close(); } catch { } };
  }, []);

  const updateStatus = async (id, newStatus) => {
    try {
      await axios.put(`/tickets/${id}/status`, { status: newStatus });
      await fetchAll();
    } catch (e) {
      alert('Falha ao atualizar status.');
    }
  };

  const colorByStatus = (s) => {
    switch (String(s || '').toLowerCase()) {
      case 'open': return 'bg-blue-100 text-blue-700';
      case 'in_progress': return 'bg-yellow-100 text-yellow-700';
      case 'closed': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-white text-xl font-semibold">Admin TI — Chamados</h1>
          <p className="text-white/70 text-sm">Gerencie os tickets abertos pelos usuários.</p>
        </div>
        <div className="flex gap-2">
          <select
            className="rounded-xl border-gray-300 text-sm"
            value={status} onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">Status (todos)</option>
            <option value="open">Aberto</option>
            <option value="in_progress">Em andamento</option>
            <option value="closed">Fechado</option>
          </select>
          <select
            className="rounded-xl border-gray-300 text-sm"
            value={prio} onChange={(e) => setPrio(e.target.value)}
          >
            <option value="">Prioridade (todas)</option>
            <option value="Baixa">Baixa</option>
            <option value="Média">Média</option>
            <option value="Alta">Alta</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow overflow-hidden">
        {busy && <div className="p-6 text-gray-600 text-sm">Carregando...</div>}
        {err && <div className="p-6 text-red-600 text-sm">{err}</div>}
        {!busy && !err && tickets.length === 0 && (
          <div className="p-6 text-gray-600 text-sm">Nenhum chamado encontrado.</div>
        )}

        {!busy && !err && tickets.length > 0 && (
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">#</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Título</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Usuário</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Categoria</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Prioridade</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Criado em</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => (
                <tr key={t.id} className="border-t">
                  <td className="px-4 py-3">{t.id}</td>
                  <td className="px-4 py-3">{t.title || '-'}</td>
                  <td className="px-4 py-3">{t?.User?.email || '-'}</td>
                  <td className="px-4 py-3">{t.category || t?.Category?.name || '-'}</td>
                  <td className="px-4 py-3">{t.priority || t?.Priority?.name || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs ${colorByStatus(t.status)}`}>
                      {t.status || '-'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {t.createdAt ? new Date(t.createdAt).toLocaleString() : '-'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-2">
                      {t.status !== 'open' && (
                        <button
                          className="text-xs rounded-lg px-3 py-1 bg-blue-600 text-white"
                          onClick={() => updateStatus(t.id, 'open')}
                        >Reabrir</button>
                      )}
                      {t.status !== 'in_progress' && (
                        <button
                          className="text-xs rounded-lg px-3 py-1 bg-yellow-500 text-white"
                          onClick={() => updateStatus(t.id, 'in_progress')}
                        >Em andamento</button>
                      )}
                      {t.status !== 'closed' && (
                        <button
                          className="text-xs rounded-lg px-3 py-1 bg-green-600 text-white"
                          onClick={() => updateStatus(t.id, 'closed')}
                        >Fechar</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
