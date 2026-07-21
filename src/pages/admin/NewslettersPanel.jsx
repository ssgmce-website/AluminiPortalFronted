import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Newspaper, Upload, Plus, Trash2, Edit3, Eye, Loader2,
  CheckCircle2, XCircle, FileCode, RefreshCw, X, ExternalLink, FileText
} from 'lucide-react';
import {
  fetchNewslettersAdmin,
  createNewsletter,
  updateNewsletter,
  deleteNewsletter,
  uploadNewsletterPdf,
} from '../../services/adminService';

export const NewslettersPanel = () => {
  const [newsletters, setNewsletters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form / Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNewsletter, setEditingNewsletter] = useState(null);

  // Form Fields
  const [formYear, setFormYear] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  // Statuses
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    loadNewsletters();
  }, []);

  const loadNewsletters = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await fetchNewslettersAdmin();
      setNewsletters(data.newsletters || []);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || 'Failed to load newsletters.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingNewsletter(null);
    setFormYear('');
    setFormTitle('');
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (newsletter) => {
    setEditingNewsletter(newsletter);
    setFormYear(newsletter.year || '');
    setFormTitle(newsletter.title || '');
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      alert('Only PDF files are allowed.');
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      alert('File size exceeds 25 MB limit.');
      return;
    }
    setSelectedFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formYear.trim()) {
      alert('Please enter the year/edition for the newsletter.');
      return;
    }

    if (!editingNewsletter && !selectedFile) {
      alert('Please select a PDF newsletter file to upload.');
      return;
    }

    try {
      setSubmitting(true);
      let fileUrl = editingNewsletter ? editingNewsletter.fileUrl : '';
      let fileName = editingNewsletter ? editingNewsletter.fileName : '';
      let fileSize = editingNewsletter ? editingNewsletter.fileSize : '';

      // If a new PDF file was selected, upload it first to storage/newsletters
      if (selectedFile) {
        setUploading(true);
        const uploadRes = await uploadNewsletterPdf(selectedFile);
        fileUrl = uploadRes.url;
        fileName = uploadRes.filename || selectedFile.name;
        fileSize = (selectedFile.size / (1024 * 1024)).toFixed(2) + ' MB';
        setUploading(false);
      }

      const newsletterData = {
        year: formYear.trim(),
        title: formTitle.trim() || `Alumni Newsletter ${formYear.trim()}`,
        fileUrl,
        fileName,
        fileSize,
      };

      if (editingNewsletter) {
        await updateNewsletter(editingNewsletter._id || editingNewsletter.id, newsletterData);
        setSuccessMsg(`Newsletter for ${formYear} updated successfully!`);
      } else {
        await createNewsletter(newsletterData);
        setSuccessMsg(`Newsletter for ${formYear} added successfully!`);
      }

      setIsModalOpen(false);
      loadNewsletters();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || err?.message || 'Failed to save newsletter.');
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  const handleDelete = async (id, year) => {
    if (!window.confirm(`Are you sure you want to delete the Newsletter for year/edition ${year}?`)) {
      return;
    }

    try {
      setDeletingId(id);
      await deleteNewsletter(id);
      setSuccessMsg(`Newsletter ${year} deleted successfully.`);
      setNewsletters(prev => prev.filter(r => (r._id || r.id) !== id));
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || 'Failed to delete newsletter.');
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
            <Newspaper className="w-7 h-7 text-[#0A3287]" />
            Newsletters Management
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Add year-wise newsletter PDFs stored in <code className="text-xs bg-slate-100 text-blue-700 px-1.5 py-0.5 rounded font-mono">storage/newsletters</code>. Newsletters are directly displayed on the public page.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 bg-[#0A3287] hover:bg-blue-800 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition shadow-md shrink-0 cursor-pointer"
        >
          <Plus size={16} /> Add Newsletter
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
        <div className="p-5 rounded-2xl border bg-blue-50/60 border-blue-100 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Newsletters</p>
            <h3 className="text-2xl font-black mt-1 text-blue-800">{newsletters.length}</h3>
          </div>
          <Newspaper className="w-8 h-8 opacity-20 text-slate-800" />
        </div>

        <div className="p-5 rounded-2xl border bg-indigo-50/60 border-indigo-100 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Latest Edition Year</p>
            <h3 className="text-2xl font-black mt-1 text-indigo-800">
              {newsletters.length > 0 ? newsletters[0].year : 'N/A'}
            </h3>
          </div>
          <FileCode className="w-8 h-8 opacity-20 text-slate-800" />
        </div>
      </div>

      {/* Table view */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <Loader2 className="w-10 h-10 animate-spin text-[#0A3287] mb-3" />
          <p className="text-slate-500 font-medium">Loading newsletters from database...</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-rose-50 border border-rose-100 rounded-2xl">
          <XCircle className="w-12 h-12 text-rose-600 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-800">Failed to load newsletters</h3>
          <p className="text-sm text-slate-500 mt-1">{error}</p>
          <button
            onClick={loadNewsletters}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 text-white text-xs font-semibold rounded-xl"
          >
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      ) : newsletters.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm text-center">
          <Newspaper size={48} className="text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-slate-700">No Newsletters Found</h3>
          <p className="text-sm text-slate-400 mt-1 max-w-sm">
            Click "Add Newsletter" above to upload the first newsletter PDF.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-[11px] font-black text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-left">Year / Edition</th>
                  <th className="px-6 py-4 text-left">Title</th>
                  <th className="px-6 py-4 text-left">PDF File</th>
                  <th className="px-6 py-4 text-left">Uploaded On</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {newsletters.map((item) => {
                  const itemId = item._id || item.id;
                  return (
                    <tr key={itemId} className="hover:bg-slate-50/50 transition-colors">
                      {/* Year */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-lg">
                          {item.year}
                        </span>
                      </td>

                      {/* Title */}
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-800">{item.title}</p>
                      </td>

                      {/* PDF File */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="p-2 bg-rose-50 text-rose-600 rounded-lg shrink-0">
                            <FileText size={16} />
                          </span>
                          <div className="min-w-0">
                            <a
                              href={item.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs font-semibold text-blue-700 hover:underline truncate block max-w-[200px]"
                              title={item.fileName || 'View PDF'}
                            >
                              {item.fileName || `Newsletter_${item.year}.pdf`}
                            </a>
                            {item.fileSize && (
                              <p className="text-[10px] text-slate-400">{item.fileSize}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Uploaded On */}
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })
                          : 'N/A'}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={item.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition inline-flex items-center gap-1"
                            title="Open PDF in New Tab"
                          >
                            <Eye size={16} />
                          </a>
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            className="p-2 text-slate-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition"
                            title="Modify Newsletter"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            disabled={deletingId === itemId}
                            onClick={() => handleDelete(itemId, item.year)}
                            className="p-2 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                            title="Delete Newsletter"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
            >
              <div className="flex items-center justify-between p-5 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Newspaper className="w-5 h-5 text-[#0A3287]" />
                  {editingNewsletter ? `Modify Newsletter (${editingNewsletter.year})` : 'Add Newsletter'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                {/* Year Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Year / Edition <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2025-26 or Autumn 2025"
                    value={formYear}
                    onChange={(e) => setFormYear(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Specify the year or edition string.</p>
                </div>

                {/* Title Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Newsletter Title
                  </label>
                  <input
                    type="text"
                    placeholder={`e.g. Alumni Newsletter ${formYear || '2025-26'}`}
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition"
                  />
                </div>

                {/* PDF File Upload */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Newsletter PDF Document {!editingNewsletter && <span className="text-rose-500">*</span>}
                  </label>

                  {editingNewsletter && !selectedFile && (
                    <div className="mb-2 p-3 bg-blue-50/70 border border-blue-100 rounded-xl flex items-center justify-between text-xs">
                      <span className="font-semibold text-blue-800 truncate max-w-[280px]">
                        Current PDF: {editingNewsletter.fileName || 'Attached PDF'}
                      </span>
                      <a
                        href={editingNewsletter.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 font-bold hover:underline shrink-0 flex items-center gap-1"
                      >
                        View PDF <ExternalLink size={12} />
                      </a>
                    </div>
                  )}

                  <label className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 hover:bg-slate-100/50 cursor-pointer transition text-center">
                    <Upload size={24} className="text-slate-400 mb-1" />
                    <span className="text-xs font-bold text-slate-700">
                      {selectedFile ? selectedFile.name : 'Click to select or replace PDF file'}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">PDF format only (Max size 25 MB)</span>
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>

                  {selectedFile && (
                    <p className="mt-1.5 text-xs text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 size={13} /> Selected: {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                    </p>
                  )}
                </div>

                {/* Modal actions */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || uploading}
                    className="inline-flex items-center gap-2 px-5 py-2 bg-[#0A3287] hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow transition"
                  >
                    {(submitting || uploading) && <Loader2 size={14} className="animate-spin" />}
                    {uploading
                      ? 'Uploading PDF...'
                      : submitting
                      ? 'Saving...'
                      : editingNewsletter
                      ? 'Update Newsletter'
                      : 'Add Newsletter'}
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

export default NewslettersPanel;
