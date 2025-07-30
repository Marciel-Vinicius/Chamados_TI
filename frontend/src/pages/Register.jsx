// frontend/src/pages/Register.jsx
import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [setor, setSetor] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        setMessage('');
        try {
            const res = await axios.post('/auth/register', { email, password, setor });
            setMessage(res.data.message);
            navigate('/verify-email', { state: { email } });
        } catch (err) {
            setMessage(err.response?.data?.message || 'Erro ao cadastrar.');
        }
    }

    return (
        <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded-2xl shadow-lg">
            <h2 className="text-2xl font-semibold mb-6 text-center">Crie sua conta</h2>
            {message && <div className="mb-4 text-center text-red-500">{message}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Setor</label>
                    <input
                        type="text"
                        value={setor}
                        onChange={e => setSetor(e.target.value)}
                        placeholder="Ex: Financeiro, RH, Compras…"
                        className="w-full border px-3 py-2 rounded focus:outline-none focus:border-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="seu@exemplo.com"
                        className="w-full border px-3 py-2 rounded focus:outline-none focus:border-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Senha</label>
                    <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        className="w-full border px-3 py-2 rounded focus:outline-none focus:border-blue-500"
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
                >
                    Cadastrar
                </button>
            </form>
            <p className="text-center mt-4 text-sm">
                Já tem conta?{' '}
                <Link to="/login" className="text-blue-600 hover:underline">
                    Entrar
                </Link>
            </p>
        </div>
    );
}
