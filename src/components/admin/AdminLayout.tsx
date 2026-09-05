import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Building2, Users, CalendarCheck, Settings, LogOut, Search, Bell, Home, UserPlus, CalendarClock, Building as BuildingIcon } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { supabase } from '../../lib/supabase';
import { useActivityStore } from '../../stores/activityStore';

const NOTIFICATIONS_SEEN_KEY = 'tpa-admin-notifications-last-seen';

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function activityIcon(module: string) {
  if (module === 'lead') return UserPlus;
  if (module === 'site_visit') return CalendarClock;
  return BuildingIcon;
}

const NAV_ITEMS = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/admin/properties', label: 'Properties', icon: Building2 },
  { to: '/admin/leads', label: 'Enquiries', icon: Users },
  { to: '/admin/site-visits', label: 'Site Visits', icon: CalendarCheck },
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
  const entries = useActivityStore(s => s.entries);
  const fetchActivity = useActivityStore(s => s.fetchActivity);
  const [notifOpen, setNotifOpen] = useState(false);
  const [lastSeen, setLastSeen] = useState<string>(() => {
    try {
      return localStorage.getItem(NOTIFICATIONS_SEEN_KEY) || '';
    } catch {
      return '';
    }
  });
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchActivity();
  }, [fetchActivity]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = lastSeen ? entries.filter(e => e.timestamp > lastSeen).length : entries.length;

  const handleToggleNotifications = () => {
    const opening = !notifOpen;
    setNotifOpen(opening);
    if (opening) {
      const now = new Date().toISOString();
      setLastSeen(now);
      try {
        localStorage.setItem(NOTIFICATIONS_SEEN_KEY, now);
      } catch {
        // ignore — worst case the unread badge just doesn't persist across sessions
      }
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin');
  };

  return (
    <div className="admin-crm min-h-screen bg-neutral-50 flex">
      {/* Sidebar — fixed to the viewport so it never scrolls with the page */}
      <aside className="w-60 flex-shrink-0 bg-white border-r border-neutral-100 flex flex-col h-screen fixed top-0 left-0 z-40">
        <div className="px-5 py-5 flex items-center gap-2.5 border-b border-neutral-100">
          <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0">
            <img src="/logo.jpg" alt="The Property Agent logo" className="w-full h-full object-cover" />
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
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive ? 'bg-brand-50 text-brand-700' : 'text-neutral-600 hover:bg-neutral-50 hover:text-navy-900'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-brand-600' : 'text-neutral-400'}`} />
                {item.label}
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

      {/* Main — offset by the fixed sidebar's width */}
      <div className="flex-1 min-w-0 ml-60">
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
              <div className="relative" ref={notifRef}>
                <button
                  onClick={handleToggleNotifications}
                  className="p-2 rounded-xl hover:bg-neutral-100 text-neutral-500 transition-colors relative"
                  title="Notifications"
                  aria-label="Notifications"
                  aria-expanded={notifOpen}
                >
                  <Bell className="h-4.5 w-4.5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 h-4 min-w-[1rem] px-0.5 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                {notifOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-neutral-100 overflow-hidden z-40 animate-scale-in origin-top-right">
                    <div className="px-4 py-3 border-b border-neutral-100">
                      <h3 className="text-sm font-bold text-navy-900">Notifications</h3>
                      <p className="text-xs text-neutral-500">Recent leads, site visits & property activity</p>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {entries.length === 0 ? (
                        <p className="text-xs text-neutral-400 text-center py-8">No activity yet</p>
                      ) : (
                        entries.slice(0, 15).map(entry => {
                          const Icon = activityIcon(entry.module);
                          return (
                            <div key={entry.id} className="flex items-start gap-3 px-4 py-3 hover:bg-neutral-50 border-b border-neutral-50 last:border-0">
                              <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0">
                                <Icon className="h-4 w-4" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs text-navy-900 leading-snug">{entry.message}</p>
                                <p className="text-[10px] text-neutral-400 mt-0.5">{timeAgo(entry.timestamp)}</p>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
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
