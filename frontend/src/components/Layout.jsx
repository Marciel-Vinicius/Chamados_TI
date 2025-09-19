// frontend/src/components/Layout.jsx
import { Link, useNavigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { NotificationProvider } from "../contexts/NotificationContext";
import NotificationBell from "./NotificationBell";
import { ToastProvider, useToast } from "../contexts/ToastContext";
import ToastContainer from "./ToastContainer";

/** Decodifica o payload do JWT sem libs externas */
function parseJwt(token) {
    try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split("")
                .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                .join("")
        );
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
}

function LayoutShell() {
    const navigate = useNavigate();
    const [userEmail, setUserEmail] = useState("");
    const [userRole, setUserRole] = useState("");
    const [loading, setLoading] = useState(true);
    const API = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/$/, "");
    const { show } = useToast();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }
        const payload = parseJwt(token.replace(/^Bearer\s+/, ""));
        setUserEmail(payload?.email || "");
        setUserRole(payload?.role || "");
        setLoading(false);
    }, [navigate]);

    const logout = async () => {
        localStorage.removeItem("token");
        show("Você saiu da conta.", { type: "info", title: "Logout" });
        navigate("/login");
        try { await axios.post(`${API}/auth/logout`); } catch { }
    };

    if (loading) {
        return (
            <div className="min-h-screen grid place-items-center bg-gradient-to-b from-slate-50 to-slate-100">
                <div className="animate-pulse text-slate-500">Carregando…</div>
            </div>
        );
    }

    // Eventos SSE -> toasts
    const handleNotify = (payload) => {
        if (!payload) return;
        if (payload.type === "new-ticket") {
            const t = payload.ticket || {};
            show(`"${t.title}" (${t.priority?.name || "Prioridade"})`, {
                type: "info",
                title: "Novo chamado aberto"
            });
        } else if (payload.type === "new-comment") {
            show(`Novo comentário no chamado #${payload.ticketId}`, {
                type: "info",
                title: "Atualização de chamado"
            });
        }
    };

    return (
        <NotificationProvider onEvent={handleNotify}>
            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
                <header className="sticky top-0 z-40 bg-white/70 backdrop-blur border-b">
                    <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <Link to="/tickets" className="font-bold text-slate-800 tracking-tight">Chamados</Link>
                            <nav className="hidden md:flex items-center gap-4 text-sm text-slate-600">
                                <Link to="/tickets" className="hover:text-slate-900">Meus Chamados</Link>
                                <Link to="/tickets/new" className="hover:text-slate-900">Abrir Chamado</Link>
                                <Link to="/reports" className="hover:text-slate-900">Relatórios</Link>
                                {userRole === "TI" && (
                                    <Link to="/admin" className="hover:text-slate-900">Painel TI</Link>
                                )}
                            </nav>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="hidden sm:inline text-sm text-slate-600">{userEmail}</span>
                            <NotificationBell />
                            <button onClick={logout} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm">
                                Sair
                            </button>
                        </div>
                    </div>
                </header>

                <main className="max-w-6xl mx-auto px-6 py-8">
                    <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                        <Outlet />
                    </div>
                </main>

                <ToastContainer />
            </div>
        </NotificationProvider>
    );
}

export default function Layout() {
    return (
        <ToastProvider>
            <LayoutShell />
        </ToastProvider>
    );
}
