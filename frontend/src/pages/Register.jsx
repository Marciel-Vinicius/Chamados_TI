import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [setor, setSetor] = useState('');
    const [msg, setMsg] = useState('');
    const navigate = useNavigate();
    const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            const res = await axios.post(`${API}/auth/register`, { email, password, setor });
            setMsg(res.data.message || 'Verifique seu e-mail para validar.');
            // opcional: redirecionar pra verify-email depois
        } catch (err) {
            console.error(err);
            setMsg(err.response?.data?.message || 'Erro no cadastro');
        }
    };

    return (
        <div className="max-w-md mx-auto p-6">
            <h2 className="text-xl font-semibold mb-4">Registrar</h2>
            {msg && <div className="mb-3 text-red-600">{msg}</div>}
            <form onSubmit={handleSubmit} className="flex flex-col">
                <input
                    type="email"
                    placeholder="seu@exemplo.com"
                    autoComplete="username"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full border px-3 py-2 rounded mb-4"
                    required
                />
                <input
                    type="password"
                    placeholder="Senha"
                    autoComplete="new-password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full border px-3 py-2 rounded mb-4"
                    required
                />
                <input
                    type="text"
                    placeholder="Setor"
                    value={setor}
                    onChange={e => setSetor(e.target.value)}
                    className="w-full border px-3 py-2 rounded mb-4"
                    required
                />
                <button className="bg-green-600 text-white px-4 py-2 rounded" type="submit">
                    Cadastrar
                </button>
            </form>
        </div>
    );
}
