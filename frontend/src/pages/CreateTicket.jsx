// frontend/src/pages/CreateTicket.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function CreateTicket() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    priority: '',
    reasonId: '',
    categoryId: '',
    priorityId: '',
    attachment: null
  });
  const [errors, setErrors] = useState({});
  const [statusMsg, setStatusMsg] = useState('');
  const [categories, setCategories] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [reasons, setReasons] = useState([]);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;

    const loadMeta = async () => {
      setLoadingMeta(true);
      try {
        const [cRes, pRes, rRes] = await Promise.all([
          axios.get(`${API}/categories`),
          axios.get(`${API}/priorities`),
          axios.get(`${API}/reasons`)
        ]);
        setCategories(Array.isArray(cRes.data) ? cRes.data : []);
        setPriorities(Array.isArray(pRes.data) ? pRes.data : []);
        setReasons(Array.isArray(rRes.data) ? rRes.data : []);
      } catch (err) {
        console.error('Erro ao carregar categorias/prioridades/motivos:', err);
      } finally {
        setLoadingMeta(false);
      }
    };

    loadMeta();
  }, [API]);

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Título é obrigatório.';
    if (!form.description.trim()) e.description = 'Descrição é obrigatória.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = ({ target }) => {
    const { name, value, files } = target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'attachment' ? files[0] : value
    }));
    // limpar fallback se selecionar existente
    if (name === 'categoryId') setForm(prev => ({ ...prev, category: '' }));
    if (name === 'priorityId') setForm(prev => ({ ...prev, priority: '' }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setStatusMsg('');
    if (!validate()) return;

    const data = new FormData();
    data.append('title', form.title);
    data.append('description', form.description);

    if (form.categoryId) data.append('categoryId', form.categoryId);
    else if (form.category) data.append('category', form.category);

    if (form.priorityId) data.append('priorityId', form.priorityId);
    else if (form.priority) data.append('priority', form.priority);

    if (form.reasonId) data.append('reasonId', form.reasonId);

    if (form.attachment) data.append('attachment', form.attachment);

    try {
      await axios.post(`${API}/tickets`, data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setStatusMsg('✅ Chamado criado com sucesso!');
      setTimeout(() => navigate('/tickets'), 1000);
    } catch (err) {
      console.error(err);
      setStatusMsg(
        err.response?.data?.message
          ? `❌ ${err.response.data.message}`
          : '❌ Erro ao criar chamado.'
      );
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Novo Chamado</h2>

      {statusMsg && (
        <div
          className={`mb-4 p-3 rounded ${statusMsg.startsWith('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
        >
          {statusMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg space-y-4">
        <div>
          <label className="block font-medium mb-1">Título</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
        </div>

        <div>
          <label className="block font-medium mb-1">Descrição</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-medium mb-1">Categoria</label>
            {loadingMeta ? (
              <div className="text-sm text-gray-500">Carregando categorias...</div>
            ) : (
              <>
                <select
                  name="categoryId"
                  value={form.categoryId}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="">-- Selecione --</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                  <option value="">Outro</option>
                </select>
                {!form.categoryId && (
                  <input
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    placeholder="Outra categoria"
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 mt-2"
                  />
                )}
              </>
            )}
          </div>
          <div>
            <label className="block font-medium mb-1">Prioridade</label>
            {loadingMeta ? (
              <div className="text-sm text-gray-500">Carregando prioridades...</div>
            ) : (
              <>
                <select
                  name="priorityId"
                  value={form.priorityId}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="">-- Selecione --</option>
                  {priorities.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                  <option value="">Outro</option>
                </select>
                {!form.priorityId && (
                  <input
                    name="priority"
                    value={form.priority}
                    onChange={handleChange}
                    placeholder="Outra prioridade"
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 mt-2"
                  />
                )}
              </>
            )}
          </div>
        </div>

        <div>
          <label className="block font-medium mb-1">Motivo (opcional)</label>
          {loadingMeta ? (
            <div className="text-sm text-gray-500">Carregando motivos...</div>
          ) : (
            <select
              name="reasonId"
              value={form.reasonId}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">-- Selecione --</option>
              {reasons.map(r => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
              <option value="">Outro</option>
            </select>
          )}
        </div>

        <div>
          <label className="block font-medium mb-1">Anexo (opcional)</label>
          <input name="attachment" type="file" onChange={handleChange} />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Enviar Chamado
        </button>
      </form>
    </div>
  );
}
