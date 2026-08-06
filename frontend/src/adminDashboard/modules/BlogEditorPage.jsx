import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Save, Eye, Edit3, Tag, Sparkles, CheckCircle2 } from 'lucide-react';

export default function BlogEditorPage({ initialData, onBack, onSaveSuccess }) {
  const [editingId] = useState(initialData?.id || null);
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    markdown_content: initialData?.markdown_content || '',
    tagsInput: (initialData?.tags || []).join(', '),
    status: initialData?.status || 'published'
  });
  const [editorMode, setEditorMode] = useState('write'); // 'write' | 'preview' | 'split'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const token = localStorage.getItem('token');

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!formData.title.trim()) {
      setError('Article title is required.');
      return;
    }

    const tagsArray = formData.tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const payload = {
      title: formData.title,
      slug: formData.slug || formData.title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-'),
      markdown_content: formData.markdown_content,
      tags: tagsArray,
      status: formData.status
    };

    const url = editingId ? `http://localhost:8000/api/blogs/${editingId}` : 'http://localhost:8000/api/blogs';
    const method = editingId ? 'PUT' : 'POST';

    setLoading(true);

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

      setSuccess(true);
      toast.success(editingId ? 'Blog post updated' : 'Blog post published');
      setTimeout(() => {
        if (onSaveSuccess) onSaveSuccess();
      }, 1000);
    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'Failed to save blog post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-2xs space-y-6">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-gray-200">
        <div>
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-gray-900 transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Articles List
          </button>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2.5">
            <Edit3 className="w-6 h-6 text-gray-700" />
            {editingId ? 'Edit Blog Post' : 'Create New Blog Post'}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm disabled:opacity-50 transition-all"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Saving Article...' : editingId ? 'Update Article' : 'Publish Article'}
          </button>
        </div>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Article saved successfully! Redirecting...
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 text-red-600 border border-red-200 rounded-2xl text-xs font-semibold">
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Title & Slug Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Article Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Q3 Indian Market Outlook & Sector Analysis"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:border-gray-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">URL Slug</label>
            <input
              type="text"
              placeholder="e.g. q3-indian-market-outlook"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-700 focus:outline-none focus:border-gray-400"
            />
          </div>
        </div>

        {/* Tags & Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-gray-500" /> Tags (Comma Separated)
            </label>
            <input
              type="text"
              placeholder="e.g. Equities, Market, Smallcase, Macro"
              value={formData.tagsInput}
              onChange={(e) => setFormData({ ...formData, tagsInput: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono focus:outline-none focus:border-gray-400"
            />
            {/* Tag Pills Preview */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {formData.tagsInput.split(',').filter(t => t.trim().length > 0).map((tag, idx) => (
                <span key={idx} className="bg-gray-100 border border-gray-200 text-gray-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                  #{tag.trim()}
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Publication Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none"
            >
              <option value="published">Published (Live)</option>
              <option value="draft">Draft (Internal)</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        {/* Markdown Content Editor */}
        <div className="space-y-3 pt-2">
          <div className="flex justify-between items-center border-b border-gray-200 pb-3">
            <span className="text-xs font-bold text-gray-700 uppercase">Markdown Content & Live Preview</span>
            <div className="flex bg-gray-100 p-1 rounded-xl gap-1">
              <button
                type="button"
                onClick={() => setEditorMode('write')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  editorMode === 'write' ? 'bg-gray-900 text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Write
              </button>
              <button
                type="button"
                onClick={() => setEditorMode('preview')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  editorMode === 'preview' ? 'bg-gray-900 text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Eye className="w-3.5 h-3.5" /> Preview
              </button>
              <button
                type="button"
                onClick={() => setEditorMode('split')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  editorMode === 'split' ? 'bg-gray-900 text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Split Mode
              </button>
            </div>
          </div>

          {/* Editor Area */}
          <div className="min-h-[350px]">
            {editorMode === 'write' && (
              <textarea
                required
                rows="16"
                placeholder="# Article Title&#10;&#10;Write your post content in Markdown format..."
                value={formData.markdown_content}
                onChange={(e) => setFormData({ ...formData, markdown_content: e.target.value })}
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-mono focus:outline-none focus:border-gray-400 leading-relaxed"
              />
            )}

            {editorMode === 'preview' && (
              <div className="p-6 bg-gray-50/70 border border-gray-200 rounded-2xl min-h-[350px] whitespace-pre-wrap font-sans text-sm text-gray-800 leading-relaxed">
                {formData.markdown_content || <span className="text-gray-400 italic text-xs">No markdown content written yet...</span>}
              </div>
            )}

            {editorMode === 'split' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <textarea
                  required
                  rows="16"
                  placeholder="Markdown input..."
                  value={formData.markdown_content}
                  onChange={(e) => setFormData({ ...formData, markdown_content: e.target.value })}
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-mono focus:outline-none"
                />
                <div className="p-4 bg-gray-50/70 border border-gray-200 rounded-2xl overflow-y-auto max-h-[400px] whitespace-pre-wrap font-sans text-xs text-gray-800 leading-relaxed">
                  {formData.markdown_content || <span className="text-gray-400 italic">Live preview stream...</span>}
                </div>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
