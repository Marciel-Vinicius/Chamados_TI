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
    const [reasons, setReasons] = useState([]);
    const [categories, setCategories] = useState([]);
    const [priorities, setPriorities] = useState([]);
    const [loadingMeta, setLoadingMeta] = useState(true);
    const [metaError, setMetaError] = useState('');
    const [authError, setAuthError] = useState('');
    const navigate = useNavigate();
    const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    // aplica token globalmente
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
    }, []);

    // busca categorias/prioridades/motivos
    useEffect(() => {
        async function loadMeta() {
            setLoadingMeta(true);
            setMetaError('');
            setAuthError('');
            try {
                const [rRes, cRes, pRes] = await Promise.all([
                    axios.get(`${API}/reasons`),
                    axios.get(`${API}/categories`),
                    axios.get(`${API}/priorities`)
                ]);
                setReasons(Array.isArray(rRes.data) ? rRes.data : []);
                setCategories(Array.isArray(cRes.data) ? cRes.data : []);
                setPriorities(Array.isArray(pRes.data) ? pRes.data : []);
                if (!Array.isArray(cRes.data) || !Array.isArray(pRes.data)) {
                    setMetaError('Resposta inesperada do servidor para categorias ou prioridades.');
                }
            } catch (err) {
                console.error('Erro carregando categorias/prioridades/motivos:', err);
                if (err.response) {
                    if (err.response.status === 401 || err.response.status === 403) {
                        setAuthError('Você não está autenticado ou não tem permissão. Faça login novamente.');
                    } else {
                        setMetaError('Falha ao carregar categorias/prioridades/motivos. Veja console.');
                    }
                } else {
                    setMetaError('Erro de rede ao buscar metadados.');
                }
            } finally {
                setLoadingMeta(false);
            }
        }
        loadMeta();
    }, [API]);

    const onChange = e => {
        const { name, value } = e.target;
        setData(prev => ({ ...prev, [name]: value }));
    };

    const onFileChange = e => setFile(e.target.files[0]);

    const onSubmit = async e => {
        e.preventDefault();
        setMsg('');
        if (!data.title.trim() || !data.description.trim()) {
            setMsg('Título e descrição são obrigatórios.');
            return;
        }

        const form = new FormData();
        form.append('title', data.title);
        form.append('description', data.description);

        if (data.categoryId) {
            form.append('categoryId', data.categoryId);
        } else if (data.category) {
            form.append('category', data.category);
        }

        if (data.priorityId) {
            form.append('priorityId', data.priorityId);
        } else if (data.priority) {
            form.append('priority', data.priority);
        }

        if (data.reasonId) {
            form.append('reasonId', data.reasonId);
        }

        if (file) {
            form.append('attachment', file);
        }

        try {
            await axios.post(`${API}/tickets`, form, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            navigate('/my-tickets');
        } catch (err) {
            console.error('Erro ao abrir chamado:', err);
            if (err.response) {
                setMsg(err.response.data?.message || `Erro: ${err.response.status}`);
            } else {
                setMsg('Erro de rede ao enviar chamado.');
            }
        }
    };

    return (
        <div className="max-w-md mx-auto p-6">
            <h2 className="text-2xl font-semibold mb-4">Novo Chamado</h2>

            {authError && <div className="mb-2 p-2 bg-red-100 text-red-800 rounded">{authError}</div>}
            {metaError && <div className="mb-2 p-2 bg-yellow-100 text-yellow-800 rounded">{metaError}</div>}
            {msg && <div className="mb-2 p-2 bg-red-50 text-red-700 rounded">{msg}</div>}

            <form onSubmit={onSubmit} className="bg-white shadow rounded p-6 space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Título</label>
                    <input
                        name="title"
                        value={data.title}
                        onChange={onChange}
                        className="w-full border px-3 py-2 rounded"
                        required
                        placeholder="Resumo do problema"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Descrição</label>
                    <textarea
                        name="description"
                        value={data.description}
                        onChange={onChange}
                        className="w-full border px-3 py-2 rounded"
                        required
                        rows={5}
                        placeholder="Detalhe o que está acontecendo"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Categoria</label>
                        {loadingMeta ? (
                            <div className="text-sm text-gray-500">Carregando categorias...</div>
                        ) : (
                            <>
                                <select
                                    name="categoryId"
                                    value={data.categoryId}
                                    onChange={e => {
                                        onChange(e);
                                        setData(prev => ({ ...prev, category: '' }));
                                    }}
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
                            <div className="text-sm text-gray-500">Carregando prioridades...</div>
                        ) : (
                            <>
                                <select
                                    name="priorityId"
                                    value={data.priorityId}
                                    onChange={e => {
                                        onChange(e);
                                        setData(prev => ({ ...prev, priority: '' }));
                                    }}
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
                        <div className="text-sm text-gray-500">Carregando motivos...</div>
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
                            <option value="">Outro</option>
                        </select>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Anexo (opcional)</label>
                    <input type="file" onChange={onFileChange} />
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
