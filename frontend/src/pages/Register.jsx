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
        try {
            await axios.post('/auth/register', { email, password });
            setMessage('✅ Registro ok! Verifique seu e‑mail.');
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setMessage(err.response?.data?.message || '❌ Erro no registro.');
        }
    }

    return (
        <div className="container">
            <h1>Cadastro</h1>
            {message && <p className="message">{message}</p>}
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="E‑mail"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Senha"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Cadastrar</button>
            </form>
            <p>Já tem conta? <Link to="/login">Entrar</Link></p>
        </div>
    );
}
