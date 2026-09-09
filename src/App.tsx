import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useEffect, Suspense, lazy } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import SmoothScrollProvider from "./components/SmoothScrollProvider";
import FloatingContactButtons from "./components/FloatingContactButtons";
import WelcomePopup from "./components/WelcomePopup";
import CookieConsent from "./components/CookieConsent";
import { SEOProvider, SEO } from "./components/SEO";
import { useSettingsStore } from "./stores/settingsStore";

// Route-level code splitting: each page (and the entire admin CRM) ships
// as its own chunk, loaded only when that route is actually visited —
// instead of one ~1.8MB bundle shipped on every single page load,
// public visitors (and crawlers) only download the page they're on.
// Admin's forms/tables/upload UI are especially heavy and were
// previously bundled into every public page for zero benefit.
const Home = lazy(() => import("./pages/Home"));
const Listings = lazy(() => import("./pages/Listings"));
const PropertyDetails = lazy(() => import("./pages/PropertyDetails"));
const About = lazy(() => import("./pages/About"));
const Services = lazy(() => import("./pages/Services"));
const Terms = lazy(() => import("./pages/Terms"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminProperties = lazy(() => import("./pages/AdminProperties"));
const AdminPropertyForm = lazy(() => import("./pages/AdminPropertyForm"));
const AdminLeads = lazy(() => import("./pages/AdminLeads"));
const AdminSiteVisits = lazy(() => import("./pages/AdminSiteVisits"));
const AdminSettings = lazy(() => import("./pages/AdminSettings"));

// Minimal, brand-neutral fallback shown for the brief moment a route
// chunk is downloading — deliberately plain so it never flashes
// noticeably on a fast connection.
function RouteFallback() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="h-8 w-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" aria-label="Loading" />
    </div>
  );
}

function AppLayout() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const fetchSettings = useSettingsStore(s => s.fetchSettings);

  // Load the admin-configurable Call/WhatsApp numbers once per app load —
  // every component that needs them just reads from the store afterward.
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  if (isAdmin) {
    return (
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/properties" element={<AdminProperties />} />
          <Route path="/admin/new" element={<AdminPropertyForm />} />
          <Route path="/admin/edit/:id" element={<AdminPropertyForm />} />
          <Route path="/admin/leads" element={<AdminLeads />} />
          <Route path="/admin/site-visits" element={<AdminSiteVisits />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="*" element={<AdminLogin />} />
        </Routes>
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <SmoothScrollProvider>
        <main className="flex-1">
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/listings" element={<Listings />} />
              <Route path="/listings/:id" element={<PropertyDetails />} />
              <Route path="/services" element={<Services />} />
              <Route path="/about" element={<About />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </SmoothScrollProvider>
      <ScrollToTop />
      <FloatingContactButtons />
      <WelcomePopup />
      <CookieConsent />
    </div>
  );
}

export default function App() {
  return (
    <SEOProvider>
      <Router>
        <SEO />
        <AppLayout />
      </Router>
    </SEOProvider>
  );
}
