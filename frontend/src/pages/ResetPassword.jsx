import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams, useNavigate } from 'react-router-dom';

export default function ResetPassword() {
    const [code, setCode] = useState('');
    const [newPass, setNewPass] = useState('');
    const [message, setMessage] = useState('');
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const email = params.get('email') || '';

    async function handleSubmit(e) {
        e.preventDefault();
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/auth/reset-password`, {
                email, code, newPassword: newPass
            });
            setMessage('Senha redefinida! Redirecionando ao login...');
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setMessage(err.response.data.message || 'Erro ao redefinir.');
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <h1>Nova Senha</h1>
            {message && <p>{message}</p>}
            <input placeholder="Código recebido" value={code} onChange={e => setCode(e.target.value)} />
            <input type="password" placeholder="Nova senha" value={newPass} onChange={e => setNewPass(e.target.value)} />
            <button>Redefinir</button>
        </form>
    );
}
