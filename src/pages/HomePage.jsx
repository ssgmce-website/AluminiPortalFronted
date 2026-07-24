import { useState, useEffect, useRef, memo, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  Users,
  ArrowRight, Building2, MapPin, ChevronRight, ChevronLeft, X, CalendarDays, UserCheck,
} from 'lucide-react';
import HeroSlider from '../components/HeroSlider';
import NewsTicker from '../components/NewsTicker';
import distinguishedAlumni from '../data/distinguishedAlumni.js';
import newsItems from '../data/newsItems.js';
import { fetchPublicNews } from '../services/newsService';
import { fetchNewlyRegisteredAlumni, fetchDistinguishedAlumni } from '../services/alumniService';
import api from '../services/api';
import ankushGawandeImg from '../assets/newly-registered-alumni/ankush-gawande.jpg';
import chetanAmbalkarImg from '../assets/newly-registered-alumni/chetan-ambalkar.jpg';
import dnyaneshwariChatarkarImg from '../assets/newly-registered-alumni/dnyaneshwari-chatarkar.jpg';
import kalyaniRautImg from '../assets/newly-registered-alumni/kalyani-raut.jpg';
import nayanChandankhedeImg from '../assets/newly-registered-alumni/nayan-chandankhede.jpg';
import riyaDangraImg from '../assets/newly-registered-alumni/riya-dangra.jpg';
import sakshiSondkarImg from '../assets/newly-registered-alumni/sakshi-sondkar.jpg';
import surabhiLahotiImg from '../assets/newly-registered-alumni/surabhi-lahoti.jpg';
import AlumniContributions from '../components/AlumniContributions';


// ─── ANIMATION VARIANTS ───────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.09 } } };

// ─── COUNT-UP HOOK ────────────────────────────────────────────────────────────
function useCountUp(target, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  useEffect(() => {
    if (!inView || started.current) return;
    started.current = true;
    let frame;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setCount(Math.floor(eased * target));
      if (t < 1) frame = requestAnimationFrame(tick);
      else setCount(target);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, target, duration]);

  return { count, ref };
}

// ─── FALLBACK AVATAR ──────────────────────────────────────────────────────────
const Avatar = memo(function Avatar({ src, alt, className }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div className={`${className} flex items-center justify-center bg-blue-100 font-bold text-blue-700`}>
        {alt?.[0]?.toUpperCase() ?? '?'}
      </div>
    );
  }
  return <img src={src} alt={alt} className={className} onError={() => setFailed(true)} loading="lazy" />;
});

// ─── STAT CARD ────────────────────────────────────────────────────────────────
const StatCard = memo(function StatCard({ icon: Icon, label, value, suffix = '', prefix = '' }) {
  const { count, ref } = useCountUp(value);
  return (
    <div ref={ref} className="flex items-center gap-4 px-8 py-6">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100">
        <Icon size={22} className="text-slate-600" />
      </div>
      <div>
        <p className="text-2xl font-extrabold text-slate-800 leading-tight">
          {prefix}{count.toLocaleString('en-IN')}{suffix}
        </p>
        <p className="mt-0.5 text-sm text-slate-500">{label}</p>
      </div>
    </div>
  );
});

// ─── SECTION HEADER with amber accent underline ───────────────────────────────
const SectionHeader = memo(function SectionHeader({ eyebrow, title, cta, href }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">{eyebrow}</p>
        <h2 className="mt-1 text-3xl font-extrabold text-slate-900 md:text-4xl">{title}</h2>
        <div className="mt-2.5 h-1 w-10 rounded-full bg-amber-400" />
      </div>
      {cta && href && (
        <Link
          to={href}
          className="flex w-fit items-center gap-1.5 text-sm font-bold uppercase tracking-wide text-slate-600 transition hover:text-blue-700"
        >
          {cta} <ArrowRight size={14} />
        </Link>
      )}
    </div>
  );
});

// ─── STATIC DATA ──────────────────────────────────────────────────────────────
// Shown until real registrations load, and as a fallback if the API call fails.
const FALLBACK_ALUMNI = [
  { name: "Ankush Gawande", branch: "Computer Science & Engineering", batch: "2024", company: "Infosys, Pune", photo: ankushGawandeImg },
  { name: "Chetan Ambalkar", branch: "Information Technology", batch: "2023", company: "TCS, Mumbai", photo: chetanAmbalkarImg },
  { name: "Dnyaneshwari Chatarkar", branch: "Electronics & Telecommunication", batch: "2024", company: "Wipro Technologies", photo: dnyaneshwariChatarkarImg },
  { name: "Kalyani Raut", branch: "Computer Science & Engineering", batch: "2023", company: "Persistent Systems", photo: kalyaniRautImg },
  { name: "Nayan Chandankhede", branch: "Mechanical Engineering", batch: "2022", company: "Bajaj Auto, Pune", photo: nayanChandankhedeImg },
  { name: "Riya Dangra", branch: "Information Technology", batch: "2024", company: "Cognizant, Pune", photo: riyaDangraImg },
  { name: "Sakshi Sondkar", branch: "Electrical Engineering", batch: "2024", company: "Siemens India, Nashik", photo: sakshiSondkarImg },
  { name: "Surabhi Lahoti", branch: "Computer Science & Engineering", batch: "2023", company: "L&T Construction", photo: surabhiLahotiImg },
];

function HomeGalleryMarqueeRow({ images, direction = "left", speed = 70, onImageClick }) {
  const duplicated = useMemo(() => {
    if (!images.length) return [];

    let copies = Math.max(4, Math.ceil(20 / images.length));
    if (copies % 2 !== 0) copies += 1;

    const result = [];
    for (let c = 0; c < copies; c++) {
      images.forEach((img, i) => {
        result.push({ ...img, _key: `${c}-${i}` });
      });
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
        className={`gallery-marquee-track ${animClass}`}
        style={{ "--marquee-speed": `${dynamicDuration}s` }}
      >
        {duplicated.map((img) => (
          <button
            key={img._key}
            type="button"
            onClick={() => onImageClick && onImageClick(img)}
            className="gallery-marquee-item cursor-pointer text-left"
          >
            <img
              src={img.url || img.src}
              alt={img.title || img.alt}
              loading="lazy"
              draggable="false"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://placehold.co/400x300?text=Gallery+Image";
              }}
            />
            <div className="gallery-marquee-item-overlay" aria-hidden="true">
              <span>{img.title || img.alt}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function HomeLightbox({ image, onClose, onPrev, onNext, hasPrev, hasNext }) {
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
          src={image.url || image.src}
          alt={image.title || image.alt || 'Gallery Image'}
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
            <p className="text-white font-bold text-base">{image.title || image.alt}</p>
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


// ─── HOME PAGE ────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [newAlumni, setNewAlumni] = useState(FALLBACK_ALUMNI);
  const [dbGallery, setDbGallery] = useState([]);
  const [news, setNews] = useState(newsItems);
  const [alumniList, setAlumniList] = useState(distinguishedAlumni);

  // Fetch active news from backend API
  useEffect(() => {
    let cancelled = false;
    fetchPublicNews()
      .then((data) => {
        if (!cancelled && data && data.length > 0) {
          setNews(data);
        }
      })
      .catch((err) => {
        console.error("[HomePage] News fetch error:", err);
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchNewlyRegisteredAlumni(8)
      .then((alumni) => {
        if (!cancelled && alumni?.length) setNewAlumni(alumni);
      })
      .catch(() => {
        // keep FALLBACK_ALUMNI on error
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchDistinguishedAlumni()
      .then((dbAlumni) => {
        if (!cancelled && dbAlumni) {
          const dbNames = new Set(dbAlumni.map(a => a.name.toLowerCase().trim()));
          const uniqueStatic = distinguishedAlumni.filter(a => !dbNames.has(a.name.toLowerCase().trim()));
          setAlumniList([...uniqueStatic, ...dbAlumni]);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch distinguished alumni for homepage:', err);
      });
    return () => { cancelled = true; };
  }, []);

  // Fetch dynamic gallery photos from backend API
  useEffect(() => {
    let cancelled = false;
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
        if (!cancelled) setDbGallery(formatted);
      })
      .catch((err) => console.error("[HomePage] Gallery fetch error:", err));
    return () => { cancelled = true; };
  }, []);

  // Split gallery images across 3 marquee rows
  const [galleryRow1, galleryRow2, galleryRow3] = useMemo(() => {
    if (!dbGallery.length) return [[], [], []];
    const r1 = [], r2 = [], r3 = [];
    dbGallery.forEach((img, i) => {
      if (i % 3 === 0) r1.push(img);
      else if (i % 3 === 1) r2.push(img);
      else r3.push(img);
    });
    return [r1, r2, r3];
  }, [dbGallery]);

  const [lightboxIndex, setLightboxIndex] = useState(null);

  const handleImageClick = (img) => {
    const idx = dbGallery.findIndex((item) => item.id === img.id || item.url === img.url);
    if (idx !== -1) setLightboxIndex(idx);
  };

  const handleClose = () => setLightboxIndex(null);

  const handlePrev = () => {
    setLightboxIndex((prev) => (prev > 0 ? prev - 1 : dbGallery.length - 1));
  };

  const handleNext = () => {
    setLightboxIndex((prev) => (prev < dbGallery.length - 1 ? prev + 1 : 0));
  };

  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') handlePrev();
      else if (e.key === 'ArrowRight') handleNext();
      else if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, dbGallery]);

  const lightboxImage = lightboxIndex !== null ? dbGallery[lightboxIndex] : null;

  return (
    <div className="space-y-14 pb-14">

      {/* ── HERO SLIDER ─────────────────────────────────────────────────────── */}
      <HeroSlider />

      {/* ── STATS STRIP ─────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1425px]">
        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="grid grid-cols-2 divide-x divide-y divide-slate-100 md:grid-cols-4 md:divide-y-0">
            <StatCard icon={UserCheck} label="Registered Alumni" value={15000} suffix="+" />
            <StatCard icon={Building2} label="Companies" value={350} suffix="+" />
            <StatCard icon={CalendarDays} label="Events Organised" value={200} suffix="+" />
            <StatCard icon={Users} label="Active Mentors" value={1000} suffix="+" />
          </div>
        </div>
      </section>

      <NewsTicker items={news} />

      {/* ── ABOUT ALUMNI CELL ───────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1425px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="grid md:grid-cols-5">
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="col-span-3 p-8 md:p-12"
          >
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Who We Are</p>
            <h2 className="mt-1 text-3xl font-extrabold text-slate-900 md:text-4xl">SSGMCE Alumni Cell</h2>
            <div className="mt-2.5 h-1 w-10 rounded-full bg-amber-400" />
            <p className="mt-5 text-base leading-7 text-slate-500">
              The SSGMCE Alumni Association is the lifeline connecting thousands of graduates
              across generations — through mentorship, knowledge-sharing, and contributions
              that shape SSGMCE's future.
            </p>
            <ul className="mt-5 space-y-3">
              {[
                'Facilitate networking among alumni across all batches',
                'Support students through mentoring and placement drives',
                'Organize annual meets, reunions, and academic events',
                'Channel alumni contributions towards college development',
              ].map((point) => (
                <li key={point} className="flex items-start gap-2.5 text-sm text-slate-600">
                  <ChevronRight size={15} className="mt-0.5 shrink-0 text-amber-500" />
                  {point}
                </li>
              ))}
            </ul>
            <Link
              to="/about/alumni-cell"
              className="mt-7 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-slate-700 transition hover:text-blue-700"
            >
              Learn More <ArrowRight size={14} />
            </Link>
          </motion.div>

          <motion.div
            variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="col-span-2 border-t border-slate-200 bg-gradient-to-br from-blue-950 via-blue-800 to-blue-700 p-8 text-white md:border-l md:border-t-0 md:p-12"
          >
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-200">Quick Facts</p>
            <h3 className="mt-1 text-2xl font-extrabold">Alumni Cell at a Glance</h3>
            <div className="mt-2.5 h-1 w-10 rounded-full bg-amber-400" />
            <div className="mt-7 space-y-5">
              {[
                { label: 'Established', value: '1983' },
                { label: 'Location', value: 'Shegaon, Dist. Buldhana, MH' },
                { label: 'Total Members', value: '1,200+' },
                { label: 'Annual Meet', value: 'Every December, SSGMCE Campus' },
                { label: 'Departments', value: '6 Engineering Branches' },
              ].map(({ label, value }) => (
                <div key={label} className="border-b border-white/15 pb-4 last:border-0 last:pb-0">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-blue-300">{label}</span>
                  <p className="mt-0.5 text-base font-bold">{value}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── NEWLY REGISTERED ALUMNI — Faculty-card style ─────────────────────── */}
      <section className="mx-auto max-w-[1425px]">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm md:p-10">
          <SectionHeader eyebrow="Welcome" title="Newly Registered Alumni" cta="Register Now" href="/register" />

          <div className="flex gap-5 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <motion.div
              variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
              className="flex gap-5"
            >
              {newAlumni.map((a, idx) => (
                <motion.div
                  key={a.name + idx}
                  variants={fadeUp}
                  className="group min-w-[200px] max-w-[220px] overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-shadow hover:shadow-md"
                >
                  {/* Portrait photo */}
                  <div className="aspect-[4/5] overflow-hidden bg-slate-100">
                    <Avatar
                      src={a.photo}
                      alt={a.name}
                      className="h-full w-full object-cover object-top transition duration-300 group-hover:scale-105"
                    />
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <p className="font-bold text-slate-800 line-clamp-1">{a.name}</p>
                    {a.batch && a.batch !== 'N/A' && (
                      <p className="mt-0.5 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                        Batch {a.batch}
                      </p>
                    )}
                    {a.branch && a.branch !== 'N/A' && (
                      <p className="mt-1 text-xs text-slate-500 capitalize line-clamp-1">{a.branch}</p>
                    )}
                    {a.company && a.company !== 'N/A' && (
                      <p className="mt-2 flex items-center gap-1 text-xs text-slate-400">
                        <Building2 size={11} className="shrink-0" />
                        <span className="truncate">{a.company}</span>
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── ALUMNI CONTRIBUTIONS — donation stats + recent donors ────────────── */}
      <AlumniContributions />

      {/* ── DISTINGUISHED ALUMNI — Prestigious-Alumni quote style ───────────── */}
      <section className="mx-auto max-w-[1425px] rounded-2xl border border-slate-200 bg-white p-8 shadow-sm md:p-10">
        <SectionHeader eyebrow="Pride of SSGMCE" title="Distinguished Alumni" cta="View All" href="/distinguished-alumni" />

        <motion.div
          variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {alumniList.slice(0, 8).map((person) => (
            <motion.div
              key={person.name}
              variants={fadeUp}
              className="relative flex min-h-[220px] flex-col items-center overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 py-8 shadow-sm transition-shadow hover:shadow-md"
            >
              {/* Decorative large quote mark */}
              <span
                className="pointer-events-none absolute -top-2 left-3 font-serif text-8xl leading-none text-slate-100 select-none"
                aria-hidden="true"
              >
                "
              </span>

              {/* Circular photo */}
              <div className="relative mb-4 flex justify-center">
                <Avatar
                  src={person.photo}
                  alt={person.name}
                  className="h-24 w-24 rounded-full object-cover ring-4 ring-white shadow-md"
                />
              </div>

              {/* Company — small uppercase amber */}
              {person.company && (
                <p className="text-center text-[10px] font-bold uppercase tracking-widest text-amber-500">
                  {person.company}
                </p>
              )}

              {/* Name */}
              <h3 className="mt-1 text-center text-sm font-extrabold text-slate-800">
                {person.name}
              </h3>

              {/* Role — amber */}
              {person.role && (
                <p className="mt-0.5 text-center text-xs font-semibold text-amber-500">
                  {person.role}
                </p>
              )}

              {/* Batch */}
              {person.batch && (
                <p className="mt-1 text-center text-xs text-slate-400">{person.batch}</p>
              )}

              {/* Branch */}
              {person.branch && (
                <p className="mt-1 text-center text-xs text-slate-400">{person.branch}</p>
              )}

              {/* Achievement */}
              {person.achievement && (
                <p className="mt-3 text-center text-xs leading-5 text-slate-500 line-clamp-3">
                  {person.achievement}
                </p>
              )}

              {/* Location */}
              {person.location && (
                <p className="mt-3 flex items-center justify-center gap-1 text-xs text-slate-400">
                  <MapPin size={11} /> {person.location}
                </p>
              )}
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── LAST MEET GALLERY — dual-row infinite marquee ────────────────────── */}
      <section className="mx-auto max-w-[1425px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="p-8 md:p-10">
          <SectionHeader eyebrow="Memories" title="Alumni Meet 2026" cta="Full Gallery" href="/gallery" />
        </div>
        <div className="flex flex-col gap-4 overflow-hidden pb-8" aria-label="Alumni meet photo gallery">
          <HomeGalleryMarqueeRow images={galleryRow1} direction="left" speed={65} onImageClick={handleImageClick} />
          <HomeGalleryMarqueeRow images={galleryRow2} direction="right" speed={55} onImageClick={handleImageClick} />
          <HomeGalleryMarqueeRow images={galleryRow3} direction="left" speed={75} onImageClick={handleImageClick} />
        </div>
      </section>

      <HomeLightbox
        image={lightboxImage}
        onClose={handleClose}
        onPrev={handlePrev}
        onNext={handleNext}
        hasPrev={dbGallery.length > 1}
        hasNext={dbGallery.length > 1}
      />

    </div>
  );
}
