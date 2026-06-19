import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';
import { Dashboard } from '@/pages/Dashboard';
import { Tasks } from '@/pages/Tasks';
import { Deliverables } from '@/pages/Deliverables';
import { Orientandos } from '@/pages/Orientandos';
import { OrientandoTarefas } from '@/pages/OrientandoTarefas';
import { Links } from '@/pages/Links';
import { Agenda } from '@/pages/Agenda';
import { ConfigNotificacoes } from '@/pages/ConfigNotificacoes';
import { PrivateRoute } from '@/components/PrivateRoute';
import { useAuthStore } from '@/stores/authStore';
import StompConnector from '@/components/StompConnector';
import NotificationToasts from '@/components/NotificationToasts';
import { MainLayout } from '@/components/layout/MainLayout';

function App() {
  const initializeFromStorage = useAuthStore((state) => state.initializeFromStorage);

  // Initialize authentication from localStorage on app load
  useEffect(() => {
    initializeFromStorage();
  }, [initializeFromStorage]);

  return (
    <>
      <StompConnector />
      <NotificationToasts />
      <Routes>
        {/* Authentication Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes Wrapper */}
        <Route element={<PrivateRoute><MainLayout /></PrivateRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/orientandos" element={<Orientandos />} />
          <Route path="/orientandos/:id/tarefas" element={<OrientandoTarefas />} />
          <Route path="/minhas-tarefas" element={<OrientandoTarefas />} />
          <Route path="/agenda" element={<Agenda />} />
          <Route path="/links" element={<Links />} />
          <Route path="/config-notificacoes" element={<ConfigNotificacoes />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/projects/:projectId/tasks" element={<Tasks />} />
          <Route path="/deliverables" element={<Deliverables />} />
        </Route>

        {/* Root redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
}

export default App;
