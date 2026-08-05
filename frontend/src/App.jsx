import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

// Public pages
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Smallcase from './pages/Smallcase';

// Auth pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Portal views
import InvestorDashboard from './investor/InvestorDashboard';
import AdminDashboard from './admin/AdminDashboard';
import AdminInvestors from './admin/AdminInvestors';
import AdminReports from './admin/AdminReports';
import AdminPortfolio from './admin/AdminPortfolio';
import AdminReportForm from './admin/AdminReportForm';
import AdminPortfolioForm from './admin/AdminPortfolioForm';
import AdminSettings from './admin/AdminSettings';
import InvestorSettings from './investor/InvestorSettings';
import AdminInvestorDetail from './admin/AdminInvestorDetail';

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <Routes>
            {/* Public */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/smallcase" element={<Smallcase />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />

            {/* Auth */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Portals */}
            <Route path="/investor" element={<InvestorDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/investors" element={<AdminInvestors />} />
            <Route path="/admin/investors/:id" element={<AdminInvestorDetail />} />
            <Route path="/admin/reports" element={<AdminReports />} />
            <Route path="/admin/reports/create" element={<AdminReportForm />} />
            <Route path="/admin/reports/edit/:id" element={<AdminReportForm />} />
            <Route path="/admin/portfolio" element={<AdminPortfolio />} />
            <Route path="/admin/portfolio/create" element={<AdminPortfolioForm />} />
            <Route path="/admin/portfolio/edit/:id" element={<AdminPortfolioForm />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
            <Route path="/investor/settings" element={<InvestorSettings />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
