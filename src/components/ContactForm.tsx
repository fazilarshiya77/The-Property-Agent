import { useState } from 'react';
import { Send, CheckCircle, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { logToGoogleSheet } from '@/lib/logger';

interface ContactFormProps {
  propertyTitle?: string;
  contactEmail: string;
}

export default function ContactForm({ propertyTitle, contactEmail }: ContactFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: propertyTitle ? `I'm interested in "${propertyTitle}"` : ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(false);
    
    try {
      // Send email using web3forms
      const form = new FormData();
      form.append('access_key', import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || '0469cb33-7c50-44d8-b019-c70583307942');
      form.append('name', formData.name);
      form.append('phone', formData.phone);
      form.append('email', formData.email);
      form.append('message', formData.message);
      form.append('subject', propertyTitle ? `Inquiry: ${propertyTitle}` : "Inquiry - Trishna Properties");
      form.append('to', contactEmail || 'trishnaproperties78@gmail.com');
      
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: form,
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Log lead to Google Sheet
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

        setIsSubmitting(false);
        setSubmitSuccess(true);
        setFormData({ name: '', phone: '', email: '', message: '' });
        setTimeout(() => setSubmitSuccess(false), 6000);
      } else {
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

  return (
    <Card className="border border-neutral-100 bg-white shadow-card p-6 lg:p-8 rounded-2xl">
      <CardHeader className="p-0 mb-6">
        <CardTitle className="text-2xl font-display font-bold text-navy-900 tracking-wide">
          {propertyTitle ? 'Schedule a Visit' : 'Get in Touch'}
        </CardTitle>
        <CardDescription className="text-sm text-neutral-500 mt-1 font-light">
          {propertyTitle ? "Fill in your details and we'll arrange a viewing" : "We'd love to hear from you"}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-0">
        {submitSuccess ? (
          <div className="text-center py-8 animate-scale-in">
            <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-brand-500" />
            </div>
            <h4 className="text-lg font-semibold text-navy-900">Message Sent!</h4>
            <p className="text-sm text-neutral-500 mt-2">Thank you for your inquiry. We will get back to you soon.</p>
          </div>
        ) : submitError ? (
          <div className="text-center py-8 animate-scale-in">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-red-500" />
            </div>
            <h4 className="text-lg font-semibold text-navy-900">Error!</h4>
            <p className="text-sm text-neutral-500 mt-2">Something went wrong. Please try again later.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">Full Name</label>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="h-11 px-4 bg-neutral-50 border border-neutral-200 rounded-xl focus-visible:ring-brand-500/20 focus-visible:border-brand-500 text-sm"
                placeholder="Enter your name"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">Phone Number</label>
              <Input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="h-11 px-4 bg-neutral-50 border border-neutral-200 rounded-xl focus-visible:ring-brand-500/20 focus-visible:border-brand-500 text-sm"
                placeholder="+91 XXXXX XXXXX"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">Email Address</label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="h-11 px-4 bg-neutral-50 border border-neutral-200 rounded-xl focus-visible:ring-brand-500/20 focus-visible:border-brand-500 text-sm"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">Message</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
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
                  <span>{propertyTitle ? 'Request a Visit' : 'Send Message'}</span>
                  <Send className="h-4 w-4 text-white" />
                </>
              )}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
