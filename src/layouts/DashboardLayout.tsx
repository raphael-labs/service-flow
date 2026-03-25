import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Briefcase,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';
import logo from '@/assets/logo.png';
import { useState } from 'react';
import NotebookBackground from '@/components/NotebookBackground';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Agenda', icon: CalendarDays, path: '/dashboard/agenda' },
  { label: 'Clientes', icon: Users, path: '/dashboard/clientes' },
  { label: 'Serviços', icon: Briefcase, path: '/dashboard/servicos' },
  { label: 'Configurações', icon: Settings, path: '/dashboard/configuracoes' },
];

export default function DashboardLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="p-5 border-b border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <img src={logo} alt="Satelite" className="w-9 h-9 object-contain" />
          <span className="text-lg font-bold font-heading text-sidebar-primary-foreground">Satelite</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(item => (
          <button
            key={item.path}
            onClick={() => { navigate(item.path); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              isActive(item.path)
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'text-sidebar-foreground hover:text-sidebar-primary-foreground hover:bg-sidebar-accent'
            }`}
          >
            <item.icon className="w-4.5 h-4.5" />
            {item.label}
          </button>
        ))}
      </nav>

      {/* Public link */}
      {user?.slug && (
        <div className="px-3 pb-2">
          <button
            onClick={() => window.open(`/booking/${user.slug}`, '_blank')}
            className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-medium text-sidebar-foreground hover:text-sidebar-primary-foreground hover:bg-sidebar-accent transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Página pública
          </button>
        </div>
      )}

      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center text-sidebar-primary text-xs font-bold">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-primary-foreground truncate">{user?.name || 'Usuário'}</p>
            <p className="text-xs text-sidebar-foreground truncate">{user?.businessName}</p>
          </div>
          <button onClick={handleLogout} className="p-1.5 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground hover:text-destructive transition-colors" title="Sair">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex bg-background relative">
      <NotebookBackground />
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 flex-col bg-sidebar border-r border-sidebar-border fixed inset-y-0 left-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 flex flex-col bg-sidebar border-r border-sidebar-border animate-slide-in-left">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 lg:ml-64 flex flex-col">
        {/* Navbar */}
        <header className="sticky top-0 z-20 bg-card/80 backdrop-blur-md border-b border-border">
          <div className="flex items-center h-14 px-4 lg:px-6">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-secondary text-muted-foreground">
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex-1" />
            <div className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
