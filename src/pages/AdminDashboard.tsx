import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Building2, CheckCircle2, FileEdit, Star, Clock, ArrowUpRight, MapPin, Users, Flame, CalendarCheck } from 'lucide-react';
import { usePropertyStore } from '../stores/propertyStore';
import { useAdminGuard } from '../stores/authStore';
import { useLeadStore } from '../stores/leadStore';
import { useSiteVisitStore } from '../stores/siteVisitStore';
import { useActivityStore } from '../stores/activityStore';
import { PROPERTY_TYPE_LABELS, PROPERTY_STATUS_LABELS, PROPERTY_STATUS_TONE } from '../data/properties';
import AdminLayout from '../components/admin/AdminLayout';
import MiniAreaChart from '../components/admin/MiniAreaChart';

const STATUS_TONE_CLASS: Record<string, string> = {
  neutral: 'bg-neutral-100 text-neutral-700',
  info: 'bg-blue-50 text-blue-700',
  success: 'bg-emerald-50 text-emerald-700',
  gold: 'bg-brand-50 text-brand-700',
  critical: 'bg-red-50 text-red-700',
};

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

export default function AdminDashboard() {
  const ready = useAdminGuard();
  const { properties, fetchProperties } = usePropertyStore();
  const { leads, fetchLeads } = useLeadStore();
  const { visits, fetchVisits } = useSiteVisitStore();
  const activityLog = useActivityStore(s => s.entries);
  const fetchActivity = useActivityStore(s => s.fetchActivity);

  useEffect(() => {
    if (!ready) return;
    fetchProperties();
    fetchLeads();
    fetchVisits();
    fetchActivity();
  }, [ready, fetchProperties, fetchLeads, fetchVisits, fetchActivity])

  const stats = useMemo(() => ({
    total: properties.length,
    published: properties.filter(p => p.status === 'published').length,
    draft: properties.filter(p => p.status === 'draft').length,
    featured: properties.filter(p => p.isFeatured).length,
    closed: properties.filter(p => p.status === 'sold' || p.status === 'rented').length,
    newLeads: leads.filter(l => l.status === 'new').length,
    hotLeads: leads.filter(l => l.temperature === 'hot').length,
    upcomingVisits: visits.filter(v => v.status === 'scheduled' || v.status === 'confirmed').length,
  }), [properties, leads, visits]);

  const byLocation = useMemo(() => {
    const counts: Record<string, number> = {};
    properties.forEach(p => {
      const key = p.district || 'Unassigned';
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [properties]);

  // Properties added per month, last 6 months — real data, no fabricated trend
  const monthlyChart = useMemo(() => {
    const months: { label: string; key: string; value: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ label: d.toLocaleDateString('en-IN', { month: 'short' }), key: `${d.getFullYear()}-${d.getMonth()}`, value: 0 });
    }
    properties.forEach(p => {
      if (!p.createdAt) return;
      const d = new Date(p.createdAt);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const m = months.find(m => m.key === key);
      if (m) m.value += 1;
    });
    return months.map(({ label, value }) => ({ label, value }));
  }, [properties]);

  const recentProperties = useMemo(() => {
    return [...properties]
      .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
      .slice(0, 5);
  }, [properties]);

  const formatPrice = (price: number, type: string) => {
    if (type === 'rent') return `₹${price.toLocaleString('en-IN')}/mo`;
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)} Cr`;
    return `₹${(price / 100000).toFixed(1)} L`;
  };

  if (!ready) return null;

  return (
    <AdminLayout
      title="Dashboard Overview"
      subtitle="A snapshot of your inventory, right now"
      actions={
        <Link to="/admin/new" className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-navy-900 font-semibold px-4 py-2.5 rounded-xl text-sm transition-all hover:shadow-lg hover:shadow-brand-500/25">
          <Plus className="h-4 w-4" /> Add Property
        </Link>
      }
    >
      {/* KPI Cards — Inventory */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-2 mb-3">
        {[
          { label: 'Total Properties', value: stats.total, icon: Building2, tone: 'text-navy-900 bg-neutral-100' },
          { label: 'Published', value: stats.published, icon: CheckCircle2, tone: 'text-emerald-700 bg-emerald-50' },
          { label: 'Draft', value: stats.draft, icon: FileEdit, tone: 'text-neutral-600 bg-neutral-100' },
          { label: 'Featured', value: stats.featured, icon: Star, tone: 'text-brand-700 bg-brand-50' },
        ].map(kpi => (
          <div key={kpi.label} className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-4">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${kpi.tone}`}>
              <kpi.icon className="h-4.5 w-4.5" />
            </div>
            <div className="text-2xl font-display font-bold text-navy-900">{kpi.value}</div>
            <div className="text-xs text-neutral-500 mt-0.5">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* KPI Cards — Pipeline */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {[
          { label: 'New Enquiries', value: stats.newLeads, icon: Users, tone: 'text-blue-700 bg-blue-50', to: '/admin/leads' },
          { label: 'Hot Enquiries', value: stats.hotLeads, icon: Flame, tone: 'text-red-700 bg-red-50', to: '/admin/leads' },
          { label: 'Upcoming Visits', value: stats.upcomingVisits, icon: CalendarCheck, tone: 'text-brand-700 bg-brand-50', to: '/admin/site-visits' },
          { label: 'Sold / Rented', value: stats.closed, icon: CheckCircle2, tone: 'text-emerald-700 bg-emerald-50', to: '/admin/properties' },
        ].map(kpi => (
          <Link key={kpi.label} to={kpi.to} className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-4 hover:shadow-card-hover hover:border-brand-500/30 transition-all">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${kpi.tone}`}>
              <kpi.icon className="h-4.5 w-4.5" />
            </div>
            <div className="text-2xl font-display font-bold text-navy-900">{kpi.value}</div>
            <div className="text-xs text-neutral-500 mt-0.5">{kpi.label}</div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-neutral-100 shadow-sm p-5 sm:p-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-navy-900">Properties Added</h2>
            <span className="text-xs text-neutral-400">Last 6 months</span>
          </div>
          <MiniAreaChart data={monthlyChart} height={220} />
        </div>

        {/* Activity feed */}
        <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-navy-900">Recent Activity</h2>
            <Clock className="h-4 w-4 text-neutral-300" />
          </div>
          {activityLog.length === 0 ? (
            <p className="text-xs text-neutral-400 py-6 text-center">Nothing yet — actions you take will show up here.</p>
          ) : (
            <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1">
              {activityLog.slice(0, 8).map(entry => (
                <div key={entry.id} className="flex items-start gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-brand-500 mt-1.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-neutral-700 leading-snug">{entry.message}</p>
                    <p className="text-[10px] text-neutral-400 mt-0.5">{timeAgo(entry.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mt-6">
        {/* Recent properties table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 sm:px-6 pt-5 sm:pt-6 pb-3">
            <h2 className="text-sm font-semibold text-navy-900">Recent Properties</h2>
            <Link to="/admin/properties" className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1">
              View all <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          {recentProperties.length === 0 ? (
            <p className="text-xs text-neutral-400 text-center py-10">No properties yet — add your first one to see it here.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-t border-neutral-100 bg-neutral-50/60">
                    <th className="text-left px-5 sm:px-6 py-2.5 text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Property</th>
                    <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-neutral-500 uppercase tracking-wider hidden sm:table-cell">Type</th>
                    <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Price</th>
                    <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50">
                  {recentProperties.map(p => (
                    <tr key={p.id} className="hover:bg-neutral-50/50">
                      <td className="px-5 sm:px-6 py-3">
                        <Link to={`/admin/edit/${p.id}`} className="text-sm font-medium text-navy-900 hover:text-brand-500 transition-colors line-clamp-1">{p.title}</Link>
                        <div className="text-[11px] text-neutral-400">{p.areaName}{p.district ? `, ${p.district}` : ''}</div>
                      </td>
                      <td className="px-4 py-3 text-xs text-neutral-600 hidden sm:table-cell">{PROPERTY_TYPE_LABELS[p.type]}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-navy-900">{formatPrice(p.price, p.type)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${STATUS_TONE_CLASS[PROPERTY_STATUS_TONE[p.status]]}`}>
                          {PROPERTY_STATUS_LABELS[p.status]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Properties by location */}
        <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-5 sm:p-6">
          <h2 className="text-sm font-semibold text-navy-900 mb-4">Properties by District</h2>
          {byLocation.length === 0 ? (
            <p className="text-xs text-neutral-400 py-6 text-center">No locations yet.</p>
          ) : (
            <div className="space-y-3">
              {byLocation.map(([district, count]) => (
                <div key={district} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-3.5 w-3.5 text-brand-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-neutral-700 font-medium truncate">{district}</span>
                      <span className="text-neutral-400 flex-shrink-0 ml-2">{count}</span>
                    </div>
                    <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-500 rounded-full" style={{ width: `${(count / stats.total) * 100}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
