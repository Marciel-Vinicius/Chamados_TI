import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL;

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(
                `${API_URL}/auth/register`,
                { email, password }
            );
            alert('Conta criada com sucesso!');
            navigate('/login');
        } catch (err) {
            alert('Erro ao criar conta');
        }
    };

    return (
        <div className="flex items-center justify-center h-screen">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-80">
                <h2 className="text-2xl mb-4">Criar Conta</h2>
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
                    className="w-full p-2 bg-green-600 text-white rounded"
                >
                    Registrar
                </button>
                <p className="mt-4 text-center">
                    Já tem conta?{' '}
                    <Link to="/login" className="text-blue-600 hover:underline">
                        Faça login
                    </Link>
                </p>
            </form>
        </div>
    );
}
