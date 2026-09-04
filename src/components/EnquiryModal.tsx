import { useEffect } from 'react';
import { X, MessageSquareText, Building2 } from 'lucide-react';
import type { Property } from '../data/properties';
import ContactForm from './ContactForm';

interface EnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property;
}

// Reuses the existing ContactForm (Supabase leads insert + web3forms + WhatsApp,
// all already wired up) inside a modal dialog — same enquiry pipeline the
// sidebar contact card on the property detail page already uses, just
// presented as a popup so it can be triggered from anywhere (cards, listing
// grids, the detail page) without navigating away.
export default function EnquiryModal({ isOpen, onClose, property }: EnquiryModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const formatPrice = (price: number, type: string) => {
    if (type === 'rent') return `₹${price.toLocaleString('en-IN')}/mo`;
    if (type === 'lease') {
      if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr (Lease)`;
      return `₹${(price / 100000).toFixed(1)} L (Lease)`;
    }
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
    return `₹${(price / 100000).toFixed(2)} L`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="enquiry-modal-title"
    >
      <div
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl border border-neutral-100 transform transition-all duration-300 scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-white/95 backdrop-blur-sm rounded-t-3xl">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-brand-500/10 text-brand-500 flex-shrink-0">
              <MessageSquareText className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h3 id="enquiry-modal-title" className="text-lg font-bold font-display text-navy-900 leading-tight">
                Enquire Now
              </h3>
              <p className="text-xs text-neutral-500 truncate">About this property</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-navy-900 hover:bg-neutral-100 transition-colors flex-shrink-0"
            aria-label="Close enquiry form"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6">
          {/* Property preview strip — makes it unambiguous which property this enquiry is tied to */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-neutral-50 border border-neutral-100 mb-5">
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-neutral-200 flex-shrink-0 relative">
              {property.images.length > 0 ? (
                <img src={property.images[0]} alt={property.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-400">
                  <Building2 className="h-6 w-6" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-semibold text-navy-900 truncate">{property.title}</h4>
              <p className="text-xs text-neutral-500 truncate">{property.location}</p>
              <p className="text-xs font-bold text-brand-600 mt-0.5">{formatPrice(property.price, property.type)}</p>
            </div>
          </div>

          <ContactForm
            propertyTitle={property.title}
            contactEmail={property.contactEmail}
            propertyId={property.id}
            bare
            onSuccess={() => {
              // Give the visitor a moment to see the success state before
              // the modal disappears out from under them.
              setTimeout(onClose, 2500);
            }}
          />
        </div>
      </div>
    </div>
  );
}
