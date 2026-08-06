import React, { useState, useEffect } from 'react';
import { 
  Home, Users, Briefcase, FileText, Settings, Bell, BookOpen, 
  Layers, Search, ChevronRight, CheckCircle2, Shield, Plus, Sparkles, LogOut, Tag, ArrowUpRight
} from 'lucide-react';
import SmallCasesManager from './modules/SmallCasesManager';
import ServicesManager from './modules/ServicesManager';
import PortfolioStocksManager from './modules/PortfolioStocksManager';
import ResearchReportsManager from './modules/ResearchReportsManager';
import InvestorUsersManager from './modules/InvestorUsersManager';
import NotificationsManager from './modules/NotificationsManager';
import BlogPostManager from './modules/BlogPostManager';
import PlatformSettingsManager from './modules/PlatformSettingsManager';

export default function AdminAppLayout() {
  const [activeTab, setActiveTab] = useState('home');
  const [adminUsername, setAdminUsername] = useState('Admin');
  const [stats, setStats] = useState({ investors: 0, reports: 0, stocks: 0, blogs: 0 });

  useEffect(() => {
    const user = localStorage.getItem('username');
    if (user) setAdminUsername(user);
    fetchOverviewStats();
  }, []);

  const fetchOverviewStats = async () => {
    try {
      const [invRes, repRes, stockRes, blogRes] = await Promise.all([
        fetch('http://localhost:8000/api/admin/investors?page=1&limit=1'),
        fetch('http://localhost:8000/api/reports?page=1&limit=1'),
        fetch('http://localhost:8000/api/portfolio?page=1&limit=1'),
        fetch('http://localhost:8000/api/blogs?page=1&limit=1'),
      ]);
      const invData = invRes.ok ? await invRes.json() : {};
      const repData = repRes.ok ? await repRes.json() : {};
      const stockData = stockRes.ok ? await stockRes.json() : {};
      const blogData = blogRes.ok ? await blogRes.json() : {};
      setStats({
        investors: invData.total || 0,
        reports: repData.total || 0,
        stocks: stockData.total || 0,
        blogs: blogData.total || 0
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-[#F6F7F9] font-sans text-gray-900 flex flex-col md:flex-row">
      {/* Zaga Left Sidebar */}
      <aside className="w-full md:w-64 bg-[#F2F3F5] border-r border-gray-200/80 p-5 flex flex-col justify-between shrink-0">
        <div>
          {/* Top Brand Logo */}
          <div className="flex items-center justify-between mb-6 px-2">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center text-white font-bold text-xs">
                Z
              </div>
              <span className="font-extrabold text-base tracking-tight text-gray-900">Raghuvir Admin</span>
            </div>
            <span className="text-[10px] bg-gray-200 text-gray-700 px-2 py-0.5 rounded font-mono">v1.1</span>
          </div>

          {/* Quick Create Action */}
          <button 
            onClick={() => setActiveTab('blogs')}
            className="w-full bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 py-2.5 px-4 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 shadow-xs mb-6 transition-all"
          >
            <Plus className="w-4 h-4 text-gray-500" /> New Article
          </button>

          {/* Search Box */}
          <div className="relative mb-6">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-full pl-8 pr-8 py-2 bg-white/70 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-gray-400"
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-gray-400 border border-gray-200 px-1 rounded bg-gray-50">⌘K</span>
          </div>

          {/* Main Navigation Sections */}
          <div className="space-y-6">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 px-3 block mb-2">Main Menu</span>
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab('home')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'home' ? 'bg-white text-gray-900 shadow-xs font-bold' : 'text-gray-600 hover:bg-white/60 hover:text-gray-900'
                  }`}
                >
                  <Home className="w-4 h-4 text-gray-500" /> Home Overview
                </button>
                <button
                  onClick={() => setActiveTab('investors')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'investors' ? 'bg-white text-gray-900 shadow-xs font-bold' : 'text-gray-600 hover:bg-white/60 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Users className="w-4 h-4 text-gray-500" /> Investor Users
                  </div>
                  <span className="text-[10px] bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded-full">{stats.investors}</span>
                </button>
                <button
                  onClick={() => setActiveTab('reports')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'reports' ? 'bg-white text-gray-900 shadow-xs font-bold' : 'text-gray-600 hover:bg-white/60 hover:text-gray-900'
                  }`}
                >
                  <FileText className="w-4 h-4 text-gray-500" /> Research Reports
                </button>
                <button
                  onClick={() => setActiveTab('portfolio')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'portfolio' ? 'bg-white text-gray-900 shadow-xs font-bold' : 'text-gray-600 hover:bg-white/60 hover:text-gray-900'
                  }`}
                >
                  <Briefcase className="w-4 h-4 text-gray-500" /> Model Portfolio
                </button>
              </nav>
            </div>

            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 px-3 block mb-2">CRUD Modules</span>
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab('smallcases')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'smallcases' ? 'bg-white text-gray-900 shadow-xs font-bold' : 'text-gray-600 hover:bg-white/60 hover:text-gray-900'
                  }`}
                >
                  <Layers className="w-4 h-4 text-gray-500" /> Small Cases
                </button>
                <button
                  onClick={() => setActiveTab('services')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'services' ? 'bg-white text-gray-900 shadow-xs font-bold' : 'text-gray-600 hover:bg-white/60 hover:text-gray-900'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-gray-500" /> Services Offered
                </button>
                <button
                  onClick={() => setActiveTab('notifications')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'notifications' ? 'bg-white text-gray-900 shadow-xs font-bold' : 'text-gray-600 hover:bg-white/60 hover:text-gray-900'
                  }`}
                >
                  <Bell className="w-4 h-4 text-gray-500" /> Broadcast Alerts
                </button>
                <button
                  onClick={() => setActiveTab('blogs')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'blogs' ? 'bg-white text-gray-900 shadow-xs font-bold' : 'text-gray-600 hover:bg-white/60 hover:text-gray-900'
                  }`}
                >
                  <BookOpen className="w-4 h-4 text-gray-500" /> Blog Articles (Tags)
                </button>
              </nav>
            </div>
          </div>
        </div>

        {/* Bottom Settings & User */}
        <div className="pt-6 border-t border-gray-200/80 space-y-2">
          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'settings' ? 'bg-white text-gray-900 shadow-xs font-bold' : 'text-gray-600 hover:bg-white/60 hover:text-gray-900'
            }`}
          >
            <Settings className="w-4 h-4 text-gray-500" /> Platform Settings
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-all"
          >
            <LogOut className="w-4 h-4 text-red-500" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Right Content Panel */}
      <main className="flex-grow p-6 md:p-8 max-w-7xl overflow-y-auto">
        {/* Top Breadcrumb & Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-gray-200 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-400 font-medium mb-1">
              <span>Admin Console</span>
              <ChevronRight className="w-3 h-3 text-gray-300" />
              <span className="text-gray-700 capitalize font-semibold">{activeTab}</span>
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              Good morning, {adminUsername} 👋
            </h1>
          </div>

          {/* Metric Badges Header */}
          <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-gray-200 shadow-2xs text-xs font-semibold text-gray-600">
            <span className="px-3 py-1 bg-gray-100 rounded-xl">{stats.investors} Investors</span>
            <span className="px-3 py-1 bg-gray-100 rounded-xl">{stats.reports} Reports</span>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-xl font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> 99.9% Uptime
            </span>
          </div>
        </div>

        {/* Tab Components Rendering */}
        {activeTab === 'home' && (
          <div className="space-y-8">
            {/* Top Priority Banner Card */}
            <div className="bg-amber-50/70 border border-amber-200/80 p-6 rounded-3xl flex items-start gap-4">
              <div className="p-3 bg-amber-100 rounded-2xl text-amber-800">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-700 block mb-1">System Health & Security</span>
                <h3 className="text-lg font-bold text-gray-900">All 50,000+ Record Database Indexes & Security Rules Active</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Server-side skip/limit pagination, strict password policies (min 7 chars with !@#$%), and multi-domain host validation are enforced.
                </p>
              </div>
            </div>

            {/* Metric Overview Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-2xs">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Investors</span>
                <h3 className="text-3xl font-extrabold text-gray-900 mt-2">{stats.investors}</h3>
                <span className="text-xs font-semibold text-emerald-600 mt-2 inline-block">Active Subscriptions</span>
              </div>
              <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-2xs">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Research Reports</span>
                <h3 className="text-3xl font-extrabold text-gray-900 mt-2">{stats.reports}</h3>
                <span className="text-xs font-semibold text-gray-500 mt-2 inline-block">Published Research</span>
              </div>
              <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-2xs">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Model Portfolio Stocks</span>
                <h3 className="text-3xl font-extrabold text-gray-900 mt-2">{stats.stocks}</h3>
                <span className="text-xs font-semibold text-gray-500 mt-2 inline-block">Active Allocation Stocks</span>
              </div>
              <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-2xs">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Blog Posts</span>
                <h3 className="text-3xl font-extrabold text-gray-900 mt-2">{stats.blogs}</h3>
                <span className="text-xs font-semibold text-gray-500 mt-2 inline-block">Articles with Tags</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'investors' && <InvestorUsersManager />}
        {activeTab === 'reports' && <ResearchReportsManager />}
        {activeTab === 'portfolio' && <PortfolioStocksManager />}
        {activeTab === 'smallcases' && <SmallCasesManager />}
        {activeTab === 'services' && <ServicesManager />}
        {activeTab === 'notifications' && <NotificationsManager />}
        {activeTab === 'blogs' && <BlogPostManager />}
        {activeTab === 'settings' && <PlatformSettingsManager />}
      </main>
    </div>
  );
}
