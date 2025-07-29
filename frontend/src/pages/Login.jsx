import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const res = await axios.post('/auth/login', { email, password });
      const { token } = res.data;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao entrar.');
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow">
      <h1 className="text-2xl font-bold text-center mb-6">Login</h1>
      {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="E-mail"
          className="w-full border border-gray-300 p-2 rounded mb-4"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Senha"
          className="w-full border border-gray-300 p-2 rounded mb-4"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded mb-4"
        >
          Entrar
        </button>
      </form>
      <div className="text-center">
        <Link to="/forgot-password" className="text-blue-500 hover:underline">Esqueceu a senha?</Link>
      </div>
      <p className="text-center mt-4">
        Ainda não tem conta? <Link to="/register" className="text-blue-500 hover:underline">Cadastre-se</Link>
      </p>
    </div>
  );
}
