// frontend/src/pages/VerifyEmail.jsx
import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function VerifyEmail() {
    const nav = useNavigate();
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [busy, setBusy] = useState(false);
    const [msg, setMsg] = useState('');
    const [err, setErr] = useState('');

    const handleVerify = async (e) => {
        e.preventDefault();
        setErr(''); setMsg('');
        setBusy(true);
        try {
            const { data } = await axios.post('/auth/verify-email', { email, code });
            setMsg(data?.message || 'E-mail verificado!');
            setTimeout(() => nav('/login'), 1200);
        } catch (error) {
            console.error(error);
            setErr(error?.response?.data?.message || 'Falha ao verificar.');
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="max-w-md mx-auto">
            <h1 className="text-white text-2xl font-semibold mb-4">Verificar e-mail</h1>
            <div className="bg-white rounded-2xl shadow p-6">
                <form onSubmit={handleVerify} className="space-y-4">
                    {err && <div className="p-3 rounded-lg text-sm bg-red-50 text-red-700">{err}</div>}
                    {msg && <div className="p-3 rounded-lg text-sm bg-green-50 text-green-700">{msg}</div>}

                    <div>
                        <label className="block text-sm font-medium text-gray-700">E-mail</label>
                        <input
                            type="email"
                            className="mt-1 w-full rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="voce@empresa.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Código</label>
                        <input
                            type="text"
                            className="mt-1 w-full rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="Código recebido por e-mail"
                            required
                        />
                    </div>

                    <button
                        disabled={busy}
                        className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white py-2 font-medium transition"
                    >
                        {busy ? 'Verificando...' : 'Verificar'}
                    </button>
                </form>

                <div className="mt-4 text-sm text-gray-600">
                    <Link className="hover:underline" to="/login">Voltar ao login</Link>
                </div>
            </div>
        </div>
    );
}
