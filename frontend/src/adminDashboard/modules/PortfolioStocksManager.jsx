import React, { useState, useEffect } from 'react';
import { Briefcase, Plus, Trash2, Edit3 } from 'lucide-react';

export default function PortfolioStocksManager() {
  const [stocks, setStocks] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    ticker: '', name: '', entry_price: '', target_price: '', stop_loss: '', weightage: '', transaction_type: 'BUY', sector: 'Equity'
  });
  const [error, setError] = useState('');

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

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    const url = editingId ? `http://localhost:8000/api/portfolio/${editingId}` : 'http://localhost:8000/api/portfolio';
    const method = editingId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ticker: formData.ticker,
          name: formData.name,
          entry_price: parseFloat(formData.entry_price),
          target_price: parseFloat(formData.target_price),
          stop_loss: parseFloat(formData.stop_loss),
          weightage: parseFloat(formData.weightage),
          transaction_type: formData.transaction_type,
          sector: formData.sector
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Failed to save stock');
      }

      setShowModal(false);
      setEditingId(null);
      fetchStocks();
    } catch (err) {
      setError(err.message);
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
            setEditingId(null);
            setFormData({ ticker: '', name: '', entry_price: '', target_price: '', stop_loss: '', weightage: '', transaction_type: 'BUY', sector: 'Equity' });
            setShowModal(true);
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
                        setEditingId(item.id);
                        setFormData({
                          ticker: item.ticker, name: item.name, entry_price: item.entry_price,
                          target_price: item.target_price, stop_loss: item.stop_loss, weightage: item.weightage,
                          transaction_type: item.transaction_type || 'BUY', sector: item.sector || 'Equity'
                        });
                        setShowModal(true);
                      }}
                      className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
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

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md border border-gray-200 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">{editingId ? 'Edit Stock Entry' : 'Add Stock Entry'}</h3>
            {error && <div className="p-3 mb-4 bg-red-50 text-red-600 text-xs rounded-xl">{error}</div>}
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Ticker</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. RELIANCE"
                    value={formData.ticker}
                    onChange={(e) => setFormData({ ...formData, ticker: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Stock Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Entry (₹)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formData.entry_price}
                    onChange={(e) => setFormData({ ...formData, entry_price: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Target (₹)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formData.target_price}
                    onChange={(e) => setFormData({ ...formData, target_price: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Stop Loss (₹)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formData.stop_loss}
                    onChange={(e) => setFormData({ ...formData, stop_loss: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Weightage (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formData.weightage}
                    onChange={(e) => setFormData({ ...formData, weightage: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Action</label>
                  <select
                    value={formData.transaction_type}
                    onChange={(e) => setFormData({ ...formData, transaction_type: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold"
                  >
                    <option value="BUY">BUY</option>
                    <option value="SELL">SELL</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-gray-900 hover:bg-black rounded-xl"
                >
                  Save Stock Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
