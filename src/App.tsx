import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import SmoothScrollProvider from "./components/SmoothScrollProvider";
import FloatingContactButtons from "./components/FloatingContactButtons";
import WelcomePopup from "./components/WelcomePopup";
import Home from "./pages/Home";
import Listings from "./pages/Listings";
import PropertyDetails from "./pages/PropertyDetails";
import About from "./pages/About";
import Services from "./pages/Services";
import Terms from "./pages/Terms";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProperties from "./pages/AdminProperties";
import AdminPropertyForm from "./pages/AdminPropertyForm";
import AdminLeads from "./pages/AdminLeads";
import AdminSiteVisits from "./pages/AdminSiteVisits";
import AdminSettings from "./pages/AdminSettings";
import { SEOProvider, SEO } from "./components/SEO";
import { useSettingsStore } from "./stores/settingsStore";

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
      <Routes>
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/properties" element={<AdminProperties />} />
        <Route path="/admin/new" element={<AdminPropertyForm />} />
        <Route path="/admin/edit/:id" element={<AdminPropertyForm />} />
        <Route path="/admin/leads" element={<AdminLeads />} />
        <Route path="/admin/site-visits" element={<AdminSiteVisits />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <SmoothScrollProvider>
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/listings" element={<Listings />} />
            <Route path="/listings/:id" element={<PropertyDetails />} />
            <Route path="/services" element={<Services />} />
            <Route path="/about" element={<About />} />
            <Route path="/terms" element={<Terms />} />
          </Routes>
        </main>
        <Footer />
      </SmoothScrollProvider>
      <ScrollToTop />
      <FloatingContactButtons />
      <WelcomePopup />
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
