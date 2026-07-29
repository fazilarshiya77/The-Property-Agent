import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, Search, LogOut, Home, Building } from 'lucide-react';
import { usePropertyStore, isAdminAuthenticated, setAdminAuthenticated } from '../stores/propertyStore';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const { properties, fetchProperties, deleteProperty } = usePropertyStore();

  useEffect(() => {
    fetchProperties()
  }, [fetchProperties])

  useEffect(() => {
    if (!isAdminAuthenticated()) navigate('/admin');
  }, [navigate]);

  const filtered = useMemo(() => {
    if (!search) return properties;
    const q = search.toLowerCase();
    return properties.filter(p =>
      p.title.toLowerCase().includes(q) || p.location.toLowerCase().includes(q)
    );
  }, [properties, search]);

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

  const handleLogout = () => {
    setAdminAuthenticated(false);
    navigate('/admin');
  };

  const formatPrice = (price: number, type: string) => {
    if (type === 'rent') return `₹${price.toLocaleString('en-IN')}/mo`;
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)} Cr`;
    return `₹${(price / 100000).toFixed(1)} L`;
  };

  if (!isAdminAuthenticated()) return null;

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-neutral-400 hover:text-brand-500 transition-colors">
              <Home className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-lg font-display font-bold text-navy-900 tracking-wide">Property Manager</h1>
              <p className="text-xs text-neutral-500">{properties.length} properties</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/admin/new"
              className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all hover:shadow-lg hover:shadow-brand-500/25"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Property</span>
            </Link>
            <button onClick={handleLogout} className="p-2.5 rounded-xl hover:bg-neutral-100 text-neutral-500 transition-colors" title="Logout">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search properties..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-neutral-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none text-sm"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Property</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider hidden md:table-cell">Location</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Price</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider hidden sm:table-cell">Type</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-neutral-100 flex-shrink-0">
                          {p.images[0] ? (
                            <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Building className="w-full h-full p-2.5 text-neutral-300" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <Link to={`/listings/${p.id}`} className="text-sm font-semibold text-navy-900 hover:text-brand-500 transition-colors truncate block">
                            {p.title}
                          </Link>
                          <p className="text-xs text-neutral-500 md:hidden">{p.areaName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-600 hidden md:table-cell">{p.areaName}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-navy-900">{formatPrice(p.price, p.type)}</td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${p.type === 'rent' ? 'bg-brand-50 text-brand-600' : 'bg-navy-950/5 text-navy-900'}`}>
                        {p.type === 'rent' ? 'Rent' : 'Sale'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
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
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-neutral-500 text-sm">No properties found</div>
          )}
        </div>
      </div>
    </div>
  );
}
