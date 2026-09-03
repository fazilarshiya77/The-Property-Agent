import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Building2, Users, CalendarCheck, BarChart3, Settings, LogOut, Search, Bell, Home } from 'lucide-react';
import { setAdminAuthenticated } from '../../stores/propertyStore';
import type { ReactNode } from 'react';

const NAV_ITEMS = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/admin/properties', label: 'Properties', icon: Building2 },
  { to: '/admin/leads', label: 'Leads', icon: Users },
  { to: '/admin/site-visits', label: 'Site Visits', icon: CalendarCheck },
  { to: '/admin/reports', label: 'Reports', icon: BarChart3, comingSoon: true },
];

interface AdminLayoutProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export default function AdminLayout({ title, subtitle, actions, children }: AdminLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    setAdminAuthenticated(false);
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 bg-white border-r border-neutral-100 flex flex-col h-screen sticky top-0">
        <div className="px-5 py-5 flex items-center gap-2.5 border-b border-neutral-100">
          <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center flex-shrink-0">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-display font-bold text-navy-900 leading-tight truncate">The Property Agent</div>
            <div className="text-[9px] font-semibold text-brand-600 uppercase tracking-widest">Admin CRM</div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(item => {
            const isActive = item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive ? 'bg-brand-50 text-brand-700' : 'text-neutral-600 hover:bg-neutral-50 hover:text-navy-900'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Icon className={`h-4 w-4 ${isActive ? 'text-brand-600' : 'text-neutral-400'}`} />
                  {item.label}
                </span>
                {item.comingSoon && (
                  <span className="text-[9px] font-bold uppercase tracking-wide text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded">Soon</span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-neutral-100 space-y-1">
          <Link to="/admin/settings" className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-neutral-600 hover:bg-neutral-50 hover:text-navy-900 transition-colors">
            <Settings className="h-4 w-4 text-neutral-400" /> Settings
          </Link>
          <Link to="/" className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-neutral-600 hover:bg-neutral-50 hover:text-navy-900 transition-colors">
            <Home className="h-4 w-4 text-neutral-400" /> View Website
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors">
            <LogOut className="h-4 w-4" /> Log Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0">
        {/* Topbar */}
        <div className="bg-white border-b border-neutral-100 sticky top-0 z-30">
          <div className="px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm hidden sm:block">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search properties, leads..."
                className="w-full pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
            <div className="flex items-center gap-3 ml-auto">
              <button className="p-2 rounded-xl hover:bg-neutral-100 text-neutral-500 transition-colors relative" title="Notifications">
                <Bell className="h-4.5 w-4.5" />
              </button>
              <div className="flex items-center gap-2.5 pl-3 border-l border-neutral-100">
                <div className="w-8 h-8 rounded-full bg-navy-900 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">A</div>
                <span className="text-sm font-medium text-navy-900 hidden md:inline">Admin</span>
              </div>
            </div>
          </div>
        </div>

        {/* Page header */}
        <div className="px-6 lg:px-8 pt-6 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-display font-bold text-navy-900 tracking-wide">{title}</h1>
            {subtitle && <p className="text-sm text-neutral-500 mt-0.5">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
        </div>

        <div className="px-6 lg:px-8 pb-10">
          {children}
        </div>
      </div>
    </div>
  );
}
