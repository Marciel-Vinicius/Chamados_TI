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
    try {
      const res = await axios.post(`${API}/auth/login`, { email, password });
      const { token } = res.data;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      navigate('/admin');
    } catch (err) {
      console.error(err);
      setMsg(err.response?.data?.message || 'Erro no login');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-xl font-semibold mb-4">Login</h2>
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
          autoComplete="current-password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full border px-3 py-2 rounded mb-4"
          required
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit">
          Entrar
        </button>
      </form>
      <div className="mt-4 text-sm">
        Não tem conta?{' '}
        <Link to="/register" className="text-blue-600 underline">
          Criar conta
        </Link>
      </div>
    </div>
  );
}
