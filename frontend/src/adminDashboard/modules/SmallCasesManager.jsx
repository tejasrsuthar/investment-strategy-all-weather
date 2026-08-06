import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3, Layers } from 'lucide-react';
import SmallCaseEditorPage from './SmallCaseEditorPage';

export default function SmallCasesManager() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Full-page Editor state
  const [showEditor, setShowEditor] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

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
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
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

  if (showEditor) {
    return (
      <SmallCaseEditorPage
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-gray-500" /> Small Cases Offerings
          </h2>
          <p className="text-xs text-gray-500 mt-1">Manage theme-based quantitative model portfolios</p>
        </div>
        <button
          onClick={() => {
            setEditingItem(null);
            setShowEditor(true);
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
                        setEditingItem(item);
                        setShowEditor(true);
                      }}
                      className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600"
                      title="Edit Smallcase"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 hover:bg-red-50 rounded-lg text-red-600"
                      title="Delete Smallcase"
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
