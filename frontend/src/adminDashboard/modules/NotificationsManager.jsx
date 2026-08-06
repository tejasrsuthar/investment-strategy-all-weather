import React, { useState, useEffect } from 'react';
import { Bell, Plus, Trash2, Edit3 } from 'lucide-react';
import NotificationEditorPage from './NotificationEditorPage';

export default function NotificationsManager() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  // Full-page Editor state
  const [showEditor, setShowEditor] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchItems();
  }, [statusFilter]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const url = statusFilter 
        ? `http://localhost:8000/api/notifications?page=1&limit=10&status=${statusFilter}`
        : `http://localhost:8000/api/notifications?page=1&limit=10`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this notification?')) return;
    try {
      const res = await fetch(`http://localhost:8000/api/notifications/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchItems();
    } catch (e) {
      console.error(e);
    }
  };

  if (showEditor) {
    return (
      <NotificationEditorPage
        initialData={editingItem}
        onBack={() => {
          setShowEditor(false);
          setEditingItem(null);
        }}
        onSaveSuccess={() => {
          setShowEditor(false);
          setEditingItem(null);
          fetchItems();
        }}
      />
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-2xs">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="w-5 h-5 text-gray-500" /> Broadcast Alerts (Draft, Published, Archived)
          </h2>
          <p className="text-xs text-gray-500 mt-1">Manage global advisory notifications broadcasted to investor dashboards</p>
        </div>
        <button
          onClick={() => {
            setEditingItem(null);
            setShowEditor(true);
          }}
          className="bg-gray-900 hover:bg-black text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Create Broadcast Alert
        </button>
      </div>

      {/* Status Workflow Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {['', 'draft', 'published', 'archived'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              statusFilter === st ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {st === '' ? 'All Statuses' : st}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-8 text-xs text-gray-500">Loading broadcast notifications...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-200 text-gray-400 font-bold uppercase tracking-wider">
                <th className="py-3">Title</th>
                <th className="py-3">Message Preview</th>
                <th className="py-3">Status</th>
                <th className="py-3">Created By</th>
                <th className="py-3">Date</th>
                <th className="py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50">
                  <td className="py-3.5 font-bold text-gray-900">{item.title}</td>
                  <td className="py-3.5 text-gray-600 max-w-xs truncate">{item.message}</td>
                  <td className="py-3.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      item.status === 'published' ? 'bg-emerald-50 text-emerald-700' :
                      item.status === 'draft' ? 'bg-amber-50 text-amber-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3.5 font-medium text-gray-500">{item.created_by || 'Admin'}</td>
                  <td className="py-3.5 text-gray-400">{new Date(item.created_at).toLocaleDateString()}</td>
                  <td className="py-3.5 text-right space-x-2">
                    <button
                      onClick={() => {
                        setEditingItem(item);
                        setShowEditor(true);
                      }}
                      className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600"
                      title="Edit Notification in Full Page"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 hover:bg-red-50 rounded-lg text-red-600"
                      title="Delete Notification"
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
    </div>
  );
}
