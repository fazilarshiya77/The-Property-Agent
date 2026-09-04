import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Shield, Clock, Star, ArrowRight, ChevronDown, ChevronUp, Tag, Key, Sparkles, Check, Phone, MapPinned, RefreshCw, MessageCircle, FileText, Building2, HelpCircle } from 'lucide-react';
import PropertyCard from '../components/PropertyCard';
import { servicesData } from '../data/services';
import { usePropertyStore } from '../stores/propertyStore';
import { useScrollReveal, useSectionReveal } from '../hooks/useScrollReveal';
import { SEO } from '../components/SEO';
import type { FAQItem, BreadcrumbItem } from '../components/SEO';

type FilterType = 'all' | 'plot' | 'farmhouse' | 'land' | 'rent' | 'lease' | 'sale' | 'commercial';

const TYPE_TABS: { id: FilterType; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'plot', label: 'Plots' },
  { id: 'farmhouse', label: 'Farmhouse Plots' },
  { id: 'land', label: 'Land' },
  { id: 'rent', label: 'For Rent' },
  { id: 'lease', label: 'For Lease' },
  { id: 'sale', label: 'For Sale' },
  { id: 'commercial', label: 'Commercial' },
];

// Helper for service icons
function getHomeServiceIcon(iconName: string) {
  switch (iconName) {
    case 'Search':
      return <Search className="h-6 w-6" />;
    case 'Tag':
      return <Tag className="h-6 w-6" />;
    case 'Key':
      return <Key className="h-6 w-6" />;
    default:
      return <Sparkles className="h-6 w-6" />;
  }
}

// ─── FAQ DATA (used by both UI and schema) ──────────────
const faqData: FAQItem[] = [
  {
    question: "What areas does The Property Agent cover?",
    answer: "The Property Agent operates all across Karnataka. We don't hold a fixed inventory in any one location — as new plots, farmhouse plots, land, rental homes, lease properties, and commercial spaces become available anywhere in the state, we list them here. Reach out and let us know the area you're interested in."
  },
  {
    question: "What kind of properties does The Property Agent deal in?",
    answer: "We deal in plot sales, farmhouse plots, agricultural land, rental houses, lease properties, properties for sale, and commercial spaces. Listings are added and removed as they become available or get sold/rented, so check back often or contact us directly with your requirement."
  },
  {
    question: "What services does The Property Agent offer?",
    answer: "We help in three ways: 1) Buying — we actively search for plots, farmhouse plots, agricultural land, and homes matching your requirement, arrange site visits, and support negotiation and documentation. 2) Selling / Listing — if you have a property to sell or rent out, we list it and connect you with genuine buyers or tenants. 3) Renting & Leasing — we help tenants find rental or lease homes and assist with the agreement."
  },
  {
    question: "What documents do I need to rent or buy a property through The Property Agent?",
    answer: "For rentals you typically need: identity proof (Aadhaar Card, PAN Card, or Passport), address proof, income proof, passport-sized photographs, and a security deposit. For plot, land, or farmhouse purchases, our team guides you through the title verification and documentation process. Requirements vary by deal type — contact us for specifics."
  },
  {
    question: "Does The Property Agent charge brokerage fees?",
    answer: "The Property Agent maintains a transparent fee structure that is clearly communicated upfront before you commit. Charges vary by property type and deal value. We believe in honest, upfront pricing with no hidden costs. Contact our team at +91 90194 88368 for specific details."
  },
  {
    question: "How do I list my property or enquire about a listing?",
    answer: "Call or WhatsApp us directly, or use the contact form on this site. Since we work as an active agent rather than holding fixed stock, the fastest way to know what's currently available in your area of interest is to reach out directly."
  },
  {
    question: "Can you help with the rental agreement or e-stamp paperwork?",
    answer: "Yes — when you rent or lease a property through us, we assist with drafting and e-stamping the rental/lease agreement so everything is properly documented. Reach out via WhatsApp (+91 99450 11138) or the contact form to get started."
  }
];

const breadcrumbs: BreadcrumbItem[] = [
  { name: 'Home', url: '/' },
];

export default function Home() {
  const { properties: allProperties, fetchProperties } = usePropertyStore();

  useEffect(() => {
    fetchProperties()
  }, [fetchProperties])
  // Feature properties flagged `isFeatured` in the admin, falling back to the
  // most recent published listings if nothing's been flagged yet.
  const publishedProperties = allProperties.filter(p => p.status === 'published');
  const featuredProperties = (() => {
    const flagged = publishedProperties.filter(p => p.isFeatured);
    if (flagged.length >= 3) return flagged.slice(0, 6);
    const rest = publishedProperties.filter(p => !p.isFeatured);
    return [...flagged, ...rest].slice(0, 6);
  })();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<FilterType>('all');
  const navigate = useNavigate();

  // FAQ accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Scroll-triggered reveal refs
  const statsRef = useScrollReveal({ direction: 'up', stagger: 0.12 });
  const coverageRef = useSectionReveal();
  const servicesHeaderRef = useSectionReveal();
  const servicesGridRef = useScrollReveal({ direction: 'up', stagger: 0.1 });
  const featuredHeaderRef = useSectionReveal();
  const featuredGridRef = useScrollReveal({ direction: 'up', stagger: 0.1 });
  const whyHeaderRef = useSectionReveal();
  const whyGridRef = useScrollReveal({ direction: 'up', stagger: 0.15 });
  const ctaRef = useScrollReveal({ direction: 'up', distance: 50, duration: 0.9 });
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (selectedType !== 'all') {
      params.append('type', selectedType);
    }
    if (searchQuery.trim()) {
      params.append('search', searchQuery.trim());
    }
    const queryString = params.toString();
    navigate(queryString ? `/listings?${queryString}` : '/listings');
  };

  return (
    <div className="min-h-screen bg-neutral-50/50">
      <SEO
        title="Plots, Farmhouses, Land, Rentals & Properties Across Karnataka"
        description="The Property Agent deals in plot sales, farmhouse plots, agricultural land, rental & lease homes, and commercial properties across Karnataka. Listings are added and updated regularly."
        keywords="The Property Agent, Karnataka real estate agent, plot for sale Karnataka, farmhouse plot Karnataka, agricultural land for sale Karnataka, rental house Karnataka, lease property Karnataka, commercial property Karnataka"
        type="website"
        canonicalPath="/"
        location="Karnataka, India"
        geoRegion="IN-KA"
        geoPosition="12.9716;77.5946"
        breadcrumbs={breadcrumbs}
        faqData={faqData}
      />

      {/* ─── HERO ─────────────────────────────── */}
      <section className="relative min-h-[75vh] sm:min-h-[85vh] flex items-center overflow-hidden bg-navy-950" aria-label="Hero — Find your perfect property in Karnataka">
        {/* Video Background */}
        <div className="absolute inset-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="absolute inset-0 w-full h-full object-cover"
            aria-hidden="true"
          >
            <source src="/real_estate.mp4" type="video/mp4" />
          </video>
          {/* Gradient overlay for text legibility — video stays visible through it */}
          <div className="absolute inset-0 bg-gradient-to-r from-navy-950/85 via-navy-950/55 to-navy-950/25" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950/70 via-transparent to-navy-950/20" />
        </div>

        <div className="relative max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-12 sm:py-20 w-full">
          <div className="max-w-2xl animate-fade-in-up">
            <span className="inline-block px-3 sm:px-4 py-1.5 bg-brand-500/25 border border-brand-500/25 text-brand-300 text-[10px] sm:text-xs font-semibold uppercase tracking-widest rounded-full mb-4 sm:mb-6 backdrop-blur-md">
              Properties Across Karnataka
            </span>
            <h1 className="text-2xl sm:text-4xl lg:text-6xl font-display font-bold text-white leading-[1.1] mb-4 sm:mb-6 tracking-wide">
              Find Your
              <br />
              <span className="gradient-text">Perfect Space</span>
            </h1>
            <p className="text-sm sm:text-lg text-neutral-300 mb-6 sm:mb-8 max-w-lg leading-relaxed font-light">
              Plots, farmhouse plots, agricultural land, rental & lease homes, and commercial spaces — sourced and listed as they become available, anywhere in Karnataka.
            </p>

            {/* Search Box */}
            <div className="max-w-xl">
              {/* Search Bar */}
              <form onSubmit={handleSearchSubmit} className="bg-white rounded-2xl shadow-glass p-2 border border-white/10" role="search" aria-label="Search properties">
                <div className="flex items-center flex-col sm:flex-row gap-2">
                  <div className="flex-1 flex items-center px-4 py-2 w-full">
                    <Search className="h-4 sm:h-5 w-4 sm:w-5 text-neutral-400 mr-2 sm:mr-3 flex-shrink-0" aria-hidden="true" />
                    <input
                      type="text"
                      id="hero-search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by location, property name, or area..."
                      className="flex-1 bg-transparent outline-none text-navy-900 placeholder-neutral-400 text-xs sm:text-sm w-full"
                      aria-label="Search properties by location or type"
                    />
                  </div>
                  <button
                    type="submit"
                    id="hero-search-btn"
                    className="bg-brand-500 hover:bg-brand-600 text-white font-semibold px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-brand-500/25 text-xs sm:text-sm flex-shrink-0 active:scale-[0.98] w-full sm:w-auto"
                  >
                    Search Properties
                  </button>
                </div>
              </form>

              {/* Quick Category Badges */}
              <div className="flex items-center flex-wrap gap-2 mt-3.5 text-xs text-neutral-300">
                <span className="text-neutral-400 font-medium hidden sm:inline">Quick links:</span>
                <Link to="/listings?type=lease" className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all border border-white/10 hover:border-white/25">
                  <FileText className="h-3.5 w-3.5" aria-hidden="true" /> Long-Term Lease
                </Link>
                <Link to="/listings?type=commercial" className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all border border-white/10 hover:border-white/25">
                  <Building2 className="h-3.5 w-3.5" aria-hidden="true" /> Commercial Space
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TRUST STRIP ─────────────────────────── */}
      <section className="py-6 sm:py-10 bg-white border-b border-neutral-100" aria-label="The Property Agent highlights">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div ref={statsRef} className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            <div className="flex items-center space-x-3 p-3 sm:p-4 rounded-xl bg-neutral-50 border border-neutral-100">
              <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center text-brand-500 flex-shrink-0">
                <MapPinned className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm sm:text-base font-bold text-navy-900">Statewide Coverage</div>
                <div className="text-xs text-neutral-500">Listings anywhere across Karnataka</div>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 sm:p-4 rounded-xl bg-neutral-50 border border-neutral-100">
              <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center text-brand-500 flex-shrink-0">
                <RefreshCw className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm sm:text-base font-bold text-navy-900">Fresh Listings</div>
                <div className="text-xs text-neutral-500">Added and updated as deals come in</div>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 sm:p-4 rounded-xl bg-neutral-50 border border-neutral-100">
              <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center text-brand-500 flex-shrink-0">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm sm:text-base font-bold text-navy-900">Direct WhatsApp Support</div>
                <div className="text-xs text-neutral-500">Talk to us directly about any deal</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── ABOUT THE PROPERTY AGENT (AIEO/GEO Content Block) ─── */}
      <section className="py-8 sm:py-12 bg-white" aria-label="About The Property Agent">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-display font-bold text-navy-900 mb-3 sm:mb-4">
              Karnataka's Independent Property Agent
            </h2>
            <p className="text-neutral-600 text-sm sm:text-base leading-relaxed max-w-3xl mx-auto">
              <strong>The Property Agent</strong> operates as an independent real estate agent based in <strong>Bengaluru, Karnataka</strong>. We don't hold a fixed inventory — as plots, farmhouse plots, agricultural land, rental homes, lease properties, and commercial spaces become available across Karnataka, we list them here, and remove them once sold or taken.
            </p>
            <p className="text-neutral-500 text-xs sm:text-sm leading-relaxed max-w-3xl mx-auto mt-3">
              Whether you're looking to <strong>buy a plot or farmhouse</strong>, <strong>invest in agricultural land</strong>, <strong>rent or lease a home</strong>, or need expert <strong>property services</strong> — The Property Agent is your direct point of contact across the state.
            </p>
          </div>
        </div>
      </section>

      {/* ─── FEATURED PROPERTIES ──────────────── */}
      {featuredProperties.length > 0 && (
        <section className="py-10 sm:py-16 lg:py-20" aria-label="Featured properties in Karnataka">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div ref={featuredHeaderRef} className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-10 gap-3 sm:gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-navy-900 mb-1.5 sm:mb-2">
                  Featured Properties
                </h2>
                <p className="text-neutral-500 text-sm">Recently listed — ready for you</p>
              </div>
              <Link
                to="/listings"
                className="flex items-center space-x-1.5 sm:space-x-2 text-brand-500 hover:text-brand-600 font-semibold transition-colors group text-sm"
                aria-label="View all property listings"
              >
                <span>View All</span>
                <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              </Link>
            </div>

            <div ref={featuredGridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {featuredProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── KARNATAKA COVERAGE BANNER ─────────────────── */}
      <section className="py-10 sm:py-16 lg:py-20 bg-neutral-50" aria-label="Statewide coverage across Karnataka">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div ref={coverageRef} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-900 to-navy-950 text-white p-8 sm:p-12 lg:p-16 text-center">
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute -top-10 -left-10 w-72 h-72 bg-brand-500 rounded-full blur-3xl" />
              <div className="absolute -bottom-10 -right-10 w-72 h-72 bg-brand-400 rounded-full blur-3xl" />
            </div>
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-brand-500/20 flex items-center justify-center mx-auto mb-5">
                <MapPinned className="h-7 w-7 text-brand-400" />
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold mb-3 sm:mb-4">
                We Serve Properties Across All of Karnataka
              </h2>
              <p className="text-neutral-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
                We're not tied to one neighborhood or city — plots, farmhouse plots, agricultural land, rental homes, and commercial spaces can come up anywhere in the state. Tell us the area and category you're looking for, and we'll let you know what's currently available.
              </p>
              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <a
                  href="https://wa.me/919945011138?text=Hi%20The%20Property%20Agent%2C%20I%27d%20like%20to%20know%20what%20properties%20are%20currently%20available."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-brand-500 hover:bg-brand-600 text-white font-semibold px-6 py-2.5 sm:py-3 rounded-xl transition-all hover:shadow-lg hover:shadow-brand-500/25 text-sm inline-flex items-center justify-center gap-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Ask on WhatsApp</span>
                </a>
                <Link
                  to="/listings"
                  className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-semibold px-6 py-2.5 sm:py-3 rounded-xl transition-all border border-white/10 text-sm"
                >
                  Browse Current Listings
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── HOW WE HELP ────── */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white" aria-label="How The Property Agent helps you">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div ref={servicesHeaderRef} className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 sm:mb-12 gap-4">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-brand-50 border border-brand-200 text-brand-700 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Independent Property Agent</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-navy-900 mb-2">
                How We Help You
              </h2>
              <p className="text-neutral-500 text-sm sm:text-base max-w-2xl">
                Whether you're buying, selling, or renting a property, we work directly with you — anywhere in Karnataka
              </p>
            </div>
            <Link
              to="/services"
              className="inline-flex items-center space-x-2 text-brand-600 hover:text-brand-700 font-bold text-sm group"
            >
              <span>Explore All Services</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div ref={servicesGridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {servicesData.map((service) => (
              <article
                key={service.id}
                className="shimmer-sweep p-6 rounded-2xl bg-blue-50 border border-blue-200/80 hover:bg-blue-100/60 hover:shadow-card-hover hover:border-blue-400/40 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">
                      {getHomeServiceIcon(service.iconName)}
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 bg-blue-100 text-blue-700 rounded-full border border-blue-200 uppercase tracking-wider">
                      {service.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-display font-bold text-navy-900 group-hover:text-blue-700 transition-colors mb-2">
                    {service.title}
                  </h3>
                  <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed mb-4 font-light">
                    {service.shortDesc}
                  </p>

                  <div className="space-y-1.5 mb-5">
                    {service.features.slice(0, 3).map((feat, idx) => (
                      <div key={idx} className="flex items-start text-xs text-neutral-600">
                        <Check className="h-3.5 w-3.5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-1">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-blue-200/60 flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-500 flex items-center">
                    <Clock className="h-3.5 w-3.5 mr-1 text-blue-500" />
                    <span>{service.turnaroundTime}</span>
                  </span>
                  <Link
                    to={`/services?service=${service.id}#service-booking-form`}
                    className="inline-flex items-center space-x-1 text-xs font-bold text-blue-700 hover:text-blue-800 bg-blue-100 hover:bg-blue-200 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {/* Quick Helpline Strip */}
          <div className="mt-8 sm:mt-10 p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-navy-900 to-navy-950 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
            <div className="flex items-center space-x-3 text-center sm:text-left">
              <div className="w-10 h-10 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center flex-shrink-0">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold">Looking to Buy, Sell, or Rent a Property?</h4>
                <p className="text-xs text-neutral-300 mt-0.5">Call us directly and we'll help you get started.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="tel:+919019488368"
                className="bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition-all shadow-md flex items-center space-x-1.5"
              >
                <Phone className="h-3.5 w-3.5" />
                <span>+91 90194 88368</span>
              </a>
              <Link
                to="/services"
                className="bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition-all border border-white/10"
              >
                View Details
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── WHY CHOOSE US ─────────────────────── */}
      <section className="py-10 sm:py-16 lg:py-20 bg-neutral-50" aria-label="Why choose The Property Agent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div ref={whyHeaderRef} className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-navy-900 mb-2 sm:mb-3">
              Why Work With The Property Agent
            </h2>
            <p className="text-neutral-500 max-w-2xl mx-auto text-sm">
              We go beyond listings — we help you find a property you'll love
            </p>
          </div>

          <div ref={whyGridRef} className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {[
              { icon: MapPinned, title: 'Statewide Reach', desc: 'Not confined to one neighborhood or city — we source and list plots, land, farmhouses, rentals, and commercial spaces from across Karnataka.' },
              { icon: Shield, title: 'Personally Verified', desc: 'Every listing we put up is personally checked before going live. No surprises, no hidden issues — what you see is what you get.' },
              { icon: Star, title: 'Direct, Personal Service', desc: 'You deal directly with us — no call centers, no middlemen. Reach out on WhatsApp or by phone and get a straight answer.' },
            ].map((item) => (
              <article key={item.title} className="group p-4 sm:p-6 lg:p-8 rounded-2xl bg-neutral-50 hover:bg-white hover:shadow-card-hover transition-all duration-300">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-brand-50 rounded-xl flex items-center justify-center mb-4 sm:mb-5 group-hover:bg-brand-100 transition-colors">
                  <item.icon className="h-5 w-5 sm:h-6 sm:w-6 text-brand-500" aria-hidden="true" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-navy-900 mb-1.5 sm:mb-2">{item.title}</h3>
                <p className="text-neutral-500 text-xs sm:text-sm leading-relaxed">{item.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ SECTION (AEO OPTIMIZED with Schema) ─── */}
      <section className="py-10 sm:py-16 lg:py-20 bg-white" aria-label="Frequently asked questions about properties in Karnataka">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-navy-900 mb-2 sm:mb-3">
              Frequently Asked Questions
            </h2>
            <p className="text-neutral-500 max-w-2xl mx-auto text-sm">
              Answers to common questions about finding properties across Karnataka with The Property Agent
            </p>
          </div>

          <div className="space-y-3 sm:space-y-4" role="list" aria-label="FAQ list">
            {faqData.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className={`rounded-2xl overflow-hidden transition-all duration-300 bg-gradient-to-br from-navy-900 to-navy-950 shadow-md ${
                    isOpen ? 'ring-1 ring-brand-500/40 shadow-lg' : 'hover:shadow-lg'
                  }`}
                  role="listitem"
                >
                  <button
                    id={`faq-toggle-${idx}`}
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full flex items-center gap-3 sm:gap-4 p-4 sm:p-6 lg:p-7 text-left hover:bg-white/5 transition-colors"
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${idx}`}
                  >
                    <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                      isOpen ? 'bg-brand-500 text-white' : 'bg-white/10 text-brand-400'
                    }`}>
                      <HelpCircle className="h-4 w-4 sm:h-4.5 sm:w-4.5" aria-hidden="true" />
                    </div>
                    <h3 className="flex-1 text-base sm:text-lg font-semibold text-white pr-2">{faq.question}</h3>
                    {isOpen ? (
                      <ChevronUp className="h-5 w-5 text-brand-400 flex-shrink-0" aria-hidden="true" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-neutral-400 flex-shrink-0" aria-hidden="true" />
                    )}
                  </button>
                  <div
                    id={`faq-answer-${idx}`}
                    className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                    role="region"
                    aria-labelledby={`faq-toggle-${idx}`}
                  >
                    <p className="pl-16 sm:pl-20 pr-4 sm:pr-6 lg:pr-7 pb-4 sm:pb-6 lg:pb-7 text-neutral-300 text-xs sm:text-sm leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── CTA BANNER ────────────────────────── */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-navy-900 to-navy-950 relative overflow-hidden" aria-label="Contact The Property Agent">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-400 rounded-full blur-3xl" />
        </div>
        <div ref={ctaRef} className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-white mb-3 sm:mb-4">
            Looking for a Plot, Land, Farmhouse, or Home in Karnataka?
          </h2>
          <p className="text-sm sm:text-lg text-neutral-300 mb-6 sm:mb-8 max-w-2xl mx-auto">
            Get in touch with The Property Agent today. We'll help you find or list the right property — whether it's a plot, farmhouse, agricultural land, rental, lease, or commercial space.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link
              to="/listings"
              id="cta-browse-btn"
              className="bg-brand-500 hover:bg-brand-600 text-white font-semibold px-6 sm:px-8 py-2.5 sm:py-3.5 rounded-xl transition-all hover:shadow-lg hover:shadow-brand-500/25 text-sm"
            >
              Browse All Properties
            </Link>
            <Link
              to="/about#contact"
              id="cta-contact-btn"
              className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-semibold px-6 sm:px-8 py-2.5 sm:py-3.5 rounded-xl transition-all border border-white/10 text-sm"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
