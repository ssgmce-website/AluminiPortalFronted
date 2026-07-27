import { useState, useEffect } from 'react';
import {
  Users,
  Upload,
  Trash2,
  Plus,
  Loader2,
  AlertCircle,
  X,
  CheckCircle,
  Edit2,
} from 'lucide-react';
import {
  createExecutiveMemberAdmin,
  deleteExecutiveMemberAdmin,
  updateExecutiveMemberAdmin,
  uploadExecutivePhoto
} from '../../services/adminService';
import { fetchExecutiveMembers } from '../../services/alumniService';

export function ExecutiveTeamPanel() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form State
  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('');
  const [department, setDepartment] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchExecutiveMembers();
      setItems(res || []);
    } catch (err) {
      console.error('[ExecutiveTeamPanel] Load error:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to load executive members.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setName('');
    setDesignation('');
    setDepartment('');
    setSelectedFile(null);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setName(item.name || '');
    setDesignation(item.designation || '');
    setDepartment(item.department || '');
    setSelectedFile(null);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setFormError('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setFormError('Please select a valid image file (JPEG, PNG, WebP).');
        setSelectedFile(null);
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setFormError('Image file size must be less than 10MB.');
        setSelectedFile(null);
        return;
      }
      setFormError('');
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim()) {
      setFormError('Please enter a name.');
      return;
    }
    if (!designation.trim()) {
      setFormError('Please enter a designation.');
      return;
    }
    if (!department.trim()) {
      setFormError('Please enter a department.');
      return;
    }

    try {
      setSubmitting(true);
      let finalPhotoUrl = editingItem ? editingItem.photo : null;

      if (selectedFile) {
        const uploadRes = await uploadExecutivePhoto(selectedFile);
        finalPhotoUrl = uploadRes.url;
      }

      if (editingItem) {
        await updateExecutiveMemberAdmin(editingItem._id, {
          name: name.trim(),
          designation: designation.trim(),
          department: department.trim(),
          photo: finalPhotoUrl,
        });
        setSuccessMessage('Executive member updated successfully!');
      } else {
        await createExecutiveMemberAdmin({
          name: name.trim(),
          designation: designation.trim(),
          department: department.trim(),
          photo: finalPhotoUrl,
        });
        setSuccessMessage('Executive member added successfully!');
      }

      handleCloseModal();
      loadData();
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      console.error('[ExecutiveTeamPanel] Submit error:', err);
      setFormError(err?.response?.data?.message || err?.message || 'Failed to save executive member.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (item) => {
    if (window.confirm(`Are you sure you want to remove "${item.name}" from the Executive Team?`)) {
      try {
        await deleteExecutiveMemberAdmin(item._id);
        setSuccessMessage('Executive member deleted successfully.');
        loadData();
        setTimeout(() => setSuccessMessage(''), 4000);
      } catch (err) {
        console.error('[ExecutiveTeamPanel] Delete error:', err);
        alert(err?.response?.data?.message || err?.message || 'Failed to delete member.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Executive Team Management</h1>
          <p className="text-sm text-slate-500">
            Add, edit, remove, and manage members of the SSGMCE Board / Executive Team.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-blue-800 cursor-pointer"
        >
          <Plus size={18} />
          Add Member
        </button>
      </div>

      {/* Success alert */}
      {successMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
          <CheckCircle size={18} className="shrink-0 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Data List / Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-slate-100">
          <Loader2 size={32} className="animate-spin text-blue-700 mb-2" />
          <p className="text-sm font-medium text-slate-500">Loading members...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-3">
          <AlertCircle size={20} className="shrink-0 text-rose-600" />
          <span className="text-sm font-semibold">{error}</span>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-slate-100 text-center">
          <Users size={40} className="text-slate-300 mb-3" />
          <p className="text-base font-bold text-slate-700">No Members Found</p>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">
            Click 'Add Member' to register a member to the executive team.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-4">Member Info</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4 text-right w-28">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {items.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Column 1: Member Info - Photo, Name, and Designation */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        {item.photo ? (
                          <img
                            src={item.photo}
                            alt={item.name}
                            className="h-12 w-12 rounded-lg object-cover object-top border border-slate-200"
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-700 font-extrabold text-lg border border-slate-100">
                            {item.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="font-extrabold text-slate-800 text-sm">{item.name}</p>
                          <p className="text-xs text-slate-500 font-semibold mt-0.5">{item.designation}</p>
                        </div>
                      </div>
                    </td>

                    {/* Column 2: Department */}
                    <td className="px-6 py-4 text-slate-700 font-medium">
                      {item.department}
                    </td>

                    {/* Column 3: Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-700 transition cursor-pointer"
                          title="Edit member"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                          title="Remove member"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
          <div className="relative max-w-lg w-full rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-800">
                {editingItem ? 'Edit Executive Member' : 'Add Executive Member'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0 text-rose-600" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Ramesh Patil"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Designation <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Faculty Coordinator / President"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Department <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Computer Science and Engineering"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Member Photo
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-blue-500 transition">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    id="executive-file-input"
                    className="hidden"
                  />
                  <label htmlFor="executive-file-input" className="cursor-pointer flex flex-col items-center">
                    <Upload size={28} className="text-blue-600 mb-1" />
                    <span className="text-xs font-bold text-slate-700">
                      {selectedFile ? selectedFile.name : 'Click to browse image file'}
                    </span>
                    <span className="text-xs text-slate-400 mt-1">PNG, JPG, JPEG up to 10MB</span>
                  </label>
                </div>
                {editingItem && !selectedFile && (
                  <p className="mt-1 text-[11px] text-slate-400">
                    Leave blank to keep the current photo.
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-blue-800 transition disabled:bg-slate-300 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Saving...
                    </>
                  ) : editingItem ? (
                    'Update Member'
                  ) : (
                    'Add Member'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
