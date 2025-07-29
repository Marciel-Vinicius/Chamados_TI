import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';

export default function VerifyEmail() {
    const [code, setCode] = useState('');
    const [message, setMessage] = useState('');
    const [searchParams] = useSearchParams();
    const email = searchParams.get('email') || '';
    const navigate = useNavigate();

    useEffect(() => {
        if (!email) navigate('/register');
    }, [email, navigate]);

    async function handleVerify(e) {
        e.preventDefault();
        try {
            const res = await axios.post('/auth/verify-email', { email, code });
            setMessage(res.data.message);
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            console.error('VERIFY ERR:', err.response || err);
            setMessage(err.response?.data?.message || 'Erro na verificação.');
        }
    }

    return (
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow">
            <h1 className="text-2xl font-bold text-center mb-6">Verificar Conta</h1>
            <p className="text-center mb-4">Enviamos um código para <b>{email}</b>.</p>
            {message && <p className="text-center mb-4">{message}</p>}
            <form onSubmit={handleVerify}>
                <input
                    type="text"
                    placeholder="Código de verificação"
                    className="w-full border border-gray-300 p-2 rounded mb-4"
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    required
                />
                <button
                    type="submit"
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded"
                >
                    Verificar
                </button>
            </form>
            <p className="text-center mt-4">
                Não recebeu o código? <Link to="/register" className="text-blue-500 hover:underline">Cadastrar novamente</Link>
            </p>
        </div>
    );
}
