// Shared phone-number helpers for the Call/WhatsApp settings feature.
// Numbers are stored (and passed around the app) in E.164 form, e.g.
// "+919019488368" — these helpers normalize admin input into that form and
// derive the tel:/wa.me links and display formatting from it.

/**
 * Normalizes free-form admin input into E.164 (e.g. "+919019488368").
 * Accepts a bare 10-digit Indian number, a "91XXXXXXXXXX" number, or a
 * full "+<countrycode><number>" international number. Returns null if the
 * input doesn't look like a usable phone number.
 */
export function normalizePhoneNumber(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const kept = trimmed.replace(/[^\d+]/g, '');

  if (kept.startsWith('+')) {
    const digits = kept.slice(1);
    return /^\d{10,15}$/.test(digits) ? `+${digits}` : null;
  }

  const digitsOnly = kept.replace(/\D/g, '');
  if (/^\d{10}$/.test(digitsOnly)) return `+91${digitsOnly}`;
  if (/^91\d{10}$/.test(digitsOnly)) return `+${digitsOnly}`;
  if (/^\d{11,15}$/.test(digitsOnly)) return `+${digitsOnly}`;

  return null;
}

/** True if the input normalizes to a usable phone number. */
export function isValidPhoneNumber(raw: string): boolean {
  return normalizePhoneNumber(raw) !== null;
}

/** Formats an E.164 number for display — "+919019488368" -> "+91 90194 88368". */
export function formatPhoneDisplay(e164: string): string {
  const indian = e164.match(/^\+91(\d{5})(\d{5})$/);
  if (indian) return `+91 ${indian[1]} ${indian[2]}`;
  return e164;
}

/** Builds a `tel:` link from an E.164 number. */
export function toTelHref(e164: string): string {
  return `tel:${e164}`;
}

/** Builds a `wa.me` deep link from an E.164 number, with an optional prefilled message. */
export function toWhatsAppHref(e164: string, message?: string): string {
  const digits = e164.replace(/\D/g, '');
  return message
    ? `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
    : `https://wa.me/${digits}`;
}
