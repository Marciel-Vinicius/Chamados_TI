// frontend/src/pages/VerifyEmail.jsx
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function VerifyEmail() {
    const location = useLocation();
    const navigate = useNavigate();
    const [code, setCode] = useState('');
    const [message, setMessage] = useState('');
    const email = location.state?.email || '';

    async function handleSubmit(e) {
        e.preventDefault();
        setMessage('');
        try {
            await axios.post('/auth/verify-email', { email, code });
            setMessage('E‑mail verificado! Redirecionando...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setMessage(err.response?.data?.message || 'Erro na verificação.');
        }
    }

    return (
        <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded-2xl shadow-lg">
            <h2 className="text-2xl font-semibold mb-6 text-center">Verificar E‑mail</h2>
            <p className="mb-4 text-center text-sm text-gray-600">
                Código enviado para <span className="font-medium">{email}</span>
            </p>
            {message && <div className="mb-4 text-center text-red-500">{message}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Código de Verificação</label>
                    <input
                        type="text"
                        value={code}
                        onChange={e => setCode(e.target.value)}
                        placeholder="000000"
                        className="w-full border px-3 py-2 rounded focus:outline-none focus:border-blue-500"
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
                >
                    Verificar
                </button>
            </form>
        </div>
    );
}
