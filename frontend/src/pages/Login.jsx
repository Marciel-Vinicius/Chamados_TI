import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${API_URL}/auth/login`,
        { email, password }
      );
      localStorage.setItem('token', res.data.token);
      const decoded = JSON.parse(atob(res.data.token.split('.')[1]));
      localStorage.setItem('role', decoded.role || 'common');
      navigate('/');
    } catch (err) {
      alert('Login falhou');
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-80">
        <h2 className="text-2xl mb-4">Login</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full mb-3 p-2 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full mb-3 p-2 border rounded"
          required
        />
        <button
          type="submit"
          className="w-full p-2 bg-blue-600 text-white rounded"
        >
          Entrar
        </button>
        <p className="mt-4 text-center">
          Não tem conta?{' '}
          <Link to="/register" className="text-blue-600 hover:underline">
            Crie uma aqui
          </Link>
        </p>
      </form>
    </div>
  );
}
