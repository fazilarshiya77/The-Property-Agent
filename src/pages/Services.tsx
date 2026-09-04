import { useState, useId, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Search,
  Tag,
  Key,
  CheckCircle,
  Clock,
  Shield,
  Star,
  Phone,
  MessageSquare,
  ArrowRight,
  Send,
  Loader2,
  MapPin,
  ChevronDown,
  ChevronUp,
  Home,
  ChevronRight,
  Sparkles,
  Award,
  Headphones,
  Check
} from 'lucide-react';
import { servicesData, ServiceItem } from '../data/services';
import { useScrollReveal, useSectionReveal } from '../hooks/useScrollReveal';
import { SEO } from '../components/SEO';
import type { BreadcrumbItem, FAQItem } from '../components/SEO';
import { logToGoogleSheet } from '../lib/logger';
import { supabase } from '../lib/supabase';

// Helper to get Lucide icon component by name
function getServiceIcon(iconName: string, className: string = 'h-6 w-6') {
  switch (iconName) {
    case 'Search':
      return <Search className={className} />;
    case 'Tag':
      return <Tag className={className} />;
    case 'Key':
      return <Key className={className} />;
    default:
      return <Sparkles className={className} />;
  }
}

export default function Services() {
  const location = useLocation();
  const serviceFormId = useId();

  // Parse any initial service query parameter (e.g. /services?service=buying-assistance)
  const initialServiceFromUrl = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const serviceParam = params.get('service');
    if (serviceParam) {
      const match = servicesData.find(s => s.id === serviceParam || s.slug === serviceParam);
      return match ? match.id : 'buying-assistance';
    }
    return 'buying-assistance';
  }, [location.search]);

  // State
  const [activeCategory, setActiveCategory] = useState<'all' | 'buying' | 'selling' | 'renting'>('all');
  const [selectedServiceForModal, setSelectedServiceForModal] = useState<ServiceItem | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Inquiry Form State
  const [selectedServiceId, setSelectedServiceId] = useState<string>(initialServiceFromUrl);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    locality: '',
    subService: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  // Filtered services
  const filteredServices = useMemo(() => {
    if (activeCategory === 'all') return servicesData;
    return servicesData.filter(s => s.category === activeCategory);
  }, [activeCategory]);

  const currentServiceItem = useMemo(() => {
    return servicesData.find(s => s.id === selectedServiceId) || servicesData[0];
  }, [selectedServiceId]);

  // Scroll reveals
  const statsRef = useScrollReveal({ direction: 'up', stagger: 0.1 });
  const servicesHeaderRef = useSectionReveal();
  const servicesGridRef = useScrollReveal({ direction: 'up', stagger: 0.12 });
  const processHeaderRef = useSectionReveal();
  const processGridRef = useScrollReveal({ direction: 'up', stagger: 0.15 });
  const trustHeaderRef = useSectionReveal();
  const trustGridRef = useScrollReveal({ direction: 'up', stagger: 0.12 });
  const faqHeaderRef = useSectionReveal();
  const formRef = useScrollReveal({ direction: 'up', distance: 40 });

  // Handle Form Change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSelectServiceForInquiry = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    setFormData(prev => ({ ...prev, subService: '' }));
    // Smooth scroll to form
    const formElement = document.getElementById('service-booking-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Handle Form Submit
  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(false);

    const serviceTitle = currentServiceItem ? currentServiceItem.title : 'General Property Inquiry';

    // Create a real lead in the CRM — additive alongside the existing
    // email/WhatsApp flow, never blocking on it either way.
    supabase.from('leads').insert([{
      name: formData.name,
      phone: formData.phone,
      email: formData.email || null,
      property_type_interested: serviceTitle,
      preferred_location: formData.locality || null,
      notes: formData.message,
      source: 'website',
      status: 'new',
      temperature: 'warm',
    }]).then(({ error }) => {
      if (error) console.error('Error creating lead:', error);
    });

    try {
      const formPayload = new FormData();
      formPayload.append('access_key', import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || '0469cb33-7c50-44d8-b019-c70583307942');
      formPayload.append('name', formData.name);
      formPayload.append('phone', formData.phone);
      formPayload.append('email', formData.email || 'not-provided@thepropertyagent.in');
      formPayload.append('looking_for', serviceTitle);
      formPayload.append('category', formData.subService || 'General Inquiry');
      formPayload.append('preferred_area', formData.locality);
      formPayload.append('message', formData.message);
      formPayload.append('subject', `Property Inquiry: ${serviceTitle} - ${formData.name}`);
      formPayload.append('to', 'trishnaproperties78@gmail.com');

      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formPayload,
      });

      const result = await response.json();

      if (result.success) {
        logToGoogleSheet({
          logType: 'CONTACT_FORM',
          message: `New Property Inquiry: ${serviceTitle} by ${formData.name}`,
          details: {
            lookingFor: serviceTitle,
            category: formData.subService,
            name: formData.name,
            phone: formData.phone,
            email: formData.email,
            preferredArea: formData.locality,
            message: formData.message,
          },
        });

        setIsSubmitting(false);
        setSubmitSuccess(true);
        setFormData({
          name: '',
          phone: '',
          email: '',
          locality: '',
          subService: '',
          message: ''
        });
        setTimeout(() => setSubmitSuccess(false), 8000);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      logToGoogleSheet({
        logType: 'ERROR',
        message: 'Property Inquiry Submission Failed',
        details: {
          error: (error as Error).message,
          service: serviceTitle,
          name: formData.name,
        },
      });
      setIsSubmitting(false);
      setSubmitError(true);
      setTimeout(() => setSubmitError(false), 6000);
    }
  };

  // Compile all FAQs for SEO Schema & UI
  const allServicesFaqs: FAQItem[] = useMemo(() => {
    const list: FAQItem[] = [
      {
        question: 'What does The Property Agent actually do?',
        answer: "We work as an independent real estate agent across Karnataka. We don't hold fixed property inventory — instead, we actively help people buy properties (plots, farmhouse plots, agricultural land, homes, commercial spaces), help owners sell or list their properties, and help tenants find rental or lease homes."
      },
      {
        question: 'I want to buy a property — how does it work?',
        answer: "Tell us what you're looking for (property type, area, budget) via the form below, WhatsApp, or a call. We search for matching properties, arrange site visits, help you negotiate, and support you through documentation and registration."
      },
      {
        question: 'I have a property to sell or rent out — can you help?',
        answer: "Yes. Share your property details with us and we'll list it and connect you with genuine, interested buyers or tenants from our network. We help with pricing guidance, coordinating visits, and paperwork through to closing."
      },
      {
        question: 'Does The Property Agent charge a fee?',
        answer: 'Our fee structure is clearly communicated upfront before you commit, and varies by deal type and value. No hidden charges — contact us for specific details on your requirement.'
      },
      {
        question: 'Which areas of Karnataka do you cover?',
        answer: "We aren't limited to one city or neighborhood — we work across Karnataka. Since we don't hold fixed inventory, the best way to know what's currently available in your area of interest is to contact us directly."
      },
      {
        question: 'Can you help with the rental agreement or e-stamp paperwork?',
        answer: 'Yes, when you rent or lease a property through us, we assist with drafting and e-stamping the rental/lease agreement so the process is fully documented and legally valid.'
      }
    ];
    return list;
  }, []);

  const breadcrumbs: BreadcrumbItem[] = [
    { name: 'Home', url: '/' },
    { name: 'Services', url: '/services' },
  ];

  return (
    <div className="min-h-screen bg-neutral-50/50">
      <SEO
        title="How We Help You Buy, Sell & Rent Property Across Karnataka"
        description="The Property Agent helps you buy plots, farmhouse plots, agricultural land, and homes; helps owners sell or list properties; and helps tenants find rental & lease homes — all across Karnataka."
        keywords="property agent Karnataka, buy plot Karnataka, sell property Karnataka, list property for sale Karnataka, rental home Karnataka, lease property Karnataka, The Property Agent services"
        type="website"
        canonicalPath="/services"
        location="Karnataka, India"
        geoRegion="IN-KA"
        geoPosition="12.9716;77.5946"
        breadcrumbs={breadcrumbs}
        faqData={allServicesFaqs}
      />

      {/* ─── BREADCRUMB ──────────────────────── */}
      <nav aria-label="Breadcrumb" className="bg-navy-950 pt-6 sm:pt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <ol className="flex items-center flex-wrap gap-1 text-xs sm:text-sm" itemScope itemType="https://schema.org/BreadcrumbList">
            <li className="flex items-center" itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
              <Link to="/" className="text-neutral-400 hover:text-brand-400 transition-colors flex items-center" itemProp="item">
                <Home className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
                <span itemProp="name">Home</span>
              </Link>
              <meta itemProp="position" content="1" />
            </li>
            <ChevronRight className="h-3 w-3 text-neutral-500 mx-1" aria-hidden="true" />
            <li className="flex items-center" itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
              <span className="text-white font-medium" itemProp="name">Services</span>
              <meta itemProp="position" content="2" />
            </li>
          </ol>
        </div>
      </nav>

      {/* ─── HERO ────────────────────────────── */}
      <section className="relative py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-950 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-24 right-0 w-96 h-96 bg-brand-500 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-10 w-80 h-80 bg-brand-400 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold leading-tight tracking-wide mb-4 sm:mb-6">
              How We Help You<br />
              <span className="gradient-text">Buy, Sell & Rent Property</span>
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-neutral-300 font-light leading-relaxed mb-8 max-w-2xl">
              We don't hold fixed inventory. As an active agent, we help <strong>buyers</strong> find and purchase plots, farmhouse plots, agricultural land, and homes; help <strong>owners</strong> sell or list their property; and help <strong>tenants</strong> find rental or lease homes — anywhere in Karnataka.
            </p>
          </div>
        </div>
      </section>

      {/* ─── QUICK METRICS ────────────────────── */}
      <section className="py-6 sm:py-8 bg-white border-b border-neutral-100" aria-label="How we work">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div ref={statsRef} className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="flex items-center space-x-3 p-3 sm:p-4 rounded-xl bg-neutral-50 border border-neutral-100">
              <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center text-brand-500 flex-shrink-0">
                <Search className="h-5 w-5" />
              </div>
              <div>
                <div className="text-base sm:text-lg font-bold text-navy-900">Buy · Sell · Rent</div>
                <div className="text-xs text-neutral-500">Three ways we help</div>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 sm:p-4 rounded-xl bg-neutral-50 border border-neutral-100">
              <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center text-brand-500 flex-shrink-0">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <div className="text-base sm:text-lg font-bold text-navy-900">Statewide</div>
                <div className="text-xs text-neutral-500">No fixed inventory, all of Karnataka</div>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 sm:p-4 rounded-xl bg-neutral-50 border border-neutral-100">
              <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center text-brand-500 flex-shrink-0">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <div className="text-base sm:text-lg font-bold text-navy-900">Direct Contact</div>
                <div className="text-xs text-neutral-500">No call centers, no middlemen</div>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 sm:p-4 rounded-xl bg-neutral-50 border border-neutral-100">
              <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center text-brand-500 flex-shrink-0">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <div className="text-base sm:text-lg font-bold text-navy-900">Personally Checked</div>
                <div className="text-xs text-neutral-500">Every listing verified before going live</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CATEGORY FILTER TABS ─────────────── */}
      <section className="py-8 sm:py-10 bg-neutral-50/80 sticky top-14 lg:top-16 z-30 backdrop-blur-md border-b border-neutral-200/60" aria-label="Filter Services">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-start sm:justify-center overflow-x-auto no-scrollbar gap-2 py-1">
            {[
              { id: 'all', label: 'All' },
              { id: 'buying', label: 'For Buyers' },
              { id: 'selling', label: 'For Owners (Sell / List)' },
              { id: 'renting', label: 'For Tenants (Rent / Lease)' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id as any)}
                className={`px-4 sm:px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
                  activeCategory === tab.id
                    ? 'bg-navy-900 text-white shadow-md shadow-navy-950/20'
                    : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200/80'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ─── MAIN SERVICES SHOWCASE GRID ───────── */}
      <section className="py-10 sm:py-16 lg:py-20" aria-label="How we help across Karnataka">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div ref={servicesHeaderRef} className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-navy-900 mb-3">
              What We Help With
            </h2>
            <p className="text-neutral-600 text-sm sm:text-base leading-relaxed">
              Whether you're buying, selling, or renting, here's exactly how we work with you.
            </p>
          </div>

          <div ref={servicesGridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredServices.map((service) => (
              <article
                key={service.id}
                id={service.id}
                className="bg-white rounded-2xl border border-neutral-200/80 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between overflow-hidden group hover:border-brand-500/40"
              >
                {/* Card Top */}
                <div className="p-6 sm:p-7">
                  {/* Badge & Icon Row */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 group-hover:bg-brand-500 group-hover:text-white transition-all duration-300 group-hover:scale-105 shadow-sm">
                      {getServiceIcon(service.iconName, 'h-6 w-6')}
                    </div>
                    <span className="text-[11px] font-bold px-3 py-1 bg-brand-50 text-brand-700 rounded-full border border-brand-200 tracking-wide">
                      {service.badge}
                    </span>
                  </div>

                  {/* Title & Category */}
                  <div className="text-[11px] uppercase tracking-wider font-semibold text-neutral-400 mb-1">
                    {service.categoryLabel}
                  </div>
                  <h3 className="text-lg sm:text-xl font-display font-bold text-navy-900 group-hover:text-brand-600 transition-colors mb-2.5">
                    {service.title}
                  </h3>
                  <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed mb-5 font-light">
                    {service.shortDesc}
                  </p>

                  {/* Coverage & Response Info */}
                  <div className="flex items-center justify-between py-3 px-3.5 bg-neutral-50 rounded-xl border border-neutral-100 mb-5 text-xs">
                    <div>
                      <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Coverage</span>
                      <span className="font-bold text-navy-900">All of Karnataka</span>
                    </div>
                    <div className="text-right">
                      <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Timeline</span>
                      <span className="font-semibold text-brand-600">{service.turnaroundTime}</span>
                    </div>
                  </div>

                  {/* Key Features Checklist */}
                  <div className="space-y-2 mb-6">
                    <div className="text-xs font-bold text-navy-900 uppercase tracking-wider">How We Help:</div>
                    {service.features.slice(0, 4).map((feat, idx) => (
                      <div key={idx} className="flex items-start text-xs text-neutral-600">
                        <Check className="h-3.5 w-3.5 text-brand-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>

                  {/* Sub Services Preview Tags */}
                  <div className="pt-4 border-t border-neutral-100">
                    <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">Covers:</div>
                    <div className="flex flex-wrap gap-1.5">
                      {service.subServices.map((sub, sIdx) => (
                        <span key={sIdx} className="text-[11px] bg-neutral-100 text-neutral-700 px-2.5 py-1 rounded-lg border border-neutral-200">
                          {sub.title}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="p-4 sm:p-6 bg-neutral-50/60 border-t border-neutral-100 flex items-center gap-2.5">
                  <button
                    onClick={() => handleSelectServiceForInquiry(service.id)}
                    className="flex-1 bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs sm:text-sm py-2.5 px-4 rounded-xl transition-all shadow-sm hover:shadow-brand-500/20 active:scale-[0.98] text-center"
                  >
                    Get Started
                  </button>
                  <button
                    onClick={() => setSelectedServiceForModal(service)}
                    className="bg-white hover:bg-neutral-100 text-navy-900 border border-neutral-200 font-semibold text-xs sm:text-sm py-2.5 px-3.5 rounded-xl transition-colors"
                    aria-label={`View full details for ${service.title}`}
                  >
                    Details
                  </button>
                  <a
                    href={`https://wa.me/919945011138?text=${encodeURIComponent(`Hello The Property Agent, I'd like help with "${service.title}". Please share more details.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 p-2.5 rounded-xl transition-colors"
                    aria-label={`WhatsApp inquiry for ${service.title}`}
                  >
                    <MessageSquare className="h-4 w-4" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ─── INTERACTIVE INQUIRY FORM ─── */}
      <section id="service-booking-form" className="py-12 sm:py-16 lg:py-20 bg-white border-y border-neutral-200/80" aria-label="Tell us what you need">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

            {/* Left Info Column */}
            <div className="lg:col-span-5">
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-brand-50 text-brand-600 rounded-full text-xs font-semibold uppercase tracking-wider mb-4">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Direct Inquiry</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-navy-900 mb-4">
                Tell Us What You're Looking For
              </h2>
              <p className="text-neutral-600 text-sm leading-relaxed mb-6">
                Fill in your details below and we'll get back to you directly — usually within a few hours. No call centers, no fixed inventory pitch, just a straight answer on what's available or possible.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-start space-x-3.5 p-3.5 bg-neutral-50 rounded-xl border border-neutral-100">
                  <div className="w-9 h-9 rounded-lg bg-brand-100 flex items-center justify-center text-brand-600 flex-shrink-0 mt-0.5">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-navy-900">We Get Back To You Fast</h4>
                    <p className="text-xs text-neutral-500 mt-0.5">Most inquiries hear back from us the same day.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3.5 p-3.5 bg-neutral-50 rounded-xl border border-neutral-100">
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0 mt-0.5">
                    <Shield className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-navy-900">Honest, Upfront Answers</h4>
                    <p className="text-xs text-neutral-500 mt-0.5">If nothing matches your requirement right now, we'll tell you — and reach out once something does.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3.5 p-3.5 bg-neutral-50 rounded-xl border border-neutral-100">
                  <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0 mt-0.5">
                    <Headphones className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-navy-900">Need Immediate Help?</h4>
                    <p className="text-xs text-neutral-500 mt-0.5">Call us directly at <a href="tel:+919019488368" className="text-brand-600 font-bold hover:underline">+91 90194 88368</a></p>
                  </div>
                </div>
              </div>

              {/* Service Areas */}
              <div className="p-4 rounded-xl bg-navy-900 text-white">
                <div className="text-xs font-semibold uppercase tracking-wider text-brand-300 mb-2">
                  Areas We Cover:
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  All of Karnataka. We're not limited to one city or neighborhood — tell us the area you're interested in and we'll let you know what's possible.
                </p>
              </div>
            </div>

            {/* Right Inquiry Form Column */}
            <div ref={formRef} className="lg:col-span-7 bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 shadow-card">
              {submitSuccess ? (
                <div className="text-center py-10 animate-scale-in">
                  <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-brand-100">
                    <CheckCircle className="h-9 w-9 text-brand-500" />
                  </div>
                  <h3 className="text-2xl font-display font-bold text-navy-900">Inquiry Received!</h3>
                  <p className="text-sm text-neutral-600 max-w-md mx-auto mt-2 leading-relaxed">
                    Thank you for reaching out to The Property Agent. We'll call or WhatsApp you shortly at your registered number.
                  </p>
                  <div className="mt-6 flex justify-center gap-3">
                    <a
                      href="https://wa.me/919945011138?text=Hello%20The%20Property%20Agent,%20I%20just%20submitted%20an%20inquiry%20online."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition-all"
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span>Chat on WhatsApp</span>
                    </a>
                  </div>
                </div>
              ) : submitError ? (
                <div className="text-center py-10 animate-scale-in">
                  <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
                    <CheckCircle className="h-9 w-9 text-red-500" />
                  </div>
                  <h3 className="text-xl font-bold text-navy-900">Submission Error</h3>
                  <p className="text-sm text-neutral-500 max-w-md mx-auto mt-2">
                    Something went wrong submitting your form. Please call us directly at +91 90194 88368.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleInquirySubmit} className="space-y-4 sm:space-y-5">
                  <h3 className="text-xl font-display font-bold text-navy-900 pb-2 border-b border-neutral-100">
                    Send Us Your Requirement
                  </h3>

                  {/* Service Selection Radio Grid */}
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                      1. I'm Looking To *
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {servicesData.map((s) => {
                        const isSelected = selectedServiceId === s.id;
                        return (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => {
                              setSelectedServiceId(s.id);
                              setFormData(prev => ({ ...prev, subService: '' }));
                            }}
                            className={`p-3 rounded-xl text-left border transition-all flex flex-col justify-between ${
                              isSelected
                                ? 'bg-brand-50/80 border-brand-500 ring-2 ring-brand-500/20 text-navy-900'
                                : 'bg-neutral-50 border-neutral-200 text-neutral-700 hover:bg-neutral-100/80'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <span className={isSelected ? 'text-brand-600' : 'text-neutral-500'}>
                                {getServiceIcon(s.iconName, 'h-4 w-4')}
                              </span>
                              {isSelected && <Check className="h-3.5 w-3.5 text-brand-600" />}
                            </div>
                            <span className="text-xs font-semibold">{s.categoryLabel}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Sub-Service Dropdown if applicable */}
                  {currentServiceItem && currentServiceItem.subServices.length > 0 && (
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                        2. Property Category (Optional)
                      </label>
                      <select
                        name="subService"
                        value={formData.subService}
                        onChange={handleInputChange}
                        className="w-full h-11 px-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none text-xs sm:text-sm text-neutral-800"
                      >
                        <option value="">Select property category (Optional)</option>
                        {currentServiceItem.subServices.map((sub, idx) => (
                          <option key={idx} value={sub.title}>
                            {sub.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Name and Phone Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Your full name"
                        className="w-full h-11 px-4 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none text-xs sm:text-sm text-neutral-800"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+91 XXXXX XXXXX"
                        className="w-full h-11 px-4 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none text-xs sm:text-sm text-neutral-800"
                      />
                    </div>
                  </div>

                  {/* Email and Locality Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                        Email Address (Optional)
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="you@example.com"
                        className="w-full h-11 px-4 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none text-xs sm:text-sm text-neutral-800"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                        Preferred Area in Karnataka *
                      </label>
                      <input
                        type="text"
                        name="locality"
                        required
                        value={formData.locality}
                        onChange={handleInputChange}
                        placeholder="e.g. Yelachanahalli, Bengaluru / Mysuru / any area"
                        className="w-full h-11 px-4 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none text-xs sm:text-sm text-neutral-800"
                      />
                    </div>
                  </div>

                  {/* Message/Notes */}
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                      Tell Us More
                    </label>
                    <textarea
                      name="message"
                      rows={3}
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="e.g. Looking for a 2-3 acre farmhouse plot near Kanakapura Road, budget up to 50 lakhs / Want to sell my residential plot in Mysuru..."
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-xs sm:text-sm text-neutral-800 resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white font-bold rounded-xl transition-all duration-300 shadow-md hover:shadow-brand-500/25 flex items-center justify-center space-x-2 active:scale-[0.98] text-sm"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Inquiry</span>
                        <Send className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS (4 STEPS) ──────────── */}
      <section className="py-12 sm:py-16 lg:py-20 bg-neutral-50" aria-label="How it works">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div ref={processHeaderRef} className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-navy-900 mb-3">
              How It Works
            </h2>
            <p className="text-neutral-600 text-sm sm:text-base">
              Simple and direct, whether you're buying, selling, or renting
            </p>
          </div>

          <div ref={processGridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Tell Us What You Need',
                desc: 'Buying, selling, or renting — share your requirement, budget, and preferred area in Karnataka.'
              },
              {
                step: '02',
                title: 'We Search or List',
                desc: 'We actively look for matching properties, or list your property to our network of buyers and tenants.'
              },
              {
                step: '03',
                title: 'Site Visits & Negotiation',
                desc: 'We coordinate visits, answer questions, and support negotiation on price and terms.'
              },
              {
                step: '04',
                title: 'Documentation & Closing',
                desc: 'We help with agreements, e-stamping, and paperwork through to the final deal.'
              }
            ].map((step, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-sm relative group hover:shadow-card-hover transition-all">
                <div className="text-3xl font-display font-black text-brand-500/20 group-hover:text-brand-500/40 transition-colors mb-3">
                  {step.step}
                </div>
                <h3 className="text-base font-bold text-navy-900 mb-2">{step.title}</h3>
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-light">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── WHY WORK WITH US ─────── */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white" aria-label="Why choose The Property Agent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div ref={trustHeaderRef} className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-navy-900 mb-3">
              Why Work With The Property Agent
            </h2>
            <p className="text-neutral-600 text-sm sm:text-base">
              What buyers, sellers, and tenants across Karnataka can expect from us
            </p>
          </div>

          <div ref={trustGridRef} className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="p-6 rounded-2xl bg-neutral-50 border border-neutral-100 hover:bg-white hover:shadow-card-hover transition-all">
              <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 mb-4">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-navy-900 mb-2">Personally Verified</h3>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                Every property we bring to you is personally checked before we recommend it — documentation, condition, and legitimacy included.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-neutral-50 border border-neutral-100 hover:bg-white hover:shadow-card-hover transition-all">
              <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 mb-4">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-navy-900 mb-2">Direct, Personal Service</h3>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                You deal with us directly — no call centers, no runaround. Reach out by phone or WhatsApp and get a straight answer.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-neutral-50 border border-neutral-100 hover:bg-white hover:shadow-card-hover transition-all">
              <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 mb-4">
                <Star className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-navy-900 mb-2">Honest, Upfront Pricing</h3>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                Our fee structure is communicated clearly before you commit — no hidden charges, no surprises.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SERVICES FAQ ACCORDION ──────────── */}
      <section className="py-12 sm:py-16 lg:py-20 bg-neutral-50" aria-label="Services FAQ">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div ref={faqHeaderRef} className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-navy-900 mb-3">
              Frequently Asked Questions
            </h2>
            <p className="text-neutral-500 text-sm">
              Common questions about buying, selling, and renting property with The Property Agent
            </p>
          </div>

          <div className="space-y-3 sm:space-y-4" role="list">
            {allServicesFaqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl border border-neutral-200 overflow-hidden transition-all shadow-sm"
                role="listitem"
              >
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-4 sm:p-6 text-left hover:bg-neutral-50/50 transition-colors"
                  aria-expanded={openFaqIndex === idx}
                >
                  <h3 className="text-sm sm:text-base font-semibold text-navy-900 pr-4">{faq.question}</h3>
                  {openFaqIndex === idx ? (
                    <ChevronUp className="h-5 w-5 text-brand-500 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-neutral-400 flex-shrink-0" />
                  )}
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openFaqIndex === idx ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <p className="px-4 sm:px-6 pb-4 sm:pb-6 text-neutral-600 text-xs sm:text-sm leading-relaxed border-t border-neutral-100 pt-3">
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── BOTTOM CTA BANNER ───────────────── */}
      <section className="py-12 sm:py-16 bg-navy-950 text-white relative overflow-hidden" aria-label="Get in touch">
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold mb-3 sm:mb-4">
            Ready to Buy, Sell, or Rent?
          </h2>
          <p className="text-sm sm:text-base text-neutral-300 mb-6 sm:mb-8 max-w-2xl mx-auto font-light">
            Contact The Property Agent today — tell us what you need and we'll help you get there, anywhere in Karnataka.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <a
              href="#service-booking-form"
              className="bg-brand-500 hover:bg-brand-600 text-white font-semibold px-6 sm:px-8 py-3 rounded-xl transition-all shadow-lg hover:shadow-brand-500/25 text-sm"
            >
              Tell Us What You Need
            </a>
            <a
              href="tel:+919019488368"
              className="bg-white/10 hover:bg-white/20 text-white font-semibold px-6 sm:px-8 py-3 rounded-xl transition-all border border-white/10 text-sm inline-flex items-center justify-center space-x-2"
            >
              <Phone className="h-4 w-4 text-brand-400" />
              <span>Call +91 90194 88368</span>
            </a>
          </div>
        </div>
      </section>

      {/* ─── SERVICE DETAILS MODAL ───────────── */}
      {selectedServiceForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-fade-in" role="dialog" aria-modal="true">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-neutral-100 p-6 sm:p-8 animate-scale-in relative">
            <button
              onClick={() => setSelectedServiceForModal(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors"
              aria-label="Close dialog"
            >
              ✕
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600">
                {getServiceIcon(selectedServiceForModal.iconName, 'h-6 w-6')}
              </div>
              <div>
                <span className="text-[11px] font-bold px-2.5 py-0.5 bg-brand-50 text-brand-700 rounded-full border border-brand-200">
                  {selectedServiceForModal.badge}
                </span>
                <h3 className="text-xl font-display font-bold text-navy-900 mt-1">
                  {selectedServiceForModal.title}
                </h3>
              </div>
            </div>

            <p className="text-neutral-600 text-sm leading-relaxed mb-6">
              {selectedServiceForModal.fullDesc}
            </p>

            {/* Sub-services Breakdown */}
            <div className="space-y-3 mb-6">
              <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider">What This Covers:</h4>
              {selectedServiceForModal.subServices.map((sub, idx) => (
                <div key={idx} className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-100">
                  <h5 className="text-sm font-bold text-navy-900">{sub.title}</h5>
                  <p className="text-xs text-neutral-500 mt-1">{sub.description}</p>
                </div>
              ))}
            </div>

            {/* Features Checklist */}
            <div className="space-y-2 mb-6">
              <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider">How We Help:</h4>
              {selectedServiceForModal.features.map((feat, idx) => (
                <div key={idx} className="flex items-start text-xs text-neutral-600">
                  <Check className="h-3.5 w-3.5 text-brand-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-neutral-100 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  const sId = selectedServiceForModal.id;
                  setSelectedServiceForModal(null);
                  handleSelectServiceForInquiry(sId);
                }}
                className="flex-1 bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm py-3 px-4 rounded-xl transition-all text-center shadow-md"
              >
                Send an Inquiry
              </button>
              <a
                href={`https://wa.me/919945011138?text=${encodeURIComponent(`Hello The Property Agent, I'd like help with "${selectedServiceForModal.title}".`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm py-3 px-5 rounded-xl transition-all text-center inline-flex items-center justify-center space-x-2"
              >
                <MessageSquare className="h-4 w-4" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
