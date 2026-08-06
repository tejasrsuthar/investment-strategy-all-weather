import React, { useState, useEffect } from 'react';
import { Bell, Plus, Trash2, Edit3, CheckSquare, Square, RefreshCw, ShieldAlert } from 'lucide-react';
import NotificationEditorPage from './NotificationEditorPage';
import NumberedPagination from '../../components/NumberedPagination';

export default function NotificationsManager() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Multi-Selection State
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  // Full-page Editor state
  const [showEditor, setShowEditor] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchItems(currentPage);
  }, [statusFilter, currentPage]);

  const fetchItems = async (page = 1) => {
    setLoading(true);
    setSelectedIds([]);
    try {
      const url = statusFilter 
        ? `http://localhost:8000/api/notifications?page=${page}&limit=10&status=${statusFilter}`
        : `http://localhost:8000/api/notifications?page=${page}&limit=10`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
        setTotalPages(data.pages || 1);
        setTotalItems(data.total || 0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSingleStatusUpdate = async (id, newStatus) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    try {
      const res = await fetch(`http://localhost:8000/api/notifications/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          title: item.title,
          message: item.message,
          status: newStatus
        })
      });
      if (res.ok) {
        setItems(items.map(i => i.id === id ? { ...i, status: newStatus } : i));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this notification?')) return;
    try {
      const res = await fetch(`http://localhost:8000/api/notifications/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchItems(currentPage);
    } catch (e) {
      console.error(e);
    }
  };

  // Selection Logic
  const toggleSelectAll = () => {
    if (selectedIds.length === items.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map(i => i.id));
    }
  };

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Bulk Operations
  const handleBulkStatusChange = async (newStatus) => {
    if (selectedIds.length === 0) return;
    setBulkActionLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/notifications/bulk-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ids: selectedIds, status: newStatus })
      });
      if (res.ok) {
        fetchItems(currentPage);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} selected notifications?`)) return;
    setBulkActionLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/notifications/bulk-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ids: selectedIds })
      });
      if (res.ok) {
        fetchItems(currentPage);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setBulkActionLoading(false);
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
          fetchItems(currentPage);
        }}
      />
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-2xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="w-5 h-5 text-gray-700" /> Broadcast Alerts
          </h2>
          <p className="text-xs text-gray-500 mt-1">Manage global advisory alerts broadcasted to investor dashboards</p>
        </div>
        <button
          onClick={() => {
            setEditingItem(null);
            setShowEditor(true);
          }}
          className="bg-gray-900 hover:bg-black text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all"
        >
          <Plus className="w-4 h-4" /> Create Broadcast Alert
        </button>
      </div>

      {/* Filter Tabs & Bulk Actions Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/70 p-3 rounded-2xl border border-gray-200/80">
        <div className="flex gap-2">
          {['', 'draft', 'published', 'archived'].map((st) => (
            <button
              key={st}
              onClick={() => {
                setStatusFilter(st);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                statusFilter === st ? 'bg-gray-900 text-white shadow-xs' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200/70'
              }`}
            >
              {st === '' ? 'All Statuses' : st}
            </button>
          ))}
        </div>

        {/* Floating Mass Bulk Action Buttons */}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2 bg-gray-900 text-white px-3 py-1.5 rounded-xl text-xs shadow-md animate-fade-in">
            <span className="font-bold text-amber-400">{selectedIds.length} Selected</span>
            <div className="h-4 w-px bg-gray-700 mx-1" />
            
            <span className="text-gray-400 font-medium">Mass Status:</span>
            <button
              onClick={() => handleBulkStatusChange('published')}
              disabled={bulkActionLoading}
              className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 font-bold rounded-lg text-[10px] uppercase"
            >
              Publish
            </button>
            <button
              onClick={() => handleBulkStatusChange('draft')}
              disabled={bulkActionLoading}
              className="px-2 py-0.5 bg-amber-600 hover:bg-amber-700 font-bold rounded-lg text-[10px] uppercase"
            >
              Draft
            </button>
            <button
              onClick={() => handleBulkStatusChange('archived')}
              disabled={bulkActionLoading}
              className="px-2 py-0.5 bg-gray-700 hover:bg-gray-600 font-bold rounded-lg text-[10px] uppercase"
            >
              Archive
            </button>
            
            <div className="h-4 w-px bg-gray-700 mx-1" />

            <button
              onClick={handleBulkDelete}
              disabled={bulkActionLoading}
              className="p-1 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs"
              title="Mass Delete Selected"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12 text-xs text-gray-400">Loading broadcast alerts...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-2xl text-xs text-gray-500">No alert notifications found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-200 text-gray-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-2 w-10">
                  <button onClick={toggleSelectAll} className="text-gray-500 hover:text-gray-900">
                    {selectedIds.length === items.length && items.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-gray-900" />
                    ) : (
                      <Square className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </th>
                <th className="py-3">Title</th>
                <th className="py-3">Message Preview</th>
                <th className="py-3">Inline Status Update</th>
                <th className="py-3">Created By</th>
                <th className="py-3">Date</th>
                <th className="py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item) => {
                const isSelected = selectedIds.includes(item.id);
                return (
                  <tr key={item.id} className={`hover:bg-gray-50/70 transition-colors ${isSelected ? 'bg-amber-50/30' : ''}`}>
                    <td className="py-3.5 px-2">
                      <button onClick={() => toggleSelect(item.id)} className="text-gray-500">
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-gray-900" />
                        ) : (
                          <Square className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </td>
                    <td className="py-3.5 font-bold text-gray-900">{item.title}</td>
                    <td className="py-3.5 text-gray-600 max-w-xs truncate">{item.message}</td>
                    
                    {/* Inline Status Dropdown */}
                    <td className="py-3.5">
                      <select
                        value={item.status}
                        onChange={(e) => handleSingleStatusUpdate(item.id, e.target.value)}
                        className={`px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase border focus:outline-none transition-all cursor-pointer ${
                          item.status === 'published' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          item.status === 'draft' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-gray-100 text-gray-600 border-gray-200'
                        }`}
                      >
                        <option value="draft">DRAFT</option>
                        <option value="published">PUBLISHED</option>
                        <option value="archived">ARCHIVED</option>
                      </select>
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
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Numbered Pagination Bar */}
      <NumberedPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        onPageChange={(page) => setCurrentPage(page)}
      />
    </div>
  );
}
