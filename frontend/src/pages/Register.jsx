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
        async function loadSectors() {
            setLoadingSectors(true);
            try {
                const res = await axios.get(`${API}/sectors`);
                setSectors(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                console.error('Erro buscando setores:', err);
                setMsg('Não foi possível carregar os setores. Tente novamente mais tarde.');
            } finally {
                setLoadingSectors(false);
            }
        }
        loadSectors();
    }, [API]);

    const handleChange = e => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: null }));
    };

    const validate = () => {
        const e = {};
        if (!form.email.trim()) e.email = 'Email é obrigatório.';
        if (!form.password) e.password = 'Senha é obrigatória.';
        if (!form.sectorId) e.sectorId = 'Selecione um setor.';
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
            // opcional: redirecionar para página de verificação
            setTimeout(() => navigate('/verify-email'), 1200);
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

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <input
                        type="email"
                        name="email"
                        placeholder="seu@exemplo.com"
                        value={form.email}
                        onChange={handleChange}
                        className="w-full border px-3 py-2 rounded"
                        autoComplete="username"
                    />
                    {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                    <input
                        type="password"
                        name="password"
                        placeholder="Senha"
                        value={form.password}
                        onChange={handleChange}
                        className="w-full border px-3 py-2 rounded"
                        required
                        autoComplete="new-password"
                    />
                    {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password}</p>}
                </div>

                <div>
                    <label className="block mb-1 font-medium">Setor</label>
                    {loadingSectors ? (
                        <div className="text-sm text-gray-500">Carregando setores...</div>
                    ) : (
                        <select
                            name="sectorId"
                            value={form.sectorId}
                            onChange={handleChange}
                            className="w-full border px-3 py-2 rounded"
                        >
                            <option value="">-- Selecione o setor --</option>
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
