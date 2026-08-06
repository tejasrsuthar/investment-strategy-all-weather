import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Trash2, Edit3, Tag, Eye } from 'lucide-react';

export default function BlogPostManager() {
  const [blogs, setBlogs] = useState([]);
  const [page, setPage] = useState(1);
  const [selectedTag, setSelectedTag] = useState('');
  const [loading, setLoading] = useState(true);

  // Editor Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    markdown_content: '',
    tagsInput: '',
    status: 'published'
  });
  const [activeTab, setActiveTab] = useState('write'); // 'write' | 'preview'
  const [error, setError] = useState('');

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

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');

    const tagsArray = formData.tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const payload = {
      title: formData.title,
      slug: formData.slug || formData.title.toLowerCase().replace(/\s+/g, '-'),
      markdown_content: formData.markdown_content,
      tags: tagsArray,
      status: formData.status
    };

    const url = editingId ? `http://localhost:8000/api/blogs/${editingId}` : 'http://localhost:8000/api/blogs';
    const method = editingId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Failed to save blog post');
      }

      setShowModal(false);
      setEditingId(null);
      setFormData({ title: '', slug: '', markdown_content: '', tagsInput: '', status: 'published' });
      fetchBlogs();
    } catch (err) {
      setError(err.message);
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

  return (
    <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-2xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-gray-500" /> Blog Posts (Markdown & Multi-Tag Support)
          </h2>
          <p className="text-xs text-gray-500 mt-1">Publish frontend-facing articles with multiple tags & live preview</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({ title: '', slug: '', markdown_content: '', tagsInput: '', status: 'published' });
            setShowModal(true);
          }}
          className="bg-gray-900 hover:bg-black text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2"
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
                        setEditingId(b.id);
                        setFormData({
                          title: b.title,
                          slug: b.slug,
                          markdown_content: b.markdown_content,
                          tagsInput: (b.tags || []).join(', '),
                          status: b.status
                        });
                        setShowModal(true);
                      }}
                      className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(b.id)}
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

      {/* Editor Modal with Markdown Preview */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-2xl border border-gray-200 shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-4">{editingId ? 'Edit Article' : 'New Article'}</h3>
            {error && <div className="p-3 mb-4 bg-red-50 text-red-600 text-xs rounded-xl">{error}</div>}
            
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Article Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">URL Slug</label>
                  <input
                    type="text"
                    placeholder="e.g. q3-market-outlook"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                  Tags (Comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Equities, Market, Wealth, Smallcase"
                  value={formData.tagsInput}
                  onChange={(e) => setFormData({ ...formData, tagsInput: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono"
                />
              </div>

              {/* Editor Tabs: Write vs Preview */}
              <div>
                <div className="flex justify-between items-center mb-2 border-b border-gray-200 pb-2">
                  <span className="text-xs font-bold text-gray-600 uppercase">Markdown Content Editor</span>
                  <div className="flex gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setActiveTab('write')}
                      className={`px-3 py-1 rounded-lg font-bold ${activeTab === 'write' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`}
                    >
                      Write
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('preview')}
                      className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1 ${activeTab === 'preview' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`}
                    >
                      <Eye className="w-3.5 h-3.5" /> Preview
                    </button>
                  </div>
                </div>

                {activeTab === 'write' ? (
                  <textarea
                    required
                    rows="8"
                    placeholder="# Article Title&#10;&#10;Write your content in Markdown..."
                    value={formData.markdown_content}
                    onChange={(e) => setFormData({ ...formData, markdown_content: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono"
                  />
                ) : (
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-xs whitespace-pre-wrap font-sans text-gray-800 min-h-[160px]">
                    {formData.markdown_content || <span className="text-gray-400 italic">No content typed yet...</span>}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
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
                  Publish Article
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
