import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function CreateTicket() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Rede',
    priority: 'Baixa',
    attachment: null
  });
  const [errors, setErrors] = useState({});
  const [statusMsg, setStatusMsg] = useState('');
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL;

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Título é obrigatório';
    if (!form.description.trim()) e.description = 'Descrição é obrigatória';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = ({ target }) => {
    const { name, value, files } = target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'attachment' ? files[0] : value
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setStatusMsg('');
    if (!validate()) return;

    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => v != null && data.append(k, v));

    try {
      await axios.post(`${API}/tickets`, data, {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token'),
          'Content-Type': 'multipart/form-data'
        }
      });
      setStatusMsg('✅ Chamado criado com sucesso!');
      setTimeout(() => navigate('/tickets'), 1000);
    } catch (err) {
      console.error(err);
      setStatusMsg('❌ Falha ao criar chamado.');
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Novo Chamado</h2>

      {statusMsg && (
        <div
          className={`mb-4 p-3 rounded ${statusMsg.startsWith('✅')
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
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
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option>Rede</option>
              <option>Impressora</option>
              <option>Sistema</option>
              <option>Hardware</option>
              <option>Outro</option>
            </select>
          </div>
          <div>
            <label className="block font-medium mb-1">Prioridade</label>
            <select
              name="priority"
              value={form.priority}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option>Baixa</option>
              <option>Média</option>
              <option>Alta</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block font-medium mb-1">Anexo (opcional)</label>
          <input
            type="file"
            name="attachment"
            onChange={handleChange}
            className="w-full"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition"
        >
          Enviar Chamado
        </button>
      </form>
    </div>
  );
}
