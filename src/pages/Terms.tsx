import { Link } from 'react-router-dom';
import {
  Home, ChevronRight, ScrollText, ShieldCheck, Building2, AlertTriangle, Users,
  MessageCircle, Copyright, Link2, Scale, Lock, RefreshCw, Gavel, Mail, Phone,
} from 'lucide-react';
import { SEO } from '../components/SEO';
import type { BreadcrumbItem } from '../components/SEO';

const LAST_UPDATED = 'September 4, 2026';

const SECTIONS = [
  {
    id: 'acceptance',
    icon: ScrollText,
    title: '1. Acceptance of Terms',
    body: (
      <p>
        By accessing or using this website, you agree to be bound by these Terms &amp; Conditions.
        If you do not agree with any part of these terms, please do not use this website. We may
        update these terms from time to time, and continued use of the site after changes are posted
        constitutes acceptance of the revised terms.
      </p>
    ),
  },
  {
    id: 'about-us',
    icon: Building2,
    title: '2. About Our Services',
    body: (
      <>
        <p>
          The Property Agent is an independent real estate agent operating across Karnataka. We do not
          hold fixed property inventory — we actively source, list, and help buy, sell, rent, and lease
          plots, farmhouse plots, agricultural land, residential and commercial properties as they
          become available.
        </p>
        <p className="mt-3">
          Because our inventory changes as deals are made, listings on this website may be added,
          updated, or removed at any time without prior notice. A property appearing on this site is
          not a guarantee of continued availability — please contact us directly to confirm current
          status before making any decisions.
        </p>
      </>
    ),
  },
  {
    id: 'listings-accuracy',
    icon: AlertTriangle,
    title: '3. Listing Accuracy & No Warranty',
    body: (
      <>
        <p>
          We make reasonable efforts to ensure that property details — pricing, area, amenities,
          location, images, and availability — are accurate at the time of listing. However, this
          information is provided by owners, sourced from the field, or entered by our team, and may
          contain errors or become outdated.
        </p>
        <p className="mt-3">
          All property information on this website is provided <span className="font-semibold text-navy-900">"as is"</span> and{' '}
          <span className="font-semibold text-navy-900">"as available"</span>, without any warranty of accuracy, completeness, or
          fitness for a particular purpose. Prices, dimensions, and terms are subject to change and
          should always be independently verified with us before you proceed with any transaction.
        </p>
      </>
    ),
  },
  {
    id: 'due-diligence',
    icon: ShieldCheck,
    title: '4. Your Responsibility & Due Diligence',
    body: (
      <>
        <p>
          Buying, selling, renting, or leasing property is a significant decision. We strongly
          recommend that you:
        </p>
        <ul className="mt-3 space-y-2 list-disc list-inside marker:text-brand-500">
          <li>Personally visit and inspect any property before committing.</li>
          <li>Independently verify legal documents, ownership, and title with a qualified professional.</li>
          <li>Confirm final pricing, terms, and availability directly with our team.</li>
          <li>Seek independent legal and financial advice where appropriate.</li>
        </ul>
        <p className="mt-3">
          The Property Agent facilitates introductions, site visits, and documentation support, but the
          final decision to proceed with any transaction rests entirely with you.
        </p>
      </>
    ),
  },
  {
    id: 'enquiries',
    icon: MessageCircle,
    title: '5. Enquiries & Communication',
    body: (
      <>
        <p>
          When you submit an enquiry through this website (via a contact form, "Enquire Now" popup, or
          service booking form), the details you provide — name, phone number, email, and message — are
          recorded so our team can follow up with you. Depending on the form, this may also open a
          WhatsApp chat or send an email on your behalf to speed up our response.
        </p>
        <p className="mt-3">
          By submitting an enquiry, you consent to being contacted by phone, WhatsApp, or email
          regarding your request. We do not sell or share your contact details with unrelated third
          parties.
        </p>
      </>
    ),
  },
  {
    id: 'intellectual-property',
    icon: Copyright,
    title: '6. Intellectual Property',
    body: (
      <p>
        All content on this website — including text, graphics, logos, and the overall design — is the
        property of The Property Agent unless otherwise credited, and is protected by applicable
        intellectual property laws. Property photographs and descriptions may belong to the respective
        property owners. You may not reproduce, distribute, or use this content for commercial purposes
        without our prior written consent.
      </p>
    ),
  },
  {
    id: 'third-party',
    icon: Link2,
    title: '7. Third-Party Services & Links',
    body: (
      <p>
        This website integrates with third-party services such as Google Maps, WhatsApp, and email/form
        delivery providers to help you reach us more easily. We are not responsible for the availability,
        content, or privacy practices of these third-party services, which are governed by their own
        terms and policies.
      </p>
    ),
  },
  {
    id: 'liability',
    icon: Scale,
    title: '8. Limitation of Liability',
    body: (
      <p>
        To the fullest extent permitted by law, The Property Agent shall not be liable for any indirect,
        incidental, or consequential loss or damage arising from your use of this website, reliance on
        listing information, or any transaction entered into with a third party (owner, buyer, tenant,
        or seller) introduced through our services. Our role is that of an intermediary and facilitator —
        we are not a party to the final sale, purchase, or rental agreement.
      </p>
    ),
  },
  {
    id: 'privacy',
    icon: Lock,
    title: '9. Privacy',
    body: (
      <p>
        We collect only the information you choose to share with us — primarily through enquiry and
        contact forms — and use it solely to respond to your request and provide our services. We do
        not knowingly sell your personal information. If you have questions about how your data is
        handled, please contact us using the details below.
      </p>
    ),
  },
  {
    id: 'changes',
    icon: RefreshCw,
    title: '10. Changes to These Terms',
    body: (
      <p>
        We may revise these Terms &amp; Conditions periodically to reflect changes in our services or
        for legal and regulatory reasons. The "Last updated" date at the top of this page indicates when
        these terms were last revised. We encourage you to review this page occasionally to stay
        informed.
      </p>
    ),
  },
  {
    id: 'governing-law',
    icon: Gavel,
    title: '11. Governing Law & Jurisdiction',
    body: (
      <p>
        These Terms &amp; Conditions are governed by the laws of India. Any disputes arising out of or
        in connection with your use of this website or our services shall be subject to the exclusive
        jurisdiction of the courts in Bengaluru, Karnataka.
      </p>
    ),
  },
];

export default function Terms() {
  const breadcrumbs: BreadcrumbItem[] = [
    { name: 'Home', url: '/' },
    { name: 'Terms & Conditions', url: '/terms' },
  ];

  return (
    <div className="min-h-screen bg-neutral-50/50">
      <SEO
        title="Terms & Conditions"
        description="Terms and Conditions for using The Property Agent's website and real estate services across Karnataka — listing accuracy, enquiries, liability, and governing law."
        type="website"
        canonicalPath="/terms"
        location="Karnataka, India"
        geoRegion="IN-KA"
        geoPosition="12.9716;77.5946"
        breadcrumbs={breadcrumbs}
      />

      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden bg-navy-950 py-16 sm:py-24 lg:py-28" aria-label="Terms and Conditions hero">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute -top-24 -right-16 w-72 h-72 sm:w-96 sm:h-96 bg-brand-500/15 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-16 w-72 h-72 sm:w-96 sm:h-96 bg-brand-500/10 rounded-full blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '26px 26px' }}
          />
        </div>

        <div className="relative max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 text-center animate-fade-in-up">
          <h1 className="font-display font-bold leading-tight tracking-wide text-white text-3xl sm:text-5xl lg:text-6xl">
            <span className="gradient-text">TERMS AND CONDITIONS</span>
          </h1>
          <p className="mt-5 sm:mt-6 text-neutral-300 text-sm sm:text-base max-w-xl mx-auto font-light">
            Please read these terms carefully before using our website or engaging our services.
          </p>
          <p className="mt-4 text-neutral-500 text-xs">Last updated: {LAST_UPDATED}</p>
        </div>
      </section>

      {/* ─── BREADCRUMB ─── */}
      <nav aria-label="Breadcrumb" className="bg-white border-b border-neutral-100">
        <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-3">
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
              <span className="text-navy-900 font-medium" itemProp="name">Terms &amp; Conditions</span>
              <meta itemProp="position" content="2" />
            </li>
          </ol>
        </div>
      </nav>

      {/* ─── CONTENTS + SECTIONS ─── */}
      <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Quick-jump contents */}
        <nav aria-label="Table of contents" className="bg-white rounded-2xl border border-neutral-100 shadow-card p-5 sm:p-6 mb-8 sm:mb-10">
          <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">On this page</h2>
          <div className="flex flex-wrap gap-2">
            {SECTIONS.map(s => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-50 border border-neutral-200 text-neutral-600 text-xs font-medium hover:bg-brand-50 hover:border-brand-200 hover:text-brand-700 transition-colors"
              >
                <s.icon className="h-3.5 w-3.5 text-brand-500" />
                {s.title}
              </a>
            ))}
          </div>
        </nav>

        {/* Sections */}
        <div className="space-y-5 sm:space-y-6">
          {SECTIONS.map(s => (
            <section key={s.id} id={s.id} className="bg-white rounded-2xl border border-neutral-100 shadow-card p-6 sm:p-8 scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0">
                  <s.icon className="h-5 w-5" />
                </div>
                <h2 className="text-lg sm:text-xl font-display font-bold text-navy-900 tracking-wide">{s.title}</h2>
              </div>
              <div className="text-sm text-neutral-600 leading-relaxed">{s.body}</div>
            </section>
          ))}

          {/* Contact */}
          <section className="bg-navy-950 rounded-2xl p-6 sm:p-8 text-center">
            <Users className="h-8 w-8 text-brand-400 mx-auto mb-3" />
            <h2 className="text-lg sm:text-xl font-display font-bold text-white tracking-wide mb-2">Questions About These Terms?</h2>
            <p className="text-sm text-neutral-300 max-w-md mx-auto mb-5">
              If anything here is unclear, reach out — we're happy to explain.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a href="mailto:thepropertyagent129@gmail.com"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-semibold transition-colors border border-white/10">
                <Mail className="h-4 w-4 text-brand-400" /> thepropertyagent129@gmail.com
              </a>
              <a href="tel:+919019488368"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold transition-colors">
                <Phone className="h-4 w-4" /> +91 90194 88368
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
