import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Users, KeyRound, UserCheck, UserX, Trash2, Edit3 } from 'lucide-react';
import { API_BASE_URL } from '../../config/apiConfig';

export default function InvestorUsersManager() {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Modals
  const [pwdModalUser, setPwdModalUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');

  const [editModalUser, setEditModalUser] = useState(null);
  const [editUsername, setEditUsername] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/investors?page=${page}&limit=10`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.items || []);
        setPages(data.pages || 1);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === 'active' ? 'disabled' : 'active';
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/investors/${user.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        toast.success(`Investor ${user.username} account set to ${newStatus.toUpperCase()}`);
        fetchUsers();
      }
    } catch (e) {
      toast.error('Failed to update investor account status');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setPwdError('');
    setPwdSuccess('');

    if (newPassword.length < 7 || !/[!@#$%]/.test(newPassword)) {
      setPwdError('Password must be at least 7 characters long and contain a special character (!@#$%)');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/investors/${pwdModalUser.id}/reset-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ new_password: newPassword })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Password reset failed');
      }

      setPwdSuccess('Password reset successfully!');
      setNewPassword('');
      setTimeout(() => setPwdModalUser(null), 1500);
    } catch (err) {
      setPwdError(err.message);
    }
  };

  const handleUpdateUsername = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/investors/${editModalUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username: editUsername })
      });

      if (res.ok) {
        setEditModalUser(null);
        fetchUsers();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Delete investor user account permanently?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/investors/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchUsers();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-2xs">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-gray-500" /> Investor Account Management
          </h2>
          <p className="text-xs text-gray-500 mt-1">Enable/disable accounts, reset passwords, and edit usernames</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-xs text-gray-500">Loading investor accounts...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-200 text-gray-400 font-bold uppercase tracking-wider">
                <th className="py-3">Username</th>
                <th className="py-3">Email</th>
                <th className="py-3">Role</th>
                <th className="py-3">Status</th>
                <th className="py-3">Registered Date</th>
                <th className="py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50/50">
                  <td className="py-3.5 font-bold text-gray-900">{u.username}</td>
                  <td className="py-3.5 font-medium text-gray-600">{u.email}</td>
                  <td className="py-3.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-gray-100 text-gray-700">
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      u.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
                    }`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="py-3.5 text-gray-400">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="py-3.5 text-right space-x-1">
                    <button
                      onClick={() => handleToggleStatus(u)}
                      title={u.status === 'active' ? 'Disable User' : 'Enable User'}
                      className={`p-1.5 rounded-lg ${u.status === 'active' ? 'hover:bg-amber-50 text-amber-600' : 'hover:bg-emerald-50 text-emerald-600'}`}
                    >
                      {u.status === 'active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => {
                        setPwdModalUser(u);
                        setNewPassword('');
                        setPwdError('');
                        setPwdSuccess('');
                      }}
                      title="Reset Password"
                      className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600"
                    >
                      <KeyRound className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setEditModalUser(u);
                        setEditUsername(u.username);
                      }}
                      title="Edit Username"
                      className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(u.id)}
                      title="Delete User"
                      className="p-1.5 hover:bg-red-50 rounded-lg text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Password Reset Modal */}
      {pwdModalUser && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm border border-gray-200 shadow-xl">
            <h3 className="text-base font-bold text-gray-900 mb-2">Reset Password for {pwdModalUser.username}</h3>
            {pwdError && <div className="p-3 mb-3 bg-red-50 text-red-600 text-xs rounded-xl">{pwdError}</div>}
            {pwdSuccess && <div className="p-3 mb-3 bg-emerald-50 text-emerald-700 text-xs rounded-xl">{pwdSuccess}</div>}
            <form onSubmit={handleResetPassword} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">New Password</label>
                <input
                  type="password"
                  required
                  placeholder="Min 7 chars with !@#$%"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPwdModalUser(null)}
                  className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-bold text-white bg-gray-900 hover:bg-black rounded-xl"
                >
                  Reset Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Username Modal */}
      {editModalUser && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm border border-gray-200 shadow-xl">
            <h3 className="text-base font-bold text-gray-900 mb-2">Edit Username</h3>
            <form onSubmit={handleUpdateUsername} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Username</label>
                <input
                  type="text"
                  required
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditModalUser(null)}
                  className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-bold text-white bg-gray-900 hover:bg-black rounded-xl"
                >
                  Save Username
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
