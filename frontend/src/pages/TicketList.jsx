// frontend/src/pages/TicketList.jsx
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function Pill({ children, color = 'gray' }) {
  const map = {
    gray: 'bg-gray-100 text-gray-700',
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-green-100 text-green-700',
    yellow: 'bg-yellow-100 text-yellow-700',
    red: 'bg-red-100 text-red-700',
    indigo: 'bg-indigo-100 text-indigo-700',
  };
  return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs ${map[color]}`}>{children}</span>;
}

export default function TicketList() {
  const [tickets, setTickets] = useState([]);
  const [busy, setBusy] = useState(true);
  const [err, setErr] = useState('');
  const [status, setStatus] = useState('');
  const [prio, setPrio] = useState('');

  const fetchData = async () => {
    setBusy(true); setErr('');
    try {
      const params = {};
      if (status) params.status = status;
      if (prio) params.priority = prio;
      const { data } = await axios.get('/tickets', { params });
      setTickets(data || []);
    } catch (e) {
      setErr('Falha ao carregar chamados.');
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => { fetchData(); }, []); // inicial
  useEffect(() => { fetchData(); }, [status, prio]); // filtros

  const colorByStatus = (s) => {
    switch (String(s || '').toLowerCase()) {
      case 'open': return 'blue';
      case 'in_progress': return 'yellow';
      case 'closed': return 'green';
      default: return 'gray';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-white text-xl font-semibold">Meus chamados</h1>
          <p className="text-white/70 text-sm">Acompanhe o andamento dos seus atendimentos.</p>
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
          <Link
            to="/new"
            className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm"
          >
            Abrir chamado
          </Link>
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
                  <td className="px-4 py-3">{t.category || t?.Category?.name || '-'}</td>
                  <td className="px-4 py-3">
                    <Pill color="indigo">{t.priority || t?.Priority?.name || '-'}</Pill>
                  </td>
                  <td className="px-4 py-3">
                    <Pill color={colorByStatus(t.status)}>{t.status || '-'}</Pill>
                  </td>
                  <td className="px-4 py-3">
                    {t.createdAt ? new Date(t.createdAt).toLocaleString() : '-'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/ticket/${t.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      Ver detalhes
                    </Link>
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
