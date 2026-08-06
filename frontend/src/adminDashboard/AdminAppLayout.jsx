import React, { useState, useEffect } from 'react';
import { 
  Home, Users, Briefcase, FileText, Settings, Bell, BookOpen, 
  Layers, Search, ChevronRight, ChevronDown, CheckCircle2, Shield, Plus, Sparkles, LogOut, ArrowUpRight
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
  const [optimizeOpen, setOptimizeOpen] = useState(true);

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      window.location.href = '/login';
      return;
    }
    const user = localStorage.getItem('username');
    if (user) setAdminUsername(user);
    fetchOverviewStats();
  }, [token]);

  const fetchOverviewStats = async () => {
    const headers = { 'Authorization': `Bearer ${token}` };
    try {
      const [invRes, repRes, stockRes, blogRes] = await Promise.all([
        fetch('http://localhost:8000/api/admin/investors?page=1&limit=1', { headers }),
        fetch('http://localhost:8000/api/reports?page=1&limit=1', { headers }),
        fetch('http://localhost:8000/api/portfolio?page=1&limit=1', { headers }),
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
    <div className="min-h-screen bg-[#F9FAFB] font-sans text-gray-900 flex flex-col md:flex-row">
      {/* Zaga Left Sidebar */}
      <aside className="w-full md:w-64 bg-[#F6F6F6] border-r border-[#EBEBEB] p-5 flex flex-col justify-between shrink-0">
        <div>
          {/* Top Brand Logo */}
          <div className="flex items-center justify-between mb-5 px-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-[#18181B] rounded-xl flex items-center justify-center text-white font-extrabold text-xs shadow-xs">
                Z
              </div>
              <span className="font-extrabold text-base tracking-tight text-[#18181B]">Zaga</span>
            </div>
            <div className="px-1.5 py-0.5 bg-white border border-[#E5E5E7] rounded text-[10px] text-gray-500 font-mono shadow-xs">
              ⌘
            </div>
          </div>

          {/* + New Project / Article Action Pill Button */}
          <button 
            onClick={() => setActiveTab('blogs')}
            className="w-full bg-white border border-[#E5E5E7] hover:bg-gray-50 py-2.5 px-4 rounded-full font-semibold text-xs text-gray-800 flex items-center justify-center gap-1.5 shadow-xs mb-4 transition-all"
          >
            <Plus className="w-4 h-4 text-gray-500" /> New Article
          </button>

          {/* Search Box Pill */}
          <div className="relative mb-6">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-full pl-9 pr-14 py-2 bg-white border border-[#E5E5E7] rounded-full text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-gray-400 shadow-xs"
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <span className="px-1.5 py-0.5 bg-white border border-[#E5E5E7] rounded text-[10px] font-mono text-gray-500 shadow-2xs">⌘</span>
              <span className="px-1.5 py-0.5 bg-white border border-[#E5E5E7] rounded text-[10px] font-mono text-gray-500 shadow-2xs">K</span>
            </div>
          </div>

          {/* Main Navigation Menu */}
          <div className="space-y-5">
            <div>
              <div className="text-xs font-medium text-gray-400 px-2 pb-2 mb-2 border-b border-[#EBEBEB]">
                Main Menu
              </div>
              <nav className="space-y-1">
                {/* Active Home Pill */}
                <button
                  onClick={() => setActiveTab('home')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-full text-xs transition-all ${
                    activeTab === 'home' 
                      ? 'bg-white text-gray-900 font-bold shadow-xs' 
                      : 'text-[#4A4A4A] hover:text-gray-900 hover:bg-white/50 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Home className="w-4 h-4 text-gray-700" /> Home
                  </div>
                </button>

                {/* Investors */}
                <button
                  onClick={() => setActiveTab('investors')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-full text-xs transition-all ${
                    activeTab === 'investors' 
                      ? 'bg-white text-gray-900 font-bold shadow-xs' 
                      : 'text-[#4A4A4A] hover:text-gray-900 hover:bg-white/50 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Users className="w-4 h-4 text-gray-700" /> Investors
                  </div>
                  <span className="text-xs font-medium text-gray-400">{stats.investors}</span>
                </button>

                {/* Reports */}
                <button
                  onClick={() => setActiveTab('reports')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-full text-xs transition-all ${
                    activeTab === 'reports' 
                      ? 'bg-white text-gray-900 font-bold shadow-xs' 
                      : 'text-[#4A4A4A] hover:text-gray-900 hover:bg-white/50 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-gray-700" /> Reports
                  </div>
                  <span className="text-xs font-medium text-gray-400">{stats.reports}</span>
                </button>

                {/* Model Portfolio */}
                <button
                  onClick={() => setActiveTab('portfolio')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-full text-xs transition-all ${
                    activeTab === 'portfolio' 
                      ? 'bg-white text-gray-900 font-bold shadow-xs' 
                      : 'text-[#4A4A4A] hover:text-gray-900 hover:bg-white/50 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Briefcase className="w-4 h-4 text-gray-700" /> Model Portfolio
                  </div>
                  <span className="text-xs font-medium text-gray-400">{stats.stocks}</span>
                </button>

                {/* Collapsible Sub-menu: Optimize / Core Modules */}
                <div>
                  <button
                    onClick={() => setOptimizeOpen(!optimizeOpen)}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 text-[#4A4A4A] hover:text-gray-900 font-medium text-xs rounded-full hover:bg-white/50 transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-gray-700" /> Optimize Modules
                    </div>
                    {optimizeOpen ? <ChevronDown className="w-3.5 h-3.5 text-gray-400" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-400" />}
                  </button>

                  {/* Indented Sub-menu Items */}
                  {optimizeOpen && (
                    <div className="border-l border-gray-200/80 ml-5 pl-3.5 space-y-1 my-1.5">
                      <button
                        onClick={() => setActiveTab('smallcases')}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-full text-xs transition-all ${
                          activeTab === 'smallcases' 
                            ? 'bg-white text-gray-900 font-bold shadow-xs' 
                            : 'text-[#4A4A4A] hover:text-gray-900 font-medium'
                        }`}
                      >
                        <Layers className="w-3.5 h-3.5 text-gray-600" /> Small Cases
                      </button>
                      <button
                        onClick={() => setActiveTab('services')}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-full text-xs transition-all ${
                          activeTab === 'services' 
                            ? 'bg-white text-gray-900 font-bold shadow-xs' 
                            : 'text-[#4A4A4A] hover:text-gray-900 font-medium'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5 text-gray-600" /> Services Offered
                      </button>
                      <button
                        onClick={() => setActiveTab('notifications')}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-full text-xs transition-all ${
                          activeTab === 'notifications' 
                            ? 'bg-white text-gray-900 font-bold shadow-xs' 
                            : 'text-[#4A4A4A] hover:text-gray-900 font-medium'
                        }`}
                      >
                        <Bell className="w-3.5 h-3.5 text-gray-600" /> Broadcast Alerts
                      </button>
                    </div>
                  )}
                </div>

                {/* Blog Content */}
                <button
                  onClick={() => setActiveTab('blogs')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-full text-xs transition-all ${
                    activeTab === 'blogs' 
                      ? 'bg-white text-gray-900 font-bold shadow-xs' 
                      : 'text-[#4A4A4A] hover:text-gray-900 hover:bg-white/50 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <BookOpen className="w-4 h-4 text-gray-700" /> Content & Articles
                  </div>
                  <span className="text-xs font-medium text-gray-400">{stats.blogs}</span>
                </button>
              </nav>
            </div>
          </div>
        </div>

        {/* Bottom Settings & User */}
        <div className="pt-4 border-t border-[#EBEBEB] space-y-1">
          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-full text-xs transition-all ${
              activeTab === 'settings' 
                ? 'bg-white text-gray-900 font-bold shadow-xs' 
                : 'text-[#4A4A4A] hover:text-gray-900 font-medium'
            }`}
          >
            <Settings className="w-4 h-4 text-gray-700" /> Platform Settings
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-full text-xs font-medium text-red-600 hover:bg-red-50 transition-all"
          >
            <LogOut className="w-4 h-4 text-red-500" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Right Content Panel */}
      <main className="flex-grow p-6 md:p-8 max-w-7xl overflow-y-auto">
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-gray-200/70 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-400 font-medium mb-1">
              <span>Zaga Console</span>
              <ChevronRight className="w-3 h-3 text-gray-300" />
              <span className="text-gray-800 capitalize font-semibold">{activeTab}</span>
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              Good morning, {adminUsername} 👋
            </h1>
          </div>

          {/* Metric Badges */}
          <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-gray-200/80 shadow-2xs text-xs font-semibold text-gray-600">
            <span className="px-3 py-1 bg-gray-100/80 rounded-xl">{stats.investors} Investors</span>
            <span className="px-3 py-1 bg-gray-100/80 rounded-xl">{stats.reports} Reports</span>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-xl font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> 99.9% Uptime
            </span>
          </div>
        </div>

        {/* Tab Components Rendering */}
        {activeTab === 'home' && (
          <div className="space-y-8">
            {/* Top Priority Banner Card */}
            <div className="bg-amber-50/70 border border-amber-200/80 p-6 rounded-3xl flex items-start gap-4 shadow-2xs">
              <div className="p-3 bg-amber-100 rounded-2xl text-amber-800 shrink-0">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-700 block mb-1">System Health & Security</span>
                <h3 className="text-lg font-bold text-gray-900">All 50,000+ Record Database Indexes & Security Rules Active</h3>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                  Server-side skip/limit pagination, strict password policies (min 7 chars with !@#$%), and multi-domain host validation are enforced across all services.
                </p>
              </div>
            </div>

            {/* Metric Overview Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white border border-[#EAEAEA] p-6 rounded-3xl shadow-2xs">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Investors</span>
                <h3 className="text-3xl font-extrabold text-gray-900 mt-2">{stats.investors}</h3>
                <span className="text-xs font-semibold text-emerald-600 mt-2 inline-block">Active Subscriptions</span>
              </div>
              <div className="bg-white border border-[#EAEAEA] p-6 rounded-3xl shadow-2xs">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Research Reports</span>
                <h3 className="text-3xl font-extrabold text-gray-900 mt-2">{stats.reports}</h3>
                <span className="text-xs font-semibold text-gray-500 mt-2 inline-block">Published Research</span>
              </div>
              <div className="bg-white border border-[#EAEAEA] p-6 rounded-3xl shadow-2xs">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Model Portfolio Stocks</span>
                <h3 className="text-3xl font-extrabold text-gray-900 mt-2">{stats.stocks}</h3>
                <span className="text-xs font-semibold text-gray-500 mt-2 inline-block">Active Stock Allocations</span>
              </div>
              <div className="bg-white border border-[#EAEAEA] p-6 rounded-3xl shadow-2xs">
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
