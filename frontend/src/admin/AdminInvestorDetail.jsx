import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Users, FileText, Briefcase, Settings, ArrowLeft, ShieldAlert, Award, Calendar, Check, X } from 'lucide-react';

export default function AdminInvestorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const [investor, setInvestor] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ show: false, status: '', title: '', message: '' });

  // Admin inline profile edit states
  const [isEditing, setIsEditing] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail] = useState('');

  useEffect(() => {
    if (!token || role !== 'admin') {
      navigate('/login');
      return;
    }
    fetchInvestorDetails();
    fetchInvestorActivities();
  }, [id, token]);

  const showToast = (title, message, type = 'success') => {
    setNotification({ title, message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchInvestorDetails = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/admin/investors/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setInvestor(data);
        setEditUsername(data.username);
        setEditEmail(data.email);
      } else {
        showToast("Error", "Failed to retrieve investor details", "error");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchInvestorActivities = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/admin/investors/${id}/activities`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setActivities(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const updateInvestorStatus = async (status) => {
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
        showToast("Success", `Investor status updated to ${status}`, "success");
        fetchInvestorDetails();
      } else {
        const data = await res.json();
        showToast("Error", data.detail || "Failed to update status", "error");
      }
    } catch (e) {
      showToast("Error", e.message, "error");
    }
  };

  const handleSaveProfile = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/admin/investors/${id}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username: editUsername, email: editEmail })
      });
      if (res.ok) {
        showToast("Success", "Investor details updated successfully", "success");
        setIsEditing(false);
        fetchInvestorDetails();
        fetchInvestorActivities();
      } else {
        const data = await res.json();
        showToast("Error", data.detail || "Failed to update details", "error");
      }
    } catch (e) {
      showToast("Error", e.message, "error");
    }
  };

  const handleToggleSubscription = async (serviceType, currentActive) => {
    try {
      const res = await fetch(`http://localhost:8000/api/admin/investors/${id}/subscriptions`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ service_type: serviceType, active: !currentActive })
      });
      if (res.ok) {
        showToast("Success", "Subscription status updated", "success");
        fetchInvestorDetails();
        fetchInvestorActivities();
      } else {
        const data = await res.json();
        showToast("Error", data.detail || "Failed to update subscription", "error");
      }
    } catch (e) {
      showToast("Error", e.message, "error");
    }
  };

  // Group activities by date
  const groupActivitiesByDate = (activityList) => {
    const groups = {};
    activityList.forEach(act => {
      const dateStr = new Date(act.timestamp).toDateString();
      
      // Determine label: Today, Yesterday, or formatted date
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      
      let label = dateStr;
      if (dateStr === today) {
        label = "Today";
      } else if (dateStr === yesterday) {
        label = "Yesterday";
      } else {
        const dateObj = new Date(act.timestamp);
        label = dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      }

      if (!groups[label]) {
        groups[label] = [];
      }
      groups[label].push(act);
    });
    return groups;
  };

  if (loading) {
    return (
      <div className="pt-32 pb-24 px-6 max-w-6xl mx-auto text-center min-h-[90vh] flex items-center justify-center">
        <div className="text-forest text-sm font-bold uppercase tracking-widest animate-pulse">Loading Profile...</div>
      </div>
    );
  }

  if (!investor) {
    return (
      <div className="pt-32 pb-24 px-6 max-w-6xl mx-auto text-center min-h-[90vh] flex flex-col items-center justify-center gap-4">
        <div className="text-red-600 text-sm font-bold uppercase tracking-widest">Investor Profile Not Found</div>
        <Link to="/admin/investors" className="text-xs font-bold uppercase tracking-widest text-forest hover:underline">Back to Directory</Link>
      </div>
    );
  }

  const groupedActivities = groupActivitiesByDate(activities);

  return (
    <div className="pt-32 pb-24 px-6 max-w-6xl mx-auto min-h-[90vh]">
      {/* Back button and title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-bordercolor pb-6 mb-8 gap-4">
        <div>
          <Link to="/admin/investors" className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-textmuted hover:text-forest transition-colors mb-2">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Investors
          </Link>
          <h1 className="text-4xl font-extrabold text-forest">Investor Profile</h1>
        </div>
        
        {/* Navigation tabs */}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Profile Card & Subscriptions */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Main Info Card */}
          <div className="bg-white border border-bordercolor p-6 rounded-3xl shadow-sm text-center">
            <div className="w-16 h-16 rounded-full bg-forest/10 text-forest flex items-center justify-center text-xl font-bold mx-auto mb-4 border border-forest/20">
              {investor.username.substring(0, 2).toUpperCase()}
            </div>
            
            {isEditing ? (
              <div className="space-y-3 mb-4 text-left">
                <div>
                  <label className="text-[10px] font-extrabold uppercase tracking-widest text-textmuted">Username</label>
                  <input
                    type="text"
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    className="w-full px-3 py-2 bg-sand border border-bordercolor rounded-xl text-xs font-semibold focus:outline-none focus:border-forest mt-1"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-extrabold uppercase tracking-widest text-textmuted">Email Address</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-sand border border-bordercolor rounded-xl text-xs font-semibold focus:outline-none focus:border-forest mt-1"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleSaveProfile}
                    className="flex-1 bg-forest text-white py-2 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-forest-hover transition-all"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditUsername(investor.username);
                      setEditEmail(investor.email);
                    }}
                    className="flex-1 bg-transparent border border-bordercolor text-textmuted py-2 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-sand transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold text-forest mb-1">{investor.username}</h2>
                <p className="text-xs text-textmuted mb-4">{investor.email}</p>
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-[10px] font-bold text-forest uppercase tracking-widest hover:underline mb-4 block mx-auto"
                >
                  Edit Profile Details
                </button>
              </>
            )}

            <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
              investor.status === 'active' ? 'bg-green-100 text-green-800' :
              investor.status === 'disabled' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
            }`}>
              {investor.status}
            </span>

            <div className="border-t border-bordercolor/65 my-6 pt-4 flex justify-between items-center text-left text-xs font-semibold">
              <span className="text-textmuted flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Registered:</span>
              <span className="text-forest font-bold">{new Date(investor.created_at).toLocaleDateString()}</span>
            </div>

            {/* Quick Status Control Buttons */}
            <div className="space-y-2 mt-6">
              <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-textmuted text-left mb-2 px-1">Enterprise Actions</h4>
              
              {investor.status !== 'active' && (
                <button
                  onClick={() => updateInvestorStatus('active')}
                  className="w-full bg-[#FAF9F6] border border-bordercolor text-green-700 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-green-50 transition-all flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" /> Activate Account
                </button>
              )}
              {investor.status !== 'disabled' && (
                <button
                  onClick={() => updateInvestorStatus('disabled')}
                  className="w-full bg-[#FAF9F6] border border-bordercolor text-yellow-700 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-yellow-50 transition-all flex items-center justify-center gap-1.5"
                >
                  <X className="w-4 h-4" /> Disable Account
                </button>
              )}
              {investor.status !== 'blacklisted' && (
                <button
                  onClick={() => {
                    setConfirmModal({
                      show: true,
                      status: 'blacklisted',
                      title: 'Confirm Blacklist',
                      message: `Are you sure you want to blacklist ${investor.username}? This will block all logins instantly.`
                    });
                  }}
                  className="w-full bg-red-600 text-white py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-red-700 transition-all flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <ShieldAlert className="w-4 h-4" /> Blacklist User
                </button>
              )}
            </div>
          </div>

          {/* Subscriptions Card */}
          <div className="bg-white border border-bordercolor p-6 rounded-3xl shadow-sm">
            <h3 className="text-sm font-bold text-forest uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-forest" /> Services Access
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-sand rounded-2xl border border-bordercolor/50">
                <div>
                  <h4 className="text-xs font-bold text-forest">Research Reports</h4>
                  <p className="text-[9px] text-textmuted">SEBI advisory bulletins</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${investor.subscribed_reports ? 'bg-green-100 text-green-800' : 'bg-red-50 text-red-600'}`}>
                    {investor.subscribed_reports ? 'Subscribed' : 'Inactive'}
                  </span>
                  <button
                    onClick={() => handleToggleSubscription('reports', investor.subscribed_reports)}
                    className="px-2.5 py-1 bg-white border border-bordercolor rounded-xl text-[9px] font-extrabold uppercase hover:bg-forest hover:text-[#FAF9F6] transition-all"
                  >
                    {investor.subscribed_reports ? 'Disable' : 'Enable'}
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center p-3 bg-sand rounded-2xl border border-bordercolor/50">
                <div>
                  <h4 className="text-xs font-bold text-forest">Model Portfolio</h4>
                  <p className="text-[9px] text-textmuted">Stock weights & types</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${investor.subscribed_portfolio ? 'bg-green-100 text-green-800' : 'bg-red-50 text-red-600'}`}>
                    {investor.subscribed_portfolio ? 'Subscribed' : 'Inactive'}
                  </span>
                  <button
                    onClick={() => handleToggleSubscription('portfolio', investor.subscribed_portfolio)}
                    className="px-2.5 py-1 bg-white border border-bordercolor rounded-xl text-[9px] font-extrabold uppercase hover:bg-forest hover:text-[#FAF9F6] transition-all"
                  >
                    {investor.subscribed_portfolio ? 'Disable' : 'Enable'}
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Detailed Activity Timeline */}
        <div className="lg:col-span-2 bg-white border border-bordercolor p-8 rounded-3xl shadow-sm min-h-[500px]">
          <h3 className="text-2xl font-bold text-forest mb-6">Activity stream</h3>
          
          {activities.length === 0 ? (
            <div className="text-center py-20 text-textmuted font-medium text-xs">
              No actions have been recorded for this investor yet.
            </div>
          ) : (
            <div className="space-y-8 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-bordercolor/55">
              {Object.keys(groupedActivities).map((dayLabel) => (
                <div key={dayLabel} className="space-y-4">
                  {/* Group Header */}
                  <h4 className="text-xs font-extrabold text-forest uppercase tracking-widest bg-sand border border-bordercolor/80 py-1.5 px-4 rounded-full inline-block relative z-10">
                    {dayLabel}
                  </h4>
                  
                  {/* Activities under this day */}
                  <div className="space-y-3 pl-8">
                    {groupedActivities[dayLabel].map((act) => (
                      <div key={act.id} className="relative before:absolute before:-left-8 before:top-1.5 before:w-2 before:h-2 before:rounded-full before:bg-forest before:ring-4 before:ring-forest/15">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <span className="text-xs font-bold text-forest capitalize">
                              {act.action.replace(/_/g, ' ')}
                            </span>
                            <p className="text-xs text-textmuted mt-0.5 font-semibold">{act.description}</p>
                          </div>
                          <span className="text-[10px] text-textmuted shrink-0 font-medium mt-0.5">
                            {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
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

      {/* Confirmation Modal */}
      {confirmModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white border border-bordercolor p-8 rounded-3xl w-full max-w-sm shadow-xl text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-100">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-forest mb-2">{confirmModal.title}</h3>
            <p className="text-xs text-textmuted mb-6">{confirmModal.message}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setConfirmModal({ show: false, status: '', title: '', message: '' })}
                className="px-5 py-2.5 bg-transparent border border-bordercolor text-textmuted rounded-full text-xs font-bold uppercase tracking-wider hover:bg-sand transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  updateInvestorStatus(confirmModal.status);
                  setConfirmModal({ show: false, status: '', title: '', message: '' });
                }}
                className="px-5 py-2.5 bg-red-600 text-white rounded-full text-xs font-bold uppercase tracking-wider hover:bg-red-700 shadow-md transition-all"
              >
                Blacklist
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
