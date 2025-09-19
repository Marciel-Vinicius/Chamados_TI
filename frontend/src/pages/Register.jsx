// frontend/src/pages/Register.jsx
import { useToast } from '../contexts/ToastContext';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Register() {
    const { show } = useToast();
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

    const API = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');

    useEffect(() => {
        const load = async () => {
            try {
                const res = await axios.get(`${API}/sectors`);
                setSectors(res.data || []);
            } catch {
                setSectors([]);
            } finally {
                setLoadingSectors(false);
            }
        };
        load();
    }, [API]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const validate = () => {
        const e = {};
        if (!form.email.trim()) e.email = 'Obrigatório';
        if (!form.password) e.password = 'Obrigatório';
        if (!form.sectorId) e.sectorId = 'Obrigatório';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMsg('');
        if (!validate()) {
            show('Preencha e-mail, senha e setor.', { type: 'error', title: 'Campos obrigatórios' });
            return;
        }
        try {
            // Envia cadastro e o backend dispara o e-mail com código
            await axios.post(`${API}/auth/register`, {
                email: form.email,
                password: form.password,
                sectorId: form.sectorId
            });

            show('Enviamos um código de verificação para seu e-mail.', { type: 'success', title: 'Verificação' });
            // Vai para a tela de verificação levando o e-mail
            navigate('/verify-email', { state: { email: form.email } });
        } catch (err) {
            const message = err?.response?.data?.message || 'Erro ao cadastrar. Tente novamente.';
            show(message, { type: 'error' });
        }
    };

    return (
        <div className="max-w-md mx-auto">
            <h1 className="text-2xl font-bold mb-4">Registrar</h1>
            <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl shadow">
                <div>
                    <label className="block text-sm font-medium mb-1">E-mail</label>
                    <input
                        type="email"
                        name="email"
                        className="w-full border rounded px-3 py-2"
                        value={form.email}
                        onChange={handleChange}
                        autoComplete="email"
                    />
                    {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Senha</label>
                    <input
                        type="password"
                        name="password"
                        className="w-full border rounded px-3 py-2"
                        value={form.password}
                        onChange={handleChange}
                        autoComplete="new-password"
                    />
                    {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Setor</label>
                    <select
                        name="sectorId"
                        className="w-full border rounded px-3 py-2 bg-white"
                        value={form.sectorId}
                        onChange={handleChange}
                    >
                        <option value="">{loadingSectors ? 'Carregando…' : 'Selecione…'}</option>
                        {!loadingSectors && sectors.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>
                    {errors.sectorId && <p className="text-red-600 text-sm mt-1">{errors.sectorId}</p>}
                </div>

                {msg && <p className="text-sm text-red-600">{msg}</p>}

                <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
                    Cadastrar
                </button>
            </form>
        </div>
    );
}
