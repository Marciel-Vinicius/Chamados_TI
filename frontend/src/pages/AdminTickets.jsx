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

  // ===== edição de status (Painel TI) =====
  const STATUS_OPTIONS = ["Aberto", "Em Andamento", "Fechado", "Concluído"];
  const [statusEditing, setStatusEditing] = useState("");
  const [savingStatus, setSavingStatus] = useState(false);

  // Sempre enviar Authorization nos requests
  const headers = useMemo(() => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  useEffect(() => {
    setStatusEditing(selected?.status || "");
  }, [selected?.id, selected?.status]);

  // carregamentos
  useEffect(() => {
    (async () => {
      try {
        await Promise.all([fetchTickets(), fetchCategories(), fetchPriorities(), fetchSectors()]);
      } finally {
        setTicketsLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- fetchers ----
  async function fetchTickets() {
    setTicketsError("");
    try {
      const { data } = await axios.get(`${API}/tickets/all`, { headers });
      const arr = Array.isArray(data) ? data : [];
      setTickets(arr);
      return arr;
    } catch (err) {
      console.error("[GET /tickets/all] erro:", err);
      const msg =
        err?.response?.status === 401
          ? "Não autenticado. Faça login novamente."
          : err?.response?.status === 403
            ? "Sem permissão para visualizar os chamados do TI."
            : "Erro ao buscar chamados. Veja console.";
      setTicketsError(msg);
      return [];
    }
  }
  async function fetchCategories() {
    try {
      const { data } = await axios.get(`${API}/categories`, { headers });
      setCats(Array.isArray(data) ? data : []);
    } catch {
      setCatalogError("Falha ao carregar Categorias.");
    }
  }
  async function fetchPriorities() {
    try {
      const { data } = await axios.get(`${API}/priorities`, { headers });
      setPriorities(Array.isArray(data) ? data : []);
    } catch {
      setCatalogError("Falha ao carregar Prioridades.");
    }
  }
  async function fetchSectors() {
    try {
      const { data } = await axios.get(`${API}/sectors`, { headers });
      setSectors(Array.isArray(data) ? data : []);
    } catch {
      setCatalogError("Falha ao carregar Setores.");
    }
  }

  async function fetchComments(ticketId) {
    setCommentsLoading(true);
    try {
      const { data } = await axios.get(`${API}/tickets/${ticketId}/comments`, { headers });
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
      const { data } = await axios.post(`${API}/${cfg.endpoint}`, { name }, { headers });
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

  // ===== salvar status (tenta PATCH/PUT/PATCH status) =====
  async function updateTicketStatus(id, status) {
    const payload = { status };
    try {
      await axios.patch(`${API}/tickets/${id}`, payload, { headers });
      return;
    } catch (e1) {
      if (e1?.response?.status !== 404) throw e1;
    }
    try {
      await axios.put(`${API}/tickets/${id}`, payload, { headers });
      return;
    } catch (e2) {
      if (e2?.response?.status !== 404) throw e2;
    }
    await axios.patch(`${API}/tickets/${id}/status`, payload, { headers });
  }

  async function saveStatus() {
    if (!selected?.id) return;
    try {
      setSavingStatus(true);
      await updateTicketStatus(selected.id, statusEditing);
      const fresh = await fetchTickets();
      const upd = fresh.find((x) => x.id === selected.id);
      setSelected(upd || null);
      alert("Status atualizado com sucesso.");
    } catch (err) {
      console.error("Falha ao atualizar status:", err);
      const msg = err?.response?.data?.message || "Falha ao atualizar status.";
      alert(msg);
    } finally {
      setSavingStatus(false);
    }
  }

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
          {/* chips */}
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
              // ===== props novos para edição de status =====
              statusOptions={STATUS_OPTIONS}
              statusEditing={statusEditing}
              setStatusEditing={setStatusEditing}
              onSaveStatus={saveStatus}
              savingStatus={savingStatus}
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
      const { data } = await axios.post(`${API}/tickets/${selected.id}/comments`, { content }, { headers });
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
        {/* Linha do input + botão com classe específica para o hotfix */}
        <div className="add-row">
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
    <div className="chip-list mt-3">
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
      : (status === "Em andamento" || status === "Em Andamento")
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

function TicketDetails({
  ticket,
  comments,
  commentsLoading,
  newComment,
  setNewComment,
  onSendComment,
  // novos props
  statusOptions,
  statusEditing,
  setStatusEditing,
  onSaveStatus,
  savingStatus
}) {
  return (
    <div className="rounded-2xl border p-6">
      <h3 className="text-xl font-bold">{ticket.title}</h3>
      <div className="mt-2 text-sm text-gray-700">{ticket.description}</div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
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

      {/* ===== Editor de status ===== */}
      <div className="mt-6 border-t pt-4">
        <div className="text-sm font-semibold mb-2">Atualizar status</div>
        <div className="flex items-center gap-2">
          <select
            value={statusEditing}
            onChange={(e) => setStatusEditing(e.target.value)}
            className="border rounded px-3 py-2 bg-white"
          >
            {statusOptions.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button
            onClick={onSaveStatus}
            disabled={savingStatus}
            className="rounded-lg px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {savingStatus ? "Salvando..." : "Salvar"}
          </button>
        </div>
        <div className="text-xs text-gray-500 mt-2">
          Alterar aqui atualiza o chamado para todos os usuários.
        </div>
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
