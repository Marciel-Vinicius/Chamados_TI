// frontend/src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, roles }) {
  const token = (localStorage.getItem('token') || '').replace(/^"|"$/g, '');
  if (!token) return <Navigate to="/login" replace />;

  if (roles?.length) {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const role = user?.role;
      if (!role || !roles.includes(role)) {
        // se não for do papel exigido, manda pra /tickets
        return <Navigate to="/tickets" replace />;
      }
    } catch (_) { }
  }

  return children;
}
