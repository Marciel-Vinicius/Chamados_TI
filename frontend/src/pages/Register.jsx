import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        setMessage('');
        try {
            const res = await axios.post('/auth/register', { email, password });
            setMessage(res.data.message); // “Código enviado...”
            setTimeout(() => navigate(`/verify-email?email=${encodeURIComponent(email)}`), 1500);
        } catch (err) {
            console.error('REGISTER ERR:', err.response || err);
            setMessage(err.response?.data?.message || 'Erro no cadastro.');
        }
    }

    return (
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow">
            <h1 className="text-2xl font-bold text-center mb-6">Cadastro</h1>
            {message && (
                <p
                    className={`mb-4 text-center ${message.startsWith('Código') ? 'text-green-600' : 'text-red-600'
                        }`}
                >
                    {message}
                </p>
            )}
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="E‑mail"
                    className="w-full border border-gray-300 p-2 rounded mb-4"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                />
                <input
                    type="password"
                    placeholder="Senha"
                    className="w-full border border-gray-300 p-2 rounded mb-4"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                />
                <button
                    type="submit"
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded"
                >
                    Cadastrar
                </button>
            </form>
            <p className="text-center mt-4">
                Já tem conta? <Link to="/login" className="text-blue-500 hover:underline">Entrar</Link>
            </p>
        </div>
    );
}
