import { useState } from "react";
import PageShell from "../components/PageShell";

const galleryData = {
  2026: [
    { id: 1, title: "Alumni Meet 2026 - Photo 1", src: null },
    { id: 2, title: "Alumni Meet 2026 - Photo 2", src: null },
    { id: 3, title: "Alumni Meet 2026 - Photo 3", src: null },
    { id: 4, title: "Alumni Meet 2026 - Photo 4", src: null },
    { id: 5, title: "Alumni Meet 2026 - Photo 5", src: null },
    { id: 6, title: "Alumni Meet 2026 - Photo 6", src: null },
  ],
  2025: [
    { id: 1, title: "Alumni Meet 2025 - Photo 1", src: null },
    { id: 2, title: "Alumni Meet 2025 - Photo 2", src: null },
    { id: 3, title: "Alumni Meet 2025 - Photo 3", src: null },
    { id: 4, title: "Alumni Meet 2025 - Photo 4", src: null },
    { id: 5, title: "Alumni Meet 2025 - Photo 5", src: null },
    { id: 6, title: "Alumni Meet 2025 - Photo 6", src: null },
  ],
  2024: [
    { id: 1, title: "Alumni Meet 2024 - Photo 1", src: null },
    { id: 2, title: "Alumni Meet 2024 - Photo 2", src: null },
    { id: 3, title: "Alumni Meet 2024 - Photo 3", src: null },
    { id: 4, title: "Alumni Meet 2024 - Photo 4", src: null },
    { id: 5, title: "Alumni Meet 2024 - Photo 5", src: null },
    { id: 6, title: "Alumni Meet 2024 - Photo 6", src: null },
  ],
  2023: [
    { id: 1, title: "Alumni Meet 2023 - Photo 1", src: null },
    { id: 2, title: "Alumni Meet 2023 - Photo 2", src: null },
    { id: 3, title: "Alumni Meet 2023 - Photo 3", src: null },
    { id: 4, title: "Alumni Meet 2023 - Photo 4", src: null },
    { id: 5, title: "Alumni Meet 2023 - Photo 5", src: null },
    { id: 6, title: "Alumni Meet 2023 - Photo 6", src: null },
  ],
};

const years = Object.keys(galleryData).sort((a, b) => b - a);

// Placeholder colors for missing photos
const placeholderColors = [
  "bg-blue-200", "bg-blue-300", "bg-indigo-200", "bg-sky-200",
  "bg-blue-400", "bg-indigo-300",
];

function EventGallery() {
  const [activeYear, setActiveYear] = useState(years[0]);
  const [lightbox, setLightbox] = useState(null);

  const photos = galleryData[activeYear] || [];

  return (
    <PageShell eyebrow="Event" title="Photo Gallery">
      {/* Year tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {years.map((year) => (
          <button
            key={year}
            onClick={() => setActiveYear(year)}
            className={`rounded-full px-5 py-2 text-sm font-bold transition ${
              activeYear === year
                ? "bg-blue-700 text-white shadow"
                : "border border-blue-200 bg-white text-blue-800 hover:bg-blue-50"
            }`}
          >
            {year}
          </button>
        ))}
      </div>

      {/* Photo count */}
      <p className="mb-4 text-xs text-slate-500">
        {photos.length} photo{photos.length !== 1 ? "s" : ""} from {activeYear}
      </p>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4">
        {photos.map((photo, idx) => (
          <button
            key={photo.id}
            onClick={() => setLightbox(photo)}
            className="group relative overflow-hidden rounded-lg border border-blue-100 bg-white shadow-sm transition hover:shadow-md hover:border-blue-300 focus:outline-none"
          >
            {photo.src ? (
              <img
                src={photo.src}
                alt={photo.title}
                loading="lazy"
                className="h-40 w-full object-cover transition group-hover:scale-105"
              />
            ) : (
              <div
                className={`flex h-40 w-full items-center justify-center ${
                  placeholderColors[idx % placeholderColors.length]
                } transition group-hover:brightness-95`}
              >
                <span className="text-3xl font-extrabold text-white/60 select-none">
                  {activeYear}
                </span>
              </div>
            )}
            <div className="px-2 py-2 text-left">
              <p className="truncate text-xs font-semibold text-slate-700">
                {photo.title}
              </p>
            </div>
          </button>
        ))}
      </div>


      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setLightbox(null)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {lightbox.src ? (
              <img
                src={lightbox.src}
                alt={lightbox.title}
                className="max-h-[70vh] w-full object-contain"
              />
            ) : (
              <div className="flex h-64 w-full items-center justify-center bg-blue-200">
                <span className="text-5xl font-extrabold text-white/50">
                  {activeYear}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between px-5 py-3">
              <p className="text-sm font-semibold text-slate-700">
                {lightbox.title}
              </p>
              <button
                onClick={() => setLightbox(null)}
                className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 hover:bg-blue-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}

export default EventGallery;
