import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Trash2, Edit3, Tag } from 'lucide-react';
import BlogEditorPage from './BlogEditorPage';

export default function BlogPostManager() {
  const [blogs, setBlogs] = useState([]);
  const [page, setPage] = useState(1);
  const [selectedTag, setSelectedTag] = useState('');
  const [loading, setLoading] = useState(true);

  // Full-page Editor state instead of popup
  const [showEditor, setShowEditor] = useState(false);
  const [editingPost, setEditingPost] = useState(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchBlogs();
  }, [page, selectedTag]);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const url = selectedTag 
        ? `http://localhost:8000/api/blogs?page=${page}&limit=10&tag=${encodeURIComponent(selectedTag)}`
        : `http://localhost:8000/api/blogs?page=${page}&limit=10`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setBlogs(data.items || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this blog post?')) return;
    try {
      const res = await fetch(`http://localhost:8000/api/blogs/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchBlogs();
    } catch (e) {
      console.error(e);
    }
  };

  if (showEditor) {
    return (
      <BlogEditorPage
        initialData={editingPost}
        onBack={() => {
          setShowEditor(false);
          setEditingPost(null);
        }}
        onSaveSuccess={() => {
          setShowEditor(false);
          setEditingPost(null);
          fetchBlogs();
        }}
      />
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-2xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-gray-500" /> Blog Articles Manager
          </h2>
          <p className="text-xs text-gray-500 mt-1">Publish frontend-facing articles with multiple tags & full page Markdown editor</p>
        </div>
        <button
          onClick={() => {
            setEditingPost(null);
            setShowEditor(true);
          }}
          className="bg-gray-900 hover:bg-black text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all"
        >
          <Plus className="w-4 h-4" /> Create Blog Post
        </button>
      </div>

      {/* Filter by Tag Input */}
      <div className="mb-6 flex items-center gap-3">
        <Tag className="w-4 h-4 text-gray-400" />
        <span className="text-xs font-bold text-gray-600 uppercase">Filter by Tag:</span>
        <input
          type="text"
          placeholder="e.g. Equities (leave empty for all)"
          value={selectedTag}
          onChange={(e) => setSelectedTag(e.target.value)}
          className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs w-64"
        />
      </div>

      {/* Blog List Table */}
      {loading ? (
        <div className="text-center py-8 text-xs text-gray-500">Loading blog posts...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-200 text-gray-400 font-bold uppercase tracking-wider">
                <th className="py-3">Title & Slug</th>
                <th className="py-3">Tags</th>
                <th className="py-3">Author</th>
                <th className="py-3">Published Date</th>
                <th className="py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {blogs.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50/50">
                  <td className="py-3.5">
                    <div className="font-bold text-gray-900">{b.title}</div>
                    <div className="text-[10px] font-mono text-gray-400">/{b.slug}</div>
                  </td>
                  <td className="py-3.5">
                    <div className="flex flex-wrap gap-1">
                      {b.tags && b.tags.map((t, idx) => (
                        <span key={idx} className="bg-gray-100 text-gray-700 font-semibold px-2 py-0.5 rounded text-[10px]">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3.5 text-gray-600 font-medium">{b.author || 'Admin'}</td>
                  <td className="py-3.5 text-gray-500">{new Date(b.created_at).toLocaleDateString()}</td>
                  <td className="py-3.5 text-right space-x-2">
                    <button
                      onClick={() => {
                        setEditingPost(b);
                        setShowEditor(true);
                      }}
                      className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600"
                      title="Edit Article in Full Page"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(b.id)}
                      className="p-1.5 hover:bg-red-50 rounded-lg text-red-600"
                      title="Delete Article"
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
