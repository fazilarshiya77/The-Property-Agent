import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Shield, Clock, Star, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import PropertyCard from '../components/PropertyCard';
import LocationCard from '../components/LocationCard';
import StatsCounter from '../components/StatsCounter';
import { locations } from '../data/properties';
import { usePropertyStore } from '../stores/propertyStore';
import { useScrollReveal, useSectionReveal, useParallax } from '../hooks/useScrollReveal';
import { SEO } from '../components/SEO';
import type { FAQItem, BreadcrumbItem } from '../components/SEO';

// ─── FAQ DATA (used by both UI and schema) ──────────────
const faqData: FAQItem[] = [
  {
    question: "What areas in Bangalore does Trishna Property Management cover?",
    answer: "Trishna Property Management covers 10+ prime locations across Bangalore including Murgeshpalya, CV Raman Nagar, GM Palya, Kaggadasapura, Bommasandra, Yelahanka, Devinagar, Sarjapur Road, Bannerghatta Road, Whitefield, and Singasandra. Our focus is on well-connected residential neighborhoods with good access to IT parks, schools, hospitals, and public transport including metro stations."
  },
  {
    question: "Are all properties on Trishna Property Management verified?",
    answer: "Yes, every property listed on Trishna Property Management is personally inspected and verified by our team before going live. We check for legal documentation authenticity, property condition, amenities availability, and overall living quality. This ensures you get exactly what you see in the listing — no surprises, no hidden issues."
  },
  {
    question: "What documents do I need to rent a property in Bangalore?",
    answer: "To rent a property in Bangalore through Trishna Property Management, you typically need: identity proof (Aadhaar Card, PAN Card, or Passport), address proof, income proof (salary slips or IT returns for the last 3 months), passport-sized photographs, and a security deposit (usually 2-10 months' rent). Our team guides you through the entire documentation process to make it seamless."
  },
  {
    question: "How long does the rental process take with Trishna Property Management?",
    answer: "The rental process with Trishna Property Management typically takes 2-7 business days from property selection to move-in. This includes property visits, documentation verification, rental agreement signing, and key handover. Most of our properties are available for immediate occupancy, and we handle all paperwork and coordination with property owners."
  },
  {
    question: "Does Trishna Property Management charge brokerage fees?",
    answer: "Trishna Property Management maintains a transparent fee structure that is clearly communicated upfront before you commit. Our service charges vary by property type and value. We believe in honest, upfront pricing with absolutely no hidden costs. Contact our team at +91 98861 04532 for specific details about any property."
  },
  {
    question: "What is the average rent for a 2BHK apartment in Murgeshpalya, Bangalore?",
    answer: "The average rent for a 2BHK apartment in Murgeshpalya, Bangalore ranges from ₹46,000 to ₹60,000 per month depending on furnishing level, floor, and amenities. Fully furnished apartments with maintenance included are priced around ₹50,000-60,000, while semi-furnished options start from ₹46,000. Security deposits typically range from ₹1.5 Lakhs to ₹2 Lakhs."
  },
  {
    question: "Does Trishna Property Management help with buying apartments from Brigade, Godrej, and Mahindra?",
    answer: "Yes, Trishna Property Management is an authorized channel partner for premium developers including Brigade Group (Brigade Valencia, Brigade Eternia, Brigade Insignia), Godrej Properties (Godrej Lakeside Orchard, Godrej Vanantara), and Mahindra Lifespaces (Mahindra Blossom, Mahindra Zen). We offer expert guidance on new launch projects, pricing, payment plans, and possession timelines across Bangalore."
  },
  {
    question: "Which areas in East Bangalore are best for renting a family home?",
    answer: "For family homes in East Bangalore, Murgeshpalya, CV Raman Nagar, and Kaggadasapura are excellent choices. Murgeshpalya offers proximity to IT parks along Old Airport Road with rents from ₹46,000-65,000. CV Raman Nagar is peaceful and close to DRDO/ISRO with rents around ₹40,000. GM Palya offers affordable options starting at ₹35,000. All areas have good schools, hospitals, and metro connectivity."
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
  // Feature Brigade & Godrej premium properties
  const featuredIds = ['550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440015']; // Brigade (10,11,12) + Godrej (14,15)
  const featuredProperties = featuredIds
    .map(id => allProperties.find(p => p.id === id))
    .filter(Boolean) as typeof allProperties;
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // FAQ accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Scroll-triggered reveal refs
  const statsRef = useScrollReveal({ direction: 'up', stagger: 0.12 });
  const locationsHeaderRef = useSectionReveal();
  const locationsGridRef = useScrollReveal({ direction: 'up', stagger: 0.1 });
  const featuredHeaderRef = useSectionReveal();
  const featuredGridRef = useScrollReveal({ direction: 'up', stagger: 0.1 });
  const whyHeaderRef = useSectionReveal();
  const whyGridRef = useScrollReveal({ direction: 'up', stagger: 0.15 });
  const ctaRef = useScrollReveal({ direction: 'up', distance: 50, duration: 0.9 });
  const heroParallaxRef = useParallax<HTMLImageElement>(0.2);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/listings?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/listings');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50/50">
      <SEO
        title="Premium Rental Homes & Properties for Sale in Bangalore"
        description="Trishna Property Management offers 50+ verified rental homes and premium properties for sale in Bangalore. Browse apartments in Murgeshpalya, CV Raman Nagar, GM Palya, Whitefield, Sarjapur Road & more. 200+ happy families. Trusted by Bangalore residents since 5+ years."
        keywords="Trishna Property Management, Trishna Properties, Prishna Properties, rental homes Bangalore, properties for sale Bangalore, 2BHK Murgeshpalya rent, 3BHK CV Raman Nagar, apartments GM Palya, Brigade Valencia Bommasandra, Godrej Lakeside Sarjapur, Mahindra Blossom Whitefield, verified properties Bangalore, premium rentals East Bangalore, furnished apartments near IT parks Bangalore, best real estate agent Bangalore"
        type="website"
        canonicalPath="/"
        location="Bangalore, Karnataka, India"
        geoRegion="IN-KA"
        geoPosition="12.9716;77.5946"
        breadcrumbs={breadcrumbs}
        faqData={faqData}
      />

      {/* ─── HERO ─────────────────────────────── */}
      <section className="relative min-h-[75vh] sm:min-h-[85vh] flex items-center overflow-hidden" aria-label="Hero — Find your perfect home in Bangalore">
        {/* Background */}
        <div className="absolute inset-0">
          <img
            ref={heroParallaxRef}
            src="/properties/godrej-lakeside/hero-bg.jpg"
            alt="Premium luxury apartment interior in Bangalore — Trishna Property Management"
            className="w-full h-[120%] object-cover"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-950/95 via-navy-950/70 to-navy-950/30" />
        </div>

        <div className="relative max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-12 sm:py-20 w-full">
          <div className="max-w-2xl animate-fade-in-up">
            <span className="inline-block px-3 sm:px-4 py-1.5 bg-brand-500/25 border border-brand-500/25 text-brand-300 text-[10px] sm:text-xs font-semibold uppercase tracking-widest rounded-full mb-4 sm:mb-6 backdrop-blur-md">
              Premium Properties in Bangalore
            </span>
            <h1 className="text-2xl sm:text-4xl lg:text-6xl font-display font-bold text-white leading-[1.1] mb-4 sm:mb-6 tracking-wide">
              Find Your
              <br />
              <span className="gradient-text">Perfect Home</span>
            </h1>
            <p className="text-sm sm:text-lg text-neutral-300 mb-6 sm:mb-8 max-w-lg leading-relaxed font-light">
              Discover handpicked luxury homes and premium residential properties in Bangalore's most sought-after neighborhoods. 50+ verified listings across 10+ prime locations.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="bg-white rounded-2xl shadow-glass p-2 max-w-xl border border-white/10" role="search" aria-label="Search properties">
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
          </div>
        </div>
      </section>

      {/* ─── STATS BAR ─────────────────────────── */}
      <section className="py-6 sm:py-10 bg-white border-b border-neutral-100" aria-label="Trishna Property Management statistics">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div ref={statsRef} className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            <StatsCounter end={50} suffix="+" label="Properties Listed" />
            <StatsCounter end={200} suffix="+" label="Happy Families" />
            <StatsCounter end={6} label="Prime Locations" />
            <StatsCounter end={5} suffix="+" label="Years Experience" />
          </div>
        </div>
      </section>

      {/* ─── ABOUT TRISHNA PROPERTY MANAGEMENT (AIEO/GEO Content Block) ─── */}
      <section className="py-8 sm:py-12 bg-white" aria-label="About Trishna Property Management">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-display font-bold text-navy-900 mb-3 sm:mb-4">
              Bangalore's Trusted Real Estate Partner
            </h2>
            <p className="text-neutral-600 text-sm sm:text-base leading-relaxed max-w-3xl mx-auto">
              <strong>Trishna Property Management</strong> (also known as Trishna Properties, Prishna Properties) is a leading real estate agency based in <strong>Bengaluru, Karnataka</strong>, specializing in premium verified rental homes and properties for sale. Founded with a mission to make property search transparent and hassle-free, we serve <strong>200+ happy families</strong> across <strong>10+ prime locations</strong> in Bangalore including <strong>Murgeshpalya, CV Raman Nagar, GM Palya, Bommasandra, Yelahanka, Whitefield, Sarjapur Road,</strong> and <strong>Bannerghatta Road</strong>.
            </p>
            <p className="text-neutral-500 text-xs sm:text-sm leading-relaxed max-w-3xl mx-auto mt-3">
              Whether you're looking to <strong>rent a 2BHK or 3BHK apartment near IT parks</strong>, <strong>buy premium apartments from Brigade Group, Godrej Properties, or Mahindra Lifespaces</strong>, or need expert <strong>property management services</strong> — Trishna Property Management is your one-stop solution. Every property is personally inspected and verified before listing.
            </p>
          </div>
        </div>
      </section>

      {/* ─── FEATURED PROPERTIES ──────────────── */}
      <section className="py-10 sm:py-16 lg:py-20" aria-label="Featured properties for sale in Bangalore">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div ref={featuredHeaderRef} className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-10 gap-3 sm:gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-navy-900 mb-1.5 sm:mb-2">
                Featured Properties
              </h2>
              <p className="text-neutral-500 text-sm">Handpicked premium homes from Brigade, Godrej & Mahindra — ready for you</p>
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

      {/* ─── EXPLORE LOCATIONS ─────────────────── */}
      <section className="py-10 sm:py-16 lg:py-20 bg-neutral-50" aria-label="Explore properties by location in Bangalore">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div ref={locationsHeaderRef} className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-navy-900 mb-2 sm:mb-3">
              Explore by Location
            </h2>
            <p className="text-neutral-500 max-w-2xl mx-auto text-sm">
              Browse verified properties in Bangalore's most desirable neighborhoods — from East Bangalore to Whitefield and beyond
            </p>
          </div>

          <div ref={locationsGridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {locations.map((loc) => (
              <LocationCard key={loc.name} {...loc} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── WHY CHOOSE US ─────────────────────── */}
      <section className="py-10 sm:py-16 lg:py-20 bg-white" aria-label="Why choose Trishna Property Management">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div ref={whyHeaderRef} className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-navy-900 mb-2 sm:mb-3">
              Why Families Trust Trishna Property Management
            </h2>
            <p className="text-neutral-500 max-w-2xl mx-auto text-sm">
              We go beyond listings — we help you find a home you'll love
            </p>
          </div>

          <div ref={whyGridRef} className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {[
              { icon: Shield, title: 'Verified Properties', desc: 'Every property is personally inspected and verified by our team before listing. No surprises, no hidden issues — what you see is what you get.' },
              { icon: Clock, title: 'Quick Move-In', desc: 'Most properties are available for immediate occupancy. We handle all paperwork, coordination with owners, and agreement signing so you can move in stress-free within 2-7 days.' },
              { icon: Star, title: 'Premium Service', desc: 'Dedicated support throughout your rental journey — from initial property search to move-in day and beyond. Over 200 families trust us for their home needs in Bangalore.' },
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

      {/* ─── NEIGHBORHOOD GUIDES (AIEO/GEO Content) ─── */}
      <section className="py-10 sm:py-16 lg:py-20 bg-neutral-50" aria-label="Bangalore neighborhood rental guides">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-navy-900 mb-2 sm:mb-3">
              Bangalore Neighborhood Guides
            </h2>
            <p className="text-neutral-500 max-w-2xl mx-auto text-sm">
              Expert insights on the best areas to rent or buy property in Bangalore
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <article className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-neutral-100">
              <h3 className="text-base sm:text-lg font-semibold text-navy-900 mb-2">Murgeshpalya — East Bangalore's Premium Rental Hub</h3>
              <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed">
                Murgeshpalya is one of the most sought-after residential areas in East Bangalore for working professionals and families. Located near Old Airport Road and HAL, it offers excellent connectivity to major IT parks, shopping centers, and hospitals. Average rental prices for 2BHK apartments range from ₹46,000 to ₹65,000/month, with options for fully furnished and semi-furnished homes in gated communities.
              </p>
              <Link to="/listings?location=Murgeshpalya" className="inline-flex items-center text-brand-500 text-xs sm:text-sm font-semibold mt-3 hover:text-brand-600 transition-colors">
                View Murgeshpalya properties <ArrowRight className="h-3.5 w-3.5 ml-1" aria-hidden="true" />
              </Link>
            </article>

            <article className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-neutral-100">
              <h3 className="text-base sm:text-lg font-semibold text-navy-900 mb-2">CV Raman Nagar — Peaceful Living Near DRDO & ISRO</h3>
              <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed">
                CV Raman Nagar is a well-established residential area known for its peaceful atmosphere and proximity to defense establishments like DRDO and ISRO. It offers easy metro access and connectivity to Old Airport Road. Rental prices for 2BHK apartments start from ₹40,000/month, making it an affordable yet premium choice for professionals and families seeking a quiet neighborhood.
              </p>
              <Link to="/listings?location=CV+Raman+Nagar" className="inline-flex items-center text-brand-500 text-xs sm:text-sm font-semibold mt-3 hover:text-brand-600 transition-colors">
                View CV Raman Nagar properties <ArrowRight className="h-3.5 w-3.5 ml-1" aria-hidden="true" />
              </Link>
            </article>

            <article className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-neutral-100">
              <h3 className="text-base sm:text-lg font-semibold text-navy-900 mb-2">Whitefield — IT Hub with Premium Developments</h3>
              <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed">
                Whitefield is Bangalore's premier IT corridor with world-class residential developments from top builders like Mahindra Lifespaces. Home to ITPL and numerous tech parks, it offers excellent social infrastructure including international schools, hospitals, and malls. Premium apartments start from ₹2.0 Cr with projects like Mahindra Blossom featuring a 97,000 sqft clubhouse and metro connectivity.
              </p>
              <Link to="/listings?location=Whitefield" className="inline-flex items-center text-brand-500 text-xs sm:text-sm font-semibold mt-3 hover:text-brand-600 transition-colors">
                View Whitefield properties <ArrowRight className="h-3.5 w-3.5 ml-1" aria-hidden="true" />
              </Link>
            </article>
          </div>
        </div>
      </section>

      {/* ─── FAQ SECTION (AEO OPTIMIZED with Schema) ─── */}
      <section className="py-10 sm:py-16 lg:py-20 bg-white" aria-label="Frequently asked questions about renting and buying properties in Bangalore">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-navy-900 mb-2 sm:mb-3">
              Frequently Asked Questions
            </h2>
            <p className="text-neutral-500 max-w-2xl mx-auto text-sm">
              Answers to common questions about finding and renting properties in Bangalore with Trishna Property Management
            </p>
          </div>
          
          <div className="space-y-3 sm:space-y-4" role="list" aria-label="FAQ list">
            {faqData.map((faq, idx) => (
              <div
                key={idx}
                className="bg-neutral-50 rounded-xl border border-neutral-100 overflow-hidden transition-all duration-300"
                role="listitem"
              >
                <button
                  id={`faq-toggle-${idx}`}
                  onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-4 sm:p-6 lg:p-7 text-left hover:bg-neutral-100/50 transition-colors"
                  aria-expanded={openFaqIndex === idx}
                  aria-controls={`faq-answer-${idx}`}
                >
                  <h3 className="text-base sm:text-lg font-semibold text-navy-900 pr-4">{faq.question}</h3>
                  {openFaqIndex === idx ? (
                    <ChevronUp className="h-5 w-5 text-brand-500 flex-shrink-0" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-neutral-400 flex-shrink-0" aria-hidden="true" />
                  )}
                </button>
                <div
                  id={`faq-answer-${idx}`}
                  className={`overflow-hidden transition-all duration-300 ${openFaqIndex === idx ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                  role="region"
                  aria-labelledby={`faq-toggle-${idx}`}
                >
                  <p className="px-4 sm:px-6 lg:px-7 pb-4 sm:pb-6 lg:pb-7 text-neutral-600 text-xs sm:text-sm leading-relaxed">{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA BANNER ────────────────────────── */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-navy-900 to-navy-950 relative overflow-hidden" aria-label="Contact Trishna Property Management">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-400 rounded-full blur-3xl" />
        </div>
        <div ref={ctaRef} className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-white mb-3 sm:mb-4">
            Ready to Find Your Dream Home in Bangalore?
          </h2>
          <p className="text-sm sm:text-lg text-neutral-300 mb-6 sm:mb-8 max-w-2xl mx-auto">
            Get in touch with Trishna Property Management today. Our expert team will help you find the perfect verified property that fits your needs and budget — whether you want to rent, buy, or sell.
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
