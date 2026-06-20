import { useState, useMemo, useRef, useCallback } from "react";
import { X, ZoomIn } from "lucide-react";
import PageShell from "../components/PageShell";
import ceremonyImg from "../assets/slide-ceremony.jpeg";
import sessionImg  from "../assets/slide-session.jpeg";
import meetImg     from "../assets/slide-meet.jpeg";

const GALLERY_DATA = {
  2026: [
    { id: "26-1", url: ceremonyImg, title: "Annual Alumni Meet Opening Ceremony" },
    { id: "26-2", url: sessionImg,  title: "Career Guidance Session 2026"        },
    { id: "26-3", url: meetImg,     title: "Grand Alumni Gathering 2026"          },
    { id: "26-4", url: ceremonyImg, title: "Felicitation of Distinguished Alumni" },
    { id: "26-5", url: sessionImg,  title: "Industry Expert Interaction 2026"    },
    { id: "26-6", url: meetImg,     title: "Batch Reunion 2026"                  },
  ],
  2025: [
    { id: "25-1", url: meetImg,     title: "Silver Jubilee Alumni Meet"           },
    { id: "25-2", url: ceremonyImg, title: "Convocation Ceremony 2025"            },
    { id: "25-3", url: sessionImg,  title: "Alumni Faculty Interaction 2025"      },
    { id: "25-4", url: meetImg,     title: "Annual Alumni Gathering 2025"         },
    { id: "25-5", url: ceremonyImg, title: "Award Night 2025"                     },
    { id: "25-6", url: sessionImg,  title: "Guest Lecture Series 2025"            },
  ],
  2024: [
    { id: "24-1", url: sessionImg,  title: "Internship Drive Session 2024"        },
    { id: "24-2", url: meetImg,     title: "Alumni Meet 2024"                     },
    { id: "24-3", url: ceremonyImg, title: "Scholarship Distribution Ceremony"    },
    { id: "24-4", url: sessionImg,  title: "Mentorship Program Launch 2024"       },
    { id: "24-5", url: meetImg,     title: "Batch of 2014 Reunion"                },
    { id: "24-6", url: ceremonyImg, title: "Distinguished Alumni Honour 2024"     },
  ],
  2023: [
    { id: "23-1", url: ceremonyImg, title: "Alumni Day Celebration 2023"          },
    { id: "23-2", url: meetImg,     title: "Grand Reunion 2023"                   },
    { id: "23-3", url: sessionImg,  title: "AI & Technology Workshop 2023"        },
    { id: "23-4", url: ceremonyImg, title: "Convocation 2023"                     },
    { id: "23-5", url: meetImg,     title: "Cultural Evening 2023"                },
    { id: "23-6", url: sessionImg,  title: "Career Fair 2023"                     },
  ],
};

const YEARS = Object.keys(GALLERY_DATA).sort((a, b) => b - a);

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

  const itemsShifted    = duplicated.length / 2;
  const dynamicDuration = itemsShifted * (speed / 12);
  const animClass       = direction === "left"
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

/* ── Page ── */
function EventGallery() {
  const [activeYear, setActiveYear]     = useState(YEARS[0]);
  const [lightboxImage, setLightboxImage] = useState(null);

  const images = GALLERY_DATA[activeYear] || [];

  const [row1, row2, row3] = useMemo(() => {
    if (!images.length) return [[], [], []];
    const r1 = [], r2 = [], r3 = [];
    images.forEach((img, i) => {
      if      (i % 3 === 0) r1.push(img);
      else if (i % 3 === 1) r2.push(img);
      else                  r3.push(img);
    });
    return [r1, r2, r3];
  }, [images]);

  const handleClick = useCallback((img) => setLightboxImage(img), []);
  const handleClose = useCallback(() => setLightboxImage(null), []);

  return (
    <>
      <PageShell eyebrow="Event" title="Photo Gallery">

        {/* Year tabs */}
        <div className="mb-8 flex flex-wrap gap-2">
          {YEARS.map((year) => (
            <button
              key={year}
              type="button"
              onClick={() => setActiveYear(year)}
              className={`rounded-full px-6 py-2 text-sm font-bold transition ${
                activeYear === year
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
          {images.length} photos from {activeYear}
        </p>

        {/* Marquee rows */}
        <div className="flex flex-col gap-4 -mx-6 md:-mx-8 overflow-hidden">
          <MarqueeRow images={row1} direction="left"  speed={65} onImageClick={handleClick} />
          <MarqueeRow images={row2} direction="right" speed={55} onImageClick={handleClick} />
          <MarqueeRow images={row3} direction="left"  speed={75} onImageClick={handleClick} />
        </div>

        <p className="mt-6 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
          <ZoomIn size={13} /> Click any image to view it
        </p>
      </PageShell>

      <Lightbox image={lightboxImage} onClose={handleClose} />
    </>
  );
}

export default EventGallery;
