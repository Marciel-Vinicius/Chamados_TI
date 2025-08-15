// frontend/src/pages/Reports.jsx
import { useEffect, useMemo, useState } from "react";
import axios from "axios";

function groupCount(items, keyFn) {
    const map = new Map();
    for (const it of items) {
        const key = keyFn(it) ?? "—";
        const k = String(key);
        map.set(k, (map.get(k) || 0) + 1);
    }
    return Array.from(map.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);
}

function toMonthKey(dateStr) {
    const d = dateStr ? new Date(dateStr) : null;
    if (!d || isNaN(d)) return "—";
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
}

function exportCSV(filename, rows, headers) {
    const headerLine = headers.join(";");
    const dataLines = rows.map(r => headers.map(h => String(r[h] ?? "").replace(/;/g, ",")).join(";"));
    const csv = [headerLine, ...dataLines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

export default function Reports() {
    const API = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/$/, "");
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");

    async function load() {
        setLoading(true);
        setErr("");
        try {
            const params = {};
            if (dateFrom) params.dateFrom = dateFrom;
            if (dateTo) params.dateTo = dateTo;
            const { data } = await axios.get(`${API}/tickets/all`, { params });
            setTickets(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error("[Reports] erro ao buscar /tickets/all:", e);
            setErr("Não foi possível carregar os dados.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

    const total = tickets.length;

    const byStatus = useMemo(() => {
        const normalize = (s) => (s || "").toString().toLowerCase();
        return groupCount(tickets, (t) => {
            const s = normalize(t.status);
            if (s.includes("fech")) return "Fechado";
            if (s.includes("andament") || s.includes("progress")) return "Em Andamento";
            return "Aberto";
        });
    }, [tickets]);

    const byCategory = useMemo(() => groupCount(tickets, (t) => t.category || t.Category?.name || "Sem categoria"), [tickets]);
    const byPriority = useMemo(() => groupCount(tickets, (t) => t.priority || t.Priority?.name || "—"), [tickets]);
    const byUser = useMemo(() => groupCount(tickets, (t) => t.User?.email || t.creator || "Desconhecido"), [tickets]);
    const byMonth = useMemo(() => groupCount(tickets, (t) => toMonthKey(t.createdAt)).reverse(), [tickets]);

    const openCount = byStatus.find(s => s.name === "Aberto")?.count || 0;
    const doingCount = byStatus.find(s => s.name === "Em Andamento")?.count || 0;
    const closedCount = byStatus.find(s => s.name === "Fechado")?.count || 0;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Relatórios</h1>
                <div className="flex items-end gap-2">
                    <div>
                        <label className="block text-xs text-gray-500">De</label>
                        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="rounded border px-2 py-1" />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500">Até</label>
                        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="rounded border px-2 py-1" />
                    </div>
                    <button onClick={load} className="rounded px-3 py-2 bg-blue-600 text-white hover:bg-blue-700">Aplicar</button>
                    <button onClick={() => { setDateFrom(""); setDateTo(""); setTimeout(load, 0); }} className="rounded px-3 py-2 border">Limpar</button>
                </div>
            </div>

            {err && <div className="rounded border border-red-300 bg-red-50 text-red-700 px-4 py-3">{err}</div>}

            {/* KPIs */}
            <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <KPI title="Total de Chamados" value={total} />
                <KPI title="Abertos" value={openCount} />
                <KPI title="Em Andamento" value={doingCount} />
                <KPI title="Fechados" value={closedCount} />
            </section>

            {loading ? (
                <div className="rounded border p-4 animate-pulse text-gray-500">Carregando...</div>
            ) : (
                <>
                    <ReportTable
                        title="Chamados por Categoria"
                        rows={byCategory}
                        headers={[{ key: "name", label: "Categoria" }, { key: "count", label: "Quantidade" }]}
                        filename="chamados_por_categoria.csv"
                    />
                    <ReportTable
                        title="Chamados por Prioridade"
                        rows={byPriority}
                        headers={[{ key: "name", label: "Prioridade" }, { key: "count", label: "Quantidade" }]}
                        filename="chamados_por_prioridade.csv"
                    />
                    <ReportTable
                        title="Chamados por Usuário (Criador)"
                        rows={byUser}
                        headers={[{ key: "name", label: "Usuário" }, { key: "count", label: "Quantidade" }]}
                        filename="chamados_por_usuario.csv"
                    />
                    <ReportTable
                        title="Chamados por Mês (abertura)"
                        rows={byMonth}
                        headers={[{ key: "name", label: "Mês" }, { key: "count", label: "Quantidade" }]}
                        filename="chamados_por_mes.csv"
                    />
                </>
            )}
        </div>
    );
}

function KPI({ title, value }) {
    return (
        <div className="rounded-xl border bg-white p-4 shadow-sm">
            <div className="text-sm text-gray-500">{title}</div>
            <div className="text-2xl font-bold">{value}</div>
        </div>
    );
}

function ReportTable({ title, rows, headers, filename }) {
    const total = rows.reduce((s, r) => s + (r.count || 0), 0);
    return (
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
                <div className="font-semibold">{title}</div>
                <button
                    onClick={() => exportCSV(filename, rows, headers.map(h => h.key))}
                    className="rounded px-3 py-2 border hover:bg-gray-50"
                >
                    Exportar CSV
                </button>
            </div>
            {rows.length === 0 ? (
                <div className="text-sm text-gray-500">Sem dados.</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-[400px] w-full text-sm">
                        <thead>
                            <tr className="text-left text-gray-500">
                                {headers.map(h => (<th key={h.key} className="py-2 border-b">{h.label}</th>))}
                                <th className="py-2 border-b text-right">%</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((r, idx) => {
                                const pct = total ? ((r.count * 100) / total) : 0;
                                return (
                                    <tr key={`${r.name}-${idx}`} className="border-b">
                                        <td className="py-2 pr-4">{r.name}</td>
                                        <td className="py-2 pr-4">{r.count}</td>
                                        <td className="py-2 text-right">{pct.toFixed(1)}%</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
