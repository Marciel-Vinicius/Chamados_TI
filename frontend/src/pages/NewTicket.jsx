// frontend/src/pages/NewTicket.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function NewTicket() {
    const API = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/$/, "");
    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    const [categories, setCategories] = useState([]);
    const [priorities, setPriorities] = useState([]);
    const [sectors, setSectors] = useState([]);

    const [categoryId, setCategoryId] = useState("");
    const [priorityId, setPriorityId] = useState("");
    const [sectorId, setSectorId] = useState("");

    const [files, setFiles] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    // Authorization padrão
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }, []);

    useEffect(() => {
        (async () => {
            try {
                const [cats, pris, secs] = await Promise.all([
                    axios.get(`${API}/categories`),
                    axios.get(`${API}/priorities`),
                    axios.get(`${API}/sectors`),
                ]);
                setCategories(cats.data || []);
                setPriorities(pris.data || []);
                setSectors(secs.data || []);
            } catch (err) {
                console.error("Falha ao carregar listas:", err);
                setErrorMsg("Falha ao carregar listas de apoio. Tente novamente.");
            }
        })();
    }, [API]);

    function onFileChange(e) {
        setFiles(Array.from(e.target.files || []));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setErrorMsg("");

        if (!title.trim() || !description.trim() || !categoryId || !priorityId || !sectorId) {
            setErrorMsg("Preencha título, descrição, categoria, prioridade e setor.");
            return;
        }

        try {
            setSubmitting(true);

            // Usa FormData para suportar anexos
            const form = new FormData();
            form.append("title", title.trim());
            form.append("description", description.trim());
            form.append("categoryId", categoryId);
            form.append("priorityId", priorityId);
            form.append("sectorId", sectorId);
            // Motivo REMOVIDO — não enviamos reasonId nem reason.

            files.forEach((f) => form.append("files", f));

            await axios.post(`${API}/tickets`, form, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            navigate("/tickets"); // volta para a lista do usuário
        } catch (err) {
            console.error("Erro ao abrir chamado:", err);
            const msg =
                err?.response?.status === 400
                    ? "Dados inválidos. Revise os campos."
                    : err?.response?.data?.message || "Erro ao abrir chamado.";
            setErrorMsg(msg);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Abrir Chamado</h1>

            {errorMsg && (
                <div className="mb-4 rounded-lg border border-red-300 bg-red-50 text-red-700 px-4 py-3">{errorMsg}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Título</label>
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full rounded-lg border px-3 py-2"
                        placeholder="Ex.: Impressora não imprime"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Descrição</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full rounded-lg border px-3 py-2 min-h-[120px]"
                        placeholder="Descreva o problema com detalhes…"
                    />
                </div>

                {/* Campo Motivo foi REMOVIDO */}

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
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
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
                                <option key={p.id} value={p.id}>
                                    {p.name}
                                </option>
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
                                <option key={s.id} value={s.id}>
                                    {s.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Anexos (opcional)</label>
                    <input type="file" multiple onChange={onFileChange} className="block w-full text-sm" />
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
