// frontend/src/pages/Register.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Register() {
    const [form, setForm] = useState({
        email: '',
        password: '',
        sectorId: ''
    });
    const [sectors, setSectors] = useState([]);
    const [msg, setMsg] = useState('');
    const [loadingSectors, setLoadingSectors] = useState(true);
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();
    const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    useEffect(() => {
        async function fetchSectors() {
            try {
                const res = await axios.get(`${API}/sectors`);
                setSectors(res.data);
            } catch (e) {
                console.error('Erro ao carregar setores', e);
            } finally {
                setLoadingSectors(false);
            }
        }
        fetchSectors();
    }, [API]);

    const validate = () => {
        const e = {};
        if (!form.email.trim()) e.email = 'Email é obrigatório.';
        if (!form.password) e.password = 'Senha é obrigatória.';
        if (!form.sectorId) e.sectorId = 'Setor é obrigatório.';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setMsg('');
        if (!validate()) return;

        try {
            await axios.post(`${API}/auth/register`, {
                email: form.email,
                password: form.password,
                sectorId: form.sectorId
            });
            setMsg('✅ Código enviado. Verifique seu e-mail para validar.');
            setTimeout(() => navigate('/verify-email', { state: { email: form.email } }), 1200);
        } catch (err) {
            console.error('Erro no registro:', err);
            if (err.response) {
                setMsg(err.response.data?.message || 'Erro ao registrar.');
            } else {
                setMsg('Erro de rede ao tentar registrar.');
            }
        }
    };

    return (
        <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Registrar</h2>

            {msg && (
                <div
                    className={`mb-3 p-2 rounded ${msg.startsWith('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}
                >
                    {msg}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                        type="email"
                        value={form.email}
                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                        className="w-full border px-3 py-2 rounded focus:outline-none focus:border-blue-500"
                        required
                    />
                    {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Senha</label>
                    <input
                        type="password"
                        value={form.password}
                        onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                        className="w-full border px-3 py-2 rounded focus:outline-none focus:border-blue-500"
                        required
                    />
                    {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password}</p>}
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Setor</label>
                    {loadingSectors ? (
                        <div>Carregando setores...</div>
                    ) : (
                        <select
                            value={form.sectorId}
                            onChange={e => setForm(f => ({ ...f, sectorId: e.target.value }))}
                            className="w-full border px-3 py-2 rounded focus:outline-none focus:border-blue-500"
                            required
                        >
                            <option value="">Selecione</option>
                            {sectors.map(s => (
                                <option key={s.id} value={s.id}>
                                    {s.name}
                                </option>
                            ))}
                        </select>
                    )}
                    {errors.sectorId && <p className="text-red-600 text-sm mt-1">{errors.sectorId}</p>}
                </div>

                <button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                >
                    Cadastrar
                </button>
            </form>
        </div>
    );
}
