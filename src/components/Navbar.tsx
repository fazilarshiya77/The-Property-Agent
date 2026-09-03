import { Link, useLocation } from 'react-router-dom';
import { Home, Building, Building2, Info, Menu, X, Phone, Lock, Sparkles, MessageCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen]);

  const navLinks = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Properties', path: '/listings', icon: Building },
    { name: 'Services', path: '/services', icon: Sparkles },
    { name: 'About', path: '/about', icon: Info }
  ];

  return (
    <>
      <nav
        aria-label="Main navigation"
        role="navigation"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/80 backdrop-blur-md border-b border-neutral-100 shadow-sm'
            : 'bg-white/95 backdrop-blur-sm'
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 lg:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group flex-shrink-0" aria-label="The Property Agent - Home">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-brand-500 flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:scale-105 flex-shrink-0">
                <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-display font-bold text-navy-900 leading-tight tracking-wider transition-colors duration-300 group-hover:text-brand-500">
                  The Property Agent
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path ||
                  (link.path === '/listings' && location.pathname.startsWith('/listings')) ||
                  (link.path === '/services' && location.pathname.startsWith('/services'));
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`relative px-4 py-2 rounded-lg text-sm font-semibold tracking-wide transition-all duration-300 ${
                      isActive
                        ? 'text-brand-500 bg-brand-50/50'
                        : 'text-neutral-700 hover:text-brand-500 hover:bg-neutral-50/80'
                    }`}
                  >
                    <span>{link.name}</span>
                    {isActive && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-brand-500 rounded-full" />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center space-x-3 lg:space-x-4">
              <a
                href="tel:+919019488368"
                className="flex items-center space-x-1.5 text-xs lg:text-sm font-semibold text-neutral-600 hover:text-brand-500 transition-colors duration-300"
                title="Call +91 90194 88368"
              >
                <Phone className="h-4 w-4 text-brand-500 flex-shrink-0" />
                <span className="hidden xl:inline">+91 90194 88368</span>
              </a>

              {/* WhatsApp Redirect Button */}
              <a
                href="https://wa.me/919945011138?text=Hi%20The%20Property%20Agent%2C%20I%20would%20like%20to%20inquire%20about%20your%20properties%20and%20services."
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-xs transition-all duration-300 border border-emerald-200/60 shadow-sm active:scale-95"
                aria-label="Chat on WhatsApp"
                title="Chat on WhatsApp"
              >
                <MessageCircle className="h-3.5 w-3.5 fill-emerald-600 text-emerald-600" />
                <span>WhatsApp</span>
              </a>

              <Link
                to="/about#contact"
                className="bg-brand-500 hover:bg-brand-600 text-white text-xs lg:text-sm font-bold px-4 lg:px-5 py-2.5 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-brand-500/20 active:scale-95 whitespace-nowrap"
              >
                Contact Us
              </Link>
              <Link
                to="/admin"
                className="flex items-center space-x-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs lg:text-sm font-semibold px-3 py-2.5 rounded-xl transition-all duration-300"
              >
                <Lock className="h-3.5 w-3.5" />
                <span className="hidden lg:inline">Admin</span>
              </Link>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg text-neutral-700 hover:bg-neutral-50 transition-colors"
              aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 z-40 md:hidden transition-opacity duration-300 ${
        isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`} role="dialog" aria-modal="true" aria-label="Mobile navigation menu">
        <div
          className="absolute inset-0 bg-navy-950/30 backdrop-blur-sm"
          onClick={() => setIsMenuOpen(false)}
          aria-hidden="true"
        />
        <div id="mobile-menu" className={`absolute top-0 right-0 h-full w-72 bg-white shadow-2xl transition-transform duration-300 ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          {/* Mobile menu header with logo */}
          <div className="p-5 border-b border-neutral-100 flex items-center space-x-3">
            <div className="h-10 w-10 rounded-lg bg-brand-500 flex items-center justify-center flex-shrink-0">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div className="text-sm font-bold text-navy-900">The Property Agent</div>
          </div>

          <div className="p-5">
            <div className="space-y-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center space-x-3 px-4 py-3.5 rounded-xl text-base font-medium transition-all ${
                      isActive
                        ? 'text-brand-500 bg-brand-50'
                        : 'text-neutral-700 hover:text-brand-500 hover:bg-neutral-50'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </div>
            <div className="mt-8 pt-6 border-t border-neutral-100 space-y-2">
              <a
                href="tel:+919019488368"
                className="flex items-center space-x-3 px-4 py-3 text-neutral-700 hover:text-brand-500 hover:bg-neutral-50 rounded-xl transition-colors"
              >
                <Phone className="h-5 w-5 text-brand-500" />
                <span className="text-sm font-medium">+91 90194 88368</span>
              </a>
              <a
                href="https://wa.me/919945011138?text=Hi%20The%20Property%20Agent%2C%20I%20would%20like%20to%20inquire%20about%20your%20properties%20and%20services."
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 px-4 py-3 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors font-medium text-sm"
              >
                <MessageCircle className="h-5 w-5 fill-emerald-600 text-emerald-600" />
                <span>Chat on WhatsApp</span>
              </a>
              <Link
                to="/about#contact"
                className="block mt-3 text-center bg-brand-500 hover:bg-brand-600 text-white font-semibold py-3.5 rounded-xl transition-colors"
              >
                Contact Us
              </Link>
              <Link
                to="/admin"
                className="flex items-center space-x-3 px-4 py-3 mt-2 text-neutral-400 hover:text-brand-500 transition-colors"
              >
                <Lock className="h-5 w-5" />
                <span className="text-sm font-medium">Admin</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer for fixed navbar */}
      <div className="h-16 lg:h-20" />
    </>
  );
}
