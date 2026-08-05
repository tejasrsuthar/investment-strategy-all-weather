import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Users, FileText, Briefcase, MoreVertical } from 'lucide-react';

export default function AdminReports() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const [reports, setReports] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [reportForm, setReportForm] = useState({ id: '', title: '', content: '' });
  const [notification, setNotification] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ show: false, message: '', onConfirm: null });

  useEffect(() => {
    if (!token || role !== 'admin') {
      navigate('/login');
      return;
    }
    fetchReports();
  }, [token, page]);

  const fetchReports = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/reports?page=${page}&limit=5`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setReports(data.items || []);
      setTotalPages(data.pages || 1);
    } catch (e) {
      console.error(e);
    }
  };

  const showToast = (title, message, type = 'success') => {
    setNotification({ title, message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSaveReport = async (e) => {
    e.preventDefault();
    const url = reportForm.id ? `http://localhost:8000/api/reports/${reportForm.id}` : 'http://localhost:8000/api/reports';
    const method = reportForm.id ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title: reportForm.title, content: reportForm.content })
      });
      if (res.ok) {
        showToast("Report Saved", `Report has been successfully ${reportForm.id ? 'updated' : 'published'}.`, "success");
        setReportForm({ id: '', title: '', content: '' });
        fetchReports();
      } else {
        const d = await res.json();
        showToast("Save Failed", d.detail, "error");
      }
    } catch (err) {
      showToast("Error", err.message, "error");
    }
  };

  const handleDeleteReport = async (id) => {
    try {
      const res = await fetch(`http://localhost:8000/api/reports/${id}`, {
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
  const handleReportStatus = async (id, status) => {
    try {
      const res = await fetch(`http://localhost:8000/api/reports/${id}/status`, {
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

  return (
    <div className="pt-32 pb-24 px-6 max-w-6xl mx-auto min-h-[90vh]">
      {/* Admin Menu Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-bordercolor pb-6 mb-8 gap-4">
        <h1 className="text-4xl font-extrabold text-forest">Admin Console</h1>
        <div className="flex bg-[#EDEEE9]/50 p-1.5 rounded-full border border-bordercolor text-xs font-bold uppercase tracking-widest text-textmuted gap-2">
          <Link to="/admin/investors" className="flex items-center gap-1.5 hover:text-forest px-5 py-2.5 rounded-full transition-all">
            <Users className="w-3.5 h-3.5" /> Investors
          </Link>
          <Link to="/admin/reports" className="flex items-center gap-1.5 bg-forest text-[#FAF9F6] px-5 py-2.5 rounded-full shadow-sm">
            <FileText className="w-3.5 h-3.5" /> Reports
          </Link>
          <Link to="/admin/portfolio" className="flex items-center gap-1.5 hover:text-forest px-5 py-2.5 rounded-full transition-all">
            <Briefcase className="w-3.5 h-3.5" /> Portfolio
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white border border-bordercolor p-8 rounded-3xl shadow-sm flex flex-col justify-between min-h-[500px]">
          <div>
            <h2 className="text-2xl font-bold mb-6 text-forest">Published Reports</h2>
            <div className="space-y-4">
              {reports.map((report) => (
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
                                setReportForm(report);
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
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-between items-center text-xs font-bold uppercase tracking-wider text-textmuted">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="bg-transparent border border-bordercolor px-4 py-2.5 rounded-full hover:bg-sand transition-colors disabled:opacity-40"
              >
                Previous
              </button>
              <span>Page {page} of {totalPages}</span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="bg-transparent border border-bordercolor px-4 py-2.5 rounded-full hover:bg-sand transition-colors disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Create/Edit Form Card */}
        <div className="bg-white border border-bordercolor p-8 rounded-3xl shadow-sm h-fit">
          <h3 className="text-xl font-bold mb-6 text-forest">{reportForm.id ? 'Edit Report' : 'Create Report'}</h3>
          <form onSubmit={handleSaveReport} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-textmuted mb-1">Title</label>
              <input
                type="text"
                required
                value={reportForm.title}
                onChange={(e) => setReportForm({ ...reportForm, title: e.target.value })}
                className="w-full px-4 py-3 bg-sand border border-bordercolor rounded-xl focus:outline-none focus:border-forest text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-textmuted mb-1">Content</label>
              <textarea
                required
                rows="5"
                value={reportForm.content}
                onChange={(e) => setReportForm({ ...reportForm, content: e.target.value })}
                className="w-full px-4 py-3 bg-sand border border-bordercolor rounded-xl focus:outline-none focus:border-forest text-xs"
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full btn-forest text-white py-4 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-forest-hover transition-all"
            >
              {reportForm.id ? 'Update Report' : 'Publish Report'}
            </button>
            {reportForm.id && (
              <button
                type="button"
                onClick={() => setReportForm({ id: '', title: '', content: '' })}
                className="w-full bg-transparent text-textmuted py-2 text-xs font-bold uppercase hover:underline"
              >
                Cancel
              </button>
            )}
          </form>
        </div>
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
