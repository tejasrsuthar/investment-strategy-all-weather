import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MoreVertical, Users, FileText, Briefcase, ArrowUp, ArrowDown, Search, Settings } from 'lucide-react';

export default function AdminInvestors() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const [investors, setInvestors] = useState([]);
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [notification, setNotification] = useState(null);

  // Search and Sort State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('all');
  const [sortField, setSortField] = useState('username');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    if (!token || role !== 'admin') {
      navigate('/login');
      return;
    }
    fetchInvestors();
  }, [token]);

  const fetchInvestors = async () => {
    try {
      // Fetch up to 1000 investors to allow full client-side search & sorting
      const res = await fetch(`http://localhost:8000/api/admin/investors?page=1&limit=1000`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setInvestors(data.items || []);
    } catch (e) {
      console.error(e);
    }
  };

  const showToast = (title, message, type = 'success') => {
    setNotification({ title, message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleInvestorStatus = async (id, status) => {
    try {
      const res = await fetch(`http://localhost:8000/api/admin/investors/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        showToast("Status Updated", `Investor account status changed to ${status}.`, "success");
        fetchInvestors();
      } else {
        const d = await res.json();
        showToast("Update Failed", d.detail, "error");
      }
    } catch (err) {
      showToast("Error", err.message, "error");
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setCurrentPage(1); // Reset page on sort
  };

  const getDateLabel = (dateStr) => {
    if (!dateStr) return '';
    const dateObj = new Date(dateStr);
    const dateString = dateObj.toDateString();
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    if (dateString === today) return "Today";
    if (dateString === yesterday) return "Yesterday";
    return dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  // Derive unique dates
  const uniqueDates = Array.from(
    new Set(investors.map(inv => getDateLabel(inv.created_at)).filter(Boolean))
  );

  // Filter logic
  const filteredInvestors = investors.filter(inv => {
    const query = searchQuery.toLowerCase();
    const dateLabel = getDateLabel(inv.created_at);

    const matchesSearch = (
      (inv.username || '').toLowerCase().includes(query) ||
      inv.email.toLowerCase().includes(query) ||
      inv.role.toLowerCase().includes(query) ||
      inv.status.toLowerCase().includes(query)
    );

    const matchesDate = selectedDate === 'all' || dateLabel === selectedDate;
    return matchesSearch && matchesDate;
  });

  // Sort logic
  const sortedInvestors = [...filteredInvestors].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];

    if (typeof aVal === 'boolean') {
      aVal = aVal ? 1 : 0;
      bVal = bVal ? 1 : 0;
    } else {
      aVal = (aVal || '').toString().toLowerCase();
      bVal = (bVal || '').toString().toLowerCase();
    }

    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedInvestors.length / itemsPerPage);
  const paginatedInvestors = sortedInvestors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const SortIndicator = ({ field }) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5 inline ml-1 text-forest" /> : <ArrowDown className="w-3.5 h-3.5 inline ml-1 text-forest" />;
  };

  return (
    <div className="pt-32 pb-24 px-6 max-w-6xl mx-auto min-h-[90vh]">
      {/* Admin Menu Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-bordercolor pb-6 mb-8 gap-4">
        <h1 className="text-4xl font-extrabold text-forest">Admin Console</h1>
        <div className="flex bg-[#EDEEE9]/50 p-1.5 rounded-full border border-bordercolor text-xs font-bold uppercase tracking-widest text-textmuted gap-2 flex-wrap">
          <Link to="/admin/investors" className="flex items-center gap-1.5 bg-forest text-[#FAF9F6] px-5 py-2.5 rounded-full shadow-sm">
            <Users className="w-3.5 h-3.5" /> Investors
          </Link>
          <Link to="/admin/reports" className="flex items-center gap-1.5 hover:text-forest px-5 py-2.5 rounded-full transition-all">
            <FileText className="w-3.5 h-3.5" /> Reports
          </Link>
          <Link to="/admin/portfolio" className="flex items-center gap-1.5 hover:text-forest px-5 py-2.5 rounded-full transition-all">
            <Briefcase className="w-3.5 h-3.5" /> Portfolio
          </Link>
          <Link to="/admin/settings" className="flex items-center gap-1.5 hover:text-forest px-5 py-2.5 rounded-full transition-all">
            <Settings className="w-3.5 h-3.5" /> Settings
          </Link>
        </div>
      </div>

      {/* Main Directory Table */}
      <div className="bg-white border border-bordercolor p-8 rounded-3xl shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold text-forest">Investor Directory</h2>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {/* Date filter tabs (small size) */}
            <div className="flex bg-[#EDEEE9]/40 p-1 rounded-full border border-bordercolor text-[10px] font-bold uppercase tracking-wider text-textmuted gap-1 items-center">
              <button
                type="button"
                onClick={() => { setSelectedDate('all'); setCurrentPage(1); }}
                className={`px-3 py-1.5 rounded-full transition-all ${selectedDate === 'all' ? 'bg-forest text-[#FAF9F6] shadow-xs' : 'hover:text-forest'}`}
              >
                All Days
              </button>
              {uniqueDates.map(d => (
                <button
                  type="button"
                  key={d}
                  onClick={() => { setSelectedDate(d); setCurrentPage(1); }}
                  className={`px-3 py-1.5 rounded-full transition-all ${selectedDate === d ? 'bg-forest text-[#FAF9F6] shadow-xs' : 'hover:text-forest'}`}
                >
                  {d}
                </button>
              ))}
            </div>

            {/* Search bar */}
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textmuted" />
              <input
                type="text"
                placeholder="Search by name, email, status..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-4 py-2.5 bg-sand border border-bordercolor rounded-full focus:outline-none focus:border-forest text-xs font-semibold"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-bordercolor text-textmuted uppercase tracking-widest cursor-pointer select-none">
                <th className="py-3 hover:text-forest" onClick={() => handleSort('username')}>Investor <SortIndicator field="username" /></th>
                <th className="py-3 hover:text-forest" onClick={() => handleSort('role')}>Role <SortIndicator field="role" /></th>
                <th className="py-3 hover:text-forest" onClick={() => handleSort('status')}>Status <SortIndicator field="status" /></th>
                <th className="py-3 hover:text-forest" onClick={() => handleSort('subscribed_reports')}>Reports Sub <SortIndicator field="subscribed_reports" /></th>
                <th className="py-3 hover:text-forest" onClick={() => handleSort('subscribed_portfolio')}>Portfolio Sub <SortIndicator field="subscribed_portfolio" /></th>
                <th className="py-3 text-right cursor-default">Actions</th>
              </tr>
            </thead>
            <tbody className="font-semibold">
              {paginatedInvestors.map((inv) => (
                <tr key={inv.id} className="border-b border-bordercolor/40">
                  <td className="py-4">
                    <Link to={`/admin/investors/${inv.id}`} className="block font-bold text-forest hover:underline">
                      {inv.username || 'Google Account'}
                    </Link>
                    <span className="text-[10px] text-textmuted font-normal">{inv.email}</span>
                  </td>
                  <td className="py-4 capitalize">{inv.role}</td>
                  <td className="py-4">
                    <span className={`px-2 py-0.5 rounded uppercase text-[10px] ${inv.status === 'active' ? 'bg-green-100 text-green-800' : inv.status === 'disabled' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-4">{inv.subscribed_reports ? '✅ Yes' : '❌ No'}</td>
                  <td className="py-4">{inv.subscribed_portfolio ? '✅ Yes' : '❌ No'}</td>
                  <td className="py-4 text-right relative">
                    {inv.role === 'admin' ? (
                      <span className="text-[10px] text-textmuted uppercase tracking-wider italic">System Protected</span>
                    ) : (
                      <div className="inline-block text-left relative">
                        <button
                          onClick={() => setActiveDropdownId(activeDropdownId === inv.id ? null : inv.id)}
                          className="text-textmuted hover:text-forest p-1 rounded-full hover:bg-sand transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        
                        {activeDropdownId === inv.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setActiveDropdownId(null)}></div>
                            
                            <div className="absolute right-0 mt-2 w-36 rounded-2xl bg-white border border-bordercolor shadow-xl z-20 overflow-hidden text-left py-1">
                              <button
                                onClick={() => {
                                  handleInvestorStatus(inv.id, 'active');
                                  setActiveDropdownId(null);
                                }}
                                className="w-full px-4 py-3 text-xs font-semibold text-green-700 hover:bg-green-50/50 transition-colors flex items-center gap-2"
                              >
                                <span className="w-2 h-2 rounded-full bg-green-600"></span>
                                Activate
                              </button>
                              <button
                                onClick={() => {
                                  handleInvestorStatus(inv.id, 'disabled');
                                  setActiveDropdownId(null);
                                }}
                                className="w-full px-4 py-3 text-xs font-semibold text-yellow-700 hover:bg-yellow-50/50 transition-colors flex items-center gap-2"
                              >
                                <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                                Disable
                              </button>
                              <button
                                onClick={() => {
                                  handleInvestorStatus(inv.id, 'blacklisted');
                                  setActiveDropdownId(null);
                                }}
                                className="w-full px-4 py-3 text-xs font-semibold text-red-700 hover:bg-red-50/50 transition-colors flex items-center gap-2"
                              >
                                <span className="w-2 h-2 rounded-full bg-red-600"></span>
                                Blacklist
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {paginatedInvestors.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-textmuted font-medium">
                    No investors matched your search query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-between items-center text-xs font-bold uppercase tracking-wider text-textmuted">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="bg-transparent border border-bordercolor px-4 py-2.5 rounded-full hover:bg-sand transition-colors disabled:opacity-40"
            >
              Previous
            </button>
            <span>Page {currentPage} of {totalPages}</span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="bg-transparent border border-bordercolor px-4 py-2.5 rounded-full hover:bg-sand transition-colors disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Floating Notifications */}
      {notification && (
        <div className="pointer-events-none fixed inset-0 flex items-end px-4 py-6 sm:items-start sm:p-6 z-50 justify-end">
          <div className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-2xl bg-white border border-bordercolor shadow-lg ring-1 ring-black ring-opacity-5">
            <div className="p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {notification.type === 'success' ? (
                    <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                    </svg>
                  )}
                </div>
                <div className="ml-3 w-0 flex-1 pt-0.5">
                  <p className="text-xs font-bold text-forest uppercase tracking-wider">{notification.title}</p>
                  <p className="mt-1 text-sm text-textmuted">{notification.message}</p>
                </div>
                <div className="ml-4 flex flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setNotification(null)}
                    className="inline-flex rounded-md bg-white text-textmuted hover:text-forest focus:outline-none"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
