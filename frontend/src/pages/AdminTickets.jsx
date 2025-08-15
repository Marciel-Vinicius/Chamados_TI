// frontend/src/pages/AdminTickets.jsx
import { useEffect, useMemo, useState } from "react";
import axios from "axios";

export default function AdminTickets() {
  const API = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/$/, "");

  // ---- estados ----
  const [tickets, setTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const [ticketsError, setTicketsError] = useState("");

  const [selected, setSelected] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newComment, setNewComment] = useState("");

  // >>> Mantemos apenas Categoria / Prioridade / Setor
  const [cats, setCats] = useState([]);
  const [catInput, setCatInput] = useState("");

  const [priorities, setPriorities] = useState([]);
  const [priorityInput, setPriorityInput] = useState("");

  const [sectors, setSectors] = useState([]);
  const [sectorInput, setSectorInput] = useState("");

  const [catalogError, setCatalogError] = useState("");
  const [saving, setSaving] = useState({ category: false, priority: false, sector: false });

  // Authorization padrão
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }, []);

  // carregamentos
  useEffect(() => {
    (async () => {
      try {
        await Promise.all([fetchTickets(), fetchCategories(), fetchPriorities(), fetchSectors()]);
      } finally {
        setTicketsLoading(false);
      }
    })();
  }, []);

  // ---- fetchers ----
  async function fetchTickets() {
    setTicketsError("");
    try {
      const { data } = await axios.get(`${API}/tickets/all`);
      setTickets(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("[GET /tickets/all] erro:", err);
      const msg =
        err?.response?.status === 401
          ? "Não autenticado. Faça login novamente."
          : err?.response?.status === 403
            ? "Sem permissão para visualizar os chamados do TI."
            : "Erro ao buscar chamados. Veja console.";
      setTicketsError(msg);
    }
  }
  async function fetchCategories() {
    try {
      const { data } = await axios.get(`${API}/categories`);
      setCats(Array.isArray(data) ? data : []);
    } catch {
      setCatalogError("Falha ao carregar Categorias.");
    }
  }
  async function fetchPriorities() {
    try {
      const { data } = await axios.get(`${API}/priorities`);
      setPriorities(Array.isArray(data) ? data : []);
    } catch {
      setCatalogError("Falha ao carregar Prioridades.");
    }
  }
  async function fetchSectors() {
    try {
      const { data } = await axios.get(`${API}/sectors`);
      setSectors(Array.isArray(data) ? data : []);
    } catch {
      setCatalogError("Falha ao carregar Setores.");
    }
  }

  async function fetchComments(ticketId) {
    setCommentsLoading(true);
    try {
      const { data } = await axios.get(`${API}/tickets/${ticketId}/comments`);
      setComments(Array.isArray(data) ? data : []);
    } finally {
      setCommentsLoading(false);
    }
  }

  useEffect(() => {
    if (selected?.id) fetchComments(selected.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.id]);

  // ---- criação de catálogos ----
  async function addItem(kind) {
    const map = {
      category: { endpoint: "categories", value: catInput, setter: setCats, clear: () => setCatInput("") },
      priority: { endpoint: "priorities", value: priorityInput, setter: setPriorities, clear: () => setPriorityInput("") },
      sector: { endpoint: "sectors", value: sectorInput, setter: setSectors, clear: () => setSectorInput("") },
    };
    const cfg = map[kind];
    if (!cfg) return;
    const name = (cfg.value || "").trim();
    if (!name) return;

    try {
      setSaving((s) => ({ ...s, [kind]: true }));
      const { data } = await axios.post(`${API}/${cfg.endpoint}`, { name });
      cfg.setter((prev) => [...prev, data]);
      cfg.clear();
      setCatalogError("");
    } catch (err) {
      console.error(err);
      const msg = err?.response?.status === 409 ? "Já existe um item com esse nome." : "Falha ao salvar.";
      setCatalogError(msg);
    } finally {
      setSaving((s) => ({ ...s, [kind]: false }));
    }
  }

  // ---- derivados ----
  const sortedTickets = useMemo(() => {
    const arr = Array.isArray(tickets) ? [...tickets] : [];
    arr.sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0));
    return arr;
  }, [tickets]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Painel TI</h1>
        <button onClick={() => fetchTickets()} className="rounded-lg px-4 py-2 bg-blue-600 text-white hover:bg-blue-700">
          Recarregar
        </button>
      </div>

      {ticketsError && (
        <div className="rounded-lg border border-red-300 bg-red-50 text-red-700 px-4 py-3">{ticketsError}</div>
      )}
      {catalogError && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 text-amber-800 px-4 py-3">{catalogError}</div>
      )}

      {/* ==== Catálogos (só Categoria, Prioridade, Setor) ==== */}
      <section id="admin-catalog" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <CatalogCard
          title="Categorias"
          placeholder="Nova categoria"
          value={catInput}
          onChange={setCatInput}
          onAdd={() => addItem("category")}
          loading={saving.category}
        >
          <Chips items={cats} />
        </CatalogCard>

        <CatalogCard
          title="Prioridades"
          placeholder="Nova prioridade"
          value={priorityInput}
          onChange={setPriorityInput}
          onAdd={() => addItem("priority")}
          loading={saving.priority}
        >
          <Chips items={priorities} />
        </CatalogCard>

        <CatalogCard
          title="Setores"
          placeholder="Novo setor"
          value={sectorInput}
          onChange={setSectorInput}
          onAdd={() => addItem("sector")}
          loading={saving.sector}
        >
          <Chips items={sectors} />
        </CatalogCard>
      </section>

      {/* ==== Lista + Detalhes ==== */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Lista de Chamados</h2>
          {ticketsLoading ? (
            <div className="rounded-lg border p-4 animate-pulse text-gray-500">Carregando chamados...</div>
          ) : sortedTickets.length === 0 ? (
            <div className="rounded-lg border p-4 text-gray-500">Nenhum chamado encontrado.</div>
          ) : (
            <ul className="space-y-3">
              {sortedTickets.map((t) => (
                <li key={`ticket-${t.id}`}>
                  <button
                    className={`w-full text-left rounded-xl border p-4 hover:bg-gray-50 ${selected?.id === t.id ? "ring-2 ring-blue-500" : ""
                      }`}
                    onClick={() => setSelected(t)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-semibold">{t.title}</div>
                      <StatusPill status={t.status} />
                    </div>
                    <div className="mt-1 text-sm text-gray-600">
                      {/* Motivo removido */}
                      {t.category || "Sem categoria"}
                      {t.priority ? ` • ${t.priority}` : ""}
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      Aberto em: {t.createdAt ? new Date(t.createdAt).toLocaleString("pt-BR") : "—"}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Detalhes</h2>
          {!selected ? (
            <div className="rounded-lg border p-6 text-gray-500">Selecione um chamado para ver detalhes.</div>
          ) : (
            <TicketDetails
              ticket={selected}
              comments={comments}
              commentsLoading={commentsLoading}
              newComment={newComment}
              setNewComment={setNewComment}
              onSendComment={addComment}
            />
          )}
        </div>
      </section>
    </div>
  );

  // ---- helpers ----
  async function addComment() {
    const content = newComment.trim();
    if (!selected?.id || !content) return;
    try {
      const { data } = await axios.post(`${API}/tickets/${selected.id}/comments`, { content });
      setComments((prev) => [...prev, data]);
      setNewComment("");
    } catch {
      alert("Falha ao enviar comentário.");
    }
  }
}

/* ---------- Subcomponentes ---------- */

function CatalogCard({ title, placeholder, value, onChange, onAdd, loading, children }) {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="mb-3 font-semibold">{title}</div>
      <div className="space-y-3">
        <div className="flex">
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 rounded-lg border px-3 py-2"
            placeholder={placeholder}
          />
          <button
            onClick={onAdd}
            disabled={loading}
            className="ml-2 rounded-lg px-3 py-2 bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            Adicionar
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Chips({ items }) {
  if (!Array.isArray(items) || items.length === 0) {
    return <div className="text-sm text-gray-500">Nenhum item cadastrado.</div>;
  }
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((i) => (
        <span
          key={`chip-${i.id}-${i.name}`}
          className="inline-flex items-center rounded-full border px-3 py-1 text-sm bg-gray-50"
        >
          {i.name}
        </span>
      ))}
    </div>
  );
}

function StatusPill({ status }) {
  const map =
    status === "Concluído"
      ? "bg-blue-100 text-blue-800"
      : status === "Em andamento"
        ? "bg-amber-100 text-amber-800"
        : "bg-emerald-100 text-emerald-800";
  return <span className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${map}`}>{status || "Aberto"}</span>;
}

function Detail({ label, value }) {
  return (
    <div className="text-sm">
      <div className="text-gray-500">{label}</div>
      <div className="font-medium">{value ?? "—"}</div>
    </div>
  );
}

function TicketDetails({ ticket, comments, commentsLoading, newComment, setNewComment, onSendComment }) {
  return (
    <div className="rounded-2xl border p-6">
      <h3 className="text-xl font-bold">{ticket.title}</h3>
      <div className="mt-2 text-sm text-gray-700">{ticket.description}</div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
        {/* Motivo removido */}
        <Detail label="Categoria" value={ticket.category || "—"} />
        <Detail label="Prioridade" value={ticket.priority || "—"} />
        <Detail label="Status" value={<StatusPill status={ticket.status} />} />
        <Detail label="Setor" value={ticket.sector || "—"} />
        <Detail label="Criador" value={ticket?.User?.email || ticket?.creator || "—"} />
        <Detail
          label="Aberto em"
          value={ticket.createdAt ? new Date(ticket.createdAt).toLocaleString("pt-BR") : "—"}
        />
      </div>

      <div className="mt-6">
        <h4 className="font-semibold mb-2">Comentários</h4>
        {commentsLoading ? (
          <div className="text-gray-500 text-sm">Carregando comentários...</div>
        ) : comments.length === 0 ? (
          <div className="text-gray-500 text-sm">Nenhum comentário ainda.</div>
        ) : (
          <ul className="space-y-3">
            {comments.map((c) => (
              <li key={`comment-${c.id}`} className="rounded-lg border p-3">
                <div className="text-sm">{c.content}</div>
                <div className="mt-1 text-xs text-gray-500">
                  {c.User?.email || "Desconhecido"} — {c.createdAt ? new Date(c.createdAt).toLocaleString("pt-BR") : ""}
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-3 flex gap-2">
          <input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="flex-1 rounded-lg border px-3 py-2"
            placeholder="Escreva um comentário…"
          />
          <button onClick={onSendComment} className="rounded-lg px-4 py-2 bg-blue-600 text-white hover:bg-blue-700">
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
}
