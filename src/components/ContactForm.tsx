import { useState } from 'react';
import { Send, CheckCircle, Loader2, MessageCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { logToGoogleSheet } from '@/lib/logger';
import { supabase } from '@/lib/supabase';

interface ContactFormProps {
  propertyTitle?: string;
  serviceTitle?: string;
  contactEmail: string;
  propertyId?: string;
  /** Render without the outer Card chrome — for embedding inside a modal
   *  or other container that already provides its own padding/border. */
  bare?: boolean;
  /** Called right after a successful submission (e.g. to auto-close a modal). */
  onSuccess?: () => void;
}

const PREFERRED_CONTACT_OPTIONS = [
  { value: '', label: 'No preference' },
  { value: 'phone', label: 'Phone Call' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'email', label: 'Email' },
] as const;

export default function ContactForm({ propertyTitle, serviceTitle, contactEmail, propertyId, bare, onSuccess }: ContactFormProps) {
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; phone?: string }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (fieldErrors[e.target.name as 'name' | 'phone']) {
      setFieldErrors(prev => ({ ...prev, [e.target.name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errs: typeof fieldErrors = {};
    if (!formData.name.trim()) errs.name = 'Name is required';
    if (!formData.phone.trim()) errs.phone = 'Phone number is required';
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});

    setIsSubmitting(true);
    setSubmitError(false);

    const preferredContactLabel = PREFERRED_CONTACT_OPTIONS.find(o => o.value === formData.preferredContact)?.label;
    const notes = formData.preferredContact
      ? `${formData.message}\n\nPreferred contact method: ${preferredContactLabel}`
      : formData.message;

    // Prepare WhatsApp Message
    const whatsappText = `*New Inquiry — The Property Agent*\n\n*Name:* ${formData.name}\n*Phone:* ${formData.phone}\n*Email:* ${formData.email || 'N/A'}\n${propertyTitle ? `*Property:* ${propertyTitle}\n` : ''}${serviceTitle ? `*Service:* ${serviceTitle}\n` : ''}${formData.preferredContact ? `*Preferred Contact:* ${preferredContactLabel}\n` : ''}*Message:* ${formData.message}`;
    const whatsappUrl = `https://wa.me/919945011138?text=${encodeURIComponent(whatsappText)}`;

    // Create a real lead in the CRM — additive alongside the existing
    // email/WhatsApp flow, never blocking on it either way.
    supabase.from('leads').insert([{
      name: formData.name,
      phone: formData.phone,
      email: formData.email || null,
      interested_property_id: propertyId || null,
      property_type_interested: propertyTitle || serviceTitle || null,
      notes,
      source: 'website',
      status: 'new',
      temperature: 'warm',
    }]).then(({ error }) => {
      if (error) console.error('Error creating lead:', error);
    });

    try {
      // 1. Send email using web3forms
      const form = new FormData();
      form.append('access_key', import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || '0469cb33-7c50-44d8-b019-c70583307942');
      form.append('name', formData.name);
      form.append('phone', formData.phone);
      form.append('email', formData.email);
      form.append('preferred_contact', preferredContactLabel || 'No preference');
      form.append('message', formData.message);
      form.append('subject', propertyTitle ? `Inquiry: ${propertyTitle}` : "Inquiry - The Property Agent");
      form.append('to', contactEmail || 'trishnaproperties78@gmail.com');

      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: form,
      });

      const result = await response.json();

      if (result.success) {
        // 2. Log lead to Google Sheet
        logToGoogleSheet({
          logType: 'CONTACT_FORM',
          message: `New Lead: ${formData.name}`,
          details: {
            name: formData.name,
            phone: formData.phone,
            email: formData.email,
            message: formData.message,
            propertyTitle: propertyTitle || 'General Inquiry',
          },
        });

        // 3. Open WhatsApp redirect
        window.open(whatsappUrl, '_blank');

        setIsSubmitting(false);
        setSubmitSuccess(true);
        setFormData({ name: '', phone: '', email: '', preferredContact: '', message: '' });
        onSuccess?.();
        setTimeout(() => setSubmitSuccess(false), 6000);
      } else {
        // Even if web3forms had an issue, forward to WhatsApp
        window.open(whatsappUrl, '_blank');
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Error submitting form:', error);

      // Log error to Google Sheet
      logToGoogleSheet({
        logType: 'ERROR',
        message: 'Contact Form Submission Failed',
        details: {
          error: (error as Error).message,
          name: formData.name,
          email: formData.email,
        },
      });

      setIsSubmitting(false);
      setSubmitError(true);
      setTimeout(() => setSubmitError(false), 6000);
    }
  };

  const defaultWhatsappMessage = propertyTitle
    ? `Hi The Property Agent, I am interested in "${propertyTitle}". Please share more details.`
    : serviceTitle
    ? `Hi The Property Agent, I would like to inquire about "${serviceTitle}".`
    : `Hi The Property Agent, I would like to make an inquiry.`;

  const titleText = propertyTitle ? 'Schedule a Visit' : serviceTitle ? `Request ${serviceTitle}` : 'Get in Touch';
  const descriptionText = propertyTitle ? "Fill in your details — forwarded instantly to Email & WhatsApp" : serviceTitle ? "Fill in your details for quick doorstep service" : "We'd love to hear from you";

  const body = (
    <>
      {submitSuccess ? (
        <div className="text-center py-8 animate-scale-in">
          <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-brand-500" />
          </div>
          <h4 className="text-lg font-semibold text-navy-900">Thank you! Your enquiry has been submitted.</h4>
          <p className="text-sm text-neutral-500 mt-2">We will contact you shortly. WhatsApp has also been opened for an instant reply.</p>
        </div>
      ) : submitError ? (
        <div className="text-center py-8 animate-scale-in">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-red-500" />
          </div>
          <h4 className="text-lg font-semibold text-navy-900">Notice</h4>
          <p className="text-sm text-neutral-500 mt-2">Connecting you directly to our WhatsApp support team...</p>
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
            disabled={isSubmitting}
            className="w-full h-12 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-brand-500/20 flex items-center justify-center space-x-2 border-none active:scale-[0.98]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-white" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <span>{propertyTitle ? 'Send Enquiry' : 'Send Message & WhatsApp'}</span>
                <Send className="h-4 w-4 text-white" />
              </>
            )}
          </Button>

          {/* Direct WhatsApp Option */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-neutral-200"></div>
            <span className="flex-shrink mx-2 text-[10px] text-neutral-400 uppercase font-bold tracking-wider">Or</span>
            <div className="flex-grow border-t border-neutral-200"></div>
          </div>

          <a
            href={`https://wa.me/919945011138?text=${encodeURIComponent(defaultWhatsappMessage)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full h-11 bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-md flex items-center justify-center space-x-2 active:scale-[0.98] text-sm"
          >
            <MessageCircle className="h-4 w-4" />
            <span>Direct WhatsApp Chat</span>
          </a>
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
