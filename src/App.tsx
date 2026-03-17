import { useEffect } from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { useAuthStore } from '@/stores/authStore';
import AuthLayout from '@/layouts/AuthLayout';
import DashboardLayout from '@/layouts/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import DashboardPage from '@/pages/DashboardPage';
import AgendaPage from '@/pages/AgendaPage';
import ClientesPage from '@/pages/ClientesPage';
import ServicosPage from '@/pages/ServicosPage';
import ConfiguracoesPage from '@/pages/ConfiguracoesPage';
import BookingPage from '@/pages/BookingPage';
import NotFound from '@/pages/NotFound';

const App = () => {
  const loadFromStorage = useAuthStore(s => s.loadFromStorage);

  useEffect(() => {
    loadFromStorage();
  }, []);

  return (
    <>
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public booking */}
          <Route path="/booking/:slug" element={<BookingPage />} />

          {/* Auth */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* Dashboard */}
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/dashboard/agenda" element={<AgendaPage />} />
            <Route path="/dashboard/clientes" element={<ClientesPage />} />
            <Route path="/dashboard/servicos" element={<ServicosPage />} />
            <Route path="/dashboard/configuracoes" element={<ConfiguracoesPage />} />
          </Route>

          {/* Redirects */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;
