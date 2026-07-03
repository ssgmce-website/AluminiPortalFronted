import { useState, useMemo, useRef, useCallback } from "react";
import { X, ZoomIn } from "lucide-react";
import PageShell from "../components/PageShell";

// ── 2023 ──────────────────────────────────────────────────────────────────────
import alumniMeet2023A from "../assets/gallery/Alumni-Meet2023.jpeg";
import alumniMeet2023B from "../assets/gallery/Alumni2023.jpeg";
import alumniMeet2023C from "../assets/gallery/AlumniMeet2023.jpeg";
import alumniMeet2023D from "../assets/gallery/Alumni_Meet2023.jpeg";
import alumniMeet2023E from "../assets/gallery/AM2023.jpeg";
import alumniMeet2023F from "../assets/gallery/A_M2023.jpeg";
import alumniMeet2023G from "../assets/gallery/_Alumni-meet2023.jpeg";

// ── 2024 ──────────────────────────────────────────────────────────────────────
import alumniMeet2024A from "../assets/gallery/Alumni-meet2024.jpeg";
import alumniMeet2024B from "../assets/gallery/AlumniMeet2024.jpeg";

// ── 2025 ──────────────────────────────────────────────────────────────────────
import alumniMeet2025A from "../assets/gallery/Alumni-Meet-2025.jpeg";
import alumniMeet2025B from "../assets/gallery/AlumniMeet-2025.jpeg";
import alumniMeet2025C from "../assets/gallery/AlumniMeet2025.jpeg";

// ── 2026 ──────────────────────────────────────────────────────────────────────
import alumniMeet2026A from "../assets/gallery/AlumniMeet2026.jpeg";
import alumniMeet2026B from "../assets/gallery/AM2026.jpeg";
import alumniMeet2026C from "../assets/gallery/A_M2026.jpeg";
import alumniMeet2026D from "../assets/gallery/_A_M2026.jpeg";
import alumniMeet2026E from "../assets/gallery/Alumni_Meet2026.jpeg";
import alumniMeet2026F from "../assets/gallery/_A-m2026.jpeg";
import alumniMeet2026G from "../assets/gallery/_Alumni_M2026.jpeg";

const ALL_IMAGES = [
  // 2023
  { id: 1,  url: alumniMeet2023D, title: "Lamp Lighting Ceremony",              year: 2023 },
  { id: 2,  url: alumniMeet2023B, title: "Grand Alumni Meet Newsletter",        year: 2023 },
  { id: 3,  url: alumniMeet2023E, title: "Student Innovation Exhibition",       year: 2023 },
  { id: 4,  url: alumniMeet2023G, title: "Student Project Exhibition",         year: 2023 },
  { id: 5,  url: alumniMeet2023A, title: "Alumni Walkathon",                    year: 2023 },
  { id: 6,  url: alumniMeet2023C, title: "Alumni Procession",                   year: 2023 },
  { id: 7,  url: alumniMeet2023F, title: "Alumni Group Photo",                  year: 2023 },
  // 2024
  { id: 8,  url: alumniMeet2024B, title: "Balloon Release Celebration",         year: 2024 },
  { id: 9,  url: alumniMeet2024A, title: "Cultural Gathering",                  year: 2024 },
  // 2025
  { id: 10, url: alumniMeet2025A, title: "MoU Signing Ceremony",                year: 2025 },
  { id: 11, url: alumniMeet2025C, title: "Grand Alumni Meet Newsletter Launch", year: 2025 },
  { id: 12, url: alumniMeet2025B, title: "Panel Discussion",                    year: 2025 },
  // 2026
  { id: 13, url: alumniMeet2026D, title: "Alumni Meet Auditorium Session",      year: 2026 },
  { id: 14, url: alumniMeet2026C, title: "Library Inauguration",                year: 2026 },
  { id: 15, url: alumniMeet2026A, title: "Guest Interaction Session",           year: 2026 },
  { id: 16, url: alumniMeet2026B, title: "Alumni Faculty Interaction",          year: 2026 },
  { id: 17, url: alumniMeet2026G, title: "Grand Alumni Meet 2026 Group Photo",  year: 2026 },
  { id: 18, url: alumniMeet2026F, title: "Inauguration Ceremony",               year: 2026 },
  { id: 19, url: alumniMeet2026E, title: "Student Interaction Session",         year: 2026 },
];

const YEARS = ["All", ...Array.from(new Set(ALL_IMAGES.map((img) => img.year))).sort((a, b) => b - a)];

/* ── MarqueeRow ── */
function MarqueeRow({ images, direction = "left", speed = 70, onImageClick }) {
  const trackRef = useRef(null);

  // We duplicate the images so the scroll loops seamlessly
  const duplicated = useMemo(() => {
    if (!images.length) return [];
    // duplicate enough times to fill wide screens
    let copies = Math.max(4, Math.ceil(20 / images.length));
    // Ensure copies is an even number so that translating by -50%
    // seamlessly loops exactly at a full repetition of the original images.
    if (copies % 2 !== 0) copies += 1;

    const result = [];
    for (let c = 0; c < copies; c++) {
      images.forEach((img, i) => result.push({ ...img, _key: `${c}-${i}` }));
    }
    return result;
  }, [images]);

  if (!images.length) return null;

  const itemsShifted = duplicated.length / 2;
  // Calculate duration to maintain constant visual speed.
  // Base calibration: speed prop was originally for ~12 items shifted (4 images * 6 copies / 2).
  const dynamicDuration = itemsShifted * (speed / 12);

  const animClass =
    direction === "left"
      ? "gallery-marquee-track-left"
      : "gallery-marquee-track-right";

  return (
    <div className="gallery-marquee-row">
      <div
        ref={trackRef}
        className={`gallery-marquee-track ${animClass}`}
        style={{ "--marquee-speed": `${dynamicDuration}s` }}
      >
        {duplicated.map((img) => (
          <button
            key={img._key}
            className="gallery-marquee-item"
            onClick={() => onImageClick(img)}
            type="button"
            aria-label={`View ${img.title}`}
          >
            <img
              src={img.url}
              alt={img.title}
              loading="lazy"
              draggable="false"
            />
            <div className="gallery-marquee-item-overlay">
              <span>{img.title}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Lightbox ── */
function Lightbox({ image, onClose }) {
  if (!image) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] max-w-4xl w-full overflow-hidden rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={image.url}
          alt={image.title}
          className="h-full w-full object-contain bg-slate-900"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-slate-950/80 to-transparent px-6 py-5">
          <p className="text-white font-semibold text-base">{image.title}</p>
          <p className="text-blue-200 text-sm">{image.year}</p>
        </div>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-slate-900/70 hover:bg-slate-800 text-white rounded-full p-1.5 transition"
          aria-label="Close"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}

/* ── Gallery page ── */
function Gallery() {
  const [selectedYear, setSelectedYear]   = useState("All");
  const [lightboxImage, setLightboxImage] = useState(null);

  const allImages = ALL_IMAGES;

  /* ── Filtered images ── */
  const filteredImages = useMemo(() =>
    allImages.filter((img) => selectedYear === "All" || img.year === selectedYear),
    [selectedYear, allImages]
  );

  /* ── Split filtered images into 3 rows for the marquee ── */
  const [row1, row2, row3] = useMemo(() => {
    if (filteredImages.length === 0) return [[], [], []];
    const r1 = [], r2 = [], r3 = [];
    filteredImages.forEach((img, i) => {
      if (i % 3 === 0) r1.push(img);
      else if (i % 3 === 1) r2.push(img);
      else r3.push(img);
    });
    return [r1, r2, r3];
  }, [filteredImages]);

  const handleImageClick = useCallback((img) => setLightboxImage(img), []);
  const handleClose      = useCallback(() => setLightboxImage(null), []);

  return (
    <>
      <PageShell eyebrow="Media" title="Gallery">

        {/* Year filter */}
        <div className="mb-8 flex flex-wrap gap-2">
          {YEARS.map((year) => (
            <button
              key={year}
              type="button"
              onClick={() => setSelectedYear(year)}
              className={`rounded-full px-5 py-2 text-sm font-bold transition ${
                selectedYear === year
                  ? "bg-blue-700 text-white shadow-sm"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-blue-50 hover:text-blue-700"
              }`}
            >
              {year}
            </button>
          ))}
        </div>

        {/* Photo count */}
        <p className="mb-6 text-sm text-slate-400">
          {filteredImages.length} photo{filteredImages.length !== 1 ? "s" : ""}
          {selectedYear !== "All" ? ` from ${selectedYear}` : ""}
        </p>

        {/* Marquee rows */}
        <div className="flex flex-col gap-4 -mx-6 md:-mx-8 overflow-hidden">
          <MarqueeRow images={row1} direction="left"  speed={65} onImageClick={handleImageClick} />
          <MarqueeRow images={row2} direction="right" speed={55} onImageClick={handleImageClick} />
          <MarqueeRow images={row3} direction="left"  speed={75} onImageClick={handleImageClick} />
        </div>

        <p className="mt-6 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
          <ZoomIn size={13} /> Click any image to view it
        </p>
      </PageShell>

      <Lightbox image={lightboxImage} onClose={handleClose} />
    </>
  );
}

export default Gallery;
