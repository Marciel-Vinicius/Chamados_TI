// frontend/src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

// Páginas (ajuste os imports conforme seus arquivos)
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import VerifyEmail from './pages/VerifyEmail.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import MyTickets from './pages/TicketList.jsx';      // ou MyTickets.jsx se for esse o nome
import NewTicket from './pages/NewTicket.jsx';        // se você usa CreateTicket.jsx, troque aqui
import AdminTickets from './pages/AdminTickets.jsx';
import TIConfig from './pages/TIConfig.jsx';
import TicketDetails from './pages/TicketDetails.jsx';

function NotFound() {
  return (
    <div className="text-center py-16">
      <h1 className="text-2xl font-semibold mb-2">Página não encontrada</h1>
      <p className="text-gray-600">Verifique o endereço e tente novamente.</p>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Rotas públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify" element={<VerifyEmail />} />
      <Route path="/reset" element={<ResetPassword />} />

      {/* Rotas protegidas (dentro do layout) */}
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/tickets" replace />} />
        <Route
          path="/tickets"
          element={
            <ProtectedRoute>
              <MyTickets />
            </ProtectedRoute>
          }
        />
        <Route
          path="/new"
          element={
            <ProtectedRoute>
              <NewTicket />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ticket/:id"
          element={
            <ProtectedRoute>
              <TicketDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={['TI']}>
              <AdminTickets />
            </ProtectedRoute>
          }
        />
        <Route
          path="/config"
          element={
            <ProtectedRoute roles={['TI']}>
              <TIConfig />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
