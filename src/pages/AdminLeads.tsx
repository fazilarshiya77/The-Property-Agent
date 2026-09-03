import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, Search, Phone, MessageCircle, Mail } from 'lucide-react';
import { isAdminAuthenticated } from '../stores/propertyStore';
import { usePropertyStore } from '../stores/propertyStore';
import { useLeadStore } from '../stores/leadStore';
import type { Lead, LeadStatus, LeadTemperature, LeadSource, LeadPurpose } from '../data/leads';
import { LEAD_STATUS_LABELS, LEAD_STATUS_TONE, LEAD_TEMPERATURE_LABELS, LEAD_SOURCE_LABELS, LEAD_PURPOSE_LABELS } from '../data/leads';
import AdminLayout from '../components/admin/AdminLayout';
import AdminModal from '../components/admin/AdminModal';

const STATUS_TONE_CLASS: Record<string, string> = {
  neutral: 'bg-neutral-100 text-neutral-700 border border-neutral-200',
  info: 'bg-blue-50 text-blue-700 border border-blue-200',
  success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  gold: 'bg-brand-50 text-brand-700 border border-brand-200',
  critical: 'bg-red-50 text-red-700 border border-red-200',
};

const TEMP_CLASS: Record<LeadTemperature, string> = {
  hot: 'bg-red-50 text-red-600',
  warm: 'bg-brand-50 text-brand-700',
  cold: 'bg-blue-50 text-blue-600',
};

const STATUS_OPTIONS: LeadStatus[] = ['new', 'contacted', 'interested', 'site_visit_planned', 'site_visit_completed', 'negotiation', 'converted', 'lost'];
const TEMP_OPTIONS: LeadTemperature[] = ['hot', 'warm', 'cold'];
const SOURCE_OPTIONS: LeadSource[] = ['website', 'whatsapp', 'instagram', 'facebook', 'google', 'referral', 'direct', 'other'];
const PURPOSE_OPTIONS: LeadPurpose[] = ['investment', 'personal_use', 'rental', 'farming', 'vacation'];

const emptyLead: Omit<Lead, 'id' | 'leadCode' | 'createdAt' | 'updatedAt'> = {
  name: '', phone: '', whatsapp: '', email: '', interestedPropertyId: '', propertyTypeInterested: '',
  preferredLocation: '', budget: '', purpose: undefined, source: 'direct', status: 'new', temperature: 'warm',
  notes: '', nextFollowUpDate: '',
};

const inputCls = "w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500";
const labelCls = "block text-xs font-medium text-neutral-500 mb-1";

export default function AdminLeads() {
  const navigate = useNavigate();
  const { leads, addLead, updateLead, deleteLead } = useLeadStore();
  const { properties } = usePropertyStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | LeadStatus>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyLead);

  useEffect(() => {
    if (!isAdminAuthenticated()) navigate('/admin');
  }, [navigate]);

  const filtered = useMemo(() => {
    return leads.filter(l => {
      const matchesSearch = !search ||
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.phone.includes(search) ||
        (l.preferredLocation || '').toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || l.status === statusFilter;
      return matchesSearch && matchesStatus;
    }).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [leads, search, statusFilter]);

  const openAdd = () => { setEditingId(null); setForm(emptyLead); setModalOpen(true); };
  const openEdit = (lead: Lead) => {
    setEditingId(lead.id);
    const { id, leadCode, createdAt, updatedAt, ...rest } = lead;
    setForm(rest);
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.phone.trim()) {
      alert('Name and phone are required.');
      return;
    }
    if (editingId) {
      updateLead(editingId, form);
    } else {
      addLead(form);
    }
    setModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Delete lead "${name}"? This cannot be undone.`)) {
      deleteLead(id);
    }
  };

  if (!isAdminAuthenticated()) return null;

  return (
    <AdminLayout
      title="Leads & Enquiries"
      subtitle={`${leads.length} total · ${leads.filter(l => l.status === 'new').length} new · ${leads.filter(l => l.temperature === 'hot').length} hot`}
      actions={
        <button onClick={openAdd} className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all hover:shadow-lg hover:shadow-brand-500/25">
          <Plus className="h-4 w-4" /> Add Lead
        </button>
      }
    >
      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 mt-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input type="text" placeholder="Search by name, phone, or location..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-white border border-neutral-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none text-sm" />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(['all', ...STATUS_OPTIONS] as const).map(s => {
            const count = s === 'all' ? leads.length : leads.filter(l => l.status === s).length;
            return (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  statusFilter === s ? 'bg-navy-900 text-white shadow-sm' : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                }`}>
                <span>{s === 'all' ? 'All' : LEAD_STATUS_LABELS[s]}</span>
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
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Lead</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider hidden md:table-cell">Looking For</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider hidden sm:table-cell">Source</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Temp</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Status</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {filtered.map(l => (
                <tr key={l.id} className="hover:bg-neutral-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="text-sm font-semibold text-navy-900">{l.name}</div>
                    <div className="text-[11px] text-neutral-400 font-mono">{l.leadCode}</div>
                    <div className="flex items-center gap-2.5 mt-1">
                      <a href={`tel:${l.phone}`} className="text-neutral-400 hover:text-brand-500" title={l.phone}><Phone className="h-3.5 w-3.5" /></a>
                      {l.whatsapp && <a href={`https://wa.me/${l.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-emerald-600" title="WhatsApp"><MessageCircle className="h-3.5 w-3.5" /></a>}
                      {l.email && <a href={`mailto:${l.email}`} className="text-neutral-400 hover:text-brand-500" title={l.email}><Mail className="h-3.5 w-3.5" /></a>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-600 hidden md:table-cell">
                    {l.propertyTypeInterested || '—'}{l.preferredLocation ? ` · ${l.preferredLocation}` : ''}
                  </td>
                  <td className="px-4 py-3 text-xs text-neutral-600 hidden sm:table-cell">{LEAD_SOURCE_LABELS[l.source]}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold uppercase ${TEMP_CLASS[l.temperature]}`}>{LEAD_TEMPERATURE_LABELS[l.temperature]}</span>
                  </td>
                  <td className="px-4 py-3">
                    <select value={l.status} onChange={e => updateLead(l.id, { status: e.target.value as LeadStatus })}
                      className={`px-2 py-1 rounded-full text-xs font-semibold outline-none cursor-pointer ${STATUS_TONE_CLASS[LEAD_STATUS_TONE[l.status]]}`}>
                      {STATUS_OPTIONS.map(s => <option key={s} value={s}>{LEAD_STATUS_LABELS[s]}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(l)} className="p-2 rounded-lg hover:bg-brand-50 text-neutral-400 hover:text-brand-500 transition-colors" title="Edit">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(l.id, l.name)} className="p-2 rounded-lg hover:bg-red-50 text-neutral-400 hover:text-red-500 transition-colors" title="Delete">
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
          <div className="text-center py-12 text-neutral-500 text-sm">
            {leads.length === 0 ? 'No leads yet — add one, or wait for enquiries to come in from the website.' : 'No leads match your search.'}
          </div>
        )}
      </div>

      {modalOpen && (
        <AdminModal
          title={editingId ? 'Edit Lead' : 'Add New Lead'}
          onClose={() => setModalOpen(false)}
          footer={
            <>
              <button onClick={() => setModalOpen(false)} className="px-4 py-2.5 rounded-xl text-sm font-semibold text-neutral-600 hover:bg-neutral-100 transition-colors">Cancel</button>
              <button onClick={handleSave} className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-brand-500 hover:bg-brand-600 text-white transition-colors">
                {editingId ? 'Save Changes' : 'Add Lead'}
              </button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Name *</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Phone *</label>
                <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>WhatsApp</label>
                <input value={form.whatsapp} onChange={e => setForm({ ...form, whatsapp: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Email</label>
                <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className={inputCls} />
              </div>
            </div>

            <div>
              <label className={labelCls}>Interested Property (Optional)</label>
              <select value={form.interestedPropertyId} onChange={e => setForm({ ...form, interestedPropertyId: e.target.value })} className={inputCls}>
                <option value="">General inquiry — no specific property</option>
                {properties.map(p => <option key={p.id} value={p.id}>{p.title} ({p.propertyCode})</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Property Type Interested In</label>
                <input value={form.propertyTypeInterested} onChange={e => setForm({ ...form, propertyTypeInterested: e.target.value })} placeholder="e.g. Farmhouse Plot" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Preferred Location</label>
                <input value={form.preferredLocation} onChange={e => setForm({ ...form, preferredLocation: e.target.value })} placeholder="e.g. Hassan" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Budget</label>
                <input value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })} placeholder="e.g. 40-50 Lakhs" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Purpose</label>
                <select value={form.purpose || ''} onChange={e => setForm({ ...form, purpose: e.target.value as LeadPurpose })} className={inputCls}>
                  <option value="">Not set</option>
                  {PURPOSE_OPTIONS.map(p => <option key={p} value={p}>{LEAD_PURPOSE_LABELS[p]}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Source</label>
                <select value={form.source} onChange={e => setForm({ ...form, source: e.target.value as LeadSource })} className={inputCls}>
                  {SOURCE_OPTIONS.map(s => <option key={s} value={s}>{LEAD_SOURCE_LABELS[s]}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Temperature</label>
                <select value={form.temperature} onChange={e => setForm({ ...form, temperature: e.target.value as LeadTemperature })} className={inputCls}>
                  {TEMP_OPTIONS.map(t => <option key={t} value={t}>{LEAD_TEMPERATURE_LABELS[t]}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Status</label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as LeadStatus })} className={inputCls}>
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{LEAD_STATUS_LABELS[s]}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Next Follow-up Date</label>
                <input type="date" value={form.nextFollowUpDate} onChange={e => setForm({ ...form, nextFollowUpDate: e.target.value })} className={inputCls} />
              </div>
            </div>

            <div>
              <label className={labelCls}>Notes</label>
              <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3} className={`${inputCls} resize-none`} />
            </div>
          </div>
        </AdminModal>
      )}
    </AdminLayout>
  );
}
