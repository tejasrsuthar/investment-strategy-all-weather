import React, { useState, useEffect } from 'react';
import { FileText, Plus, Trash2, Edit3 } from 'lucide-react';
import ReportEditorPage from './ReportEditorPage';

export default function ResearchReportsManager() {
  const [reports, setReports] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Full-page Editor state
  const [showEditor, setShowEditor] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchReports();
  }, [page]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/reports?page=${page}&limit=10`);
      if (res.ok) {
        const data = await res.json();
        setReports(data.items || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this report?')) return;
    try {
      const res = await fetch(`http://localhost:8000/api/reports/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchReports();
    } catch (e) {
      console.error(e);
    }
  };

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
          fetchReports();
        }}
      />
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-2xs">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-gray-500" /> Research Reports Manager
          </h2>
          <p className="text-xs text-gray-500 mt-1">Publish and manage equity research insights for subscribed investors</p>
        </div>
        <button
          onClick={() => {
            setEditingItem(null);
            setShowEditor(true);
          }}
          className="bg-gray-900 hover:bg-black text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Create Research Report
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-xs text-gray-500">Loading research reports...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-200 text-gray-400 font-bold uppercase tracking-wider">
                <th className="py-3">Title</th>
                <th className="py-3">Content Summary</th>
                <th className="py-3">Status</th>
                <th className="py-3">Published Date</th>
                <th className="py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reports.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50">
                  <td className="py-3.5 font-bold text-gray-900">{item.title}</td>
                  <td className="py-3.5 text-gray-600 max-w-xs truncate">{item.content}</td>
                  <td className="py-3.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700">
                      {item.status || 'published'}
                    </span>
                  </td>
                  <td className="py-3.5 text-gray-400">{new Date(item.published_at).toLocaleDateString()}</td>
                  <td className="py-3.5 text-right space-x-2">
                    <button
                      onClick={() => {
                        setEditingItem(item);
                        setShowEditor(true);
                      }}
                      className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600"
                      title="Edit Report in Full Page"
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
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
