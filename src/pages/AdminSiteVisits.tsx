import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, Search, CalendarCheck } from 'lucide-react';
import { isAdminAuthenticated, usePropertyStore } from '../stores/propertyStore';
import { useLeadStore } from '../stores/leadStore';
import { useSiteVisitStore } from '../stores/siteVisitStore';
import type { SiteVisit, VisitStatus } from '../data/siteVisits';
import { VISIT_STATUS_LABELS, VISIT_STATUS_TONE } from '../data/siteVisits';
import AdminLayout from '../components/admin/AdminLayout';
import AdminModal from '../components/admin/AdminModal';

const STATUS_TONE_CLASS: Record<string, string> = {
  neutral: 'bg-neutral-100 text-neutral-700 border border-neutral-200',
  info: 'bg-blue-50 text-blue-700 border border-blue-200',
  success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  gold: 'bg-brand-50 text-brand-700 border border-brand-200',
  critical: 'bg-red-50 text-red-700 border border-red-200',
};

const STATUS_OPTIONS: VisitStatus[] = ['scheduled', 'confirmed', 'completed', 'cancelled', 'rescheduled'];

const emptyVisit: Omit<SiteVisit, 'id' | 'visitCode' | 'createdAt' | 'updatedAt'> = {
  leadId: '', leadName: '', propertyId: '', propertyTitle: '', visitDate: '', visitTime: '', status: 'scheduled', feedback: '', notes: '',
};

const inputCls = "w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500";
const labelCls = "block text-xs font-medium text-neutral-500 mb-1";

export default function AdminSiteVisits() {
  const navigate = useNavigate();
  const { visits, addVisit, updateVisit, deleteVisit } = useSiteVisitStore();
  const { leads } = useLeadStore();
  const { properties } = usePropertyStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | VisitStatus>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyVisit);

  useEffect(() => {
    if (!isAdminAuthenticated()) navigate('/admin');
  }, [navigate]);

  const filtered = useMemo(() => {
    return visits.filter(v => {
      const matchesSearch = !search ||
        v.leadName.toLowerCase().includes(search.toLowerCase()) ||
        v.propertyTitle.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || v.status === statusFilter;
      return matchesSearch && matchesStatus;
    }).sort((a, b) => (a.visitDate || '').localeCompare(b.visitDate || ''));
  }, [visits, search, statusFilter]);

  const openAdd = () => { setEditingId(null); setForm(emptyVisit); setModalOpen(true); };
  const openEdit = (visit: SiteVisit) => {
    setEditingId(visit.id);
    const { id, visitCode, createdAt, updatedAt, ...rest } = visit;
    setForm(rest);
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.leadName.trim() || !form.propertyTitle.trim() || !form.visitDate) {
      alert('Visitor name, property, and visit date are required.');
      return;
    }
    if (editingId) {
      updateVisit(editingId, form);
    } else {
      addVisit(form);
    }
    setModalOpen(false);
  };

  const handleDelete = (id: string, leadName: string) => {
    if (window.confirm(`Delete this visit for "${leadName}"? This cannot be undone.`)) {
      deleteVisit(id);
    }
  };

  const handleLeadSelect = (leadId: string) => {
    const lead = leads.find(l => l.id === leadId);
    setForm({ ...form, leadId, leadName: lead ? lead.name : form.leadName });
  };

  const handlePropertySelect = (propertyId: string) => {
    const property = properties.find(p => p.id === propertyId);
    setForm({ ...form, propertyId, propertyTitle: property ? property.title : form.propertyTitle });
  };

  if (!isAdminAuthenticated()) return null;

  return (
    <AdminLayout
      title="Site Visits"
      subtitle={`${visits.length} total · ${visits.filter(v => v.status === 'scheduled' || v.status === 'confirmed').length} upcoming`}
      actions={
        <button onClick={openAdd} className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all hover:shadow-lg hover:shadow-brand-500/25">
          <Plus className="h-4 w-4" /> Schedule Visit
        </button>
      }
    >
      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 mt-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input type="text" placeholder="Search by visitor or property..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-white border border-neutral-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none text-sm" />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(['all', ...STATUS_OPTIONS] as const).map(s => {
            const count = s === 'all' ? visits.length : visits.filter(v => v.status === s).length;
            return (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  statusFilter === s ? 'bg-navy-900 text-white shadow-sm' : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                }`}>
                <span>{s === 'all' ? 'All' : VISIT_STATUS_LABELS[s]}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${statusFilter === s ? 'bg-white/20 text-white' : 'bg-neutral-100 text-neutral-600'}`}>{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Visitor</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Property</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider hidden sm:table-cell">Date &amp; Time</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Status</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {filtered.map(v => (
                <tr key={v.id} className="hover:bg-neutral-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="text-sm font-semibold text-navy-900">{v.leadName}</div>
                    <div className="text-[11px] text-neutral-400 font-mono">{v.visitCode}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-600">{v.propertyTitle}</td>
                  <td className="px-4 py-3 text-sm text-neutral-600 hidden sm:table-cell">
                    {v.visitDate ? new Date(v.visitDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                    {v.visitTime && <span className="text-neutral-400"> · {v.visitTime}</span>}
                  </td>
                  <td className="px-4 py-3">
                    <select value={v.status} onChange={e => updateVisit(v.id, { status: e.target.value as VisitStatus })}
                      className={`px-2 py-1 rounded-full text-xs font-semibold outline-none cursor-pointer ${STATUS_TONE_CLASS[VISIT_STATUS_TONE[v.status]]}`}>
                      {STATUS_OPTIONS.map(s => <option key={s} value={s}>{VISIT_STATUS_LABELS[s]}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(v)} className="p-2 rounded-lg hover:bg-brand-50 text-neutral-400 hover:text-brand-500 transition-colors" title="Edit">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(v.id, v.leadName)} className="p-2 rounded-lg hover:bg-red-50 text-neutral-400 hover:text-red-500 transition-colors" title="Delete">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-neutral-500 text-sm flex flex-col items-center gap-2">
            <CalendarCheck className="h-8 w-8 text-neutral-300" />
            {visits.length === 0 ? 'No site visits scheduled yet.' : 'No visits match your search.'}
          </div>
        )}
      </div>

      {modalOpen && (
        <AdminModal
          title={editingId ? 'Edit Site Visit' : 'Schedule a Site Visit'}
          onClose={() => setModalOpen(false)}
          footer={
            <>
              <button onClick={() => setModalOpen(false)} className="px-4 py-2.5 rounded-xl text-sm font-semibold text-neutral-600 hover:bg-neutral-100 transition-colors">Cancel</button>
              <button onClick={handleSave} className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-brand-500 hover:bg-brand-600 text-white transition-colors">
                {editingId ? 'Save Changes' : 'Schedule Visit'}
              </button>
            </>
          }
        >
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Link to Existing Lead (Optional)</label>
              <select value={form.leadId} onChange={e => handleLeadSelect(e.target.value)} className={inputCls}>
                <option value="">No lead selected — enter name manually</option>
                {leads.map(l => <option key={l.id} value={l.id}>{l.name} ({l.leadCode})</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Visitor Name *</label>
              <input value={form.leadName} onChange={e => setForm({ ...form, leadName: e.target.value })} className={inputCls} />
            </div>

            <div>
              <label className={labelCls}>Property</label>
              <select value={form.propertyId} onChange={e => handlePropertySelect(e.target.value)} className={inputCls}>
                <option value="">No property selected — enter title manually</option>
                {properties.map(p => <option key={p.id} value={p.id}>{p.title} ({p.propertyCode})</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Property Title *</label>
              <input value={form.propertyTitle} onChange={e => setForm({ ...form, propertyTitle: e.target.value })} className={inputCls} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Visit Date *</label>
                <input type="date" value={form.visitDate} onChange={e => setForm({ ...form, visitDate: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Visit Time</label>
                <input type="time" value={form.visitTime} onChange={e => setForm({ ...form, visitTime: e.target.value })} className={inputCls} />
              </div>
            </div>

            <div>
              <label className={labelCls}>Status</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as VisitStatus })} className={inputCls}>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{VISIT_STATUS_LABELS[s]}</option>)}
              </select>
            </div>

            <div>
              <label className={labelCls}>Customer Feedback</label>
              <textarea value={form.feedback} onChange={e => setForm({ ...form, feedback: e.target.value })} rows={2} className={`${inputCls} resize-none`} />
            </div>
            <div>
              <label className={labelCls}>Agent Notes</label>
              <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} className={`${inputCls} resize-none`} />
            </div>
          </div>
        </AdminModal>
      )}
    </AdminLayout>
  );
}
