// frontend/src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import TIOnlyRoute from './components/TIOnlyRoute.jsx';

import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import VerifyEmail from './pages/VerifyEmail.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';

import TicketList from './pages/TicketList.jsx';
import CreateTicket from './pages/CreateTicket.jsx';
import TicketDetails from './pages/TicketDetails.jsx';
import AdminTickets from './pages/AdminTickets.jsx';
import Reports from './pages/Reports.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Área logada */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route index element={<Navigate to="tickets" replace />} />
                  <Route path="tickets" element={<TicketList />} />
                  <Route path="tickets/new" element={<CreateTicket />} />
                  <Route path="tickets/:id" element={<TicketDetails />} />
                  <Route
                    path="admin"
                    element={
                      <TIOnlyRoute>
                        <AdminTickets />
                      </TIOnlyRoute>
                    }
                  />
                  <Route
                    path="reports"
                    element={
                      <TIOnlyRoute>
                        <Reports />
                      </TIOnlyRoute>
                    }
                  />
                  <Route path="*" element={<Navigate to="tickets" replace />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
