import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, ExternalLink } from 'lucide-react';

export default function Footer() {
  const address = '31, GM Palya Main Rd, KG Colony, GM Palya, C V Raman Nagar, Bengaluru, Karnataka 560075';
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  const mapsEmbed = `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;

  return (
    <footer className="bg-navy-950 text-white">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-10 sm:py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center space-x-2.5 sm:space-x-3 mb-4 sm:mb-5 group">
              <img
                src="/logo.jpeg"
                alt="Trishna Properties"
                className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl object-contain border border-white/10 shadow-md group-hover:scale-105 transition-transform bg-white"
              />
              <div>
                <span className="text-lg sm:text-xl font-display font-bold leading-tight block tracking-wider">Trishna</span>
                <span className="text-[8px] sm:text-[9px] font-semibold text-brand-500 uppercase tracking-widest">
                  Properties
                </span>
              </div>
            </Link>
            <p className="text-neutral-400 text-sm leading-relaxed font-light">
              Your trusted partner for premium luxury homes and properties in Bangalore. Buy, Rent, or Sell — we help you find the perfect space.
            </p>
          </div>

          {/* Properties */}
          <div>
            <h4 className="text-sm font-semibold text-neutral-200 uppercase tracking-wider mb-3 sm:mb-4">Properties</h4>
            <ul className="space-y-2 sm:space-y-2.5 text-sm">
              <li><Link to="/listings?location=Murgeshpalya" className="text-neutral-400 hover:text-brand-400 transition-colors">Murgeshpalya</Link></li>
              <li><Link to="/listings?location=CV+Raman+Nagar" className="text-neutral-400 hover:text-brand-400 transition-colors">CV Raman Nagar</Link></li>
              <li><Link to="/listings?location=GM+Palya" className="text-neutral-400 hover:text-brand-400 transition-colors">GM Palya</Link></li>
              <li><Link to="/listings?location=Bommasandra" className="text-neutral-400 hover:text-brand-400 transition-colors">Bommasandra</Link></li>
              <li><Link to="/listings?location=Yelahanka" className="text-neutral-400 hover:text-brand-400 transition-colors">Yelahanka</Link></li>
              <li><Link to="/listings?type=rent" className="text-neutral-400 hover:text-brand-400 transition-colors">For Rent</Link></li>
              <li><Link to="/listings?type=sale" className="text-neutral-400 hover:text-brand-400 transition-colors">For Sale</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold text-neutral-200 uppercase tracking-wider mb-3 sm:mb-4">Company</h4>
            <ul className="space-y-2 sm:space-y-2.5 text-sm">
              <li><Link to="/" className="text-neutral-400 hover:text-brand-400 transition-colors">Home</Link></li>
              <li><Link to="/about" className="text-neutral-400 hover:text-brand-400 transition-colors">About Us</Link></li>
              <li><Link to="/listings" className="text-neutral-400 hover:text-brand-400 transition-colors">All Properties</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-neutral-200 uppercase tracking-wider mb-3 sm:mb-4">Contact Us</h4>
            <ul className="space-y-2.5 sm:space-y-3 text-sm">
              <li className="flex items-start space-x-2.5 sm:space-x-3">
                <Mail className="h-4 w-4 text-brand-400 mt-0.5 flex-shrink-0" />
                <a href="mailto:trishnaproperties78@gmail.com" className="text-neutral-400 hover:text-brand-400 transition-colors break-all">
                  trishnaproperties78@gmail.com
                </a>
              </li>
              <li className="flex items-start space-x-2.5 sm:space-x-3">
                <Phone className="h-4 w-4 text-brand-400 mt-0.5 flex-shrink-0" />
                <a href="tel:+919886104532" className="text-neutral-400 hover:text-brand-400 transition-colors">
                  +91 98861 04532
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
            title="Trishna Properties Office Location"
            className="w-full h-44 sm:h-48 lg:h-64"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            style={{ border: 0, filter: 'grayscale(0.4) invert(0.02) contrast(1.1)' }}
            allowFullScreen
          />
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 mt-6 sm:mt-8 pt-5 sm:pt-6 flex flex-col sm:flex-row justify-between items-center gap-2.5 sm:gap-3">
          <p className="text-neutral-500 text-sm text-center sm:text-left font-light">
            © {new Date().getFullYear()} Trishna Properties. All rights reserved.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
            <p className="text-neutral-600 text-xs font-light">
              Made with ❤️ in Bangalore
            </p>
            <a
              href="https://naazailabs.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-500 hover:text-brand-400 text-xs font-light transition-colors"
            >
              Developed by Naazai Labs
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
