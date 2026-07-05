import React from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { 
  Home, 
  Users, 
  Calendar, 
  Link as LinkIcon, 
  Settings, 
  LogOut,
  ClipboardList
} from 'lucide-react';
import NotificationsBell from '@/components/NotificationsBell';

export const MainLayout: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const navItems = [
    { name: 'Página Principal', path: '/dashboard', icon: <Home size={20} /> },
    ...(user?.profile !== 'ORIENTANDO' ? [{ name: 'Gerenciador de Orientandos', path: '/orientandos', icon: <Users size={20} /> }] : []),
    ...(user?.profile === 'ORIENTANDO' ? [{ name: 'Minhas Tarefas', path: '/minhas-tarefas', icon: <ClipboardList size={20} /> }] : []),
    { name: 'Gerenciador da Agenda', path: '/agenda', icon: <Calendar size={20} /> },
    { name: 'Organizador de Links', path: '/links', icon: <LinkIcon size={20} /> },
    { name: 'Configurar notificações', path: '/config-notificacoes', icon: <Settings size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-[#f4f4f5] flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 h-24 flex items-center justify-between z-10 pr-6">
        <div className="w-64 h-full flex items-center justify-center shrink-0">
          {/* SAOA Logo — Ícone aumentado em mais 10% (~81px) */}
          <img src="/icone_saoa.png" alt="SAOA Logo" className="w-[81px] h-[81px] object-contain" />
        </div>

        <div className="flex items-center gap-4 text-gray-600">
          <NotificationsBell />
          <button className="hover:bg-gray-100 p-2 rounded-full transition-colors">
            <Settings size={20} />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col justify-between hidden md:flex">
          <div>
            {/* User Profile Box */}
            <div className="p-6 flex flex-col items-center border-b border-gray-100">
              <div className="w-24 h-24 rounded-full bg-gray-300 border-2 border-[#7852EA] mb-3 flex items-center justify-center overflow-hidden shrink-0">
                <svg className="w-16 h-16 text-gray-100 mt-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-[#4c0587] text-center">
                {user?.fullName || 'Usuário'}
              </h2>
              <p className="text-sm text-gray-500 capitalize">
                {user?.profile?.toLowerCase() || 'Perfil'}
              </p>
            </div>

            {/* Navigation */}
            <nav className="p-4 space-y-2">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path || (item.path === '/dashboard' && location.pathname === '/');
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive 
                        ? 'text-[#4c0587] bg-purple-50' 
                        : 'text-gray-600 hover:text-[#4c0587] hover:bg-gray-50'
                    }`}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Logout Button */}
          <div className="p-4 border-t border-gray-100">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut size={20} />
              <span>Sair</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
