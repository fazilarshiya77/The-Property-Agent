import { Link } from 'react-router-dom';
import ContactForm from '../components/ContactForm';
import StatsCounter from '../components/StatsCounter';
import { Shield, Users, MapPin, Clock, Star, Award, ExternalLink, Home, ChevronRight } from 'lucide-react';
import { useScrollReveal, useSectionReveal } from '../hooks/useScrollReveal';
import { SEO } from '../components/SEO';
import type { BreadcrumbItem, FAQItem } from '../components/SEO';

// About page FAQ data for AEO
const aboutFaqData: FAQItem[] = [
  {
    question: "How can I contact Trishna Property Management?",
    answer: "You can reach Trishna Property Management by phone at +91 98861 04532, email at trishnaproperties78@gmail.com, or visit our office at 31, GM Palya Main Rd, KG Colony, GM Palya, C V Raman Nagar, Bengaluru, Karnataka 560075. We are open Monday to Saturday, 9 AM to 7 PM."
  },
  {
    question: "What services does Trishna Property Management offer in Bangalore?",
    answer: "Trishna Property Management offers comprehensive real estate and property care services in Bangalore including: 1) Rental and purchase of verified premium homes, 2) Official Government E-Stamping & rental agreement drafting, 3) Electrical works and diagnostics, 4) Plumbing & sanitary solutions, 5) Carpentry & modular woodwork repairs, 6) Civil building works, painting & waterproofing, and 7) Local & intercity Packers & Movers shifting."
  },
  {
    question: "How many properties and service technicians does Trishna Property Management have?",
    answer: "Trishna Property Management currently has 50+ verified property listings and a dedicated team of verified electricians, plumbers, carpenters, civil contractors, and packers & movers across Bangalore serving 200+ happy families."
  }
];

export default function About() {
  const address = '31, GM Palya Main Rd, KG Colony, GM Palya, C V Raman Nagar, Bengaluru, Karnataka 560075';
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  const mapsEmbed = `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;

  // Scroll reveal refs
  const statsRef = useScrollReveal({ direction: 'up', stagger: 0.12 });
  const storyRef = useScrollReveal({ direction: 'up', stagger: 0.15 });
  const diffHeaderRef = useSectionReveal();
  const diffGridRef = useScrollReveal({ direction: 'up', stagger: 0.1 });
  const officeHeaderRef = useSectionReveal();
  const officeRef = useScrollReveal({ direction: 'up', stagger: 0.15 });
  const contactRef = useScrollReveal({ direction: 'up', stagger: 0.12 });

  // ─── SEO Data ─────────────────────────────
  const breadcrumbs: BreadcrumbItem[] = [
    { name: 'Home', url: '/' },
    { name: 'About Us', url: '/about' },
  ];

  return (
    <div className="min-h-screen" itemScope itemType="https://schema.org/AboutPage">
      <SEO
        title="About Trishna Property Management — Real Estate & Home Services in Bangalore"
        description="Learn about Trishna Property Management, Bangalore's trusted property & home care partner. 50+ verified properties, 200+ happy families, 5+ years experience. Expert E-Stamping, Electrical, Plumbing, Carpentry, Building Works & Movers across Bangalore."
        keywords="about Trishna Property Management, Trishna Properties, real estate agent Bangalore, property management Bangalore, home services Bangalore, E-stamp Bangalore, electrician CV Raman Nagar, plumber GM Palya, carpentry Murgeshpalya, packers and movers Bangalore"
        type="website"
        canonicalPath="/about"
        location="Bengaluru, Karnataka, India"
        geoRegion="IN-KA"
        geoPosition="12.9716;77.5946"
        breadcrumbs={breadcrumbs}
        faqData={aboutFaqData}
      />

      {/* ─── BREADCRUMB NAVIGATION ─── */}
      <nav aria-label="Breadcrumb" className="bg-navy-900 pt-20">
        <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8">
          <ol className="flex items-center flex-wrap gap-1 text-sm" itemScope itemType="https://schema.org/BreadcrumbList">
            <li className="flex items-center" itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
              <Link to="/" className="text-neutral-400 hover:text-brand-400 transition-colors flex items-center" itemProp="item">
                <Home className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
                <span itemProp="name">Home</span>
              </Link>
              <meta itemProp="position" content="1" />
            </li>
            <ChevronRight className="h-3 w-3 text-neutral-500 mx-1" aria-hidden="true" />
            <li className="flex items-center" itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
              <span className="text-white font-medium" itemProp="name">About Us</span>
              <meta itemProp="position" content="2" />
            </li>
          </ol>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative py-8 sm:py-12 lg:py-16 bg-gradient-to-br from-navy-900 to-navy-950 overflow-hidden" aria-label="About Trishna Property Management">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 right-10 w-96 h-96 bg-brand-500 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 text-center">
          <span className="inline-block px-3 py-1 bg-brand-500/20 text-brand-300 text-sm font-medium rounded-full mb-6">
            About Trishna
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold text-white mb-4 sm:mb-6 leading-tight">
            Your Trusted Partner for<br className="hidden sm:block" />
            <span className="gradient-text">Premium Homes in Bangalore</span>
          </h1>
          <p className="text-base sm:text-lg text-neutral-300 max-w-2xl mx-auto leading-relaxed">
            We specialize in connecting families with quality-verified rental and sale properties across Bangalore's finest neighborhoods. <strong>50+ verified properties. 200+ happy families. 10+ prime locations.</strong>
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-8 sm:py-10 bg-white border-b border-neutral-100 -mt-1" aria-label="Company statistics">
        <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8">
          <div ref={statsRef} className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            <StatsCounter end={50} suffix="+" label="Properties Listed" />
            <StatsCounter end={200} suffix="+" label="Happy Families" />
            <StatsCounter end={6} label="Prime Locations" />
            <StatsCounter end={5} suffix="+" label="Years Experience" />
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-12 sm:py-16 lg:py-20" aria-label="Our story">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div ref={storyRef} className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <article>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-navy-900 mb-5 sm:mb-6">Our Story</h2>
              <div className="space-y-4 text-neutral-600 text-sm sm:text-base leading-relaxed">
                <p>
                  <strong>Trishna Property Management</strong> (also known as <strong>Trishna Properties</strong>) was founded with a simple mission — to make finding a quality home in <strong>Bangalore</strong> hassle-free and transparent. Whether you want to <strong>Buy, Rent, or Sell</strong>, we're here to help with our deep expertise in the Bangalore real estate market.
                </p>
                <p>
                  We understand that finding the right home is more than just a transaction. It's about finding a space where memories are made, where families grow, and where every day feels comfortable and secure. That's why we personally inspect every property and maintain strict quality standards.
                </p>
                <p>
                  Based in <strong>GM Palya, C V Raman Nagar, Bengaluru</strong>, our team covers properties across <strong>East Bangalore, South Bangalore, and Whitefield</strong>. We partner with top developers like <strong>Brigade Group, Godrej Properties, and Mahindra Lifespaces</strong> to bring you the best premium projects alongside our curated rental portfolio.
                </p>
              </div>
            </article>
            <div className="rounded-2xl overflow-hidden shadow-card-hover">
              <img
                src="/properties/brigade-insignia/our-story.jpg"
                alt="Premium apartment interior showcasing quality properties managed by Trishna Property Management in Bangalore"
                className="w-full h-64 sm:h-80 object-cover"
                loading="lazy"
                width="640"
                height="320"
              />
            </div>
          </div>
        </div>
      </section>

      {/* What Makes Us Different */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white" aria-label="What makes Trishna Property Management different">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div ref={diffHeaderRef} className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-navy-900 mb-3">What Makes Trishna Property Management Different</h2>
            <p className="text-neutral-500 max-w-2xl mx-auto text-sm sm:text-base">
              We go above and beyond to ensure every family finds the perfect home in Bangalore
            </p>
          </div>

          <div ref={diffGridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              { icon: Shield, title: 'Verified Listings', desc: 'Every property is personally visited and verified by our team. We check legal documentation, property condition, and amenities availability.' },
              { icon: Users, title: 'Dedicated Support', desc: 'A dedicated property manager assists you from initial search to move-in and throughout your stay. Available via phone at +91 98861 04532.' },
              { icon: MapPin, title: '10+ Prime Locations', desc: 'Properties across Murgeshpalya, CV Raman Nagar, GM Palya, Bommasandra, Yelahanka, Whitefield, Sarjapur Road, Bannerghatta Road, and more.' },
              { icon: Clock, title: 'Quick 2-7 Day Process', desc: 'Most tenants move in within a week. We handle documentation, owner coordination, and rental agreement preparation.' },
              { icon: Star, title: 'Quality Interiors', desc: 'We list only well-maintained properties with modern fittings and clean interiors. Fully furnished and semi-furnished options available.' },
              { icon: Award, title: 'Transparent Pricing', desc: 'Honest pricing with no hidden charges. Rent, deposit, and maintenance charges clearly stated upfront for every property.' },
            ].map(item => (
              <article key={item.title} className="p-5 sm:p-6 rounded-2xl bg-neutral-50 hover:bg-white hover:shadow-card-hover transition-all duration-300 group text-center">
                <div className="w-11 h-11 sm:w-12 sm:h-12 bg-brand-50 rounded-xl flex items-center justify-center mb-4 sm:mb-5 group-hover:bg-brand-100 group-hover:scale-110 transition-all duration-300 mx-auto">
                  <item.icon className="h-5 w-5 sm:h-6 sm:w-6 text-brand-500" aria-hidden="true" />
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-navy-900 mb-2">{item.title}</h3>
                <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed">{item.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Office & Map Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-neutral-50" aria-label="Visit our office in Bangalore" itemScope itemType="https://schema.org/LocalBusiness">
        <meta itemProp="name" content="Trishna Property Management" />
        <meta itemProp="telephone" content="+91 98861 04532" />
        <meta itemProp="email" content="trishnaproperties78@gmail.com" />
        <meta itemProp="priceRange" content="₹35,000 - ₹3.2 Cr" />
        
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div ref={officeHeaderRef} className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-navy-900 mb-3">Visit Our Office</h2>
            <p className="text-neutral-500 text-sm sm:text-base">Come meet us in person — we'd love to help you find your dream home in Bangalore</p>
          </div>

          <div ref={officeRef} className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
            {/* Map */}
            <div className="lg:col-span-3 rounded-2xl overflow-hidden shadow-card border border-neutral-100 bg-white">
              <iframe
                src={mapsEmbed}
                title="Trishna Property Management office location — GM Palya, CV Raman Nagar, Bengaluru"
                className="w-full h-64 sm:h-80 lg:h-96"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                style={{ border: 0 }}
                allowFullScreen
                aria-label="Google Maps showing Trishna Property Management office at GM Palya, Bengaluru"
              />
            </div>

            {/* Office Info */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-card p-6 sm:p-8 flex flex-col justify-center">
              <div className="flex items-center space-x-3 mb-6">
                <img src="/logo.jpeg" alt="Trishna Property Management logo" className="h-12 w-12 rounded-xl object-contain bg-white shadow-sm border border-neutral-100" width="48" height="48" />
                <div>
                  <h3 className="font-display font-bold text-navy-900 tracking-wide" itemProp="legalName">Trishna Property Management</h3>
                  <p className="text-[10px] font-semibold text-brand-500 uppercase tracking-widest">Buy · Rent · Sell</p>
                </div>
              </div>

              <div className="space-y-4" itemProp="address" itemScope itemType="https://schema.org/PostalAddress">
                <div className="flex items-start space-x-3">
                  <div className="w-9 h-9 bg-brand-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MapPin className="h-4 w-4 text-brand-500" aria-hidden="true" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-navy-900 uppercase tracking-wide mb-1">Address</h4>
                    <p className="text-sm text-neutral-600 leading-relaxed">
                      <span itemProp="streetAddress">31, GM Palya Main Rd, KG Colony, GM Palya</span>,{' '}
                      <span itemProp="addressLocality">C V Raman Nagar, Bengaluru</span>,{' '}
                      <span itemProp="addressRegion">Karnataka</span>{' '}
                      <span itemProp="postalCode">560075</span>
                    </p>
                  </div>
                </div>

                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center space-x-2 w-full py-3 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-brand-500/25"
                  aria-label="Open Trishna Property Management office location in Google Maps"
                >
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                  <span>Open in Google Maps</span>
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-12 sm:py-16 lg:py-20 bg-white" aria-label="Contact Trishna Property Management">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div ref={contactRef} className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            <div>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-navy-900 mb-4">Get in Touch</h2>
              <p className="text-neutral-600 mb-6 sm:mb-8 leading-relaxed text-sm sm:text-base">
                Whether you're looking for a <strong>rental home in East Bangalore</strong>, want to <strong>buy a premium apartment from Brigade, Godrej, or Mahindra</strong>, or list your property with us, we'd love to hear from you. Contact Trishna Property Management today for expert real estate guidance.
              </p>

              <div className="space-y-5">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-brand-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-5 w-5 text-brand-500" aria-hidden="true" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-navy-900">Office</h4>
                    <p className="text-sm text-neutral-500 mt-1">{address}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-brand-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Star className="h-5 w-5 text-brand-500" aria-hidden="true" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-navy-900">Areas We Serve in Bangalore</h4>
                    <p className="text-sm text-neutral-500 mt-1">Murgeshpalya, CV Raman Nagar, GM Palya, Bommasandra, Yelahanka, Devinagar, Kaggadasapura, Sarjapur Road, Bannerghatta Road, Whitefield, Singasandra & more</p>
                  </div>
                </div>
              </div>
            </div>

            <ContactForm contactEmail="trishnaproperties78@gmail.com" />
          </div>
        </div>
      </section>
    </div>
  );
}
