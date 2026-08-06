import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Users, FileText, Briefcase, MoreVertical, Plus, ArrowUp, ArrowDown, Search, Settings } from 'lucide-react';
import { API_BASE_URL } from '../config/apiConfig';

export default function AdminReports() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const [reports, setReports] = useState([]);
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [notification, setNotification] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ show: false, message: '', onConfirm: null });

  // Search and Sort State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('all');
  const [sortField, setSortField] = useState('published_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    if (!token || role !== 'admin') {
      navigate('/login');
      return;
    }
    fetchReports();
  }, [token]);

  const fetchReports = async () => {
    try {
      // Fetch up to 1000 reports to support client-side search & sorting
      const res = await fetch(`${API_BASE_URL}/api/reports?page=1&limit=1000`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setReports(data.items || []);
    } catch (e) {
      console.error(e);
    }
  };

  const showToast = (title, message, type = 'success') => {
    setNotification({ title, message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleReportStatus = async (id, status) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/reports/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        showToast("Status Updated", `Report status changed to ${status}.`, "success");
        fetchReports();
      } else {
        const d = await res.json();
        showToast("Update Failed", d.detail, "error");
      }
    } catch (err) {
      showToast("Error", err.message, "error");
    }
  };

  const handleDeleteReport = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/reports/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showToast("Deleted", "Report has been permanently deleted.", "success");
        fetchReports();
      } else {
        const d = await res.json();
        showToast("Delete Failed", d.detail, "error");
      }
    } catch (e) {
      showToast("Error", e.message, "error");
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
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
    new Set(reports.map(rep => getDateLabel(rep.published_at)).filter(Boolean))
  );

  // Filtering
  const filteredReports = reports.filter(rep => {
    const query = searchQuery.toLowerCase();
    const dateLabel = getDateLabel(rep.published_at);

    const matchesSearch = (
      rep.title.toLowerCase().includes(query) ||
      rep.content.toLowerCase().includes(query) ||
      rep.status.toLowerCase().includes(query)
    );

    const matchesDate = selectedDate === 'all' || dateLabel === selectedDate;
    return matchesSearch && matchesDate;
  });

  // Sorting
  const sortedReports = [...filteredReports].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];

    aVal = (aVal || '').toString().toLowerCase();
    bVal = (bVal || '').toString().toLowerCase();

    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedReports.length / itemsPerPage);
  const paginatedReports = sortedReports.slice(
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
          <Link to="/admin/investors" className="flex items-center gap-1.5 hover:text-forest px-5 py-2.5 rounded-full transition-all">
            <Users className="w-3.5 h-3.5" /> Investors
          </Link>
          <Link to="/admin/reports" className="flex items-center gap-1.5 bg-forest text-[#FAF9F6] px-5 py-2.5 rounded-full shadow-sm">
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

      <div className="bg-white border border-bordercolor p-8 rounded-3xl shadow-sm flex flex-col justify-between min-h-[500px]">
        <div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold text-forest">Research Reports</h2>
              {/* Sorting triggers */}
              <div className="flex gap-2 text-[10px] font-bold uppercase tracking-wider text-textmuted select-none">
                <span className="cursor-pointer hover:text-forest" onClick={() => handleSort('title')}>
                  Sort Title <SortIndicator field="title" />
                </span>
                <span>•</span>
                <span className="cursor-pointer hover:text-forest" onClick={() => handleSort('published_at')}>
                  Sort Date <SortIndicator field="published_at" />
                </span>
                <span>•</span>
                <span className="cursor-pointer hover:text-forest" onClick={() => handleSort('status')}>
                  Sort Status <SortIndicator field="status" />
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-center">
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
              <div className="relative w-full md:w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textmuted" />
                <input
                  type="text"
                  placeholder="Search reports..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-9 pr-4 py-2 bg-sand border border-bordercolor rounded-full focus:outline-none focus:border-forest text-xs font-semibold"
                />
              </div>

              <Link to="/admin/reports/create" className="btn-forest text-[#FAF9F6] text-xs font-bold uppercase tracking-widest px-5 py-2 rounded-full shadow-md flex items-center gap-1 hover:bg-forest-hover transition-all whitespace-nowrap">
                <Plus className="w-4 h-4" /> Create Report
              </Link>
            </div>
          </div>
          
          <div className="space-y-4">
            {paginatedReports.map((report) => (
              <div key={report.id} className="p-4 bg-sand border border-bordercolor rounded-2xl flex justify-between items-start">
                <div className="flex-grow pr-4">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h4 className="font-bold text-forest text-base">{report.title}</h4>
                    <span className={`px-2 py-0.5 rounded-full uppercase text-[8px] font-extrabold tracking-wider ${
                      report.status === 'published' ? 'bg-green-100 text-green-800' :
                      report.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-150 text-gray-600'
                    }`}>
                      {report.status}
                    </span>
                  </div>
                  <p className="text-xs text-textmuted mb-2 line-clamp-2">{report.content}</p>
                  <span className="text-[10px] text-textmuted font-semibold">Published: {new Date(report.published_at).toLocaleDateString()}</span>
                </div>
                <div className="relative flex shrink-0">
                  <div className="inline-block text-left relative">
                    <button
                      onClick={() => setActiveDropdownId(activeDropdownId === report.id ? null : report.id)}
                      className="text-textmuted hover:text-forest p-1 rounded-full hover:bg-sand/80 transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    
                    {activeDropdownId === report.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setActiveDropdownId(null)}></div>
                        
                        <div className="absolute right-0 mt-2 w-36 rounded-2xl bg-white border border-bordercolor shadow-xl z-20 overflow-hidden text-left py-1">
                          <button
                            onClick={() => {
                              navigate(`/admin/reports/edit/${report.id}`);
                              setActiveDropdownId(null);
                            }}
                            className="w-full px-4 py-2.5 text-xs font-semibold text-forest hover:bg-sand transition-colors text-left"
                          >
                            Edit Details
                          </button>
                          <button
                            onClick={() => {
                              handleReportStatus(report.id, 'published');
                              setActiveDropdownId(null);
                            }}
                            className="w-full px-4 py-2.5 text-xs font-semibold text-green-700 hover:bg-green-50/50 transition-colors flex items-center gap-2 text-left"
                          >
                            <span className="w-2 h-2 rounded-full bg-green-600"></span>
                            Publish
                          </button>
                          <button
                            onClick={() => {
                              handleReportStatus(report.id, 'draft');
                              setActiveDropdownId(null);
                            }}
                            className="w-full px-4 py-2.5 text-xs font-semibold text-yellow-700 hover:bg-yellow-50/50 transition-colors flex items-center gap-2 text-left"
                          >
                            <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                            Save Draft
                          </button>
                          <button
                            onClick={() => {
                              handleReportStatus(report.id, 'archived');
                              setActiveDropdownId(null);
                            }}
                            className="w-full px-4 py-2.5 text-xs font-semibold text-gray-600 hover:bg-sand transition-colors flex items-center gap-2 text-left"
                          >
                            <span className="w-2 h-2 rounded-full bg-gray-500"></span>
                            Archive
                          </button>
                          <button
                            onClick={() => {
                              setConfirmModal({
                                show: true,
                                message: "Are you sure you want to delete this research report? This action cannot be undone.",
                                onConfirm: () => {
                                  handleDeleteReport(report.id);
                                  setConfirmModal({ show: false, message: '', onConfirm: null });
                                }
                              });
                              setActiveDropdownId(null);
                            }}
                            className="w-full px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors border-t border-bordercolor/40 text-left"
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {paginatedReports.length === 0 && (
              <div className="py-8 text-center text-textmuted font-medium">
                No reports matched your search query.
              </div>
            )}
          </div>
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

      {/* React Frontend Confirmation Modal */}
      {confirmModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white border border-bordercolor p-8 rounded-3xl w-full max-w-sm shadow-xl text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-100 animate-pulse">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-forest mb-2">Confirm Delete</h3>
            <p className="text-xs text-textmuted mb-6">{confirmModal.message}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setConfirmModal({ show: false, message: '', onConfirm: null })}
                className="px-5 py-2.5 bg-transparent border border-bordercolor text-textmuted rounded-full text-xs font-bold uppercase tracking-wider hover:bg-sand transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmModal.onConfirm}
                className="px-5 py-2.5 bg-red-600 text-white rounded-full text-xs font-bold uppercase tracking-wider hover:bg-red-700 shadow-md transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
