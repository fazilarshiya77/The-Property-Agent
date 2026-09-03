import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Search, Building, Video, Star } from 'lucide-react';
import { usePropertyStore } from '../stores/propertyStore';
import { useAdminGuard } from '../stores/authStore';
import type { PropertyType, PropertyStatus } from '../data/properties';
import { PROPERTY_TYPE_LABELS, PROPERTY_STATUS_LABELS, PROPERTY_STATUS_TONE } from '../data/properties';
import AdminLayout from '../components/admin/AdminLayout';

const STATUS_TONE_CLASS: Record<string, string> = {
  neutral: 'bg-neutral-100 text-neutral-700 border border-neutral-200',
  info: 'bg-blue-50 text-blue-700 border border-blue-200',
  success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  gold: 'bg-brand-50 text-brand-700 border border-brand-200',
  critical: 'bg-red-50 text-red-700 border border-red-200',
};

const STATUS_OPTIONS: PropertyStatus[] = ['draft', 'available', 'published', 'reserved', 'sold', 'rented', 'inactive'];

export default function AdminProperties() {
  const ready = useAdminGuard();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | PropertyType>('all');
  const { properties, fetchProperties, deleteProperty, updateProperty } = usePropertyStore();

  useEffect(() => {
    if (ready) fetchProperties()
  }, [ready, fetchProperties])

  const filtered = useMemo(() => {
    return properties.filter(p => {
      const matchesSearch = !search ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.location.toLowerCase().includes(search.toLowerCase()) ||
        p.areaName.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === 'all' || p.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [properties, search, typeFilter]);

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Delete "${title}"? This action cannot be undone.`)) {
      try {
        await deleteProperty(id);
      } catch (err) {
        console.error('Error deleting property:', err)
        alert('Ran into an issue, please try again later.')
      }
    }
  };

  const handleStatusChange = async (id: string, status: PropertyStatus) => {
    try {
      await updateProperty(id, { status });
    } catch (err) {
      console.error('Error updating status:', err)
      alert('Ran into an issue, please try again later.')
    }
  };

  const toggleFeatured = async (id: string, isFeatured?: boolean) => {
    try {
      await updateProperty(id, { isFeatured: !isFeatured });
    } catch (err) {
      console.error('Error updating featured flag:', err)
    }
  };

  const formatPrice = (price: number, type: string) => {
    if (type === 'rent') return `₹${price.toLocaleString('en-IN')}/mo`;
    if (type === 'lease') {
      if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr (Lease)`;
      return `₹${(price / 100000).toFixed(1)} L (Lease)`;
    }
    if (type === 'commercial' && price < 1000000) return `₹${price.toLocaleString('en-IN')}/mo`;
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)} Cr`;
    return `₹${(price / 100000).toFixed(1)} L`;
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'rent':
        return { label: 'Rent', className: 'bg-brand-50 text-brand-600 border border-brand-200' };
      case 'sale':
        return { label: 'Sale', className: 'bg-amber-50 text-amber-700 border border-amber-200' };
      case 'lease':
        return { label: 'Lease', className: 'bg-indigo-50 text-indigo-700 border border-indigo-200' };
      case 'commercial':
        return { label: 'Commercial', className: 'bg-emerald-50 text-emerald-700 border border-emerald-200' };
      case 'plot':
        return { label: 'Plot', className: 'bg-amber-50 text-amber-700 border border-amber-200' };
      case 'farmhouse':
        return { label: 'Farmhouse', className: 'bg-lime-50 text-lime-700 border border-lime-200' };
      case 'land':
        return { label: 'Land', className: 'bg-orange-50 text-orange-700 border border-orange-200' };
      default:
        return { label: type, className: 'bg-neutral-100 text-neutral-800' };
    }
  };

  if (!ready) return null;

  return (
    <AdminLayout
      title="Properties"
      subtitle={`${properties.length} total · ${properties.filter(p => p.status === 'published').length} published · ${properties.filter(p => p.status === 'draft').length} draft`}
      actions={
        <Link
          to="/admin/new"
          className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all hover:shadow-lg hover:shadow-brand-500/25"
        >
          <Plus className="h-4 w-4" />
          <span>Add Property</span>
        </Link>
      }
    >
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 mt-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search properties by title, location or area..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-white border border-neutral-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none text-sm"
          />
        </div>

        {/* Type Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {([
            { id: 'all', label: 'All' },
            { id: 'plot', label: PROPERTY_TYPE_LABELS.plot },
            { id: 'farmhouse', label: PROPERTY_TYPE_LABELS.farmhouse },
            { id: 'land', label: PROPERTY_TYPE_LABELS.land },
            { id: 'rent', label: PROPERTY_TYPE_LABELS.rent },
            { id: 'lease', label: PROPERTY_TYPE_LABELS.lease },
            { id: 'sale', label: PROPERTY_TYPE_LABELS.sale },
            { id: 'commercial', label: PROPERTY_TYPE_LABELS.commercial },
          ] as const).map(({ id, label }) => {
            const count = id === 'all' ? properties.length : properties.filter(p => p.type === id).length;
            return (
              <button
                key={id}
                onClick={() => setTypeFilter(id as typeof typeFilter)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  typeFilter === id
                    ? 'bg-navy-900 text-white shadow-sm'
                    : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                <span>{label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  typeFilter === id ? 'bg-white/20 text-white' : 'bg-neutral-100 text-neutral-600'
                }`}>
                  {count}
                </span>
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
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Property</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider hidden lg:table-cell">Location</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Price</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider hidden sm:table-cell">Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Status</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {filtered.map((p) => {
                const badge = getTypeBadge(p.type);
                return (
                  <tr key={p.id} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-neutral-100 flex-shrink-0 relative">
                          {p.images[0] ? (
                            <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Building className="w-full h-full p-2.5 text-neutral-300" />
                          )}
                          {p.videos && p.videos.length > 0 && (
                            <div className="absolute bottom-0 right-0 bg-navy-950/80 text-white p-0.5 rounded-tl shadow-sm" title={`${p.videos.length} video(s)`}>
                              <Video className="h-3 w-3 text-brand-300" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <Link to={`/listings/${p.id}`} className="text-sm font-semibold text-navy-900 hover:text-brand-500 transition-colors truncate block">
                              {p.title}
                            </Link>
                            {p.videos && p.videos.length > 0 && (
                              <span className="text-[10px] font-bold px-1.5 py-0.2 bg-brand-50 text-brand-700 rounded flex-shrink-0">
                                Video
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-neutral-400 font-mono">{p.propertyCode}</p>
                          <p className="text-xs text-neutral-500 lg:hidden">{p.areaName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-600 hidden lg:table-cell">
                      {p.areaName}{p.district ? `, ${p.district}` : ''}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-navy-900">{formatPrice(p.price, p.type)}</td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${badge.className}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={p.status}
                        onChange={e => handleStatusChange(p.id, e.target.value as PropertyStatus)}
                        className={`px-2 py-1 rounded-full text-xs font-semibold outline-none cursor-pointer ${STATUS_TONE_CLASS[PROPERTY_STATUS_TONE[p.status]]}`}
                      >
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{PROPERTY_STATUS_LABELS[s]}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => toggleFeatured(p.id, p.isFeatured)}
                          className={`p-2 rounded-lg transition-colors ${p.isFeatured ? 'text-brand-500 hover:bg-brand-50' : 'text-neutral-300 hover:bg-neutral-100 hover:text-neutral-400'}`}
                          title={p.isFeatured ? 'Featured — click to unfeature' : 'Mark as Featured'}
                        >
                          <Star className={`h-4 w-4 ${p.isFeatured ? 'fill-brand-500' : ''}`} />
                        </button>
                        <Link
                          to={`/admin/edit/${p.id}`}
                          className="p-2 rounded-lg hover:bg-brand-50 text-neutral-400 hover:text-brand-500 transition-colors"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(p.id, p.title)}
                          className="p-2 rounded-lg hover:bg-red-50 text-neutral-400 hover:text-red-500 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-neutral-500 text-sm">No properties found</div>
        )}
      </div>
    </AdminLayout>
  );
}
