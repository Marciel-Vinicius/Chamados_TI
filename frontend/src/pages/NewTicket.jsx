// frontend/src/pages/NewTicket.jsx
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function NewTicket() {
    const nav = useNavigate();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [reasonId, setReasonId] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [priorityId, setPriorityId] = useState('');
    const [file, setFile] = useState(null);

    const [reasons, setReasons] = useState([]);
    const [categories, setCategories] = useState([]);
    const [priorities, setPriorities] = useState([]);
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState('');
    const [msg, setMsg] = useState('');

    const loadFilters = async () => {
        try {
            const [r, c, p] = await Promise.all([
                axios.get('/reasons'),
                axios.get('/categories'),
                axios.get('/priorities'),
            ]);
            setReasons(r.data || []);
            setCategories(c.data || []);
            setPriorities(p.data || []);
        } catch (e) {
            // silencioso
        }
    };

    useEffect(() => { loadFilters(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErr(''); setMsg('');
        setBusy(true);
        try {
            const fd = new FormData();
            fd.append('title', title);
            fd.append('description', description);
            if (reasonId) fd.append('reasonId', reasonId);
            if (categoryId) fd.append('categoryId', categoryId);
            if (priorityId) fd.append('priorityId', priorityId);
            if (file) fd.append('attachment', file);

            await axios.post('/tickets', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            setMsg('Chamado aberto com sucesso!');
            setTimeout(() => nav('/tickets'), 1000);
        } catch (e) {
            setErr(e?.response?.data?.message || 'Falha ao abrir chamado.');
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-white text-xl font-semibold mb-4">Abrir chamado</h1>
            <div className="bg-white rounded-2xl shadow p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    {err && <div className="p-3 rounded-lg text-sm bg-red-50 text-red-700">{err}</div>}
                    {msg && <div className="p-3 rounded-lg text-sm bg-green-50 text-green-700">{msg}</div>}

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Título</label>
                        <input
                            className="mt-1 w-full rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Resumo do problema"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Descrição</label>
                        <textarea
                            rows={4}
                            className="mt-1 w-full rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Descreva o que está acontecendo..."
                            required
                        />
                    </div>

                    <div className="grid md:grid-cols-3 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Motivo</label>
                            <select
                                className="mt-1 w-full rounded-xl border-gray-300"
                                value={reasonId} onChange={(e) => setReasonId(e.target.value)}
                            >
                                <option value="">—</option>
                                {reasons.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Categoria</label>
                            <select
                                className="mt-1 w-full rounded-xl border-gray-300"
                                value={categoryId} onChange={(e) => setCategoryId(e.target.value)}
                            >
                                <option value="">—</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Prioridade</label>
                            <select
                                className="mt-1 w-full rounded-xl border-gray-300"
                                value={priorityId} onChange={(e) => setPriorityId(e.target.value)}
                            >
                                <option value="">—</option>
                                {priorities.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Anexo (opcional)</label>
                        <input
                            type="file"
                            className="mt-1 w-full text-sm"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                        />
                    </div>

                    <button
                        disabled={busy}
                        className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 font-medium"
                    >
                        {busy ? 'Enviando...' : 'Abrir chamado'}
                    </button>
                </form>
            </div>
        </div>
    );
}
