// frontend/src/pages/VerifyEmail.jsx
import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '../contexts/ToastContext';

export default function VerifyEmail() {
    const location = useLocation();
    const navigate = useNavigate();
    const { show } = useToast();

    const [code, setCode] = useState('');
    const [message, setMessage] = useState('');
    const email = location.state?.email || '';

    async function handleSubmit(e) {
        e.preventDefault();
        setMessage('');
        try {
            const API = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');
            const res = await axios.post(`${API}/auth/verify-email`, { email, code });
            const token = res.data?.token;
            if (token) localStorage.setItem('token', token);

            show('Email verificado com sucesso.', { type: 'success', title: 'Verificação' });
            navigate('/tickets');
        } catch (err) {
            const msg = err?.response?.data?.message || 'Código inválido ou expirado.';
            setMessage(msg);
        }
    }

    return (
        <div className="max-w-md mx-auto">
            <h1 className="text-2xl font-bold mb-4">Verificar E-mail</h1>
            <div className="bg-white p-6 rounded-xl shadow">
                <p className="text-sm text-slate-600 mb-3">
                    Enviamos um código de verificação para: <b>{email || '(sem e-mail)'}</b>
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Código</label>
                        <input
                            value={code}
                            onChange={e => setCode(e.target.value)}
                            placeholder="000000"
                            className="w-full border px-3 py-2 rounded focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    {message && <div className="text-sm text-red-600">{message}</div>}

                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg">
                        Verificar
                    </button>
                </form>

                <div className="text-sm text-slate-600 mt-4">
                    Digitou o e-mail errado? <Link to="/register" className="text-blue-600 underline">Voltar ao cadastro</Link>
                </div>
            </div>
        </div>
    );
}
