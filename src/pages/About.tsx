import { Link } from 'react-router-dom';
import ContactForm from '../components/ContactForm';
import { Shield, Users, MapPin, Clock, Star, Award, ExternalLink, Home, ChevronRight, Building2, MessageCircle } from 'lucide-react';
import { useScrollReveal, useSectionReveal } from '../hooks/useScrollReveal';
import { SEO } from '../components/SEO';
import type { BreadcrumbItem, FAQItem } from '../components/SEO';
import { useSettingsStore } from '../stores/settingsStore';
import { formatPhoneDisplay, toTelHref, toWhatsAppHref } from '../lib/phone';

// About page FAQ data for AEO — a function of the admin-configured numbers
// so the "How can I contact us" answer always reflects Settings.
function buildAboutFaqData(callDisplay: string, whatsappDisplay: string): FAQItem[] {
  return [
    {
      question: "How can I contact The Property Agent?",
      answer: `You can reach The Property Agent by phone at ${callDisplay}, WhatsApp at ${whatsappDisplay}, email at trishnaproperties78@gmail.com, or visit our office at No. 84, 4th cross kashi nagar, yelachanahalli, B-78., Bengaluru, Karnataka. We are open Monday to Saturday, 9 AM to 7 PM.`
    },
    {
      question: "What services does The Property Agent offer across Karnataka?",
      answer: "We help in three ways: 1) Buying — we actively search for plots, farmhouse plots, agricultural land, and homes matching your requirement, and support you through site visits, negotiation, and documentation. 2) Selling / Listing — if you have a property to sell or rent out, we list it and connect you with genuine buyers or tenants. 3) Renting & Leasing — we help tenants find rental or lease homes and assist with the agreement, including e-stamp paperwork."
    },
    {
      question: "Does The Property Agent hold fixed property inventory?",
      answer: "No — The Property Agent works as an active agent rather than holding fixed stock. Properties are added to this site as they become available and removed once sold, rented, or leased. Contact us directly to check on current availability in a specific area or category."
    }
  ];
}

export default function About() {
  const { callNumber, whatsappNumber } = useSettingsStore(s => s.settings);
  const aboutFaqData = buildAboutFaqData(formatPhoneDisplay(callNumber), formatPhoneDisplay(whatsappNumber));
  const address = 'No. 84, 4th cross kashi nagar, yelachanahalli, B-78., Bengaluru, Karnataka';
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  const mapsEmbed = `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;

  // Scroll reveal refs
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
        title="About The Property Agent — Independent Real Estate Agent Across Karnataka"
        description="Learn about The Property Agent, an independent real estate agent covering all of Karnataka — helping you buy plots, farmhouse plots, land, and homes; helping owners sell or list properties; and helping tenants find rental & lease homes."
        keywords="about The Property Agent, real estate agent Karnataka, plot for sale Karnataka, farmhouse plot Karnataka, agricultural land Karnataka, property services Karnataka, Bengaluru real estate agent"
        type="website"
        canonicalPath="/about"
        location="Bengaluru, Karnataka, India"
        geoRegion="IN-KA"
        geoPosition="12.9716;77.5946"
        breadcrumbs={breadcrumbs}
        faqData={aboutFaqData}
      />

      {/* ─── BREADCRUMB NAVIGATION ─── */}
      <nav aria-label="Breadcrumb" className="bg-navy-900 pt-20 sm:pt-24">
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
      <section className="relative py-8 sm:py-12 lg:py-16 bg-gradient-to-br from-navy-900 to-navy-950 overflow-hidden" aria-label="About The Property Agent">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 right-10 w-96 h-96 bg-brand-500 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold text-white mb-4 sm:mb-6 leading-tight">
            Your Direct Contact for<br className="hidden sm:block" />
            <span className="gradient-text">Properties Across Karnataka</span>
          </h1>
          <p className="text-base sm:text-lg text-neutral-300 max-w-2xl mx-auto leading-relaxed">
            An independent property agent dealing in <strong>plots, farmhouse plots, agricultural land, rentals, lease, and sale properties</strong> across Karnataka — no fixed inventory, just active deals as they come in.
          </p>
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
                  <strong>The Property Agent</strong> was founded with a simple mission — to connect people directly with the right property, wherever in <strong>Karnataka</strong> it happens to be. We're not tied to a fixed set of listings in one neighborhood; as plots, farmhouse plots, agricultural land, rental homes, and commercial spaces become available, we bring them to you.
                </p>
                <p>
                  We understand that finding the right property is more than just a transaction. That's why every listing we put up is personally checked before it goes live, and taken down as soon as it's sold, rented, or leased — so what you see is always current.
                </p>
                <p>
                  Based in <strong>Yelachanahalli, Bengaluru</strong>, our reach covers the whole state — from residential rentals and leases to plots, farmhouses, and agricultural land in districts across Karnataka.
                </p>
              </div>
            </article>
            <div className="rounded-2xl overflow-hidden shadow-card-hover h-64 sm:h-80 bg-navy-950">
              <img src="/about.jpg" alt="The Property Agent — our story" className="w-full h-full object-cover" loading="lazy" decoding="async" />
            </div>
          </div>
        </div>
      </section>

      {/* What Makes Us Different */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white" aria-label="What makes The Property Agent different">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div ref={diffHeaderRef} className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-navy-900 mb-3">What Makes The Property Agent Different</h2>
            <p className="text-neutral-500 max-w-2xl mx-auto text-sm sm:text-base">
              We go above and beyond to help you find the right property, anywhere in Karnataka
            </p>
          </div>

          <div ref={diffGridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              { icon: Shield, title: 'Personally Verified', desc: 'Every listing is personally checked before it goes live. We look at documentation, condition, and legitimacy before you ever see it.' },
              { icon: Users, title: 'Direct Support', desc: 'You deal with us directly — no call centers, no runaround. Reach out by phone or WhatsApp and get a straight answer.' },
              { icon: MapPin, title: 'Statewide Coverage', desc: 'Plots, farmhouse plots, land, rentals, lease & sale properties from anywhere across Karnataka — not limited to one city or neighborhood.' },
              { icon: Clock, title: 'Fast Response', desc: 'We handle documentation, owner coordination, and paperwork promptly so deals move quickly once you\'re ready.' },
              { icon: Star, title: 'Honest Listings', desc: 'What you see is what you get — no inflated descriptions, no bait-and-switch on price or condition.' },
              { icon: Award, title: 'Transparent Pricing', desc: 'Fees are clearly communicated upfront before you commit. No hidden charges, ever.' },
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
      <section className="py-12 sm:py-16 lg:py-20 bg-neutral-50" aria-label="Visit our office in Bengaluru" itemScope itemType="https://schema.org/LocalBusiness">
        <meta itemProp="name" content="The Property Agent" />
        <meta itemProp="telephone" content={formatPhoneDisplay(callNumber)} />
        <meta itemProp="email" content="trishnaproperties78@gmail.com" />

        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div ref={officeHeaderRef} className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-navy-900 mb-3">Visit Our Office</h2>
            <p className="text-neutral-500 text-sm sm:text-base">Come meet us in person — we'd love to help you find the right property</p>
          </div>

          <div ref={officeRef} className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
            {/* Map */}
            <div className="lg:col-span-3 rounded-2xl overflow-hidden shadow-card border border-neutral-100 bg-white">
              <iframe
                src={mapsEmbed}
                title="The Property Agent office location — Yelachanahalli, Bengaluru"
                className="w-full h-64 sm:h-80 lg:h-96"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                style={{ border: 0 }}
                allowFullScreen
                aria-label="Google Maps showing The Property Agent office at Yelachanahalli, Bengaluru"
              />
            </div>

            {/* Office Info */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-card p-6 sm:p-8 flex flex-col justify-center">
              <div className="flex items-center space-x-3 mb-6">
                <div className="h-12 w-12 rounded-xl bg-brand-500 flex items-center justify-center flex-shrink-0">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-navy-900 tracking-wide" itemProp="legalName">The Property Agent</h3>
                  <p className="text-[10px] font-semibold text-brand-500 uppercase tracking-widest">Plots · Land · Rentals · Sale</p>
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
                      <span itemProp="streetAddress">No. 84, 4th cross kashi nagar, yelachanahalli, B-78.</span>,{' '}
                      <span itemProp="addressLocality">Bengaluru</span>,{' '}
                      <span itemProp="addressRegion">Karnataka</span>
                    </p>
                  </div>
                </div>

                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center space-x-2 w-full py-3 bg-brand-500 hover:bg-brand-600 text-navy-900 text-sm font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-brand-500/25"
                  aria-label="Open The Property Agent office location in Google Maps"
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
      <section id="contact" className="py-12 sm:py-16 lg:py-20 bg-white" aria-label="Contact The Property Agent">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div ref={contactRef} className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            <div>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-navy-900 mb-4">Get in Touch</h2>
              <p className="text-neutral-600 mb-6 sm:mb-8 leading-relaxed text-sm sm:text-base">
                Whether you're looking for a <strong>plot, farmhouse, or agricultural land</strong>, want to <strong>rent, lease, or buy a home</strong>, or want to <strong>list your property with us</strong>, we'd love to hear from you. Contact The Property Agent today.
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
                    <MessageCircle className="h-5 w-5 text-brand-500" aria-hidden="true" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-navy-900">Call or WhatsApp</h4>
                    <p className="text-sm text-neutral-500 mt-1">
                      <a href={toTelHref(callNumber)} className="hover:text-brand-500 transition-colors">{formatPhoneDisplay(callNumber)}</a>
                      {' · '}
                      <a href={toWhatsAppHref(whatsappNumber)} target="_blank" rel="noopener noreferrer" className="hover:text-brand-500 transition-colors">{formatPhoneDisplay(whatsappNumber)} (WhatsApp)</a>
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-brand-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Star className="h-5 w-5 text-brand-500" aria-hidden="true" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-navy-900">Areas We Serve</h4>
                    <p className="text-sm text-neutral-500 mt-1">All of Karnataka</p>
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
