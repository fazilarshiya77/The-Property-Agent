import { useState } from 'react';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSettingsStore } from '@/stores/settingsStore';
import { formatPhoneDisplay, toWhatsAppHref } from '@/lib/phone';

interface ContactFormProps {
  propertyTitle?: string;
  serviceTitle?: string;
  /** Kept for backward compatibility with existing call sites; unused now
   *  that this form no longer sends its own email — the enquiry goes
   *  straight to WhatsApp instead. */
  contactEmail?: string;
  propertyId?: string;
  /** Shown as "Location: ..." in the WhatsApp message when this enquiry
   *  is tied to a specific property. */
  propertyLocation?: string;
  /** Shown as "Property ID: ..." in the WhatsApp message — the
   *  human-readable property code (e.g. "PA-KA-00214"), not the internal id. */
  propertyCode?: string;
  /** Render without the outer Card chrome — for embedding inside a modal
   *  or other container that already provides its own padding/border. */
  bare?: boolean;
  /** Called right after the WhatsApp handoff (e.g. to auto-close a modal). */
  onSuccess?: () => void;
}

const PREFERRED_CONTACT_OPTIONS = [
  { value: '', label: 'No preference' },
  { value: 'phone', label: 'Phone Call' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'email', label: 'Email' },
] as const;

// This form is a WhatsApp enquiry mechanism only — it never touches
// Supabase or the CRM. Submitting builds a clean, professional message
// from the entered details and opens WhatsApp (via wa.me) for the
// admin-configured WhatsApp number (Admin -> Settings -> Contact &
// Communication), pre-filled and ready for the visitor to send.
export default function ContactForm({ propertyTitle, serviceTitle, propertyLocation, propertyCode, bare, onSuccess }: ContactFormProps) {
  const { callNumber, whatsappNumber, businessName } = useSettingsStore(s => s.settings);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    preferredContact: '',
    message: propertyTitle
      ? `I'm interested in "${propertyTitle}"`
      : serviceTitle
      ? `I would like to inquire about "${serviceTitle}"`
      : ''
  });
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; phone?: string }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (fieldErrors[e.target.name as 'name' | 'phone']) {
      setFieldErrors(prev => ({ ...prev, [e.target.name]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(false);

    const errs: typeof fieldErrors = {};
    if (!formData.name.trim()) errs.name = 'Name is required';
    if (!formData.phone.trim()) errs.phone = 'Phone number is required';
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});

    if (!whatsappNumber.trim()) {
      setErrorMessage("WhatsApp isn't configured yet, so we can't open a chat right now. Please call us directly, or try again shortly.");
      setSubmitError(true);
      setTimeout(() => setSubmitError(false), 6000);
      return;
    }

    const preferredContactLabel = PREFERRED_CONTACT_OPTIONS.find(o => o.value === formData.preferredContact)?.label;

    const lines: string[] = [
      `Hello ${businessName},`,
      '',
      propertyTitle
        ? 'I am interested in this property and would like more information.'
        : serviceTitle
        ? `I would like to inquire about "${serviceTitle}".`
        : 'I am interested in your properties and services and would like more information.',
      '',
      `Name: ${formData.name.trim()}`,
      `Phone: ${formData.phone.trim()}`,
    ];
    if (formData.email.trim()) lines.push(`Email: ${formData.email.trim()}`);
    if (preferredContactLabel) lines.push(`Preferred Contact: ${preferredContactLabel}`);

    if (formData.message.trim()) {
      lines.push('', 'Message:', formData.message.trim());
    }

    // Property-specific enquiries include the property's details; general
    // enquiries (no propertyTitle) never fabricate this section.
    if (propertyTitle) {
      lines.push('', `Property: ${propertyTitle}`);
      if (propertyLocation) lines.push(`Location: ${propertyLocation}`);
      if (propertyCode) lines.push(`Property ID: ${propertyCode}`);
    }

    lines.push('', 'Thank you.');

    const waLink = toWhatsAppHref(whatsappNumber, lines.join('\n'));
    window.open(waLink, '_blank', 'noopener,noreferrer');

    setSubmitSuccess(true);
    setFormData({ name: '', phone: '', email: '', preferredContact: '', message: '' });
    onSuccess?.();
    setTimeout(() => setSubmitSuccess(false), 6000);
  };

  const titleText = propertyTitle ? 'Schedule a Visit' : serviceTitle ? `Request ${serviceTitle}` : 'Get in Touch';
  const descriptionText = propertyTitle ? "Fill in your details and we'll get back to you shortly" : serviceTitle ? "Fill in your details for quick doorstep service" : "We'd love to hear from you";

  const body = (
    <>
      {submitSuccess ? (
        <div className="text-center py-8 animate-scale-in">
          <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-brand-500" />
          </div>
          <h4 className="text-lg font-semibold text-navy-900">WhatsApp is open in a new tab</h4>
          <p className="text-sm text-neutral-500 mt-2">Your message is ready — just hit Send in WhatsApp to reach us.</p>
        </div>
      ) : submitError ? (
        <div className="text-center py-8 animate-scale-in">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h4 className="text-lg font-semibold text-navy-900">Something went wrong</h4>
          <p className="text-sm text-neutral-500 mt-2">{errorMessage || `Please try again, or call us directly at ${formatPhoneDisplay(callNumber)}.`}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">Full Name *</label>
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`h-11 px-4 bg-neutral-50 border rounded-xl focus-visible:ring-brand-500/20 text-sm ${
                fieldErrors.name ? 'border-red-300 focus-visible:border-red-500' : 'border-neutral-200 focus-visible:border-brand-500'
              }`}
              placeholder="Enter your name"
            />
            {fieldErrors.name && <p className="text-xs text-red-500 mt-1">{fieldErrors.name}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">Phone Number *</label>
            <Input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`h-11 px-4 bg-neutral-50 border rounded-xl focus-visible:ring-brand-500/20 text-sm ${
                fieldErrors.phone ? 'border-red-300 focus-visible:border-red-500' : 'border-neutral-200 focus-visible:border-brand-500'
              }`}
              placeholder="+91 XXXXX XXXXX"
            />
            {fieldErrors.phone && <p className="text-xs text-red-500 mt-1">{fieldErrors.phone}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">Email Address</label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="h-11 px-4 bg-neutral-50 border border-neutral-200 rounded-xl focus-visible:ring-brand-500/20 focus-visible:border-brand-500 text-sm"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">Preferred Contact Method</label>
            <select
              name="preferredContact"
              value={formData.preferredContact}
              onChange={handleChange}
              className="w-full h-11 px-4 bg-neutral-50 border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-sm text-neutral-700"
            >
              {PREFERRED_CONTACT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">Message</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-sm resize-none"
              placeholder="Tell us what you're looking for..."
            />
          </div>
          <Button
            type="submit"
            className="w-full h-12 bg-brand-500 hover:bg-brand-600 text-navy-900 font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-brand-500/20 flex items-center justify-center space-x-2 border-none active:scale-[0.98]"
          >
            <span>Send Enquiry</span>
            <Send className="h-4 w-4 text-white" />
          </Button>
        </form>
      )}
    </>
  );

  if (bare) {
    return (
      <div>
        <div className="mb-6">
          <h3 className="text-xl font-display font-bold text-navy-900 tracking-wide">{titleText}</h3>
          <p className="text-sm text-neutral-500 mt-1 font-light">{descriptionText}</p>
        </div>
        {body}
      </div>
    );
  }

  return (
    <Card className="border border-neutral-100 bg-white shadow-card p-6 lg:p-8 rounded-2xl">
      <CardHeader className="p-0 mb-6">
        <CardTitle className="text-2xl font-display font-bold text-navy-900 tracking-wide">
          {titleText}
        </CardTitle>
        <CardDescription className="text-sm text-neutral-500 mt-1 font-light">
          {descriptionText}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-0">
        {body}
      </CardContent>
    </Card>
  );
}
