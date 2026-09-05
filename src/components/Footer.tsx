import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, ExternalLink, MessageCircle } from 'lucide-react';
import { useSettingsStore } from '../stores/settingsStore';
import { formatPhoneDisplay, toTelHref, toWhatsAppHref } from '../lib/phone';

export default function Footer() {
  const { callNumber, whatsappNumber } = useSettingsStore(s => s.settings);
  const address = 'No. 84, 4th cross kashi nagar, yelachanahalli, B-78., Bengaluru, Karnataka';
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  const mapsEmbed = `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;

  return (
    <footer className="bg-navy-950 text-white" role="contentinfo" aria-label="The Property Agent footer">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-10 sm:py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-8 lg:gap-8">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center space-x-2.5 sm:space-x-3 mb-4 sm:mb-5 group">
              <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl overflow-hidden shadow-md group-hover:scale-105 transition-transform flex-shrink-0">
                <img src="/logo.jpg" alt="The Property Agent logo" className="w-full h-full object-cover" />
              </div>
              <span className="text-lg sm:text-xl font-display font-bold leading-tight tracking-wider">The Property Agent</span>
            </Link>
            <p className="text-neutral-400 text-sm leading-relaxed font-light">
              An independent property agent dealing in plots, farmhouse plots, land, rentals, lease & sale properties across Karnataka. Listings change as new deals come in — reach out directly for the latest.
            </p>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-sm font-semibold text-neutral-200 uppercase tracking-wider mb-3 sm:mb-4">How We Help</h4>
            <ul className="space-y-2 sm:space-y-2.5 text-sm" aria-label="Buying, selling, and renting services">
              <li><Link to="/services#buying-assistance" className="text-neutral-400 hover:text-brand-400 transition-colors">Help You Buy</Link></li>
              <li><Link to="/services#selling-assistance" className="text-neutral-400 hover:text-brand-400 transition-colors">Help You Sell / List</Link></li>
              <li><Link to="/services#rental-lease-assistance" className="text-neutral-400 hover:text-brand-400 transition-colors">Help You Rent / Lease</Link></li>
            </ul>
          </div>

          {/* Properties */}
          <div>
            <h4 className="text-sm font-semibold text-neutral-200 uppercase tracking-wider mb-3 sm:mb-4">Property Categories</h4>
            <ul className="space-y-2 sm:space-y-2.5 text-sm" aria-label="Browse properties by category">
              <li><Link to="/listings?type=plot" className="text-neutral-400 hover:text-brand-400 transition-colors">Plots for Sale</Link></li>
              <li><Link to="/listings?type=farmhouse" className="text-neutral-400 hover:text-brand-400 transition-colors">Farmhouse Plots</Link></li>
              <li><Link to="/listings?type=land" className="text-neutral-400 hover:text-brand-400 transition-colors">Land</Link></li>
              <li><Link to="/listings?type=rent" className="text-neutral-400 hover:text-brand-400 transition-colors">For Rent</Link></li>
              <li><Link to="/listings?type=lease" className="text-neutral-400 hover:text-brand-400 transition-colors">For Lease</Link></li>
              <li><Link to="/listings?type=sale" className="text-neutral-400 hover:text-brand-400 transition-colors">For Sale</Link></li>
              <li><Link to="/listings?type=commercial" className="text-neutral-400 hover:text-brand-400 transition-colors">Commercial</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold text-neutral-200 uppercase tracking-wider mb-3 sm:mb-4">Company</h4>
            <ul className="space-y-2 sm:space-y-2.5 text-sm" aria-label="Company links">
              <li><Link to="/" className="text-neutral-400 hover:text-brand-400 transition-colors">Home</Link></li>
              <li><Link to="/services" className="text-neutral-400 hover:text-brand-400 transition-colors">All Services</Link></li>
              <li><Link to="/about" className="text-neutral-400 hover:text-brand-400 transition-colors">About Us</Link></li>
              <li><Link to="/listings" className="text-neutral-400 hover:text-brand-400 transition-colors">All Properties</Link></li>
              <li><Link to="/about#contact" className="text-neutral-400 hover:text-brand-400 transition-colors">Contact</Link></li>
              <li><Link to="/terms" className="text-neutral-400 hover:text-brand-400 transition-colors">Terms &amp; Conditions</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-neutral-200 uppercase tracking-wider mb-3 sm:mb-4">Contact Us</h4>
            <ul className="space-y-2.5 sm:space-y-3 text-sm" aria-label="Contact information">
              <li className="flex items-start space-x-2.5 sm:space-x-3">
                <Mail className="h-4 w-4 text-brand-400 mt-0.5 flex-shrink-0" />
                <a href="mailto:thepropertyagent129@gmail.com" className="text-neutral-400 hover:text-brand-400 transition-colors whitespace-nowrap text-[13px] sm:text-sm">
                  thepropertyagent129@gmail.com
                </a>
              </li>
              <li className="flex items-start space-x-2.5 sm:space-x-3">
                <Phone className="h-4 w-4 text-brand-400 mt-0.5 flex-shrink-0" />
                <a href={toTelHref(callNumber)} className="text-neutral-400 hover:text-brand-400 transition-colors">
                  {formatPhoneDisplay(callNumber)}
                </a>
              </li>
              <li className="flex items-start space-x-2.5 sm:space-x-3">
                <MessageCircle className="h-4 w-4 text-brand-400 mt-0.5 flex-shrink-0" />
                <a href={toWhatsAppHref(whatsappNumber)} target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-brand-400 transition-colors">
                  {formatPhoneDisplay(whatsappNumber)} (WhatsApp)
                </a>
              </li>
              <li className="flex items-start space-x-2.5 sm:space-x-3">
                <MapPin className="h-4 w-4 text-brand-400 mt-0.5 flex-shrink-0" />
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-400 hover:text-brand-400 transition-colors group"
                >
                  {address}
                  <ExternalLink className="inline-block h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Map */}
        <div className="mt-8 sm:mt-10 lg:mt-12 rounded-2xl overflow-hidden border border-white/5 shadow-glass transition-all duration-300 hover:border-brand-500/30">
          <iframe
            src={mapsEmbed}
            title="The Property Agent Office Location"
            className="w-full h-44 sm:h-48 lg:h-64"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            style={{ border: 0, filter: 'grayscale(0.4) invert(0.02) contrast(1.1)' }}
            allowFullScreen
            aria-label="Google Maps showing The Property Agent office location at Yelachanahalli, Bengaluru"
          />
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 mt-6 sm:mt-8 pt-5 sm:pt-6 grid grid-cols-1 sm:grid-cols-3 items-center gap-2.5 sm:gap-3 text-center">
          <p className="text-neutral-500 text-sm sm:text-left font-light">
            © {new Date().getFullYear()} The Property Agent. All rights reserved.
          </p>
          <a
            href="https://naazailabs.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-400 hover:text-brand-400 text-sm font-medium transition-colors"
          >
            Designed and Developed by Naaz AI Labs
          </a>
          <Link to="/terms" className="text-neutral-500 hover:text-brand-400 text-sm font-light transition-colors sm:text-right">
            Terms &amp; Conditions
          </Link>
        </div>
      </div>
    </footer>
  );
}
