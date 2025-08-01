// frontend/src/pages/Login.jsx
import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const handleSubmit = async e => {
    e.preventDefault();
    setMsg('');
    if (!email.trim() || !password) {
      setMsg('Email e senha são obrigatórios.');
      return;
    }

    try {
      const res = await axios.post(`${API}/auth/login`, { email, password });
      const token = res.data.token;
      if (!token) {
        setMsg('Resposta inesperada do servidor.');
        return;
      }
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      navigate('/'); // ajustar para rota principal
    } catch (err) {
      console.error('Login error', err);
      if (err.response) {
        setMsg(err.response.data?.message || 'Erro ao fazer login.');
      } else {
        setMsg('Erro de rede.');
      }
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Entrar</h2>
      {msg && <div className="mb-3 p-2 bg-red-100 text-red-800 rounded">{msg}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="email"
            name="email"
            placeholder="seu@exemplo.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
            autoComplete="username"
          />
        </div>
        <div>
          <input
            type="password"
            name="password"
            placeholder="Senha"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
            autoComplete="current-password"
          />
        </div>
        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
          Entrar
        </button>
        <div className="text-sm mt-2">
          Não tem conta? <Link to="/register" className="text-blue-600 underline">Registrar</Link>
        </div>
      </form>
    </div>
  );
}
