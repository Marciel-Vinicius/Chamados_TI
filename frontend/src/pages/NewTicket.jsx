// frontend/src/pages/NewTicket.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function NewTicket() {
    const [data, setData] = useState({
        title: '',
        description: '',
        category: '',
        priority: '',
        reasonId: '',
        categoryId: '',
        priorityId: ''
    });
    const [file, setFile] = useState(null);
    const [msg, setMsg] = useState('');
    const [categories, setCategories] = useState([]);
    const [priorities, setPriorities] = useState([]);
    const [reasons, setReasons] = useState([]);
    const [loadingMeta, setLoadingMeta] = useState(true);
    const navigate = useNavigate();
    const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        async function loadMeta() {
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
                console.error('Erro carregando metadados:', err);
                setMsg('Falha ao carregar categorias/prioridades/motivos.');
            } finally {
                setLoadingMeta(false);
            }
        }
        loadMeta();
    }, [API]);

    const onChange = e => {
        const { name, value } = e.target;
        setData(prev => ({ ...prev, [name]: value }));
        if (name === 'categoryId') setData(prev => ({ ...prev, category: '' }));
        if (name === 'priorityId') setData(prev => ({ ...prev, priority: '' }));
    };

    const onFileChange = e => setFile(e.target.files[0]);

    const onSubmit = async e => {
        e.preventDefault();
        const form = new FormData();
        form.append('title', data.title);
        form.append('description', data.description);

        if (data.categoryId) form.append('categoryId', data.categoryId);
        else if (data.category) form.append('category', data.category);

        if (data.priorityId) form.append('priorityId', data.priorityId);
        else if (data.priority) form.append('priority', data.priority);

        if (data.reasonId) form.append('reasonId', data.reasonId);
        if (file) form.append('attachment', file);

        try {
            await axios.post(`${API}/tickets`, form, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            navigate('/tickets');
        } catch (err) {
            console.error(err);
            setMsg('Erro ao enviar chamado.');
        }
    };

    return (
        <div className="max-w-md mx-auto p-6">
            <h2 className="text-2xl font-semibold mb-4">Novo Chamado</h2>
            {msg && <div className="mb-3 text-red-600">{msg}</div>}
            <form onSubmit={onSubmit} className="bg-white shadow rounded p-6 space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Título</label>
                    <input
                        name="title"
                        value={data.title}
                        onChange={onChange}
                        className="w-full border px-3 py-2 rounded"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Descrição</label>
                    <textarea
                        name="description"
                        value={data.description}
                        onChange={onChange}
                        rows={4}
                        className="w-full border px-3 py-2 rounded"
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Categoria</label>
                        {loadingMeta ? (
                            <div className="text-sm text-gray-500">Carregando...</div>
                        ) : (
                            <>
                                <select
                                    name="categoryId"
                                    value={data.categoryId}
                                    onChange={onChange}
                                    className="w-full border px-3 py-2 rounded"
                                >
                                    <option value="">-- Selecione --</option>
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                                {!data.categoryId && (
                                    <input
                                        name="category"
                                        value={data.category}
                                        onChange={onChange}
                                        placeholder="Outra categoria"
                                        className="w-full border px-3 py-2 rounded mt-2"
                                    />
                                )}
                            </>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Prioridade</label>
                        {loadingMeta ? (
                            <div className="text-sm text-gray-500">Carregando...</div>
                        ) : (
                            <>
                                <select
                                    name="priorityId"
                                    value={data.priorityId}
                                    onChange={onChange}
                                    className="w-full border px-3 py-2 rounded"
                                >
                                    <option value="">-- Selecione --</option>
                                    {priorities.map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.name}
                                        </option>
                                    ))}
                                </select>
                                {!data.priorityId && (
                                    <input
                                        name="priority"
                                        value={data.priority}
                                        onChange={onChange}
                                        placeholder="Outra prioridade"
                                        className="w-full border px-3 py-2 rounded mt-2"
                                    />
                                )}
                            </>
                        )}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Motivo (opcional)</label>
                    {loadingMeta ? (
                        <div className="text-sm text-gray-500">Carregando...</div>
                    ) : (
                        <select
                            name="reasonId"
                            value={data.reasonId}
                            onChange={onChange}
                            className="w-full border px-3 py-2 rounded"
                        >
                            <option value="">-- Selecione --</option>
                            {reasons.map(r => (
                                <option key={r.id} value={r.id}>
                                    {r.name}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Anexo</label>
                    <input type="file" onChange={e => setFile(e.target.files[0])} />
                </div>

                <button className="w-full bg-blue-600 text-white px-4 py-2 rounded" type="submit">
                    Enviar Chamado
                </button>
            </form>
        </div>
    );
}
