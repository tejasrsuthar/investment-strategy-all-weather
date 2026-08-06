import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FileText, Plus, Trash2, Edit3, ExternalLink, CheckSquare, Square, ArrowUpDown, Search } from 'lucide-react';
import ReportEditorPage from './ReportEditorPage';
import NumberedPagination from '../../components/NumberedPagination';

export default function ResearchReportsManager() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Multi-Selection State
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  // Sorting State
  const [sortField, setSortField] = useState('published_at');
  const [sortDirection, setSortDirection] = useState('desc');

  // Full-page Editor state
  const [showEditor, setShowEditor] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchReports(currentPage);
  }, [currentPage]);

  const fetchReports = async (page = 1) => {
    setLoading(true);
    setSelectedIds([]);
    try {
      const res = await fetch(`http://localhost:8000/api/reports?page=${page}&limit=10`);
      if (res.ok) {
        const data = await res.json();
        setReports(data.items || []);
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
    const report = reports.find(r => r.id === id);
    if (!report) return;
    try {
      const res = await fetch(`http://localhost:8000/api/reports/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setReports(reports.map(r => r.id === id ? { ...r, status: newStatus } : r));
        toast.success(`Report status updated to ${newStatus.toUpperCase()}`);
      }
    } catch (e) {
      toast.error('Failed to update report status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this report?')) return;
    try {
      const res = await fetch(`http://localhost:8000/api/reports/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success('Research report deleted');
        fetchReports(currentPage);
      }
    } catch (e) {
      toast.error('Failed to delete report');
    }
  };

  // Selection Logic
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredReports.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredReports.map(r => r.id));
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
      const res = await fetch('http://localhost:8000/api/reports/bulk-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ids: selectedIds, status: newStatus })
      });
      if (res.ok) {
        toast.success(`Updated status for ${selectedIds.length} reports to ${newStatus.toUpperCase()}`);
        fetchReports(currentPage);
      }
    } catch (e) {
      toast.error('Failed to execute bulk status update');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Delete ${selectedIds.length} selected research reports?`)) return;
    setBulkActionLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/reports/bulk-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ids: selectedIds })
      });
      if (res.ok) {
        toast.success(`Deleted ${selectedIds.length} research reports`);
        fetchReports(currentPage);
      }
    } catch (e) {
      toast.error('Failed to execute bulk delete');
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Sorting Handler
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filtered & Sorted Reports
  const filteredReports = reports
    .filter(r => {
      const matchesSearch = searchQuery === '' || 
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        r.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === '' || r.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let valA = a[sortField] || '';
      let valB = b[sortField] || '';
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  if (showEditor) {
    return (
      <ReportEditorPage
        initialData={editingItem}
        onBack={() => {
          setShowEditor(false);
          setEditingItem(null);
        }}
        onSaveSuccess={() => {
          setShowEditor(false);
          setEditingItem(null);
          fetchReports(currentPage);
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
            <FileText className="w-5 h-5 text-gray-700" /> Research Reports Manager
          </h2>
          <p className="text-xs text-gray-500 mt-1">Publish institutional research reports & Google Doc analysis links</p>
        </div>
        <button
          onClick={() => {
            setEditingItem(null);
            setShowEditor(true);
          }}
          className="bg-gray-900 hover:bg-black text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all"
        >
          <Plus className="w-4 h-4" /> Create Research Report
        </button>
      </div>

      {/* Search, Filter & Bulk Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/70 p-3 rounded-2xl border border-gray-200/80">
        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search reports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-gray-400"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex gap-2">
          {['', 'published', 'draft', 'archived'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                statusFilter === st ? 'bg-gray-900 text-white shadow-xs' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200/70'
              }`}
            >
              {st === '' ? 'All Statuses' : st}
            </button>
          ))}
        </div>

        {/* Floating Mass Bulk Action Bar */}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2 bg-gray-900 text-white px-3 py-1.5 rounded-xl text-xs shadow-md">
            <span className="font-bold text-amber-400">{selectedIds.length} Selected</span>
            <div className="h-4 w-px bg-gray-700 mx-1" />
            
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
        <div className="text-center py-12 text-xs text-gray-400">Loading research reports...</div>
      ) : filteredReports.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-2xl text-xs text-gray-500">No research reports found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-200 text-gray-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-2 w-10">
                  <button onClick={toggleSelectAll} className="text-gray-500 hover:text-gray-900">
                    {selectedIds.length === filteredReports.length && filteredReports.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-gray-900" />
                    ) : (
                      <Square className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </th>
                <th className="py-3 cursor-pointer hover:text-gray-900" onClick={() => handleSort('title')}>
                  <div className="flex items-center gap-1">
                    Title <ArrowUpDown className="w-3 h-3 text-gray-400" />
                  </div>
                </th>
                <th className="py-3">External Link / Doc</th>
                <th className="py-3 cursor-pointer hover:text-gray-900" onClick={() => handleSort('status')}>
                  <div className="flex items-center gap-1">
                    Status <ArrowUpDown className="w-3 h-3 text-gray-400" />
                  </div>
                </th>
                <th className="py-3 cursor-pointer hover:text-gray-900" onClick={() => handleSort('published_at')}>
                  <div className="flex items-center gap-1">
                    Published Date <ArrowUpDown className="w-3 h-3 text-gray-400" />
                  </div>
                </th>
                <th className="py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredReports.map((item) => {
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
                    
                    {/* Google Doc Link */}
                    <td className="py-3.5">
                      {item.doc_link ? (
                        <a
                          href={item.doc_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg text-[10px] transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" /> Open Google Doc
                        </a>
                      ) : (
                        <span className="text-gray-400 font-mono text-[10px]">—</span>
                      )}
                    </td>

                    {/* Inline Status Selector */}
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

                    <td className="py-3.5 text-gray-500 font-medium">
                      {new Date(item.published_at).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 text-right space-x-2">
                      <button
                        onClick={() => {
                          setEditingItem(item);
                          setShowEditor(true);
                        }}
                        className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600"
                        title="Edit Report"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 hover:bg-red-50 rounded-lg text-red-600"
                        title="Delete Report"
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
