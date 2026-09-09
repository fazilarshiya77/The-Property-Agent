import { useState, useEffect } from 'react';
import { Cookie, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const CONSENT_KEY = 'tpa-cookie-consent'; // 'accepted' | 'declined'

// A simple cookie/local-storage consent notice — required for Indian data
// protection compliance (IT Act 2000 + DPDP Act 2023) and to be upfront
// about the strictly-necessary storage this site uses (admin session,
// "seen the welcome popup" flag, this consent choice itself). See
// Terms & Conditions, Section 10 for full details.
export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const existing = localStorage.getItem(CONSENT_KEY);
      if (!existing) setVisible(true);
    } catch {
      // localStorage unavailable — just don't show the banner rather than
      // risk it reappearing every load with no way to dismiss it
    }
  }, []);

  const respond = (choice: 'accepted' | 'declined') => {
    try {
      localStorage.setItem(CONSENT_KEY, choice);
    } catch {
      // ignore — worst case the banner reappears next visit
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-0 inset-x-0 z-50 p-3 sm:p-4 animate-fade-in-up"
    >
      <div className="max-w-3xl mx-auto bg-navy-950 text-white rounded-2xl shadow-2xl border border-white/10 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="p-2 rounded-xl bg-brand-500/20 text-brand-400 flex-shrink-0">
          <Cookie className="h-5 w-5" />
        </div>
        <p className="text-xs sm:text-sm text-neutral-300 flex-1 leading-relaxed">
          We use cookies and similar storage to run this site (like keeping the admin CRM signed in) and to remember your preferences. We don't use them for third-party advertising.{' '}
          <Link to="/terms#cookies" className="text-brand-400 hover:text-brand-300 underline underline-offset-2">
            Learn more
          </Link>
        </p>
        <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto">
          <button
            onClick={() => respond('declined')}
            className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            Decline
          </button>
          <button
            onClick={() => respond('accepted')}
            className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-brand-500 hover:bg-brand-600 text-navy-900 transition-colors"
          >
            Accept
          </button>
          <button
            onClick={() => respond('declined')}
            aria-label="Dismiss"
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors sm:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
