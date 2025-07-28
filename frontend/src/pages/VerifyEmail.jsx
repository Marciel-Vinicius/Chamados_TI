import { useEffect, useState } from 'react';
import axios from 'axios';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';

export default function VerifyEmail() {
    const [message, setMessage] = useState('Verificando...');
    const [verified, setVerified] = useState(false);
    const [params] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const token = params.get('token');
        axios
            .get(`/auth/verify-email?token=${token}`)
            .then(res => {
                setMessage(res.data.message);
                setVerified(true);
                setTimeout(() => navigate('/login'), 3000);
            })
            .catch(() => setMessage('❌ Falha na verificação.'));
    }, []);

    return (
        <div className="container">
            <h1>Verificar E‑mail</h1>
            <p className="message">{message}</p>
            {verified && <p style={{ textAlign: 'center' }}><Link to="/login">Ir para Login</Link></p>}
        </div>
    );
}
