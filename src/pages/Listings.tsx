import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import PropertyCard from '../components/PropertyCard';
import { usePropertyStore } from '../stores/propertyStore';
import { Search, SlidersHorizontal, X, ChevronDown, Home, ChevronRight } from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { SEO, generateItemListSchema } from '../components/SEO';
import type { BreadcrumbItem } from '../components/SEO';
import type { PropertyType } from '../data/properties';
import { PROPERTY_TYPE_LABELS } from '../data/properties';
import { Helmet } from 'react-helmet-async';

type SortOption = 'default' | 'price-asc' | 'price-desc' | 'area-desc';
type TypeFilter = 'all' | PropertyType;

const TYPE_PILLS: { id: TypeFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'plot', label: 'Plots' },
  { id: 'farmhouse', label: 'Farmhouse Plots' },
  { id: 'land', label: 'Land' },
  { id: 'rent', label: 'For Rent' },
  { id: 'lease', label: 'For Lease' },
  { id: 'sale', label: 'For Sale' },
  { id: 'commercial', label: 'Commercial' },
];

const LAND_TYPES: PropertyType[] = ['plot', 'farmhouse', 'land'];

export default function Listings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [propertyType, setPropertyType] = useState<TypeFilter>(
    (searchParams.get('type') as TypeFilter) || 'all'
  );
  const [selectedLocation, setSelectedLocation] = useState(
    searchParams.get('location') || 'all'
  );
  const [bedrooms, setBedrooms] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [showFilters, setShowFilters] = useState(false);
  const gridRef = useScrollReveal({ direction: 'up', stagger: 0.08 });

  useEffect(() => {
    setSearchTerm(searchParams.get('search') || '');
    setSelectedLocation(searchParams.get('location') || 'all');
    setPropertyType((searchParams.get('type') as TypeFilter) || 'all');
  }, [searchParams]);

  const { properties: allProperties, fetchProperties, loading } = usePropertyStore();

  useEffect(() => {
    fetchProperties()
  }, [fetchProperties])

  // Public listings only ever show published properties — drafts, reserved,
  // sold etc. stay admin-only.
  const properties = useMemo(() => allProperties.filter(p => p.status === 'published'), [allProperties]);

  const allLocations = useMemo(() => {
    const locs = [...new Set(properties.map(p => p.areaName))];
    return locs.sort();
  }, [properties]);

  const filteredProperties = useMemo(() => {
    let result = properties.filter((property) => {
      const matchesSearch = !searchTerm ||
        property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = propertyType === 'all' || property.type === propertyType;
      const matchesLocation = selectedLocation === 'all' || 
        (property.areaName && property.areaName.toLowerCase() === selectedLocation.toLowerCase()) ||
        (property.location && property.location.toLowerCase().includes(selectedLocation.toLowerCase()));
      const isNonResidential = property.type === 'commercial' || LAND_TYPES.includes(property.type);
      const matchesBedrooms = bedrooms === 'all' ||
        property.bedrooms >= Number(bedrooms) ||
        isNonResidential;
      return matchesSearch && matchesType && matchesLocation && matchesBedrooms;
    });

    switch (sortBy) {
      case 'price-asc': result.sort((a, b) => a.price - b.price); break;
      case 'price-desc': result.sort((a, b) => b.price - a.price); break;
      case 'area-desc': result.sort((a, b) => b.area - a.area); break;
    }
    return result;
  }, [searchTerm, propertyType, selectedLocation, bedrooms, sortBy, properties]);

  const activeFilterCount = [
    propertyType !== 'all',
    selectedLocation !== 'all',
    bedrooms !== 'all'
  ].filter(Boolean).length;

  const clearFilters = () => {
    setPropertyType('all');
    setSelectedLocation('all');
    setBedrooms('all');
    setSearchTerm('');
  };

  // ─── SEO Data ─────────────────────────────
  const breadcrumbs: BreadcrumbItem[] = [
    { name: 'Home', url: '/' },
    { name: 'Properties', url: '/listings' },
    ...(selectedLocation !== 'all' ? [{ name: selectedLocation, url: `/listings?location=${encodeURIComponent(selectedLocation)}` }] : []),
  ];

  // Dynamic title and description based on filters
  const locationLabel = selectedLocation !== 'all' ? selectedLocation : 'Karnataka';
  const typeLabel = propertyType === 'all' ? 'Properties' : PROPERTY_TYPE_LABELS[propertyType];
  const pageTitle = `${typeLabel} in ${locationLabel}`;
  const pageDescription = `Browse ${filteredProperties.length} ${typeLabel.toLowerCase()} listings in ${locationLabel}. Filter by location, price, and category (Plots, Farmhouse Plots, Land, Rent, Lease, Sale, Commercial). Listings are added and updated regularly by The Property Agent.`;

  const itemListSchema = generateItemListSchema(pageTitle, pageDescription, filteredProperties.length);

  return (
    <div className="min-h-screen bg-neutral-50/50">
      <SEO
        title={pageTitle}
        description={pageDescription}
        keywords={`${typeLabel.toLowerCase()} ${locationLabel}, ${locationLabel} real estate listings, plot for sale ${locationLabel}, farmhouse plot ${locationLabel}, land for sale ${locationLabel}, rental house ${locationLabel}, The Property Agent ${locationLabel}`}
        type="website"
        canonicalPath="/listings"
        location={selectedLocation !== 'all' ? `${locationLabel}, Karnataka, India` : 'Karnataka, India'}
        geoRegion="IN-KA"
        geoPosition="12.9716;77.5946"
        breadcrumbs={breadcrumbs}
      />

      {/* ItemList Schema */}
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(itemListSchema)}
        </script>
      </Helmet>

      {/* ─── HERO ─────────────────────────────── */}
      <section className="relative overflow-hidden bg-navy-950 min-h-[420px] sm:min-h-[480px] lg:min-h-[560px] flex items-center" aria-label="Properties hero">
        {/* Background photo — height is kept close to the photo's own
            proportions (rather than an oversized viewport-height banner) so
            object-cover only trims the far edges instead of zooming deep
            into the composition. */}
        <div className="absolute inset-0">
          <img
            src="/property-hero.jpg"
            alt="Modern commercial towers and city skyline representing properties across Karnataka"
            className="absolute inset-0 w-full h-full object-cover object-center"
            loading="eager"
            decoding="async"
          />
          {/* Gradient overlay for text legibility — applied as a separate layer
              so the photo itself is never darkened, filtered, or degraded. */}
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/55 to-navy-950/35" />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-950/70 via-transparent to-navy-950/40" />
        </div>

        <div className="relative max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-16 text-center w-full animate-fade-in-up">
          <span className="inline-block px-3 sm:px-4 py-1.5 bg-brand-500/20 border border-brand-500/30 text-brand-300 text-[10px] sm:text-xs font-semibold uppercase tracking-widest rounded-full mb-5 sm:mb-6 backdrop-blur-md">
            Across Karnataka
          </span>
          <h1 className="font-display font-bold leading-none tracking-wide text-white text-5xl sm:text-7xl lg:text-8xl">
            <span className="gradient-text">PROPERTIES</span>
          </h1>
          <p className="mt-5 sm:mt-6 text-neutral-200 text-sm sm:text-base max-w-xl mx-auto font-light">
            Plots, farmhouse plots, agricultural land, rental &amp; lease homes, and commercial spaces — sourced and listed as they become available, anywhere in Karnataka.
          </p>
        </div>
      </section>

      {/* ─── BREADCRUMB NAVIGATION ─── */}
      <div className="bg-white border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center flex-wrap gap-1 text-sm" itemScope itemType="https://schema.org/BreadcrumbList">
              <li className="flex items-center" itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                <Link to="/" className="text-neutral-500 hover:text-brand-500 transition-colors flex items-center" itemProp="item">
                  <Home className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
                  <span itemProp="name">Home</span>
                </Link>
                <meta itemProp="position" content="1" />
              </li>
              <ChevronRight className="h-3 w-3 text-neutral-400 mx-1" aria-hidden="true" />
              <li className="flex items-center" itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                <span className="text-navy-900 font-medium" itemProp="name">Properties</span>
                <meta itemProp="position" content="2" />
              </li>
              {selectedLocation !== 'all' && (
                <>
                  <ChevronRight className="h-3 w-3 text-neutral-400 mx-1" aria-hidden="true" />
                  <li className="flex items-center" itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                    <span className="text-navy-900 font-medium" itemProp="name">{selectedLocation}</span>
                    <meta itemProp="position" content="3" />
                  </li>
                </>
              )}
            </ol>
          </nav>

          {/* SEO Intro Paragraph */}
          <p className="text-neutral-500 text-xs sm:text-sm mt-2 leading-relaxed max-w-3xl">
            {selectedLocation !== 'all'
              ? `Explore ${typeLabel.toLowerCase()} in ${selectedLocation}. All listings are personally checked by The Property Agent before going live, with transparent pricing and no hidden charges.`
              : `Browse our current collection of plots, farmhouse plots, agricultural land, rental & lease homes, and commercial properties across Karnataka. Since we don't hold fixed inventory, this list changes as new deals come in — check back often or contact us directly.`
            }
          </p>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-neutral-100 sticky top-14 lg:top-16 z-30">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
          {/* Search + filter toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" aria-hidden="true" />
              <input
                type="text"
                id="listings-search"
                placeholder="Search by title, location or area..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 sm:pl-11 pr-3 sm:pr-4 py-2.5 bg-neutral-50/80 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none text-sm transition-all placeholder-neutral-400"
                aria-label="Search properties by title, location, or area"
              />
            </div>
            <button
              id="filter-toggle-btn"
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
                showFilters || activeFilterCount > 0
                  ? 'bg-brand-500 text-navy-900 border-brand-500 shadow-md shadow-brand-500/25'
                  : 'bg-neutral-50 border-neutral-200 text-neutral-700 hover:bg-neutral-100'
              }`}
              aria-label="Toggle property filters"
              aria-expanded={showFilters}
            >
              <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Filters</span>
              {activeFilterCount > 0 && (
                <span className={`w-5 h-5 text-xs rounded-full flex items-center justify-center font-bold ${
                  showFilters || activeFilterCount > 0 ? 'bg-white text-brand-600' : 'bg-brand-500 text-navy-900'
                }`}>
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Type pills */}
          <div className="flex items-center gap-1.5 sm:gap-2 mt-3 sm:mt-4 overflow-x-auto pb-1" role="group" aria-label="Filter by property type">
            {TYPE_PILLS.map(({ id, label }) => (
              <button
                key={id}
                id={`filter-type-${id}`}
                onClick={() => setPropertyType(id)}
                className={`px-3 sm:px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 flex-shrink-0 ${
                  propertyType === id
                    ? 'bg-navy-950 text-brand-400 border border-brand-500/20 shadow-md'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 border border-transparent'
                }`}
                aria-pressed={propertyType === id}
              >
                {label}
              </button>
            ))}

            {/* Sort dropdown */}
            <div className="ml-auto relative flex-shrink-0">
              <div className="flex items-center">
                <label htmlFor="sort-select" className="sr-only">Sort properties</label>
                <select
                  id="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="appearance-none bg-transparent text-sm text-neutral-600 pr-6 cursor-pointer outline-none"
                  aria-label="Sort properties by"
                >
                  <option value="default">Sort: Default</option>
                  <option value="price-asc">Price: Low → High</option>
                  <option value="price-desc">Price: High → Low</option>
                  <option value="area-desc">Area: Largest First</option>
                </select>
                <ChevronDown className="h-3.5 w-3.5 text-neutral-400 -ml-5 pointer-events-none" aria-hidden="true" />
              </div>
            </div>
          </div>

          {/* Expanded filters */}
          {showFilters && (
            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-neutral-100 animate-fade-in" role="group" aria-label="Advanced filters">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div>
                  <label htmlFor="location-filter" className="block text-xs font-medium text-neutral-500 uppercase tracking-wider mb-1.5">Location</label>
                  <select id="location-filter" value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500">
                    <option value="all">All Locations</option>
                    {allLocations.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="bedrooms-filter" className="block text-xs font-medium text-neutral-500 uppercase tracking-wider mb-1.5">Bedrooms</label>
                  <select id="bedrooms-filter" value={bedrooms} onChange={(e) => setBedrooms(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500">
                    <option value="all">Any</option>
                    <option value="2">2+ Beds</option>
                    <option value="3">3+ Beds</option>
                    <option value="4">4+ Beds</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button id="clear-filters-btn" onClick={clearFilters} className="text-sm text-brand-500 hover:text-brand-600 font-medium transition-colors">
                    Clear All Filters
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Active filter chips */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2.5 sm:mt-3" role="list" aria-label="Active filters">
              {propertyType !== 'all' && (
                <span className="flex items-center gap-1 px-3 py-1 bg-navy-900 text-white text-xs font-medium rounded-full" role="listitem">
                  {PROPERTY_TYPE_LABELS[propertyType]}
                  <button onClick={() => setPropertyType('all')} aria-label={`Remove ${propertyType} filter`}><X className="h-3 w-3" /></button>
                </span>
              )}
              {selectedLocation !== 'all' && (
                <span className="flex items-center gap-1 px-3 py-1 bg-brand-50 text-brand-600 text-xs font-medium rounded-full" role="listitem">
                  {selectedLocation}
                  <button onClick={() => setSelectedLocation('all')} aria-label={`Remove ${selectedLocation} filter`}><X className="h-3 w-3" /></button>
                </span>
              )}
              {bedrooms !== 'all' && (
                <span className="flex items-center gap-1 px-3 py-1 bg-brand-50 text-brand-600 text-xs font-medium rounded-full" role="listitem">
                  {bedrooms}+ Beds
                  <button onClick={() => setBedrooms('all')} aria-label="Remove bedrooms filter"><X className="h-3 w-3" /></button>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8" aria-label="Property search results">
        {loading ? (
          <div className="text-center py-16 sm:py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500 mx-auto mb-4"></div>
            <p className="text-sm text-neutral-500">Loading properties...</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-neutral-500 mb-4 sm:mb-6">
              Showing <span className="font-semibold text-navy-900">{filteredProperties.length}</span> {filteredProperties.length === 1 ? 'property' : 'properties'}
              {selectedLocation !== 'all' ? ` in ${selectedLocation}` : ' across Karnataka'}
            </p>

            {filteredProperties.length > 0 ? (
              <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {filteredProperties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 sm:py-20">
                <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">🏠</div>
                <h3 className="text-base sm:text-lg font-semibold text-navy-800 mb-1.5 sm:mb-2">No properties found</h3>
                <p className="text-neutral-500 text-sm mb-4 sm:mb-6 max-w-md mx-auto">Try adjusting your filters, or reach out directly — we don't hold fixed inventory, so new deals come in that aren't listed yet.</p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button id="no-results-clear-btn" onClick={clearFilters}
                    className="text-brand-500 hover:text-brand-600 font-medium text-sm transition-colors">
                    Clear all filters
                  </button>
                  <a href="https://wa.me/919019488368" target="_blank" rel="noopener noreferrer"
                    className="bg-brand-500 hover:bg-brand-600 text-navy-900 font-semibold text-sm px-5 py-2.5 rounded-xl transition-all">
                    Ask on WhatsApp
                  </a>
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
