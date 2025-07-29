import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [step, setStep] = useState('email');     // 'email' ou 'reset'
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    // 1. envia código
    async function handleSendCode(e) {
        e.preventDefault();
        try {
            await axios.post('/auth/forgot-password', { email });
            setMessage('✅ Código enviado! Verifique seu e‑mail.');
            setStep('reset');
        } catch (err) {
            setMessage(err.response?.data?.message || '❌ Erro ao solicitar código.');
        }
    }

    // 2. redefine senha
    async function handleReset(e) {
        e.preventDefault();
        try {
            await axios.post('/auth/reset-password', { email, code, newPassword });
            setMessage('✅ Senha redefinida! Você será redirecionado.');
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setMessage(err.response?.data?.message || '❌ Erro ao redefinir senha.');
        }
    }

    return (
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow">
            <h1 className="text-2xl font-bold text-center mb-6">Recuperar Senha</h1>
            {message && <p className="text-blue-500 mb-4 text-center">{message}</p>}

            {step === 'email' ? (
                <form onSubmit={handleSendCode}>
                    <input
                        type="email"
                        placeholder="E‑mail cadastrado"
                        className="w-full border border-gray-300 p-2 rounded mb-4"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                    />
                    <button
                        type="submit"
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded"
                    >
                        Enviar código
                    </button>
                </form>
            ) : (
                <form onSubmit={handleReset}>
                    <input
                        type="text"
                        placeholder="Código recebido"
                        className="w-full border border-gray-300 p-2 rounded mb-4"
                        value={code}
                        onChange={e => setCode(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Nova senha"
                        className="w-full border border-gray-300 p-2 rounded mb-4"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        required
                    />
                    <button
                        type="submit"
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded"
                    >
                        Redefinir senha
                    </button>
                </form>
            )}

            <p className="text-center mt-4">
                Voltar para <Link to="/login" className="text-blue-500 hover:underline">Login</Link>
            </p>
        </div>
    );
}
