// frontend/src/pages/Login.jsx
import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();
  const { show } = useToast();
  const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const handleSubmit = async e => {
    e.preventDefault();
    setMsg('');
    if (!email.trim() || !password) {
      show('Preencha e-mail e senha.', { type: 'error', title: 'Campos obrigatórios' });
      return;
    }
    try {
      const res = await axios.post(`${API}/auth/login`, { email, password });
      localStorage.setItem('token', res.data.token);
      show('Login realizado com sucesso.', { type: 'success', title: 'Bem-vindo(a)' });
      navigate('/tickets');
    } catch (err) {
      show('Credenciais inválidas.', { type: 'error', title: 'Erro no login' });
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Entrar</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl shadow">
        <div>
          <label className="block text-sm font-medium mb-1">E-mail</label>
          <input
            type="email"
            className="w-full border rounded px-3 py-2"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Senha</label>
          <input
            type="password"
            className="w-full border rounded px-3 py-2"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>

        {msg && <p className="text-sm text-red-600">{msg}</p>}

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
