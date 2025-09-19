// frontend/src/pages/NewTicket.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useToast } from "../contexts/ToastContext";

export default function NewTicket() {
    const API = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/$/, "");
    const navigate = useNavigate();
    const { show } = useToast();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    const [categories, setCategories] = useState([]);
    const [priorities, setPriorities] = useState([]);
    const [sectors, setSectors] = useState([]);

    const [categoryId, setCategoryId] = useState("");
    const [priorityId, setPriorityId] = useState("");
    const [sectorId, setSectorId] = useState("");
    const [attachment, setAttachment] = useState(null);

    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const token = localStorage.getItem("token");
                const [c, p, s] = await Promise.all([
                    axios.get(`${API}/categories`, { headers: { Authorization: "Bearer " + token } }),
                    axios.get(`${API}/priorities`, { headers: { Authorization: "Bearer " + token } }),
                    axios.get(`${API}/sectors`, { headers: { Authorization: "Bearer " + token } }),
                ]);
                setCategories(c.data || []);
                setPriorities(p.data || []);
                setSectors(s.data || []);
            } catch { }
        };
        load();
    }, [API]);

    const submit = async (e) => {
        e.preventDefault();

        if (!title.trim() || !description.trim() || !categoryId || !priorityId || !sectorId) {
            show('Preencha título, descrição, categoria, prioridade e setor.', { type: 'error', title: 'Campos obrigatórios' });
            return;
        }

        try {
            setSubmitting(true);
            const form = new FormData();
            form.append("title", title.trim());
            form.append("description", description.trim());
            form.append("categoryId", categoryId);
            form.append("priorityId", priorityId);
            form.append("sectorId", sectorId);
            if (attachment) form.append("attachment", attachment);

            const token = localStorage.getItem("token");
            const res = await axios.post(`${API}/tickets`, form, {
                headers: { Authorization: "Bearer " + token },
            });

            const created = res.data;
            show('Chamado aberto com sucesso.', { type: 'success', title: 'Chamado criado' });
            navigate(`/tickets/${created.id}`);
        } catch (err) {
            show('Erro ao abrir chamado.', { type: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl">
            <h1 className="text-2xl font-bold mb-4">Abrir Chamado</h1>

            <form className="space-y-4" onSubmit={submit}>
                <div>
                    <label className="block text-sm font-medium mb-1">Título</label>
                    <input
                        className="w-full rounded-lg border px-3 py-2"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Resumo do problema"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Descrição</label>
                    <textarea
                        className="w-full rounded-lg border px-3 py-2"
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Detalhes do problema"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Categoria</label>
                        <select
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            className="w-full rounded-lg border px-3 py-2 bg-white"
                        >
                            <option value="">Selecione…</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Prioridade</label>
                        <select
                            value={priorityId}
                            onChange={(e) => setPriorityId(e.target.value)}
                            className="w-full rounded-lg border px-3 py-2 bg-white"
                        >
                            <option value="">Selecione…</option>
                            {priorities.map((p) => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Setor</label>
                        <select
                            value={sectorId}
                            onChange={(e) => setSectorId(e.target.value)}
                            className="w-full rounded-lg border px-3 py-2 bg-white"
                        >
                            <option value="">Selecione…</option>
                            {sectors.map((s) => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Anexo (opcional)</label>
                    <input type="file" onChange={(e) => setAttachment(e.target.files?.[0] || null)} />
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="rounded-lg px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                        {submitting ? "Enviando..." : "Abrir Chamado"}
                    </button>
                </div>
            </form>
        </div>
    );
}
