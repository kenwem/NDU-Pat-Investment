import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import {
  LayoutDashboard,
  Calendar,
  Package,
  Star,
  Wrench,
  MessageSquare,
  Settings,
  LogOut,
  ArrowLeft,
  Menu,
  X,
} from 'lucide-react';
import { auth } from '../../firebase';
import { useIdleTimeout } from '../../hooks/useIdleTimeout';

const ADMIN_NAV = [
  { label: 'Dashboard', path: '/admin', icon: LayoutDashboard, exact: true },
  { label: 'Appointments', path: '/admin/appointments', icon: Calendar },
  { label: 'Products', path: '/admin/products', icon: Package },
  { label: 'Testimonials', path: '/admin/testimonials', icon: Star },
  { label: 'Services', path: '/admin/services', icon: Wrench },
  { label: 'Comments', path: '/admin/comments', icon: MessageSquare },
  { label: 'Site Settings', path: '/admin/settings', icon: Settings },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { minutes, seconds, isExpiringSoon } = useIdleTimeout();

  const currentNav =
    ADMIN_NAV.find((item) =>
      item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path)
    ) ||
    (location.pathname.startsWith('/admin/messages')
      ? { label: 'Messages' }
      : location.pathname.startsWith('/admin/orders')
      ? { label: 'Orders' }
      : { label: 'Admin Portal' });

  const handleLogout = async () => {
    localStorage.removeItem('admin_last_activity');
    await signOut(auth);
    navigate('/admin/login', { replace: true });
  };

  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className="h-screen bg-stone-100 flex overflow-hidden">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-stone-900/60 z-40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-stone-900 text-stone-300 flex flex-col shrink-0 transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-6 border-b border-stone-800 flex items-center justify-between">
          <div>
            <h2 className="text-white font-extrabold text-lg tracking-tight">NDU PAT Admin</h2>
            <p className="text-xs text-lime-400 font-medium">Management Portal</p>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-stone-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 pt-4">
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-lime-400" />
            Back to Site
          </Link>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {ADMIN_NAV.map((item) => {
            const Icon = item.icon;
            const active = item.exact
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  active
                    ? 'bg-lime-600 text-white shadow-sm font-semibold'
                    : 'text-stone-400 hover:text-white hover:bg-stone-800'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-stone-800">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-red-400 hover:text-white hover:bg-red-600/20 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Column */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
              className="lg:hidden p-2 rounded-lg text-stone-600 hover:bg-stone-100 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-stone-900">{currentNav.label}</h1>
          </div>

          <div
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold tabular-nums border ${
              isExpiringSoon
                ? 'bg-red-50 text-red-700 border-red-200'
                : 'bg-stone-50 text-stone-700 border-stone-200'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isExpiringSoon ? 'bg-red-500' : 'bg-lime-500'
              }`}
            />
            {isExpiringSoon
              ? `SECURITY TIMEOUT: ${formattedTime}`
              : `Session expires: ${formattedTime}`}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
