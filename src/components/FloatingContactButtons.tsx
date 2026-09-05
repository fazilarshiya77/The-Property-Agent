import { useState, useEffect, useRef } from 'react';
import { Phone, MessageCircle, X } from 'lucide-react';
import { useSettingsStore } from '../stores/settingsStore';
import { formatPhoneDisplay, toTelHref, toWhatsAppHref } from '../lib/phone';

const WHATSAPP_MESSAGE = "Hi The Property Agent, I'd like to enquire about your properties and services.";

// Two floating action buttons (WhatsApp + Call) fixed to the bottom-right
// corner of every public page. Tapping either opens a small popover with
// the admin-configured number (see Admin -> Settings -> Contact &
// Communication) rather than a hardcoded one.
export default function FloatingContactButtons() {
  const [openMenu, setOpenMenu] = useState<'whatsapp' | 'call' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { callNumber, whatsappNumber } = useSettingsStore(s => s.settings);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenMenu(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const waLink = toWhatsAppHref(whatsappNumber, WHATSAPP_MESSAGE);
  const telLink = toTelHref(callNumber);

  return (
    <div
      ref={containerRef}
      className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end gap-3"
    >
      {/* WhatsApp button + popover */}
      <div className="relative">
        {openMenu === 'whatsapp' && (
          <div className="absolute bottom-full right-0 mb-3 w-64 bg-white rounded-2xl shadow-2xl border border-neutral-100 p-3 animate-scale-in origin-bottom-right">
            <div className="flex items-center justify-between px-1 pb-2 mb-1 border-b border-neutral-100">
              <span className="text-xs font-semibold text-neutral-700 uppercase tracking-wider">Chat on WhatsApp</span>
              <button
                onClick={() => setOpenMenu(null)}
                aria-label="Close"
                className="p-1 rounded-lg text-neutral-400 hover:text-navy-900 hover:bg-neutral-100 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpenMenu(null)}
              className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-neutral-50 transition-colors"
            >
              <div className="p-2 rounded-full bg-green-500/10 text-green-600 flex-shrink-0">
                <MessageCircle className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-navy-900">{formatPhoneDisplay(whatsappNumber)}</p>
                <p className="text-xs text-neutral-500">Tap to message us</p>
              </div>
            </a>
          </div>
        )}
        <button
          onClick={() => setOpenMenu(openMenu === 'whatsapp' ? null : 'whatsapp')}
          aria-label="Chat on WhatsApp"
          aria-expanded={openMenu === 'whatsapp'}
          className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-300 active:scale-95"
        >
          <MessageCircle className="h-6 w-6 sm:h-7 sm:w-7" fill="currentColor" strokeWidth={0} />
        </button>
      </div>

      {/* Call button + popover */}
      <div className="relative">
        {openMenu === 'call' && (
          <div className="absolute bottom-full right-0 mb-3 w-64 bg-white rounded-2xl shadow-2xl border border-neutral-100 p-3 animate-scale-in origin-bottom-right">
            <div className="flex items-center justify-between px-1 pb-2 mb-1 border-b border-neutral-100">
              <span className="text-xs font-semibold text-neutral-700 uppercase tracking-wider">Call Us</span>
              <button
                onClick={() => setOpenMenu(null)}
                aria-label="Close"
                className="p-1 rounded-lg text-neutral-400 hover:text-navy-900 hover:bg-neutral-100 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <a
              href={telLink}
              onClick={() => setOpenMenu(null)}
              className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-neutral-50 transition-colors"
            >
              <div className="p-2 rounded-full bg-brand-500/10 text-brand-600 flex-shrink-0">
                <Phone className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-navy-900">{formatPhoneDisplay(callNumber)}</p>
                <p className="text-xs text-neutral-500">Tap to call now</p>
              </div>
            </a>
          </div>
        )}
        <button
          onClick={() => setOpenMenu(openMenu === 'call' ? null : 'call')}
          aria-label="Call us"
          aria-expanded={openMenu === 'call'}
          className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-brand-500 hover:bg-brand-600 text-navy-900 shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-300 active:scale-95"
        >
          <Phone className="h-6 w-6 sm:h-7 sm:w-7" fill="currentColor" strokeWidth={0} />
        </button>
      </div>
    </div>
  );
}
