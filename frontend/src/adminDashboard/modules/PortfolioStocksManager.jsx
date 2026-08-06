import React, { useState, useEffect } from 'react';
import { Briefcase, Plus, Trash2, Edit3 } from 'lucide-react';
import StockEditorPage from './StockEditorPage';

export default function PortfolioStocksManager() {
  const [stocks, setStocks] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Full-page Editor state
  const [showEditor, setShowEditor] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchStocks();
  }, [page]);

  const fetchStocks = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/portfolio?page=${page}&limit=10`);
      if (res.ok) {
        const data = await res.json();
        setStocks(data.items || []);
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
      const res = await fetch(`http://localhost:8000/api/portfolio/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchStocks();
    } catch (e) {
      console.error(e);
    }
  };

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
          fetchStocks();
        }}
      />
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-2xs">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-gray-500" /> Model Portfolio Stocks
          </h2>
          <p className="text-xs text-gray-500 mt-1">Manage active stock holdings and allocation weightages</p>
        </div>
        <button
          onClick={() => {
            setEditingItem(null);
            setShowEditor(true);
          }}
          className="bg-gray-900 hover:bg-black text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Stock Entry
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-xs text-gray-500">Loading portfolio stocks...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-200 text-gray-400 font-bold uppercase tracking-wider">
                <th className="py-3">Stock Ticker</th>
                <th className="py-3">Stock Name</th>
                <th className="py-3">Entry Price</th>
                <th className="py-3">Target</th>
                <th className="py-3">Stop Loss</th>
                <th className="py-3">Weightage (%)</th>
                <th className="py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stocks.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50">
                  <td className="py-3.5 font-bold text-gray-900">{item.ticker}</td>
                  <td className="py-3.5 font-medium text-gray-700">{item.name}</td>
                  <td className="py-3.5 text-gray-800 font-semibold">₹{item.entry_price}</td>
                  <td className="py-3.5 text-emerald-600 font-bold">₹{item.target_price}</td>
                  <td className="py-3.5 text-red-600 font-semibold">₹{item.stop_loss}</td>
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
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
