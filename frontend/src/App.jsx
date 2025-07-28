import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import TicketList from './pages/TicketList';
import CreateTicket from './pages/CreateTicket';
import TicketDetails from './pages/TicketDetails';
import AdminTickets from './pages/AdminTickets';

export default function App() {
  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <Router>
      <Routes>
        {/* Pública */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Redireciona raiz */}
        <Route
          path="/"
          element={<Navigate to={isAuthenticated ? '/tickets' : '/login'} replace />}
        />

        {/* Protegidas */}
        <Route element={<ProtectedRoute />}>
          {/* Layout compartilhado */}
          <Route element={<Layout />}>
            <Route path="tickets" element={<TicketList />} />
            <Route path="tickets/new" element={<CreateTicket />} />
            <Route path="tickets/:id" element={<TicketDetails />} />
            <Route path="admin" element={<AdminTickets />} />
          </Route>
        </Route>

        {/* Qualquer outra rota */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
