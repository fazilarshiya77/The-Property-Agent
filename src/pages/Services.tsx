import { useState, useId, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FileCheck,
  Zap,
  Droplets,
  Hammer,
  Building2,
  Truck,
  CheckCircle,
  Clock,
  Shield,
  Star,
  Phone,
  MessageSquare,
  ArrowRight,
  Send,
  Loader2,
  Calendar,
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

// Helper to get Lucide icon component by name
function getServiceIcon(iconName: string, className: string = 'h-6 w-6') {
  switch (iconName) {
    case 'FileCheck':
      return <FileCheck className={className} />;
    case 'Zap':
      return <Zap className={className} />;
    case 'Droplets':
      return <Droplets className={className} />;
    case 'Hammer':
      return <Hammer className={className} />;
    case 'Building2':
      return <Building2 className={className} />;
    case 'Truck':
      return <Truck className={className} />;
    default:
      return <Sparkles className={className} />;
  }
}

export default function Services() {
  const location = useLocation();
  const serviceFormId = useId();

  // Parse any initial service query parameter (e.g. /services?service=electrical-works)
  const initialServiceFromUrl = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const serviceParam = params.get('service');
    if (serviceParam) {
      const match = servicesData.find(s => s.id === serviceParam || s.slug === serviceParam);
      return match ? match.id : 'e-stamp';
    }
    return 'e-stamp';
  }, [location.search]);

  // State
  const [activeCategory, setActiveCategory] = useState<'all' | 'legal' | 'maintenance' | 'renovation' | 'relocation'>('all');
  const [selectedServiceForModal, setSelectedServiceForModal] = useState<ServiceItem | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Booking Form State
  const [selectedServiceId, setSelectedServiceId] = useState<string>(initialServiceFromUrl);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    locality: '',
    subService: '',
    preferredDate: '',
    preferredTime: 'Morning (9 AM - 12 PM)',
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

  const handleSelectServiceForBooking = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    setFormData(prev => ({ ...prev, subService: '' }));
    // Smooth scroll to form
    const formElement = document.getElementById('service-booking-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Handle Form Submit
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(false);

    const serviceTitle = currentServiceItem ? currentServiceItem.title : 'General Home Service';

    try {
      const formPayload = new FormData();
      formPayload.append('access_key', import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || '0469cb33-7c50-44d8-b019-c70583307942');
      formPayload.append('name', formData.name);
      formPayload.append('phone', formData.phone);
      formPayload.append('email', formData.email || 'not-provided@trishnaproperties.in');
      formPayload.append('service', serviceTitle);
      formPayload.append('sub_service', formData.subService || 'General Inquiry');
      formPayload.append('locality_address', formData.locality);
      formPayload.append('preferred_date', formData.preferredDate || 'Flexible');
      formPayload.append('preferred_time', formData.preferredTime);
      formPayload.append('message', formData.message);
      formPayload.append('subject', `Service Request: ${serviceTitle} - ${formData.name}`);
      formPayload.append('to', 'trishnaproperties78@gmail.com');

      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formPayload,
      });

      const result = await response.json();

      if (result.success) {
        logToGoogleSheet({
          logType: 'CONTACT_FORM',
          message: `New Service Request: ${serviceTitle} by ${formData.name}`,
          details: {
            service: serviceTitle,
            subService: formData.subService,
            name: formData.name,
            phone: formData.phone,
            email: formData.email,
            locality: formData.locality,
            date: formData.preferredDate,
            time: formData.preferredTime,
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
          preferredDate: '',
          preferredTime: 'Morning (9 AM - 12 PM)',
          message: ''
        });
        setTimeout(() => setSubmitSuccess(false), 8000);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Error submitting service booking:', error);
      logToGoogleSheet({
        logType: 'ERROR',
        message: 'Service Booking Submission Failed',
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
        question: 'What home & property services does Trishna Property Management provide in Bangalore?',
        answer: 'Trishna Property Management provides 6 core home services across Bangalore: 1) E-Stamp paper procurement and legal rental agreement drafting, 2) Electrical works and diagnostics by licensed electricians, 3) Plumbing repairs, sanitaryware fittings and tank cleaning, 4) Carpentry, modular kitchen fixes, and custom woodwork, 5) Civil building works, painting, waterproofing & renovation, and 6) Packers & movers local shifting and intercity relocation.'
      },
      {
        question: 'How do I book an E-stamp or rental agreement in Bangalore?',
        answer: 'You can book e-stamp papers and rental agreement drafting online through our booking form, via WhatsApp at +91 98861 04532, or by calling us. We draft the agreement, procure official SHCIL/KAVERI government e-stamps, and deliver the hardcopy to your doorstep within same-day or 24 hours.'
      },
      {
        question: 'Are your electricians, plumbers, and carpenters background verified?',
        answer: 'Yes, 100% of our technicians, craftsmen, and moving crew are verified, highly experienced, and equipped with professional diagnostic and installation tools. We also provide a 30-day workmanship warranty on all repair services.'
      },
      {
        question: 'Do you provide emergency plumbing and electrical services?',
        answer: 'Yes! We offer rapid 60 to 90-minute emergency response in prime East Bangalore locations including GM Palya, CV Raman Nagar, Murgeshpalya, Kaggadasapura, and surrounding areas.'
      },
      {
        question: 'What are the charges for local home shifting (Packers & Movers) in Bangalore?',
        answer: 'Our local Bangalore house shifting starts from ₹3,499 for 1BHK, ₹5,499 for 2BHK, and ₹7,999 for 3BHK. We provide 3-layer protective packing, furniture dismantling/reassembly, safe transportation in covered vehicles, and end-to-end relocation assistance.'
      },
      {
        question: 'Do you offer free inspection for building works, painting, and renovations?',
        answer: 'Yes! For building works, false ceiling, tile laying, terrace waterproofing, and home painting, our project supervisor visits your site for a free inspection and provides a transparent, itemized quotation with zero hidden charges.'
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
        title="Home Services in Bangalore — E-Stamp, Electrical, Plumbing, Carpentry, Painting & Packers Movers"
        description="Comprehensive property and home services by Trishna Property Management in Bangalore. Government E-Stamp & Rental Agreements, Certified Electrical Works, Emergency Plumbing, Master Carpentry, Civil Building & Renovation, and Reliable Packers & Movers. 100% verified experts, transparent pricing, 30-day warranty."
        keywords="E-stamp Bangalore, rental agreement e-stamping GM Palya, electricians CV Raman Nagar, plumber Murgeshpalya, carpentry woodwork Bangalore, painting and building works Bangalore, terrace waterproofing, packers and movers East Bangalore, home shifting services Bangalore, Trishna Property Management services"
        type="website"
        canonicalPath="/services"
        location="Bangalore, Karnataka, India"
        geoRegion="IN-KA"
        geoPosition="12.9716;77.5946"
        breadcrumbs={breadcrumbs}
        faqData={allServicesFaqs}
      />

      {/* ─── BREADCRUMB ──────────────────────── */}
      <nav aria-label="Breadcrumb" className="bg-navy-950 pt-20">
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
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 bg-brand-500/20 border border-brand-500/30 text-brand-300 rounded-full text-xs font-semibold uppercase tracking-widest mb-4 sm:mb-6 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5" />
              <span>One-Stop Home & Property Solutions</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold leading-tight tracking-wide mb-4 sm:mb-6">
              Complete Property &<br />
              <span className="gradient-text">Home Maintenance Services</span>
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-neutral-300 font-light leading-relaxed mb-8 max-w-2xl">
              From official Government <strong>E-Stamp papers</strong> and <strong>Rental Agreements</strong> to certified <strong>Electrical, Plumbing, Carpentry, Civil Renovation</strong>, and trusted <strong>Packers & Movers</strong> — Trishna Property Management delivers verified doorstep excellence across Bangalore.
            </p>

            <div className="flex flex-wrap gap-3 sm:gap-4">
              <a
                href="#service-booking-form"
                className="bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-brand-500/20 hover:shadow-brand-500/30 active:scale-[0.98] inline-flex items-center space-x-2"
              >
                <span>Book a Service Online</span>
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="https://wa.me/919886104532?text=Hello%20Trishna%20Properties,%20I%20would%20like%20to%20inquire%20about%20your%20home%20services."
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-6 py-3.5 rounded-xl transition-all inline-flex items-center space-x-2 shadow-md active:scale-[0.98]"
              >
                <MessageSquare className="h-4 w-4" />
                <span>WhatsApp Booking</span>
              </a>
              <a
                href="tel:+919886104532"
                className="bg-white/10 hover:bg-white/20 text-white text-sm font-semibold px-5 py-3.5 rounded-xl transition-all border border-white/10 inline-flex items-center space-x-2"
              >
                <Phone className="h-4 w-4 text-brand-400" />
                <span>+91 98861 04532</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── QUICK METRICS ────────────────────── */}
      <section className="py-6 sm:py-8 bg-white border-b border-neutral-100" aria-label="Services Key Metrics">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div ref={statsRef} className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="flex items-center space-x-3 p-3 sm:p-4 rounded-xl bg-neutral-50 border border-neutral-100">
              <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center text-brand-500 flex-shrink-0">
                <FileCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="text-base sm:text-lg font-bold text-navy-900">6 Core</div>
                <div className="text-xs text-neutral-500">Home & Legal Services</div>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 sm:p-4 rounded-xl bg-neutral-50 border border-neutral-100">
              <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center text-brand-500 flex-shrink-0">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <div className="text-base sm:text-lg font-bold text-navy-900">100% Verified</div>
                <div className="text-xs text-neutral-500">Skilled Technicians</div>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 sm:p-4 rounded-xl bg-neutral-50 border border-neutral-100">
              <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center text-brand-500 flex-shrink-0">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <div className="text-base sm:text-lg font-bold text-navy-900">60-90 Min</div>
                <div className="text-xs text-neutral-500">Fast Doorstep Response</div>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 sm:p-4 rounded-xl bg-neutral-50 border border-neutral-100">
              <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center text-brand-500 flex-shrink-0">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <div className="text-base sm:text-lg font-bold text-navy-900">30-Day</div>
                <div className="text-xs text-neutral-500">Workmanship Warranty</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CATEGORY FILTER TABS ─────────────── */}
      <section className="py-8 sm:py-10 bg-neutral-50/80 sticky top-16 lg:top-20 z-30 backdrop-blur-md border-b border-neutral-200/60" aria-label="Filter Services">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-start sm:justify-center overflow-x-auto no-scrollbar gap-2 py-1">
            {[
              { id: 'all', label: 'All 6 Services' },
              { id: 'legal', label: 'E-Stamp & Legal' },
              { id: 'maintenance', label: 'Electrical, Plumbing & Carpentry' },
              { id: 'renovation', label: 'Building & Painting' },
              { id: 'relocation', label: 'Packers & Movers' },
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
      <section className="py-10 sm:py-16 lg:py-20" aria-label="Our Services in Bangalore">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div ref={servicesHeaderRef} className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-navy-900 mb-3">
              Explore Our Professional Services
            </h2>
            <p className="text-neutral-600 text-sm sm:text-base leading-relaxed">
              Transparent rates, trained technicians, genuine materials, and guaranteed peace of mind. Select a service to view full package details or book instantly.
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

                  {/* Turnaround & Availability Info */}
                  <div className="flex items-center justify-between py-3 px-3.5 bg-neutral-50 rounded-xl border border-neutral-100 mb-5 text-xs">
                    <div>
                      <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Availability</span>
                      <span className="font-bold text-navy-900">Doorstep Assistance</span>
                    </div>
                    <div className="text-right">
                      <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Turnaround</span>
                      <span className="font-semibold text-brand-600">{service.turnaroundTime}</span>
                    </div>
                  </div>

                  {/* Key Features Checklist */}
                  <div className="space-y-2 mb-6">
                    <div className="text-xs font-bold text-navy-900 uppercase tracking-wider">What's Included:</div>
                    {service.features.slice(0, 4).map((feat, idx) => (
                      <div key={idx} className="flex items-start text-xs text-neutral-600">
                        <Check className="h-3.5 w-3.5 text-brand-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>

                  {/* Sub Services Preview Tags */}
                  <div className="pt-4 border-t border-neutral-100">
                    <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">Available Options:</div>
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
                    onClick={() => handleSelectServiceForBooking(service.id)}
                    className="flex-1 bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs sm:text-sm py-2.5 px-4 rounded-xl transition-all shadow-sm hover:shadow-brand-500/20 active:scale-[0.98] text-center"
                  >
                    Book Now
                  </button>
                  <button
                    onClick={() => setSelectedServiceForModal(service)}
                    className="bg-white hover:bg-neutral-100 text-navy-900 border border-neutral-200 font-semibold text-xs sm:text-sm py-2.5 px-3.5 rounded-xl transition-colors"
                    aria-label={`View full details for ${service.title}`}
                  >
                    Details
                  </button>
                  <a
                    href={`https://wa.me/919886104532?text=${encodeURIComponent(`Hello Trishna Properties, I want to book/inquire about "${service.title}". Please provide details.`)}`}
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

      {/* ─── INTERACTIVE SERVICE BOOKING & ESTIMATE FORM ─── */}
      <section id="service-booking-form" className="py-12 sm:py-16 lg:py-20 bg-white border-y border-neutral-200/80" aria-label="Book a Service">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* Left Info Column */}
            <div className="lg:col-span-5">
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-brand-50 text-brand-600 rounded-full text-xs font-semibold uppercase tracking-wider mb-4">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Instant Doorstep Booking</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-navy-900 mb-4">
                Request Service or Get a Free Estimate
              </h2>
              <p className="text-neutral-600 text-sm leading-relaxed mb-6">
                Fill in your details below and our service supervisor will confirm your appointment within <strong>30 minutes</strong>. No advance payment required for standard inspections.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-start space-x-3.5 p-3.5 bg-neutral-50 rounded-xl border border-neutral-100">
                  <div className="w-9 h-9 rounded-lg bg-brand-100 flex items-center justify-center text-brand-600 flex-shrink-0 mt-0.5">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-navy-900">Same-Day & Flexible Slots</h4>
                    <p className="text-xs text-neutral-500 mt-0.5">Choose your preferred morning, afternoon, or evening timing.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3.5 p-3.5 bg-neutral-50 rounded-xl border border-neutral-100">
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0 mt-0.5">
                    <Shield className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-navy-900">Upfront Transparent Pricing</h4>
                    <p className="text-xs text-neutral-500 mt-0.5">Inspect first, approve price estimate, pay only after satisfied completion.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3.5 p-3.5 bg-neutral-50 rounded-xl border border-neutral-100">
                  <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0 mt-0.5">
                    <Headphones className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-navy-900">Need Immediate Help?</h4>
                    <p className="text-xs text-neutral-500 mt-0.5">Call our direct service desk at <a href="tel:+919886104532" className="text-brand-600 font-bold hover:underline">+91 98861 04532</a></p>
                  </div>
                </div>
              </div>

              {/* Service Areas */}
              <div className="p-4 rounded-xl bg-navy-900 text-white">
                <div className="text-xs font-semibold uppercase tracking-wider text-brand-300 mb-2">
                  Key Service Areas in Bangalore:
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  GM Palya · CV Raman Nagar · Murgeshpalya · Kaggadasapura · Whitefield · Indiranagar · Bommasandra · Yelahanka · Sarjapur Road · Singasandra & surrounding neighborhoods.
                </p>
              </div>
            </div>

            {/* Right Booking Form Column */}
            <div ref={formRef} className="lg:col-span-7 bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 shadow-card">
              {submitSuccess ? (
                <div className="text-center py-10 animate-scale-in">
                  <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-brand-100">
                    <CheckCircle className="h-9 w-9 text-brand-500" />
                  </div>
                  <h3 className="text-2xl font-display font-bold text-navy-900">Service Request Received!</h3>
                  <p className="text-sm text-neutral-600 max-w-md mx-auto mt-2 leading-relaxed">
                    Thank you for choosing Trishna Property Management. Our service coordinator will call you shortly at your registered number to confirm the technician's arrival slot.
                  </p>
                  <div className="mt-6 flex justify-center gap-3">
                    <a
                      href="https://wa.me/919886104532?text=Hello%20Trishna%20Properties,%20I%20just%20submitted%20a%20service%20booking%20request%20online."
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
                    Something went wrong submitting your form. Please call us directly at +91 98861 04532.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleBookingSubmit} className="space-y-4 sm:space-y-5">
                  <h3 className="text-xl font-display font-bold text-navy-900 pb-2 border-b border-neutral-100">
                    Book a Service Appointment
                  </h3>

                  {/* Service Selection Radio Grid */}
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                      1. Select Service Type *
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
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
                            <span className="text-xs font-semibold line-clamp-1">{s.title.split('&')[0]}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Sub-Service Dropdown if applicable */}
                  {currentServiceItem && currentServiceItem.subServices.length > 0 && (
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                        2. Specific Requirement / Package (Optional)
                      </label>
                      <select
                        name="subService"
                        value={formData.subService}
                        onChange={handleInputChange}
                        className="w-full h-11 px-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none text-xs sm:text-sm text-neutral-800"
                      >
                        <option value="">Select specific service package (Optional)</option>
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
                        placeholder="+91 98861 XXXXX"
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
                        Bangalore Locality / Flat Address *
                      </label>
                      <input
                        type="text"
                        name="locality"
                        required
                        value={formData.locality}
                        onChange={handleInputChange}
                        placeholder="e.g. GM Palya / CV Raman Nagar"
                        className="w-full h-11 px-4 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none text-xs sm:text-sm text-neutral-800"
                      />
                    </div>
                  </div>

                  {/* Preferred Date & Time Slot */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                        Preferred Date
                      </label>
                      <input
                        type="date"
                        name="preferredDate"
                        value={formData.preferredDate}
                        onChange={handleInputChange}
                        className="w-full h-11 px-4 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none text-xs sm:text-sm text-neutral-800"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                        Preferred Time Slot
                      </label>
                      <select
                        name="preferredTime"
                        value={formData.preferredTime}
                        onChange={handleInputChange}
                        className="w-full h-11 px-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none text-xs sm:text-sm text-neutral-800"
                      >
                        <option value="Morning (9 AM - 12 PM)">Morning (9 AM - 12 PM)</option>
                        <option value="Afternoon (12 PM - 3 PM)">Afternoon (12 PM - 3 PM)</option>
                        <option value="Evening (3 PM - 7 PM)">Evening (3 PM - 7 PM)</option>
                        <option value="Emergency (Immediate / ASAP)">Emergency (Immediate / ASAP)</option>
                      </select>
                    </div>
                  </div>

                  {/* Message/Notes */}
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                      Describe Your Issue or Requirement
                    </label>
                    <textarea
                      name="message"
                      rows={3}
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="e.g. Need 11-month rental agreement e-stamp + doorstep delivery / Fixing bathroom pipe leakage and tap change..."
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none text-xs sm:text-sm text-neutral-800 resize-none"
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
                        <span>Submitting Booking...</span>
                      </>
                    ) : (
                      <>
                        <span>Confirm Service Request</span>
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
      <section className="py-12 sm:py-16 lg:py-20 bg-neutral-50" aria-label="How Our Service Works">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div ref={processHeaderRef} className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-navy-900 mb-3">
              How It Works
            </h2>
            <p className="text-neutral-600 text-sm sm:text-base">
              Simple, transparent, and hassle-free service delivery in 4 easy steps
            </p>
          </div>

          <div ref={processGridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Choose Service',
                desc: 'Select from E-stamping, Electrical, Plumbing, Carpentry, Building works, or Packers & Movers.'
              },
              {
                step: '02',
                title: 'Instant Confirmation',
                desc: 'Our coordinator calls within 30 minutes to confirm requirements and schedule your technician visit.'
              },
              {
                step: '03',
                title: 'Doorstep Execution',
                desc: 'Trained, verified professionals arrive with tools and genuine materials to complete the job cleanly.'
              },
              {
                step: '04',
                title: 'Quality Check & Pay',
                desc: 'Inspect the completed work, pay transparently with no hidden fees, and enjoy our 30-day warranty.'
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

      {/* ─── WHY CHOOSE TRISHNA SERVICES ─────── */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white" aria-label="Why Choose Trishna Home Services">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div ref={trustHeaderRef} className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-navy-900 mb-3">
              The Trishna Service Guarantee
            </h2>
            <p className="text-neutral-600 text-sm sm:text-base">
              Why Bangalore residents and landlords trust us for property maintenance
            </p>
          </div>

          <div ref={trustGridRef} className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="p-6 rounded-2xl bg-neutral-50 border border-neutral-100 hover:bg-white hover:shadow-card-hover transition-all">
              <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 mb-4">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-navy-900 mb-2">Verified & Certified Pros</h3>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                Every electrician, plumber, carpenter, and painter in our team undergoes stringent background checks, skill assessments, and safety training.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-neutral-50 border border-neutral-100 hover:bg-white hover:shadow-card-hover transition-all">
              <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 mb-4">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-navy-900 mb-2">30-Day Workmanship Warranty</h3>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                We stand behind our work. If any issue arises within 30 days of service completion, our technician will re-inspect and fix it at zero extra labor cost.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-neutral-50 border border-neutral-100 hover:bg-white hover:shadow-card-hover transition-all">
              <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 mb-4">
                <Star className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-navy-900 mb-2">Honest, Upfront Pricing</h3>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                No surprises or inflated bills. Detailed itemized quotation provided before commencing any work, with clear labor and genuine material breakdowns.
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
              Common questions about our home services, pricing, turnaround times, and booking in Bangalore
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
      <section className="py-12 sm:py-16 bg-navy-950 text-white relative overflow-hidden" aria-label="Book Services Now">
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold mb-3 sm:mb-4">
            Need Fast, Reliable Home Assistance in Bangalore?
          </h2>
          <p className="text-sm sm:text-base text-neutral-300 mb-6 sm:mb-8 max-w-2xl mx-auto font-light">
            Contact Trishna Property Management today for same-day e-stamping, skilled repairs, renovation, or smooth house shifting.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <a
              href="#service-booking-form"
              className="bg-brand-500 hover:bg-brand-600 text-white font-semibold px-6 sm:px-8 py-3 rounded-xl transition-all shadow-lg hover:shadow-brand-500/25 text-sm"
            >
              Book Service Online
            </a>
            <a
              href="tel:+919886104532"
              className="bg-white/10 hover:bg-white/20 text-white font-semibold px-6 sm:px-8 py-3 rounded-xl transition-all border border-white/10 text-sm inline-flex items-center justify-center space-x-2"
            >
              <Phone className="h-4 w-4 text-brand-400" />
              <span>Call +91 98861 04532</span>
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
              <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider">Service Packages & Offerings:</h4>
              {selectedServiceForModal.subServices.map((sub, idx) => (
                <div key={idx} className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-100">
                  <h5 className="text-sm font-bold text-navy-900">{sub.title}</h5>
                  <p className="text-xs text-neutral-500 mt-1">{sub.description}</p>
                </div>
              ))}
            </div>

            {/* Features Checklist */}
            <div className="space-y-2 mb-6">
              <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider">Key Inclusions:</h4>
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
                  handleSelectServiceForBooking(sId);
                }}
                className="flex-1 bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm py-3 px-4 rounded-xl transition-all text-center shadow-md"
              >
                Book This Service Now
              </button>
              <a
                href={`https://wa.me/919886104532?text=${encodeURIComponent(`Hello Trishna Properties, I want to book "${selectedServiceForModal.title}".`)}`}
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
