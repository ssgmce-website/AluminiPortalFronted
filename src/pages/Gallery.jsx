import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { X, ZoomIn, Image as ImageIcon, ChevronLeft, ChevronRight } from "lucide-react";
import PageShell from "../components/PageShell";
import api from "../services/api";

/* ── MarqueeRow ── */
function MarqueeRow({ images, direction = "left", speed = 70, onImageClick }) {
  const trackRef = useRef(null);

  const duplicated = useMemo(() => {
    if (!images.length) return [];
    let copies = Math.max(4, Math.ceil(20 / images.length));
    if (copies % 2 !== 0) copies += 1;

    const result = [];
    for (let c = 0; c < copies; c++) {
      images.forEach((img, i) => result.push({ ...img, _key: `${c}-${i}` }));
    }
    return result;
  }, [images]);

  if (!images.length) return null;

  const itemsShifted = duplicated.length / 2;
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
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://placehold.co/400x300?text=Gallery+Image";
              }}
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
function Lightbox({ image, onClose, onPrev, onNext, hasPrev, hasNext }) {
  if (!image) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] max-w-5xl w-full overflow-hidden rounded-2xl shadow-2xl flex items-center justify-center bg-slate-950"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={image.url}
          alt={image.title}
          className="max-h-[85vh] w-auto max-w-full object-contain mx-auto"
        />

        {/* Previous Button */}
        {hasPrev && (
          <button
            onClick={onPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-slate-900/80 hover:bg-blue-600 text-white rounded-full p-3 transition-all cursor-pointer shadow-lg hover:scale-110 flex items-center justify-center border border-white/10"
            aria-label="Previous image"
          >
            <ChevronLeft size={24} />
          </button>
        )}

        {/* Next Button */}
        {hasNext && (
          <button
            onClick={onNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-slate-900/80 hover:bg-blue-600 text-white rounded-full p-3 transition-all cursor-pointer shadow-lg hover:scale-110 flex items-center justify-center border border-white/10"
            aria-label="Next image"
          >
            <ChevronRight size={24} />
          </button>
        )}

        <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-slate-950/90 via-slate-950/60 to-transparent px-6 py-4 flex items-end justify-between pointer-events-none">
          <div>
            <p className="text-white font-bold text-base">{image.title}</p>
            {image.year && <p className="text-blue-300 text-xs font-semibold mt-0.5">{image.year}</p>}
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-slate-900/80 hover:bg-red-600 text-white rounded-full p-2 transition cursor-pointer border border-white/10"
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
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [dbImages, setDbImages]           = useState([]);
  const [loading, setLoading]             = useState(true);

  useEffect(() => {
    api
      .get("/public/gallery")
      .then((res) => {
        const list = res.data?.data?.gallery || [];
        const formatted = list.map((item) => ({
          id: item._id,
          url: item.imageUrl,
          title: item.title,
          year: String(item.year),
        }));
        setDbImages(formatted);
      })
      .catch((err) => console.error("[Gallery] Public fetch error:", err))
      .finally(() => setLoading(false));
  }, []);

  const yearsList = useMemo(() => {
    if (!dbImages.length) return ["All"];
    const set = new Set(dbImages.map((img) => String(img.year)));
    return ["All", ...Array.from(set).sort((a, b) => b - a)];
  }, [dbImages]);

  /* ── Filtered images ── */
  const filteredImages = useMemo(() =>
    dbImages.filter((img) => selectedYear === "All" || String(img.year) === String(selectedYear)),
    [selectedYear, dbImages]
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

  const handleImageClick = useCallback((img) => {
    const idx = filteredImages.findIndex((item) => item.id === img.id || item.url === img.url);
    if (idx !== -1) {
      setLightboxIndex(idx);
    }
  }, [filteredImages]);

  const handleClose = useCallback(() => setLightboxIndex(null), []);

  const handlePrev = useCallback(() => {
    setLightboxIndex((prev) => (prev > 0 ? prev - 1 : filteredImages.length - 1));
  }, [filteredImages]);

  const handleNext = useCallback(() => {
    setLightboxIndex((prev) => (prev < filteredImages.length - 1 ? prev + 1 : 0));
  }, [filteredImages]);

  // Keyboard navigation
  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") handlePrev();
      else if (e.key === "ArrowRight") handleNext();
      else if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, handlePrev, handleNext, handleClose]);

  const lightboxImage = lightboxIndex !== null ? filteredImages[lightboxIndex] : null;

  return (
    <>
      <PageShell eyebrow="Media" title="Gallery">
        {/* Year filter */}
        {yearsList.length > 1 && (
          <div className="mb-8 flex flex-wrap gap-2">
            {yearsList.map((year) => (
              <button
                key={year}
                type="button"
                onClick={() => {
                  setSelectedYear(year);
                  setLightboxIndex(null);
                }}
                className={`rounded-full px-5 py-2 text-sm font-bold transition cursor-pointer ${
                  selectedYear === year
                    ? "bg-blue-700 text-white shadow-sm"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                }`}
              >
                {year}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 text-slate-400">
            <p className="text-sm font-semibold">Loading gallery photos...</p>
          </div>
        ) : filteredImages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <ImageIcon size={48} className="text-slate-300 mb-3" />
            <h3 className="text-lg font-bold text-slate-700">No Gallery Photos Available</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              {selectedYear !== "All"
                ? `No photos uploaded for year ${selectedYear}.`
                : "No gallery photos uploaded yet. Check back soon for event memories!"}
            </p>
          </div>
        ) : (
          <>
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
          </>
        )}
      </PageShell>

      <Lightbox
        image={lightboxImage}
        onClose={handleClose}
        onPrev={handlePrev}
        onNext={handleNext}
        hasPrev={filteredImages.length > 1}
        hasNext={filteredImages.length > 1}
      />
    </>
  );
}

export default Gallery;
