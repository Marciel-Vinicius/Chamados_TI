// frontend/src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import VerifyEmail from './pages/VerifyEmail.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';

import TicketList from './pages/TicketList.jsx';
import CreateTicket from './pages/CreateTicket.jsx';
import TicketDetails from './pages/TicketDetails.jsx';
import AdminTickets from './pages/AdminTickets.jsx';
import TIConfig from './pages/TIConfig.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Páginas públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Rotas que precisam de token */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  {/* Chamados do usuário */}
                  <Route path="tickets" element={<TicketList />} />
                  <Route path="tickets/new" element={<CreateTicket />} />
                  <Route path="tickets/:id" element={<TicketDetails />} />

                  {/* Painel TI (somente chamados) */}
                  <Route path="admin" element={<AdminTickets />} />

                  {/* Configurações TI (cadastros de motivos, categorias, etc.) */}
                  <Route path="config-ti" element={<TIConfig />} />

                  {/* opcional: rota padrão dentro de "/*" */}
                  <Route path="*" element={<TicketList />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
