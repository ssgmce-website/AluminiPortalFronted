import { useState, useMemo, useRef, useCallback } from "react";
import { X, ZoomIn } from "lucide-react";
import PageShell from "../components/PageShell";
import ceremonyImg from "../assets/slide-ceremony.jpeg";
import sessionImg  from "../assets/slide-session.jpeg";
import meetImg     from "../assets/slide-meet.jpeg";

/* ── Data ── */
const ALL_IMAGES = [
  { id: 1,  url: ceremonyImg, title: "Alumni Award Ceremony",       category: "Ceremonies"  },
  { id: 2,  url: sessionImg,  title: "Faculty Interaction Session",  category: "Sessions"    },
  { id: 3,  url: meetImg,     title: "Grand Alumni Meet 2024",       category: "Meets"       },
  { id: 4,  url: ceremonyImg, title: "Felicitation Function",        category: "Ceremonies"  },
  { id: 5,  url: sessionImg,  title: "Career Guidance Lecture",      category: "Sessions"    },
  { id: 6,  url: meetImg,     title: "Batch Reunion 2023",           category: "Meets"       },
  { id: 7,  url: ceremonyImg, title: "Convocation 2023",             category: "Ceremonies"  },
  { id: 8,  url: sessionImg,  title: "Industry Expert Talk",         category: "Sessions"    },
  { id: 9,  url: meetImg,     title: "Silver Jubilee Meet",          category: "Meets"       },
  { id: 10, url: ceremonyImg, title: "Distinguished Alumni Honour",  category: "Ceremonies"  },
  { id: 11, url: sessionImg,  title: "Internship Drive Session",     category: "Sessions"    },
  { id: 12, url: meetImg,     title: "Annual Alumni Gathering",      category: "Meets"       },
];

const CATEGORIES = ["All", "Ceremonies", "Sessions", "Meets"];

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

  const itemsShifted   = duplicated.length / 2;
  const dynamicDuration = itemsShifted * (speed / 12);
  const animClass      = direction === "left"
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
            <img src={img.url} alt={img.title} loading="lazy" draggable="false" />
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] max-w-4xl w-full overflow-hidden rounded-xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={image.url}
          alt={image.title}
          className="h-full w-full object-contain bg-slate-900"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-950/80 to-transparent px-5 py-4">
          <p className="text-white font-semibold">{image.title}</p>
          <p className="text-blue-200 text-sm">{image.category}</p>
        </div>
        <button
          onClick={onClose}
          className="absolute top-3 right-3 bg-slate-900/70 hover:bg-slate-800 text-white rounded-full p-1.5 transition"
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
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [lightboxImage, setLightboxImage]       = useState(null);

  const filteredImages = useMemo(() =>
    selectedCategory === "All"
      ? ALL_IMAGES
      : ALL_IMAGES.filter((img) => img.category === selectedCategory),
    [selectedCategory]
  );

  const [row1, row2, row3] = useMemo(() => {
    if (filteredImages.length === 0) return [[], [], []];
    const r1 = [], r2 = [], r3 = [];
    filteredImages.forEach((img, i) => {
      if      (i % 3 === 0) r1.push(img);
      else if (i % 3 === 1) r2.push(img);
      else                  r3.push(img);
    });
    return [r1, r2, r3];
  }, [filteredImages]);

  const handleImageClick = useCallback((img) => setLightboxImage(img), []);
  const handleClose      = useCallback(() => setLightboxImage(null), []);

  return (
    <>
      <PageShell eyebrow="Media" title="Gallery">
        {/* Category filter */}
        <div className="mb-8 flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                selectedCategory === cat
                  ? "bg-blue-700 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

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
