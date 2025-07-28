import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [step, setStep] = useState('email');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

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

    async function handleReset(e) {
        e.preventDefault();
        try {
            await axios.post('/auth/reset-password', { email, code, newPassword });
            setMessage('✅ Senha redefinida! Redirecionando...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setMessage(err.response?.data?.message || '❌ Erro ao redefinir senha.');
        }
    }

    return (
        <div className="container">
            <h1>Recuperar Senha</h1>
            {message && <p className="message">{message}</p>}

            {step === 'email' && (
                <form onSubmit={handleSendCode}>
                    <input
                        type="email"
                        placeholder="E‑mail cadastrado"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                    />
                    <button type="submit">Enviar código</button>
                    <p>Voltar para <Link to="/login">Login</Link></p>
                </form>
            )}

            {step === 'reset' && (
                <form onSubmit={handleReset}>
                    <input
                        type="text"
                        placeholder="Código recebido"
                        value={code}
                        onChange={e => setCode(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Nova senha"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        required
                    />
                    <button type="submit">Redefinir senha</button>
                </form>
            )}
        </div>
    );
}
