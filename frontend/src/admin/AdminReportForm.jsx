import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Users, FileText, Briefcase, ArrowLeft } from 'lucide-react';
import { API_BASE_URL } from '../config/apiConfig';

export default function AdminReportForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('published');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (!token || role !== 'admin') {
      navigate('/login');
      return;
    }
    if (id) {
      fetchReport();
    }
  }, [token, id]);

  const fetchReport = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/reports?limit=100`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      const report = data.items.find(r => r.id === id);
      if (report) {
        setTitle(report.title);
        setContent(report.content);
        setStatus(report.status);
      } else {
        showToast("Error", "Report not found.", "error");
      }
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
    setLoading(true);
    const url = id ? `${API_BASE_URL}/api/reports/${id}` : `${API_BASE_URL}/api/reports`;
    const method = id ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, content, status })
      });
      if (res.ok) {
        showToast("Report Saved", `Report has been successfully ${id ? 'updated' : 'published'}.`, "success");
        setTimeout(() => navigate('/admin/reports'), 1500);
      } else {
        const d = await res.json();
        showToast("Save Failed", d.detail, "error");
      }
    } catch (err) {
      showToast("Error", err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-32 pb-24 px-6 max-w-2xl mx-auto min-h-[90vh]">
      {/* Back to List */}
      <Link to="/admin/reports" className="inline-flex items-center gap-2 text-forest hover:underline font-bold text-xs uppercase tracking-widest mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Reports
      </Link>

      <div className="bg-white border border-bordercolor p-8 rounded-3xl shadow-sm">
        <h3 className="text-2xl font-extrabold mb-6 text-forest">{id ? 'Edit Research Report' : 'Create Research Report'}</h3>
        
        <form onSubmit={handleSaveReport} className="space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-textmuted mb-2">Title</label>
            <input
              type="text"
              required
              placeholder="Enter report title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-sand border border-bordercolor rounded-xl focus:outline-none focus:border-forest text-sm font-semibold"
            />
          </div>
          
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-textmuted mb-2">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-3 bg-sand border border-bordercolor rounded-xl focus:outline-none focus:border-forest text-sm font-bold"
            >
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-textmuted mb-2">Content</label>
            <textarea
              required
              rows="10"
              placeholder="Write report contents here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-3 bg-sand border border-bordercolor rounded-xl focus:outline-none focus:border-forest text-sm font-medium"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-forest text-white py-4 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-forest-hover transition-all disabled:opacity-50"
          >
            {loading ? 'Saving...' : id ? 'Update Report' : 'Publish Report'}
          </button>
        </form>
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
