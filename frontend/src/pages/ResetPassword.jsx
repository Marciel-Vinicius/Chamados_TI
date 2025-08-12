// frontend/src/pages/ResetPassword.jsx
import { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function ResetPassword() {
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [password, setPassword] = useState('');
    const [busy, setBusy] = useState(false);
    const [msg, setMsg] = useState('');
    const [err, setErr] = useState('');

    const requestCode = async () => {
        setErr(''); setMsg('');
        setBusy(true);
        try {
            const { data } = await axios.post('/auth/forgot-password', { email });
            setMsg(data?.message || 'Código enviado! Verifique seu e-mail.');
        } catch (error) {
            setErr(error?.response?.data?.message || 'Falha ao solicitar código.');
        } finally {
            setBusy(false);
        }
    };

    const changePassword = async (e) => {
        e.preventDefault();
        setErr(''); setMsg('');
        setBusy(true);
        try {
            const { data } = await axios.post('/auth/reset-password', { email, code, password });
            setMsg(data?.message || 'Senha alterada com sucesso!');
        } catch (error) {
            setErr(error?.response?.data?.message || 'Falha ao alterar senha.');
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="max-w-md mx-auto">
            <h1 className="text-white text-2xl font-semibold mb-4">Recuperar senha</h1>
            <div className="bg-white rounded-2xl shadow p-6 space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">E-mail</label>
                    <div className="mt-1 flex gap-2">
                        <input
                            type="email"
                            className="w-full rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="voce@empresa.com"
                        />
                        <button
                            disabled={busy || !email}
                            onClick={requestCode}
                            className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-4"
                        >
                            Enviar código
                        </button>
                    </div>
                </div>

                <form onSubmit={changePassword} className="space-y-4">
                    {err && <div className="p-3 rounded-lg text-sm bg-red-50 text-red-700">{err}</div>}
                    {msg && <div className="p-3 rounded-lg text-sm bg-green-50 text-green-700">{msg}</div>}

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

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nova senha</label>
                        <input
                            type="password"
                            className="mt-1 w-full rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        disabled={busy}
                        className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white py-2 font-medium transition"
                    >
                        {busy ? 'Alterando...' : 'Alterar senha'}
                    </button>
                </form>

                <div className="text-sm text-gray-600">
                    <Link className="hover:underline" to="/login">Voltar ao login</Link>
                </div>
            </div>
        </div>
    );
}
