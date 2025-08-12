// frontend/src/pages/Register.jsx
import { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

export default function Register() {
    const nav = useNavigate();
    const [name, setName] = useState(''); // nome do usuário
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [busy, setBusy] = useState(false);
    const [msg, setMsg] = useState('');
    const [err, setErr] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErr(''); setMsg('');
        setBusy(true);
        try {
            const { data } = await axios.post('/auth/register', { name, email, password });
            setMsg(data?.message || 'Conta criada! Verifique seu e-mail (se aplicável).');
            setTimeout(() => nav('/login'), 1200);
        } catch (error) {
            console.error('Register error', error);
            setErr(error?.response?.data?.message || 'Falha ao registrar.');
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="max-w-md mx-auto">
            <h1 className="text-white text-2xl font-semibold mb-4">Criar conta</h1>
            <div className="bg-white rounded-2xl shadow p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    {err && <div className="p-3 rounded-lg text-sm bg-red-50 text-red-700">{err}</div>}
                    {msg && <div className="p-3 rounded-lg text-sm bg-green-50 text-green-700">{msg}</div>}

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nome</label>
                        <input
                            type="text"
                            className="mt-1 w-full rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Seu nome"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">E-mail</label>
                        <input
                            type="email"
                            className="mt-1 w-full rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="voce@empresa.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Senha</label>
                        <input
                            type="password"
                            className="mt-1 w-full rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Mínimo 6 caracteres"
                            required
                        />
                    </div>

                    <button
                        disabled={busy}
                        className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white py-2 font-medium transition"
                    >
                        {busy ? 'Enviando...' : 'Criar conta'}
                    </button>
                </form>

                <div className="mt-4 text-sm text-gray-600">
                    Já tem conta? <Link className="hover:underline" to="/login">Entrar</Link>
                </div>
            </div>
        </div>
    );
}
