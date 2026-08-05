import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Users, FileText, Briefcase } from 'lucide-react';

export default function AdminReports() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const [reports, setReports] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [reportForm, setReportForm] = useState({ id: '', title: '', content: '' });
  const [notification, setNotification] = useState(null);

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
    if (!window.confirm("Are you sure you want to delete this report?")) return;
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
                  <div>
                    <h4 className="font-bold text-forest text-base mb-1">{report.title}</h4>
                    <p className="text-xs text-textmuted mb-2 line-clamp-2">{report.content}</p>
                    <span className="text-[10px] text-textmuted font-semibold">Published: {new Date(report.published_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => setReportForm(report)}
                      className="bg-transparent border border-bordercolor text-forest px-3 py-1 rounded text-[10px] font-bold uppercase hover:bg-sage/20 transition-all"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteReport(report.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded text-[10px] font-bold uppercase hover:bg-red-700 transition-all"
                    >
                      Delete
                    </button>
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
    </div>
  );
}
