import { useState, useEffect } from "react";
import {
  Image,
  Upload,
  Trash2,
  Edit2,
  Plus,
  Search,
  ExternalLink,
  Loader2,
  AlertCircle,
  X,
  CheckCircle,
  Filter,
} from "lucide-react";
import {
  fetchGalleryAdmin,
  createGalleryImage,
  updateGalleryImage,
  deleteGalleryImage,
  uploadGalleryImage,
} from "../../services/adminService";

export default function GalleryPanel() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState("All");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form State
  const [title, setTitle] = useState("");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [selectedFile, setSelectedFile] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchGalleryAdmin();
      setItems(res?.gallery || []);
    } catch (err) {
      console.error("[GalleryPanel] Load error:", err);
      setError(err?.response?.data?.message || err?.message || "Failed to load gallery images.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const yearsList = ["All", ...Array.from(new Set(items.map((i) => i.year))).sort((a, b) => b - a)];

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setTitle("");
    setYear(new Date().getFullYear().toString());
    setSelectedFile(null);
    setExistingImageUrl("");
    setFormError("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setTitle(item.title || "");
    setYear(item.year || new Date().getFullYear().toString());
    setSelectedFile(null);
    setExistingImageUrl(item.imageUrl || "");
    setFormError("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setFormError("");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setFormError("Please select a valid image file (JPEG, PNG, WebP, GIF).");
        setSelectedFile(null);
        return;
      }
      if (file.size > 15 * 1024 * 1024) {
        setFormError("Image file size must be less than 15MB.");
        setSelectedFile(null);
        return;
      }
      setFormError("");
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!title.trim()) {
      setFormError("Please enter an image title.");
      return;
    }
    if (!year.trim()) {
      setFormError("Please enter a valid year.");
      return;
    }
    if (!editingItem && !selectedFile) {
      setFormError("Please select an image file to upload.");
      return;
    }

    try {
      setSubmitting(true);
      let finalImageUrl = existingImageUrl;
      let finalFileName = editingItem?.fileName || "";
      let finalFileSize = editingItem?.fileSize || "";

      if (selectedFile) {
        const uploadRes = await uploadGalleryImage(selectedFile, year.trim());
        finalImageUrl = uploadRes.url;
        finalFileName = uploadRes.filename || selectedFile.name;
        finalFileSize = (selectedFile.size / (1024 * 1024)).toFixed(2) + " MB";
      }

      if (editingItem) {
        await updateGalleryImage(editingItem._id, {
          title: title.trim(),
          year: year.trim(),
          imageUrl: finalImageUrl,
          fileName: finalFileName,
          fileSize: finalFileSize,
        });
        setSuccessMessage("Gallery image updated successfully!");
      } else {
        await createGalleryImage({
          title: title.trim(),
          year: year.trim(),
          imageUrl: finalImageUrl,
          fileName: finalFileName,
          fileSize: finalFileSize,
        });
        setSuccessMessage("Gallery image uploaded successfully!");
      }

      handleCloseModal();
      loadData();
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err) {
      console.error("[GalleryPanel] Submit error:", err);
      setFormError(err?.response?.data?.message || err?.message || "Failed to save gallery image.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (item) => {
    if (window.confirm(`Are you sure you want to delete "${item.title}" (${item.year})? This will also remove the image file from disk.`)) {
      try {
        await deleteGalleryImage(item._id);
        setSuccessMessage("Gallery image deleted successfully.");
        loadData();
        setTimeout(() => setSuccessMessage(""), 4000);
      } catch (err) {
        console.error("[GalleryPanel] Delete error:", err);
        alert(err?.response?.data?.message || err?.message || "Failed to delete gallery image.");
      }
    }
  };

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesYear = selectedYear === "All" || item.year === selectedYear;
    return matchesSearch && matchesYear;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Gallery Management</h1>
          <p className="text-sm text-slate-500">
            Upload, update, and manage gallery memories stored in year-wise folders.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-blue-800 cursor-pointer"
        >
          <Plus size={18} />
          Upload Image
        </button>
      </div>

      {/* Success alert */}
      {successMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
          <CheckCircle size={18} className="shrink-0 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Search & Year Filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search images by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-200 pl-10 pr-4 py-2 text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={16} className="text-slate-400" />
          <span className="text-xs font-semibold text-slate-500">Year Filter:</span>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-blue-600"
          >
            {yearsList.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Data List / Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-slate-100">
          <Loader2 size={32} className="animate-spin text-blue-700 mb-2" />
          <p className="text-sm font-medium text-slate-500">Loading gallery images...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-3">
          <AlertCircle size={20} className="shrink-0 text-rose-600" />
          <span className="text-sm font-semibold">{error}</span>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-slate-100 text-center">
          <Image size={40} className="text-slate-300 mb-3" />
          <p className="text-base font-bold text-slate-700">No Gallery Images Found</p>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">
            {searchTerm || selectedYear !== "All"
              ? "No images matched your filter parameters."
              : "Click 'Upload Image' to add photos to the gallery store."}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredItems.map((item) => (
            <div
              key={item._id}
              className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs transition hover:shadow-md"
            >
              {/* Image preview */}
              <div className="relative aspect-4/3 overflow-hidden bg-slate-900">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="h-full w-full object-cover transition group-hover:scale-105"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://placehold.co/400x300?text=Gallery+Image";
                  }}
                />
                <span className="absolute top-3 right-3 rounded-full bg-slate-950/80 px-2.5 py-0.5 text-xs font-bold text-white backdrop-blur-xs">
                  {item.year}
                </span>
              </div>

              {/* Info */}
              <div className="flex flex-1 flex-col p-4 justify-between">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm line-clamp-2">{item.title}</h3>
                  {item.fileSize && (
                    <p className="mt-1 text-xs text-slate-400">File size: {item.fileSize}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                  <a
                    href={item.imageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-900"
                  >
                    View <ExternalLink size={12} />
                  </a>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(item)}
                      className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 hover:text-blue-700 transition cursor-pointer"
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      className="rounded-lg p-1.5 text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
          <div className="relative max-w-lg w-full rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-800">
                {editingItem ? "Edit Gallery Image" : "Upload Gallery Image"}
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
                  Image Title <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Grand Alumni Meet Inauguration"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Year <span className="text-rose-600">*</span>
                </label>
                <input
                  type="number"
                  placeholder="e.g. 2026"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  required
                />
                <p className="mt-1 text-xs text-slate-400">
                  Image will be stored in <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-700">storage/gallery/{year || "YYYY"}/</code>
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Select Image File {!editingItem && <span className="text-rose-600">*</span>}
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-blue-500 transition">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    id="gallery-file-input"
                    className="hidden"
                  />
                  <label htmlFor="gallery-file-input" className="cursor-pointer flex flex-col items-center">
                    <Upload size={28} className="text-blue-600 mb-1" />
                    <span className="text-xs font-bold text-slate-700">
                      {selectedFile ? selectedFile.name : "Click to browse image file"}
                    </span>
                    <span className="text-xs text-slate-400 mt-1">PNG, JPG, JPEG, WebP up to 15MB</span>
                  </label>
                </div>
                {editingItem && !selectedFile && (
                  <p className="mt-1 text-xs text-slate-400">
                    Leave blank to keep existing image file.
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
                    "Update Image"
                  ) : (
                    "Upload Image"
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
