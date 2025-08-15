// frontend/src/components/TIOnlyRoute.jsx
import { Navigate } from "react-router-dom";

/** Decodifica o payload do JWT sem libs externas */
function parseJwt(token) {
    try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
            atob(base64).split("").map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join("")
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

export default function TIOnlyRoute({ children }) {
    const token = localStorage.getItem("token");
    if (!token) return <Navigate to="/login" replace />;
    const payload = parseJwt(token);
    if (!isTIUser(payload)) return <Navigate to="/tickets" replace />;
    return children;
}
