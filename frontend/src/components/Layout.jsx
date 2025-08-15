// frontend/src/components/Layout.jsx
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { NotificationProvider } from "../contexts/NotificationContext";
import NotificationBell from "./NotificationBell";

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
    } catch {
        return null;
    }
}

function isTIUser(payload) {
    if (!payload) return false;
    const values = [];
    const push = (v) => (v != null ? values.push(v) : null);
    push(payload.sector); push(payload.setor); push(payload.department); push(payload.sectorName);
    push(payload.role);
    if (Array.isArray(payload.sectors)) values.push(...payload.sectors);
    if (Array.isArray(payload.roles)) values.push(...payload.roles);
    const flags = values.map((v) => String(v).toLowerCase());
    const allowed = new Set(["ti", "dev", "tecnologia", "it", "admin", "admin-ti"]);
    return flags.some((v) => allowed.has(v)) || payload.isAdmin === true;
}

export default function Layout({ children }) {
    const navigate = useNavigate();
    const [canSeeAdmin, setCanSeeAdmin] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
            setCanSeeAdmin(isTIUser(parseJwt(token)));
        } else {
            setCanSeeAdmin(false);
        }
    }, []);

    function logout() {
        localStorage.removeItem("token");
        delete axios.defaults.headers.common["Authorization"];
        navigate("/login");
    }

    return (
        <NotificationProvider>
            <div className="min-h-screen bg-gray-50">
                <header className="bg-white shadow-sm">
                    <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                        <Link to="/tickets" className="text-xl font-bold text-gray-800">
                            TI-Chamados
                        </Link>
                        <nav className="hidden md:flex items-center gap-6 text-sm">
                            <Link to="/tickets" className="hover:underline">Meus Chamados</Link>
                            <Link to="/tickets/new" className="hover:underline">Abrir Chamado</Link>
                            {canSeeAdmin && (
                                <>
                                    <Link to="/reports" className="hover:underline">Relatórios</Link>
                                    <Link to="/admin" className="hover:underline">Painel TI</Link>
                                </>
                            )}
                        </nav>
                        <div className="flex items-center gap-4">
                            <NotificationBell />
                            <button onClick={logout} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                                Logout
                            </button>
                        </div>
                    </div>
                </header>
                <main className="container mx-auto px-6 py-10">
                    <div className="bg-white rounded-2xl shadow-lg p-8">{children}</div>
                </main>
            </div>
        </NotificationProvider>
    );
}
