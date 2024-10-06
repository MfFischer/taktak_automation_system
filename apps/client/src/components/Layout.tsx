import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Workflow, Play, Settings, Sparkles, Zap, LogOut } from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/app', icon: Home },
  { name: 'Workflows', href: '/app/workflows', icon: Workflow },
  { name: 'Executions', href: '/app/executions', icon: Play },
  { name: 'AI Assistant', href: '/app/ai-assistant', icon: Sparkles },
  { name: 'Settings', href: '/app/settings', icon: Settings },
];

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-dark-surface border-r border-dark-border backdrop-blur-xl animate-slide-in-left">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center h-16 px-6 border-b border-dark-border">
            <div className="flex items-center space-x-2 group">
              <div className="relative">
                <img src="/logo.png" alt="Taktak" className="w-8 h-8 object-contain" />
                <div className="absolute inset-0 blur-xl bg-taktak-500/30 animate-pulse-glow"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gradient">Taktak</h1>
                <p className="text-xs text-gray-500">Automation Platform</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item, index) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    flex items-center px-4 py-3 text-sm font-medium rounded-xl
                    transition-all duration-300 group relative overflow-hidden
                    animate-fade-in-up
                    ${
                      isActive
                        ? 'bg-gradient-taktak text-white shadow-glow'
                        : 'text-gray-300 hover:text-white hover:bg-dark-hover'
                    }
                  `}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Hover effect background */}
                  {!isActive && (
                    <div className="absolute inset-0 bg-gradient-taktak opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                  )}

                  <item.icon className={`w-5 h-5 mr-3 transition-transform duration-300 ${
                    isActive ? 'scale-110' : 'group-hover:scale-110'
                  }`} />
                  <span className="relative z-10">{item.name}</span>

                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute right-2 w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-dark-border space-y-3">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl text-gray-300 hover:text-white hover:bg-dark-hover transition-all duration-300 group"
            >
              <LogOut className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform duration-300" />
              <span>Logout</span>
            </button>
            <div className="glass rounded-xl p-3">
              <p className="text-xs text-gray-400 leading-relaxed">
                <span className="text-gradient font-semibold">Taktak</span> v1.0.0
                <br />
                <span className="text-gray-500">Shake off the manual work ⚡</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <main className="min-h-screen animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

