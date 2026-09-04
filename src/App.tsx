import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { Settings } from "lucide-react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import SmoothScrollProvider from "./components/SmoothScrollProvider";
import Home from "./pages/Home";
import Listings from "./pages/Listings";
import PropertyDetails from "./pages/PropertyDetails";
import About from "./pages/About";
import Services from "./pages/Services";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProperties from "./pages/AdminProperties";
import AdminPropertyForm from "./pages/AdminPropertyForm";
import AdminLeads from "./pages/AdminLeads";
import AdminSiteVisits from "./pages/AdminSiteVisits";
import AdminComingSoon from "./pages/AdminComingSoon";
import { SEOProvider, SEO } from "./components/SEO";

function AppLayout() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

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
        <Route path="/admin/settings" element={<AdminComingSoon title="Settings" icon={Settings} description="Manage the Karnataka location list, amenities master, and site defaults from here." />} />
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
          </Routes>
        </main>
        <Footer />
      </SmoothScrollProvider>
      <ScrollToTop />
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
