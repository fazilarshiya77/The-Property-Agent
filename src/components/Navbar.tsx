import { Link, useLocation } from 'react-router-dom';
import { Home, Building, Info, Menu, X, Phone, Lock } from 'lucide-react';
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
            <Link to="/" className="flex items-center space-x-3 group flex-shrink-0" aria-label="Trishna Property Management - Home">
              <img
                src="/logo.jpeg"
                alt="Trishna Property Management — Premium Real Estate in Bangalore"
                className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl object-contain border border-neutral-100 shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:scale-105 bg-white"
                width="48"
                height="48"
              />
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-display font-bold text-navy-900 leading-tight tracking-wider transition-colors duration-300 group-hover:text-brand-500">
                  Trishna
                </span>
                <span className="text-[8px] sm:text-[9px] font-semibold text-brand-500 uppercase tracking-widest -mt-0.5">
                  Property Management
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path ||
                  (link.path === '/listings' && location.pathname.startsWith('/listings'));
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
            <div className="hidden md:flex items-center space-x-5">
              <a
                href="tel:+919886104532"
                className="flex items-center space-x-2 text-sm font-semibold text-neutral-600 hover:text-brand-500 transition-colors duration-300"
              >
                <Phone className="h-4 w-4 text-brand-500" />
                <span className="hidden lg:inline">+91 98861 04532</span>
              </a>
              <Link
                to="/about#contact"
                className="bg-brand-500 hover:bg-brand-600 text-white text-sm font-bold px-6 py-2.5 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-brand-500/20 active:scale-95"
              >
                Contact Us
              </Link>
              <Link
                to="/admin"
                className="flex items-center space-x-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all duration-300"
              >
                <Lock className="h-4 w-4" />
                <span>Admin Login</span>
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
            <img src="/logo.jpeg" alt="Trishna Property Management" className="h-10 w-10 rounded-lg object-contain bg-white" />
            <div>
              <div className="text-sm font-bold text-navy-900">Trishna</div>
              <div className="text-[9px] text-neutral-500 uppercase tracking-wider">Property Management</div>
            </div>
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
            <div className="mt-8 pt-6 border-t border-neutral-100">
              <a
                href="tel:+919886104532"
                className="flex items-center space-x-3 px-4 py-3 text-neutral-600 hover:text-brand-500 transition-colors"
              >
                <Phone className="h-5 w-5" />
                <span className="text-sm font-medium">+91 98861 04532</span>
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
