import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Megaphone, Upload, Plus, Trash2, Edit3, Eye, Loader2,
  CheckCircle2, XCircle, RefreshCw, X, Link as LinkIcon, Calendar, Check, AlertCircle, ToggleLeft, ToggleRight
} from 'lucide-react';
import {
  fetchNewsAdmin,
  createNewsAdmin,
  updateNewsAdmin,
  deleteNewsAdmin,
  toggleNewsActiveAdmin,
  uploadNewsImage
} from '../../services/adminService';

export const NewsPanel = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form / Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNews, setEditingNews] = useState(null);

  // Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formSummary, setFormSummary] = useState('');
  const [formDetailsText, setFormDetailsText] = useState(''); // Textarea text split by newlines
  const [formActionLabel, setFormActionLabel] = useState('');
  const [formActionTo, setFormActionTo] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  // Statuses
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await fetchNewsAdmin();
      setNews(data || []);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || 'Failed to load news items.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingNews(null);
    setFormTitle('');
    setFormSummary('');
    setFormDetailsText('');
    setFormActionLabel('');
    setFormActionTo('');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormIsActive(true);
    setSelectedFile(null);
    setImagePreview('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingNews(item);
    setFormTitle(item.title || '');
    setFormSummary(item.summary || '');
    setFormDetailsText(Array.isArray(item.details) ? item.details.join('\n\n') : '');
    setFormActionLabel(item.action?.label || '');
    setFormActionTo(item.action?.to || '');
    setFormDate(item.date ? new Date(item.date).toISOString().split('T')[0] : '');
    setFormIsActive(item.isActive !== undefined ? item.isActive : true);
    setSelectedFile(null);
    setImagePreview(item.image || '');
    setIsModalOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Only image files are allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5 MB limit.');
      return;
    }
    setSelectedFile(file);

    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      setTogglingId(id);
      await toggleNewsActiveAdmin(id);
      setNews((prev) =>
        prev.map((item) =>
          (item._id || item.id) === id ? { ...item, isActive: !item.isActive } : item
        )
      );
      setSuccessMsg(`News item ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || 'Failed to toggle status.');
    } finally {
      setTogglingId(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      alert('Please enter a title.');
      return;
    }
    if (!formSummary.trim()) {
      alert('Please enter a summary.');
      return;
    }

    try {
      setSubmitting(true);
      let imageUrl = editingNews ? editingNews.image : '';

      // Upload file if new one is selected
      if (selectedFile) {
        setUploading(true);
        const uploadRes = await uploadNewsImage(selectedFile);
        imageUrl = uploadRes.url;
        setUploading(false);
      }

      // Convert details text to array of paragraphs
      const detailsArray = formDetailsText
        .split('\n')
        .map((p) => p.trim())
        .filter((p) => p.length > 0);

      const newsData = {
        title: formTitle.trim(),
        summary: formSummary.trim(),
        details: detailsArray,
        image: imageUrl,
        action: {
          label: formActionLabel.trim(),
          to: formActionTo.trim(),
        },
        isActive: formIsActive,
        date: formDate ? new Date(formDate) : new Date(),
      };

      if (editingNews) {
        await updateNewsAdmin(editingNews._id || editingNews.id, newsData);
        setSuccessMsg(`News "${formTitle}" updated successfully!`);
      } else {
        await createNewsAdmin(newsData);
        setSuccessMsg(`News "${formTitle}" created successfully!`);
      }

      setIsModalOpen(false);
      loadNews();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || err?.message || 'Failed to save news.');
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete the news update: "${title}"?`)) {
      return;
    }

    try {
      setDeletingId(id);
      await deleteNewsAdmin(id);
      setSuccessMsg(`News "${title}" deleted successfully.`);
      setNews((prev) => prev.filter((r) => (r._id || r.id) !== id));
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || 'Failed to delete news.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Megaphone className="w-7 h-7 text-[#0A3287]" />
            News Ticker & updates
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage the scrolling news ticker and detailed news updates displayed across the website.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 bg-[#0A3287] hover:bg-blue-800 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition shadow-md shrink-0 cursor-pointer"
        >
          <Plus size={16} /> Add News Update
        </button>
      </div>

      {/* Notifications */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-sm font-medium"
          >
            <CheckCircle2 size={16} className="text-emerald-600" />
            {successMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl border bg-blue-50/60 border-blue-100 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total News Items</p>
            <h3 className="text-2xl font-black mt-1 text-blue-800">{news.length}</h3>
          </div>
          <Megaphone className="w-8 h-8 opacity-20 text-slate-800" />
        </div>

        <div className="p-5 rounded-2xl border bg-emerald-50/60 border-emerald-100 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Active News</p>
            <h3 className="text-2xl font-black mt-1 text-emerald-800">
              {news.filter((n) => n.isActive).length}
            </h3>
          </div>
          <CheckCircle2 className="w-8 h-8 opacity-20 text-slate-800" />
        </div>

        <div className="p-5 rounded-2xl border bg-amber-50/60 border-amber-100 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Inactive / Hidden</p>
            <h3 className="text-2xl font-black mt-1 text-amber-800">
              {news.filter((n) => !n.isActive).length}
            </h3>
          </div>
          <AlertCircle className="w-8 h-8 opacity-20 text-slate-800" />
        </div>
      </div>

      {/* Table view */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <Loader2 className="w-10 h-10 animate-spin text-[#0A3287] mb-3" />
          <p className="text-slate-500 font-medium">Loading news updates from database...</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-rose-50 border border-rose-100 rounded-2xl">
          <XCircle className="w-12 h-12 text-rose-600 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-800">Failed to load news</h3>
          <p className="text-sm text-slate-500 mt-1">{error}</p>
          <button
            onClick={loadNews}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 text-white text-xs font-semibold rounded-xl"
          >
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      ) : news.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm text-center">
          <Megaphone size={48} className="text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-slate-700">No News Found</h3>
          <p className="text-sm text-slate-400 mt-1 max-w-sm">
            Click "Add News Update" above to create the first announcement.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-[11px] font-black text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-left">Date</th>
                  <th className="px-6 py-4 text-left">News details</th>
                  <th className="px-6 py-4 text-left">Action Link</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {news.map((item) => {
                  const itemId = item._id || item.id;
                  return (
                    <tr key={itemId} className="hover:bg-slate-50/50 transition-colors">
                      {/* Date */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1 rounded-lg">
                          <Calendar size={13} />
                          {item.date
                            ? new Date(item.date).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })
                            : 'N/A'}
                        </span>
                      </td>

                      {/* Image + Title/Summary */}
                      <td className="px-6 py-4 max-w-[400px]">
                        <div className="flex gap-3">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-12 h-12 object-cover rounded-lg border border-slate-200 shrink-0"
                            />
                          )}
                          <div className="min-w-0">
                            <p className="font-extrabold text-slate-800 line-clamp-1">{item.title}</p>
                            <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{item.summary}</p>
                          </div>
                        </div>
                      </td>

                      {/* Action Link */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.action?.to ? (
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                              <LinkIcon size={12} className="text-slate-400" />
                              {item.action.label || 'Link'}
                            </span>
                            <span className="text-[10px] text-blue-600 truncate max-w-[150px]">
                              {item.action.to}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 font-semibold italic">Default (/news/{itemId})</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          disabled={togglingId === itemId}
                          onClick={() => handleToggleActive(itemId, item.isActive)}
                          className="focus:outline-none cursor-pointer"
                          title="Click to toggle status"
                        >
                          {togglingId === itemId ? (
                            <Loader2 size={18} className="animate-spin text-blue-600 mx-auto" />
                          ) : item.isActive ? (
                            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[11px] font-bold px-2 py-0.5 rounded-full border border-emerald-100">
                              <Check size={10} /> Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-[11px] font-bold px-2 py-0.5 rounded-full border border-amber-100">
                              <X size={10} /> Inactive
                            </span>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            className="p-2 text-slate-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition cursor-pointer"
                            title="Edit News details"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            disabled={deletingId === itemId}
                            onClick={() => handleDelete(itemId, item.title)}
                            className="p-2 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            title="Delete news update"
                          >
                            {deletingId === itemId ? (
                              <Loader2 size={16} className="animate-spin text-rose-600" />
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Add / Edit Modal ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8"
            >
              <div className="flex items-center justify-between p-5 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-[#0A3287]" />
                  {editingNews ? 'Modify News Update' : 'Add News Update'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Title Input */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      News Title <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alumni Registration is open for all batches"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition"
                    />
                  </div>

                  {/* Summary Input */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Brief Summary <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Short description displayed in ticker list / details preview"
                      value={formSummary}
                      onChange={(e) => setFormSummary(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition"
                    />
                  </div>

                  {/* Date Picker */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition"
                    />
                  </div>

                  {/* Active Toggle */}
                  <div className="flex items-center gap-3 px-1 pt-6">
                    <button
                      type="button"
                      onClick={() => setFormIsActive(!formIsActive)}
                      className="text-slate-700 hover:text-blue-800 transition focus:outline-none flex items-center gap-2 cursor-pointer"
                    >
                      {formIsActive ? (
                        <ToggleRight size={38} className="text-[#0A3287]" />
                      ) : (
                        <ToggleLeft size={38} className="text-slate-400" />
                      )}
                      <span className="text-xs font-bold uppercase tracking-wider">
                        {formIsActive ? 'Visible / Active' : 'Hidden / Inactive'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Details TextArea */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Detailed Paragraphs
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Provide details about the update. Press Enter twice to start a new paragraph."
                    value={formDetailsText}
                    onChange={(e) => setFormDetailsText(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Separate paragraphs with blank lines.</p>
                </div>

                {/* Action Link fields */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <span className="text-xs font-bold text-slate-700 block uppercase tracking-wider">Action Button (Optional)</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Button Label
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Register Now"
                        value={formActionLabel}
                        onChange={(e) => setFormActionLabel(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-500 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Destination Page / URL
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. /register or https://example.com"
                        value={formActionTo}
                        onChange={(e) => setFormActionTo(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-500 transition"
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400">If omitted, clicking news in the ticker will lead to its detail page (`/news/id`).</p>
                </div>

                {/* News Image Upload */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Featured Image
                  </label>

                  {imagePreview && (
                    <div className="mb-3 relative w-32 h-24 rounded-lg overflow-hidden border border-slate-200 shadow-sm">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFile(null);
                          setImagePreview('');
                        }}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 shadow hover:bg-red-700 transition cursor-pointer"
                        title="Remove image"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  )}

                  <label className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 hover:bg-slate-100/50 cursor-pointer transition text-center">
                    <Upload size={24} className="text-slate-400 mb-1" />
                    <span className="text-xs font-bold text-slate-700">
                      {selectedFile ? selectedFile.name : 'Select or Replace Featured Image'}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">Images only (Max size 5 MB)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Modal actions */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || uploading}
                    className="inline-flex items-center gap-2 px-5 py-2 bg-[#0A3287] hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow transition cursor-pointer"
                  >
                    {(submitting || uploading) && <Loader2 size={14} className="animate-spin" />}
                    {uploading
                      ? 'Uploading Image...'
                      : submitting
                      ? 'Saving...'
                      : editingNews
                      ? 'Update News'
                      : 'Add News'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NewsPanel;
