import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3, Layers } from 'lucide-react';

export default function SmallCasesManager() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Form modal
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', cagr: '', min_investment: '', description: '' });
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchItems();
  }, [page]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/smallcases?page=${page}&limit=10`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
        setPages(data.pages || 1);
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
    const url = editingId ? `http://localhost:8000/api/smallcases/${editingId}` : 'http://localhost:8000/api/smallcases';
    const method = editingId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          cagr: parseFloat(formData.cagr),
          min_investment: parseFloat(formData.min_investment),
          description: formData.description
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Failed to save smallcase');
      }

      setShowModal(false);
      setEditingId(null);
      setFormData({ name: '', cagr: '', min_investment: '', description: '' });
      fetchItems();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this smallcase?')) return;
    try {
      const res = await fetch(`http://localhost:8000/api/smallcases/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchItems();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-2xs">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-gray-500" /> Small Cases Offerings
          </h2>
          <p className="text-xs text-gray-500 mt-1">Manage theme-based quantitative model portfolios</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({ name: '', cagr: '', min_investment: '', description: '' });
            setShowModal(true);
          }}
          className="bg-gray-900 hover:bg-black text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Small Case
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-xs text-gray-500">Loading smallcases...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-200 text-gray-400 font-bold uppercase tracking-wider">
                <th className="py-3">Name</th>
                <th className="py-3">CAGR (%)</th>
                <th className="py-3">Min Investment (₹)</th>
                <th className="py-3">Description</th>
                <th className="py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50">
                  <td className="py-3.5 font-bold text-gray-900">{item.name}</td>
                  <td className="py-3.5 font-bold text-emerald-600">+{item.cagr}%</td>
                  <td className="py-3.5 font-medium text-gray-700">₹{item.min_investment.toLocaleString()}</td>
                  <td className="py-3.5 text-gray-500 max-w-xs truncate">{item.description}</td>
                  <td className="py-3.5 text-right space-x-2">
                    <button
                      onClick={() => {
                        setEditingId(item.id);
                        setFormData({ name: item.name, cagr: item.cagr, min_investment: item.min_investment, description: item.description });
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
            <h3 className="text-lg font-bold text-gray-900 mb-4">{editingId ? 'Edit Small Case' : 'New Small Case'}</h3>
            {error && <div className="p-3 mb-4 bg-red-50 text-red-600 text-xs rounded-xl">{error}</div>}
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">CAGR (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formData.cagr}
                    onChange={(e) => setFormData({ ...formData, cagr: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Min Investment (₹)</label>
                  <input
                    type="number"
                    required
                    value={formData.min_investment}
                    onChange={(e) => setFormData({ ...formData, min_investment: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Description</label>
                <textarea
                  required
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                />
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
                  Save Smallcase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
