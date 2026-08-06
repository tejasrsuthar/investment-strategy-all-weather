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

// New Investor & Admin pages
import ModelPortfolioPerformance from './pages/ModelPortfolioPerformance';
import NewsAnnouncements from './pages/NewsAnnouncements';
import AdminAppLayout from './adminDashboard/AdminAppLayout';
import InvestorResearchReports from './pages/InvestorResearchReports';
import InvestorModelPortfolio from './pages/InvestorModelPortfolio';
import SystemStatusPage from './pages/SystemStatusPage';

export default function App() {
  const isAdminDomain = window.location.hostname === 'app.raghuvircons.local';

  if (isAdminDomain) {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<AdminAppLayout />} />
        </Routes>
      </Router>
    );
  }

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
            <Route path="/news" element={<NewsAnnouncements />} />
            <Route path="/status" element={<SystemStatusPage />} />

            {/* Auth */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Portals */}
            <Route path="/investor" element={<InvestorDashboard />} />
            <Route path="/investor/services/reports" element={<InvestorResearchReports />} />
            <Route path="/investor/services/portfolio" element={<InvestorModelPortfolio />} />
            <Route path="/investor/reports" element={<InvestorResearchReports />} />
            <Route path="/investor/portfolio" element={<InvestorModelPortfolio />} />
            <Route path="/investor/settings" element={<InvestorSettings />} />

            {/* Admin Standalone Dashboard (Path fallback & direct route) */}
            <Route path="/adminDashboard" element={<AdminAppLayout />} />
            <Route path="/admin" element={<AdminAppLayout />} />
            <Route path="/admin/investors" element={<AdminInvestors />} />
            <Route path="/admin/investors/:id" element={<AdminInvestorDetail />} />
            <Route path="/admin/reports" element={<AdminReports />} />
            <Route path="/admin/reports/create" element={<AdminReportForm />} />
            <Route path="/admin/reports/edit/:id" element={<AdminReportForm />} />
            <Route path="/admin/portfolio" element={<AdminPortfolio />} />
            <Route path="/admin/portfolio/create" element={<AdminPortfolioForm />} />
            <Route path="/admin/portfolio/edit/:id" element={<AdminPortfolioForm />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
