// frontend/src/pages/TIConfig.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function TIConfig() {
    const [reasons, setReasons] = useState([]);
    const [newReason, setNewReason] = useState('');
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState('');
    const [priorities, setPriorities] = useState([]);
    const [newPriority, setNewPriority] = useState('');
    const [sectors, setSectors] = useState([]);
    const [newSector, setNewSector] = useState('');
    const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    useEffect(() => {
        fetchReasons();
        fetchCategories();
        fetchPriorities();
        fetchSectors();
    }, []);

    async function fetchReasons() {
        const { data } = await axios.get(`${API}/reasons`);
        setReasons(data);
    }
    async function fetchCategories() {
        const { data } = await axios.get(`${API}/categories`);
        setCategories(data);
    }
    async function fetchPriorities() {
        const { data } = await axios.get(`${API}/priorities`);
        setPriorities(data);
    }
    async function fetchSectors() {
        const { data } = await axios.get(`${API}/sectors`);
        setSectors(data);
    }

    async function addReason() {
        if (!newReason.trim()) return;
        const { data } = await axios.post(`${API}/reasons`, { name: newReason.trim() });
        setReasons(r => [...r, data]);
        setNewReason('');
    }
    async function addCategory() {
        if (!newCategory.trim()) return;
        const { data } = await axios.post(`${API}/categories`, { name: newCategory.trim() });
        setCategories(c => [...c, data]);
        setNewCategory('');
    }
    async function addPriority() {
        if (!newPriority.trim()) return;
        const { data } = await axios.post(`${API}/priorities`, { name: newPriority.trim() });
        setPriorities(p => [...p, data]);
        setNewPriority('');
    }
    async function addSector() {
        if (!newSector.trim()) return;
        const { data } = await axios.post(`${API}/sectors`, { name: newSector.trim() });
        setSectors(s => [...s, data]);
        setNewSector('');
    }

    return (
        <div className="max-w-7xl mx-auto px-6 py-8">
            <h2 className="text-3xl font-bold mb-6">Configurações TI</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <ConfigCard
                    title="Motivos de Chamado"
                    items={reasons}
                    newValue={newReason}
                    onChange={e => setNewReason(e.target.value)}
                    onAdd={addReason}
                    placeholder="Novo motivo"
                    buttonColor="bg-green-600 hover:bg-green-700"
                />
                <ConfigCard
                    title="Categorias"
                    items={categories}
                    newValue={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    onAdd={addCategory}
                    placeholder="Nova categoria"
                    buttonColor="bg-blue-600 hover:bg-blue-700"
                />
                <ConfigCard
                    title="Prioridades"
                    items={priorities}
                    newValue={newPriority}
                    onChange={e => setNewPriority(e.target.value)}
                    onAdd={addPriority}
                    placeholder="Nova prioridade"
                    buttonColor="bg-indigo-600 hover:bg-indigo-700"
                />
                <ConfigCard
                    title="Setores"
                    items={sectors}
                    newValue={newSector}
                    onChange={e => setNewSector(e.target.value)}
                    onAdd={addSector}
                    placeholder="Novo setor"
                    buttonColor="bg-purple-600 hover:bg-purple-700"
                />
            </div>
        </div>
    );
}

function ConfigCard({ title, items, newValue, onChange, onAdd, placeholder, buttonColor }) {
    return (
        <div className="bg-white border rounded-2xl shadow p-5 flex flex-col">
            <h3 className="text-lg font-semibold mb-3">{title}</h3>
            <div className="flex mb-3">
                <input
                    className="flex-1 min-w-0 border border-gray-300 rounded-l-lg px-3 py-2 focus:outline-none"
                    placeholder={placeholder}
                    value={newValue}
                    onChange={onChange}
                />
                <button onClick={onAdd} className={`${buttonColor} text-white px-4 py-2 rounded-r-lg`}>
                    Adicionar
                </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-auto">
                {items.length ? (
                    items.map(i => (
                        <span key={i.id} className="bg-gray-100 px-3 py-1 rounded text-sm">
                            {i.name}
                        </span>
                    ))
                ) : (
                    <p className="text-gray-500">Nenhum {title.toLowerCase()}</p>
                )}
            </div>
        </div>
    );
}
