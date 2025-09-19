// frontend/src/pages/CreateTicket.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';

export default function CreateTicket() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    priority: '',
    categoryId: '',
    priorityId: '',
    sectorId: '',
    attachment: null
  });
  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const { show } = useToast();
  const API = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: 'Bearer ' + token };
        const [c, p, s] = await Promise.all([
          axios.get(`${API}/categories`, { headers }),
          axios.get(`${API}/priorities`, { headers }),
          axios.get(`${API}/sectors`, { headers }),
        ]);
        setCategories(c.data || []);
        setPriorities(p.data || []);
        setSectors(s.data || []);
      } catch {
        setCategories([]); setPriorities([]); setSectors([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [API]);

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Obrigatório';
    if (!form.description.trim()) e.description = 'Obrigatório';
    if (!form.categoryId && !form.category) e.category = 'Selecione uma categoria ou informe outra.';
    if (!form.priorityId && !form.priority) e.priority = 'Selecione uma prioridade ou informe outra.';
    if (!form.sectorId) e.sectorId = 'Obrigatório';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = e => {
    const { name, value, files } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'attachment' ? files[0] : value
    }));
    if (name === 'categoryId') setForm(prev => ({ ...prev, category: '' }));
    if (name === 'priorityId') setForm(prev => ({ ...prev, priority: '' }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validate()) {
      show('Preencha os campos obrigatórios.', { type: 'error', title: 'Campos obrigatórios' });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: 'Bearer ' + token };
      const fd = new FormData();
      fd.append('title', form.title.trim());
      fd.append('description', form.description.trim());
      if (form.categoryId) fd.append('categoryId', form.categoryId);
      else if (form.category) fd.append('category', form.category.trim());
      if (form.priorityId) fd.append('priorityId', form.priorityId);
      else if (form.priority) fd.append('priority', form.priority.trim());
      fd.append('sectorId', form.sectorId);
      if (form.attachment) fd.append('attachment', form.attachment);

      const res = await axios.post(`${API}/tickets`, fd, { headers });
      const created = res.data;
      show('Chamado aberto com sucesso.', { type: 'success', title: 'Chamado criado' });
      navigate(`/tickets/${created.id}`);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Erro ao abrir chamado.';
      show(msg, { type: 'error' });
    }
  };

  if (loading) return <div className="text-slate-500">Carregando…</div>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-4">Abrir Chamado</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Título</label>
          <input
            name="title"
            className="w-full border rounded px-3 py-2"
            value={form.title}
            onChange={handleChange}
            placeholder="Resumo do problema"
          />
          {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Descrição</label>
          <textarea
            name="description"
            rows={4}
            className="w-full border rounded px-3 py-2"
            value={form.description}
            onChange={handleChange}
            placeholder="Detalhes do problema"
          />
          {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Categoria</label>
            <select
              name="categoryId"
              value={form.categoryId}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 bg-white"
            >
              <option value="">{categories.length ? 'Selecione…' : '—'}</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <div className="mt-2">
              <input
                name="category"
                placeholder="Ou digite outra categoria…"
                value={form.category}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            {errors.category && <p className="text-red-600 text-sm mt-1">{errors.category}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Prioridade</label>
            <select
              name="priorityId"
              value={form.priorityId}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 bg-white"
            >
              <option value="">{priorities.length ? 'Selecione…' : '—'}</option>
              {priorities.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <div className="mt-2">
              <input
                name="priority"
                placeholder="Ou digite outra prioridade…"
                value={form.priority}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            {errors.priority && <p className="text-red-600 text-sm mt-1">{errors.priority}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Setor</label>
            <select
              name="sectorId"
              value={form.sectorId}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 bg-white"
            >
              <option value="">{sectors.length ? 'Selecione…' : '—'}</option>
              {sectors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            {errors.sectorId && <p className="text-red-600 text-sm mt-1">{errors.sectorId}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Anexo (opcional)</label>
          <input name="attachment" type="file" onChange={handleChange} />
        </div>

        <div className="pt-2">
          <button type="submit" className="rounded-lg px-4 py-2 bg-blue-600 text-white hover:bg-blue-700">
            Abrir Chamado
          </button>
        </div>
      </form>
    </div>
  );
}
