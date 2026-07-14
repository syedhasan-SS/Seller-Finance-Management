import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { ClipboardList, Megaphone, BookOpen, Users, LogOut, Home } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const NAV = [
  { to: '/admin/tasks', label: 'Tasks', icon: ClipboardList },
  { to: '/admin/announcements', label: 'Announcements', icon: Megaphone },
  { to: '/admin/articles', label: 'Featured Articles', icon: BookOpen },
  { to: '/admin/progress', label: 'Seller Progress', icon: Users },
] as const;

export default function AdminLayout() {
  const { logout, userName, role } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-60 flex-col bg-fleek-black border-r border-fleek-gray-800">
        <div className="px-5 py-4 flex items-center gap-2 border-b border-fleek-gray-800">
          <img src="/logo.jpeg" alt="Fleek" className="h-7 w-7 rounded-sm" />
          <div className="leading-tight">
            <div className="text-sm font-bold text-white tracking-wider uppercase">Fleek</div>
            <div className="text-xs text-gray-400">Admin Console</div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-fleek-yellow text-fleek-black'
                    : 'text-gray-300 hover:text-white hover:bg-fleek-gray-800'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-fleek-gray-800 space-y-1">
          <button
            onClick={() => navigate('/home')}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-fleek-gray-800 transition-colors"
          >
            <Home className="w-4 h-4" />
            View seller homepage
          </button>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-red-400 hover:bg-fleek-gray-800 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <div className="md:hidden bg-fleek-black px-4 py-3 flex items-center justify-between border-b border-fleek-gray-800">
          <div className="flex items-center gap-2">
            <img src="/logo.jpeg" alt="Fleek" className="h-6 w-6 rounded-sm" />
            <span className="text-sm font-bold text-white tracking-wider uppercase">Admin</span>
          </div>
          <button onClick={logout} className="text-gray-300">
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile tab nav */}
        <nav className="md:hidden flex overflow-x-auto bg-white border-b border-gray-200">
          {NAV.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex-shrink-0 px-4 py-3 text-xs font-semibold border-b-2 transition-colors ${
                  isActive ? 'border-fleek-yellow text-fleek-black' : 'border-transparent text-gray-500'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Top bar (desktop) */}
        <header className="hidden md:flex bg-white border-b border-gray-200 px-6 py-3 items-center justify-between">
          <div className="text-sm text-gray-600">
            Signed in as <span className="font-semibold text-fleek-black">{userName || 'Admin'}</span>
            {role && <span className="ml-2 text-xs text-gray-500 uppercase">{role}</span>}
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
