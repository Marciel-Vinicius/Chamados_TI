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
      navigate('/'); // ajustar para rota principal
    } catch (err) {
      console.error('Login error', err);
      if (err.response) {
        const serverMsg = err.response.data?.message || 'Erro ao fazer login.';
        setMsg(serverMsg);
      } else {
        setMsg('Erro de rede.');
      }
    }
  };

  const isUnverified = msg.toLowerCase().includes('verifique seu e-mail');

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Entrar</h2>
      {msg && (
        <div className="mb-3 p-2 rounded bg-red-100 text-red-800">
          {msg}
          {isUnverified && (
            <div className="mt-1 text-sm">
              Ainda não verificou o e-mail?{' '}
              <button
                onClick={() => navigate('/verify-email', { state: { email } })}
                className="underline text-blue-600"
              >
                Verificar agora
              </button>
            </div>
          )}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full border px-3 py-2 rounded focus:outline-none focus:border-blue-500"
            required
            autoComplete="username"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Senha</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full border px-3 py-2 rounded focus:outline-none focus:border-blue-500"
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
