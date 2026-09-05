import { useState, useEffect } from 'react';
import { X, MessageSquareText } from 'lucide-react';
import ContactForm from './ContactForm';

const SESSION_KEY = 'tpa-welcome-popup-shown';
const SHOW_DELAY_MS = 4000;

// A one-time-per-session enquiry popup shown a few seconds after the
// homepage first loads. Reuses the shared ContactForm (bare) inside the
// same modal chrome pattern as EnquiryModal, but without a property
// preview since this popup isn't tied to any specific listing.
export default function WelcomePopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    let alreadyShown = false;
    try {
      alreadyShown = sessionStorage.getItem(SESSION_KEY) === '1';
    } catch {
      // sessionStorage unavailable (e.g. private browsing) — fall back to showing once per page load
    }
    if (alreadyShown) return;

    const timer = setTimeout(() => {
      setIsOpen(true);
      try {
        sessionStorage.setItem(SESSION_KEY, '1');
      } catch {
        // ignore
      }
    }, SHOW_DELAY_MS);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
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
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-fade-in"
      onClick={() => setIsOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-popup-title"
    >
      <div
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto overscroll-contain bg-white rounded-3xl shadow-2xl border border-neutral-100 transform transition-all duration-300 scale-100"
        onClick={(e) => e.stopPropagation()}
        data-lenis-prevent
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-white/95 backdrop-blur-sm rounded-t-3xl">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-brand-500/10 text-brand-500 flex-shrink-0">
              <MessageSquareText className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h3 id="welcome-popup-title" className="text-lg font-bold font-display text-navy-900 leading-tight">
                Looking for a property?
              </h3>
              <p className="text-xs text-neutral-500 truncate">Tell us what you need — we'll reach out</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-xl text-neutral-400 hover:text-navy-900 hover:bg-neutral-100 transition-colors flex-shrink-0"
            aria-label="Close enquiry form"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6">
          <ContactForm
            contactEmail="trishnaproperties78@gmail.com"
            bare
            onSuccess={() => {
              setTimeout(() => setIsOpen(false), 2500);
            }}
          />
        </div>
      </div>
    </div>
  );
}
