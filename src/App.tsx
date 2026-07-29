import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import SmoothScrollProvider from "./components/SmoothScrollProvider";
import Home from "./pages/Home";
import Listings from "./pages/Listings";
import PropertyDetails from "./pages/PropertyDetails";
import About from "./pages/About";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminPropertyForm from "./pages/AdminPropertyForm";
import { SEOProvider, SEO } from "./components/SEO";

function AppLayout() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  if (isAdmin) {
    return (
      <Routes>
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/new" element={<AdminPropertyForm />} />
        <Route path="/admin/edit/:id" element={<AdminPropertyForm />} />
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
