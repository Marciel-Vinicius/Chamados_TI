// frontend/src/pages/TIConfig.jsx
import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';

function TabButton({ active, onClick, children }) {
    return (
        <button
            onClick={onClick}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${active ? 'bg-white text-slate-900' : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
        >
            {children}
        </button>
    );
}

function RowActions({ onEdit, onDelete }) {
    return (
        <div className="flex gap-2">
            <button onClick={onEdit} className="text-xs px-2 py-1 rounded-lg bg-amber-500 text-white">Editar</button>
            <button onClick={onDelete} className="text-xs px-2 py-1 rounded-lg bg-red-600 text-white">Excluir</button>
        </div>
    );
}

function ManageList({ title, endpoint }) {
    const [items, setItems] = useState([]);
    const [busy, setBusy] = useState(true);
    const [err, setErr] = useState('');
    const [name, setName] = useState('');
    const [saving, setSaving] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editingName, setEditingName] = useState('');

    const load = async () => {
        setBusy(true); setErr('');
        try {
            const { data } = await axios.get(endpoint);
            setItems(data || []);
        } catch (e) {
            setErr('Falha ao carregar.');
        } finally {
            setBusy(false);
        }
    };

    useEffect(() => { load(); }, [endpoint]);

    const addItem = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        setSaving(true);
        try {
            await axios.post(endpoint, { name: name.trim() });
            setName('');
            await load();
        } catch (e) {
            alert(e?.response?.data?.message || 'Falha ao cadastrar.');
        } finally {
            setSaving(false);
        }
    };

    const startEdit = (it) => {
        setEditingId(it.id);
        setEditingName(it.name);
    };

    const saveEdit = async () => {
        if (!editingName.trim()) return;
        setSaving(true);
        try {
            await axios.put(`${endpoint}/${editingId}`, { name: editingName.trim() });
            setEditingId(null);
            setEditingName('');
            await load();
        } catch (e) {
            alert(e?.response?.data?.message || 'Falha ao editar.');
        } finally {
            setSaving(false);
        }
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditingName('');
    };

    const remove = async (id) => {
        if (!confirm('Tem certeza que deseja excluir?')) return;
        try {
            await axios.delete(`${endpoint}/${id}`);
            await load();
        } catch (e) {
            alert(e?.response?.data?.message || 'Falha ao excluir (pode haver tickets vinculados).');
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">{title}</h2>
                <span className="text-sm text-gray-500">{items.length} itens</span>
            </div>

            <form onSubmit={addItem} className="flex gap-2 mb-4">
                <input
                    className="flex-1 rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    placeholder={`Nome da/o ${title.slice(0, -1).toLowerCase()}`}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <button
                    disabled={saving}
                    className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4"
                >
                    {saving ? 'Salvando...' : 'Cadastrar'}
                </button>
            </form>

            {busy && <div className="text-gray-600 text-sm">Carregando...</div>}
            {err && <div className="text-red-600 text-sm">{err}</div>}
            {!busy && !err && (
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left font-medium text-gray-600 w-20">ID</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-600">Nome</th>
                            <th className="px-4 py-3 text-right font-medium text-gray-600 w-40">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((it) => (
                            <tr key={it.id} className="border-t">
                                <td className="px-4 py-3">{it.id}</td>
                                <td className="px-4 py-3">
                                    {editingId === it.id ? (
                                        <input
                                            className="w-full rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                            value={editingName}
                                            onChange={(e) => setEditingName(e.target.value)}
                                        />
                                    ) : (
                                        it.name
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex justify-end">
                                        {editingId === it.id ? (
                                            <div className="flex gap-2">
                                                <button onClick={saveEdit} className="text-xs px-3 py-1 rounded-lg bg-blue-600 text-white">Salvar</button>
                                                <button onClick={cancelEdit} className="text-xs px-3 py-1 rounded-lg bg-gray-200">Cancelar</button>
                                            </div>
                                        ) : (
                                            <RowActions onEdit={() => startEdit(it)} onDelete={() => remove(it.id)} />
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {items.length === 0 && (
                            <tr>
                                <td colSpan={3} className="px-4 py-6 text-center text-gray-500">
                                    Nenhum item cadastrado.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default function TIConfig() {
    const [tab, setTab] = useState('categories');
    const title = useMemo(() => {
        switch (tab) {
            case 'reasons': return 'Motivos';
            case 'priorities': return 'Prioridades';
            default: return 'Categorias';
        }
    }, [tab]);

    return (
        <div className="space-y-5">
            <div>
                <h1 className="text-white text-xl font-semibold">Configurações TI</h1>
                <p className="text-white/70 text-sm">Cadastre e gerencie as tabelas de apoio.</p>
            </div>

            <div className="flex items-center gap-2">
                <TabButton active={tab === 'categories'} onClick={() => setTab('categories')}>Categorias</TabButton>
                <TabButton active={tab === 'reasons'} onClick={() => setTab('reasons')}>Motivos</TabButton>
                <TabButton active={tab === 'priorities'} onClick={() => setTab('priorities')}>Prioridades</TabButton>
            </div>

            {tab === 'categories' && <ManageList title="Categorias" endpoint="/categories" />}
            {tab === 'reasons' && <ManageList title="Motivos" endpoint="/reasons" />}
            {tab === 'priorities' && <ManageList title="Prioridades" endpoint="/priorities" />}
        </div>
    );
}
