import { Link } from 'react-router-dom';
import { Home, Search, Building2 } from 'lucide-react';
import { SEO } from '../components/SEO';

// Catch-all for any path that doesn't match a real route — without this,
// App.tsx's <Routes> renders nothing for an unmatched path (blank page
// inside the navbar/footer chrome, no message, no noindex), which is
// unfriendly to visitors following a stale/broken link and to crawlers.
export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <SEO
        title="Page Not Found"
        description="The page you're looking for doesn't exist or may have moved. Browse our current property listings or head back home."
        noIndex
      />
      <div className="text-center max-w-md">
        <div className="text-6xl font-display font-bold text-brand-500 mb-2">404</div>
        <h1 className="text-2xl font-display font-bold text-navy-900 mb-3">Page Not Found</h1>
        <p className="text-sm text-neutral-500 mb-8">
          The page you're looking for doesn't exist or may have moved. It might have been a listing that's since been sold or rented.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-navy-900 font-semibold text-sm px-5 py-2.5 rounded-xl transition-all shadow-sm"
          >
            <Home className="h-4 w-4" /> Back to Home
          </Link>
          <Link
            to="/listings"
            className="inline-flex items-center gap-2 bg-neutral-100 hover:bg-neutral-200 text-navy-900 font-semibold text-sm px-5 py-2.5 rounded-xl transition-all"
          >
            <Building2 className="h-4 w-4" /> Browse Listings
          </Link>
        </div>
        <Link
          to="/listings"
          className="inline-flex items-center gap-1.5 mt-6 text-xs text-neutral-400 hover:text-brand-500 transition-colors"
        >
          <Search className="h-3.5 w-3.5" /> Or search for a property
        </Link>
      </div>
    </div>
  );
}
