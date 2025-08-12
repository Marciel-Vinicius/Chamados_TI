// frontend/src/pages/Login.jsx
import { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      const { data } = await axios.post('/auth/login', { email, password });
      const token = data?.token || data?.accessToken;
      if (!token) throw new Error('Resposta sem token');

      localStorage.setItem('token', token);
      if (data?.user) localStorage.setItem('user', JSON.stringify(data.user));
      else localStorage.removeItem('user');

      nav('/tickets', { replace: true });
    } catch (error) {
      console.error('Login error', error);
      setErr('Falha no login. Verifique seus dados.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-white text-2xl font-semibold mb-4">Entrar</h1>
      <div className="bg-white rounded-2xl shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {err && <div className="p-3 rounded-lg text-sm bg-red-50 text-red-700">{err}</div>}

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
              placeholder="••••••••"
              required
            />
          </div>

          <button
            disabled={busy}
            className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white py-2 font-medium transition"
          >
            {busy ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="mt-4 text-sm text-gray-600 flex items-center justify-between">
          <Link className="hover:underline" to="/register">Criar conta</Link>
          <Link className="hover:underline" to="/reset">Esqueci minha senha</Link>
        </div>
      </div>
    </div>
  );
}
