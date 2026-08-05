import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Users, FileText, Briefcase, Settings, User as UserIcon, Shield, Sliders } from 'lucide-react';
import { z } from 'zod';

const profileSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters long." }),
  password: z.string().optional().or(z.literal('')),
});

export default function AdminSettings() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const [activeTab, setActiveTab] = useState('profile');
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Preference fields (mock / future settings)
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  
  // Security fields
  const [twoFactor, setTwoFactor] = useState(false);

  useEffect(() => {
    if (!token || role !== 'admin') {
      navigate('/login');
    }
  }, [token]);

  const showToast = (title, message, type = 'success') => {
    setNotification({ title, message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');

    const validationResult = profileSchema.safeParse({ username, password });
    if (!validationResult.success) {
      setError(validationResult.error.errors[0].message);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('http://localhost:8000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          username,
          password: password || undefined
        })
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('username', data.username);
        showToast("Success", "Profile updated successfully!", "success");
        setPassword('');
      } else {
        const data = await res.json();
        setError(data.detail || "Failed to update profile");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
          <Link to="/admin/reports" className="flex items-center gap-1.5 hover:text-forest px-5 py-2.5 rounded-full transition-all">
            <FileText className="w-3.5 h-3.5" /> Reports
          </Link>
          <Link to="/admin/portfolio" className="flex items-center gap-1.5 hover:text-forest px-5 py-2.5 rounded-full transition-all">
            <Briefcase className="w-3.5 h-3.5" /> Portfolio
          </Link>
          <Link to="/admin/settings" className="flex items-center gap-1.5 bg-forest text-[#FAF9F6] px-5 py-2.5 rounded-full shadow-sm">
            <Settings className="w-3.5 h-3.5" /> Settings
          </Link>
        </div>
      </div>

      <div className="bg-white border border-bordercolor rounded-3xl shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[500px]">
        {/* Sidebar tabs */}
        <div className="w-full md:w-64 bg-sand/30 border-r border-bordercolor/80 p-6 flex flex-col gap-2 shrink-0">
          <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-textmuted mb-4 px-3">System Settings</h3>
          
          <button
            onClick={() => { setActiveTab('profile'); setError(''); }}
            className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all text-left ${
              activeTab === 'profile' ? 'bg-forest text-white shadow-sm' : 'text-textmuted hover:bg-sand/65 hover:text-forest'
            }`}
          >
            <UserIcon className="w-4 h-4" /> Profile Settings
          </button>
          
          <button
            onClick={() => { setActiveTab('preferences'); setError(''); }}
            className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all text-left ${
              activeTab === 'preferences' ? 'bg-forest text-white shadow-sm' : 'text-textmuted hover:bg-sand/65 hover:text-forest'
            }`}
          >
            <Sliders className="w-4 h-4" /> Preferences
          </button>

          <button
            onClick={() => { setActiveTab('security'); setError(''); }}
            className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all text-left ${
              activeTab === 'security' ? 'bg-forest text-white shadow-sm' : 'text-textmuted hover:bg-sand/65 hover:text-forest'
            }`}
          >
            <Shield className="w-4 h-4" /> Security & API keys
          </button>
        </div>

        {/* Tab contents */}
        <div className="flex-grow p-8">
          {error && (
            <div className="p-4 mb-6 bg-red-50 text-red-600 rounded-xl text-xs border border-red-100 font-semibold max-w-lg">
              {error}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="max-w-lg">
              <h2 className="text-xl font-bold text-forest mb-1">Profile Settings</h2>
              <p className="text-xs text-textmuted mb-6">Modify login username and credential values</p>

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-textmuted mb-1">Username</label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-3 bg-sand border border-bordercolor rounded-xl focus:outline-none focus:border-forest text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-textmuted mb-1">New Password (Optional)</label>
                  <input
                    type="password"
                    placeholder="Leave blank to keep current password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-sand border border-bordercolor rounded-xl focus:outline-none focus:border-forest text-xs font-semibold"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-forest text-white px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-forest-hover transition-all disabled:opacity-50 mt-4 shadow-md"
                >
                  {loading ? 'Saving Changes...' : 'Save Settings'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="max-w-lg">
              <h2 className="text-xl font-bold text-forest mb-1">Preferences</h2>
              <p className="text-xs text-textmuted mb-6">Configure system defaults and console preferences</p>

              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-sand border border-bordercolor/60 rounded-2xl">
                  <div>
                    <h4 className="text-xs font-bold text-forest uppercase tracking-wider mb-0.5">Email Notifications</h4>
                    <p className="text-[10px] text-textmuted font-medium">Receive weekly system updates and registration alerts</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailNotifications}
                    onChange={(e) => {
                      setEmailNotifications(e.target.checked);
                      showToast("Preference Updated", `Email notifications ${e.target.checked ? 'enabled' : 'disabled'}.`);
                    }}
                    className="w-4 h-4 accent-forest cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-sand border border-bordercolor/60 rounded-2xl">
                  <div>
                    <h4 className="text-xs font-bold text-forest uppercase tracking-wider mb-0.5">Dark Mode (Experimental)</h4>
                    <p className="text-[10px] text-textmuted font-medium">Apply dark shades across administration control grids</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={darkMode}
                    onChange={(e) => {
                      setDarkMode(e.target.checked);
                      showToast("Theme Selected", `Console theme switched to ${e.target.checked ? 'Dark' : 'Light'} Mode.`);
                    }}
                    className="w-4 h-4 accent-forest cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="max-w-lg">
              <h2 className="text-xl font-bold text-forest mb-1">Security & API Keys</h2>
              <p className="text-xs text-textmuted mb-6">Manage system API keys and Multi-Factor security configurations</p>

              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-sand border border-bordercolor/60 rounded-2xl">
                  <div>
                    <h4 className="text-xs font-bold text-forest uppercase tracking-wider mb-0.5">Two-Factor Authentication (2FA)</h4>
                    <p className="text-[10px] text-textmuted font-medium">Protect the administration account using phone-based authenticator codes</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={twoFactor}
                    onChange={(e) => {
                      setTwoFactor(e.target.checked);
                      showToast("Security Updated", `2FA setup ${e.target.checked ? 'initiated' : 'deactivated'}.`);
                    }}
                    className="w-4 h-4 accent-forest cursor-pointer"
                  />
                </div>

                <div className="p-4 border border-bordercolor rounded-2xl space-y-3">
                  <h4 className="text-xs font-bold text-forest uppercase tracking-wider">Access Token</h4>
                  <div className="p-3 bg-sand rounded-xl border border-bordercolor text-[10px] font-mono select-all overflow-x-auto whitespace-pre-wrap break-all text-textmuted">
                    {token.substring(0, 45)}...
                  </div>
                  <p className="text-[9px] text-textmuted font-semibold">Keep this token highly secure. It yields full administrative access rights.</p>
                </div>
              </div>
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
    </div>
  );
}
