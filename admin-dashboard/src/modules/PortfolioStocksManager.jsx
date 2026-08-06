import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Briefcase, Plus, Trash2, Edit3, CheckSquare, Square, ArrowUpDown, Search } from 'lucide-react';
import StockEditorPage from './StockEditorPage';
import NumberedPagination from '../components/NumberedPagination';
import { API_BASE_URL } from '../config/apiConfig';

export default function PortfolioStocksManager() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Multi-Selection State
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  // Sorting State
  const [sortField, setSortField] = useState('ticker');
  const [sortDirection, setSortDirection] = useState('asc');

  // Full-page Editor state
  const [showEditor, setShowEditor] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchStocks(currentPage);
  }, [currentPage]);

  const fetchStocks = async (page = 1) => {
    setLoading(true);
    setSelectedIds([]);
    try {
      const res = await fetch(`${API_BASE_URL}/api/portfolio?page=${page}&limit=10`);
      if (res.ok) {
        const data = await res.json();
        setStocks(data.items || []);
        setTotalPages(data.pages || 1);
        setTotalItems(data.total || 0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete stock entry?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/portfolio/stocks/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success('Portfolio stock holding deleted');
        fetchStocks(currentPage);
      }
    } catch (e) {
      toast.error('Failed to delete stock holding');
    }
  };

  // Selection Logic
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredStocks.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredStocks.map(s => s.id));
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
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Delete ${selectedIds.length} selected portfolio stock holdings?`)) return;
    setBulkActionLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/portfolio/bulk-delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ids: selectedIds })
      });
      if (res.ok) {
        toast.success(`Deleted ${selectedIds.length} portfolio stock holdings`);
        fetchStocks(currentPage);
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

  // Filtered & Sorted Stocks
  const filteredStocks = stocks
    .filter(s => {
      const matchesSearch = searchQuery === '' || 
        s.ticker.toLowerCase().includes(searchQuery.toLowerCase()) || 
        s.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === '' || s.transaction_type === typeFilter;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  if (showEditor) {
    return (
      <StockEditorPage
        initialData={editingItem}
        onBack={() => {
          setShowEditor(false);
          setEditingItem(null);
        }}
        onSaveSuccess={() => {
          setShowEditor(false);
          setEditingItem(null);
          fetchStocks(currentPage);
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
            <Briefcase className="w-5 h-5 text-gray-700" /> Model Portfolio Stocks
          </h2>
          <p className="text-xs text-gray-500 mt-1">Manage active stock holdings and allocation weightages</p>
        </div>
        <button
          onClick={() => {
            setEditingItem(null);
            setShowEditor(true);
          }}
          className="bg-gray-900 hover:bg-black text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all"
        >
          <Plus className="w-4 h-4" /> Add Stock Entry
        </button>
      </div>

      {/* Search, Filter & Bulk Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/70 p-3 rounded-2xl border border-gray-200/80">
        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search ticker or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-gray-400"
          />
        </div>

        {/* Transaction Type Filter Tabs */}
        <div className="flex gap-2">
          {['', 'BUY', 'SELL'].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                typeFilter === t ? 'bg-gray-900 text-white shadow-xs' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200/70'
              }`}
            >
              {t === '' ? 'All Types' : t}
            </button>
          ))}
        </div>

        {/* Floating Mass Bulk Action Bar */}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2 bg-gray-900 text-white px-3 py-1.5 rounded-xl text-xs shadow-md">
            <span className="font-bold text-amber-400">{selectedIds.length} Selected</span>
            <div className="h-4 w-px bg-gray-700 mx-1" />
            <button
              onClick={handleBulkDelete}
              disabled={bulkActionLoading}
              className="p-1 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs flex items-center gap-1"
              title="Mass Delete Selected"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete Selected
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12 text-xs text-gray-400">Loading portfolio stocks...</div>
      ) : filteredStocks.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-2xl text-xs text-gray-500">No portfolio stock holdings found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-200 text-gray-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-2 w-10">
                  <button onClick={toggleSelectAll} className="text-gray-500 hover:text-gray-900">
                    {selectedIds.length === filteredStocks.length && filteredStocks.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-gray-900" />
                    ) : (
                      <Square className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </th>
                <th className="py-3 cursor-pointer hover:text-gray-900" onClick={() => handleSort('ticker')}>
                  <div className="flex items-center gap-1">
                    Ticker <ArrowUpDown className="w-3 h-3 text-gray-400" />
                  </div>
                </th>
                <th className="py-3 cursor-pointer hover:text-gray-900" onClick={() => handleSort('name')}>
                  <div className="flex items-center gap-1">
                    Stock Name <ArrowUpDown className="w-3 h-3 text-gray-400" />
                  </div>
                </th>
                <th className="py-3 cursor-pointer hover:text-gray-900" onClick={() => handleSort('entry_price')}>
                  <div className="flex items-center gap-1">
                    Entry Price <ArrowUpDown className="w-3 h-3 text-gray-400" />
                  </div>
                </th>
                <th className="py-3 cursor-pointer hover:text-gray-900" onClick={() => handleSort('target_price')}>
                  <div className="flex items-center gap-1">
                    Target <ArrowUpDown className="w-3 h-3 text-gray-400" />
                  </div>
                </th>
                <th className="py-3 cursor-pointer hover:text-gray-900" onClick={() => handleSort('stop_loss')}>
                  <div className="flex items-center gap-1">
                    Stop Loss <ArrowUpDown className="w-3 h-3 text-gray-400" />
                  </div>
                </th>
                <th className="py-3 cursor-pointer hover:text-gray-900" onClick={() => handleSort('weightage')}>
                  <div className="flex items-center gap-1">
                    Weight (%) <ArrowUpDown className="w-3 h-3 text-gray-400" />
                  </div>
                </th>
                <th className="py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStocks.map((item) => {
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
                    <td className="py-3.5 font-bold text-gray-900 font-mono">{item.ticker}</td>
                    <td className="py-3.5 font-medium text-gray-700">{item.name}</td>
                    <td className="py-3.5 font-bold text-gray-900">₹{item.entry_price?.toLocaleString('en-IN')}</td>
                    <td className="py-3.5 font-bold text-emerald-700">₹{item.target_price?.toLocaleString('en-IN')}</td>
                    <td className="py-3.5 font-bold text-red-600">₹{item.stop_loss?.toLocaleString('en-IN')}</td>
                    <td className="py-3.5 font-bold text-gray-900">{item.weightage}%</td>
                    <td className="py-3.5 text-right space-x-2">
                      <button
                        onClick={() => {
                          setEditingItem(item);
                          setShowEditor(true);
                        }}
                        className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600"
                        title="Edit Stock Entry"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 hover:bg-red-50 rounded-lg text-red-600"
                        title="Delete Stock Entry"
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
