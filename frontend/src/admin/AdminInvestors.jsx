import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MoreVertical, Users, FileText, Briefcase } from 'lucide-react';

export default function AdminInvestors() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const [investors, setInvestors] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (!token || role !== 'admin') {
      navigate('/login');
      return;
    }
    fetchInvestors();
  }, [token, page]);

  const fetchInvestors = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/admin/investors?page=${page}&limit=5`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setInvestors(data.items || []);
      setTotalPages(data.pages || 1);
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

  return (
    <div className="pt-32 pb-24 px-6 max-w-6xl mx-auto min-h-[90vh]">
      {/* Admin Menu Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-bordercolor pb-6 mb-8 gap-4">
        <h1 className="text-4xl font-extrabold text-forest">Admin Console</h1>
        <div className="flex bg-[#EDEEE9]/50 p-1.5 rounded-full border border-bordercolor text-xs font-bold uppercase tracking-widest text-textmuted gap-2">
          <Link to="/admin/investors" className="flex items-center gap-1.5 bg-forest text-[#FAF9F6] px-5 py-2.5 rounded-full shadow-sm">
            <Users className="w-3.5 h-3.5" /> Investors
          </Link>
          <Link to="/admin/reports" className="flex items-center gap-1.5 hover:text-forest px-5 py-2.5 rounded-full transition-all">
            <FileText className="w-3.5 h-3.5" /> Reports
          </Link>
          <Link to="/admin/portfolio" className="flex items-center gap-1.5 hover:text-forest px-5 py-2.5 rounded-full transition-all">
            <Briefcase className="w-3.5 h-3.5" /> Portfolio
          </Link>
        </div>
      </div>

      {/* Main Directory Table */}
      <div className="bg-white border border-bordercolor p-8 rounded-3xl shadow-sm">
        <h2 className="text-2xl font-bold mb-6 text-forest">Investor Directory</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-bordercolor text-textmuted uppercase tracking-widest">
                <th className="py-3">Investor</th>
                <th className="py-3">Role</th>
                <th className="py-3">Status</th>
                <th className="py-3">Reports Sub</th>
                <th className="py-3">Portfolio Sub</th>
                <th className="py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="font-semibold">
              {investors.map((inv) => (
                <tr key={inv.id} className="border-b border-bordercolor/40">
                  <td className="py-4">
                    <span className="block font-bold text-forest">{inv.username || 'Google Account'}</span>
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
            </tbody>
          </table>
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
