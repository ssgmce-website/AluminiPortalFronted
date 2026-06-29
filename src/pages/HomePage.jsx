import { useState, useEffect, useRef, useMemo, memo } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  GraduationCap, Users, Award, HeartHandshake,
  ArrowRight, Briefcase, BookOpen, Gift,
  Building2, MapPin, ChevronRight,
} from 'lucide-react';
import HeroSlider from '../components/HeroSlider';
import Newsroom from '../components/Newsroom';
import contributions from '../data/contributions.json';
import meetImg from '../assets/slide-meet.jpeg';
import sessionImg from '../assets/slide-session.jpeg';
import ceremonyImg from '../assets/slide-ceremony.jpeg';

// ─── ANIMATION VARIANTS (defined once at module level, never recreated) ───────
const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };

// ─── COUNT-UP HOOK ────────────────────────────────────────────────────────────
function useCountUp(target, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref     = useRef(null);
  const started = useRef(false);
  const inView  = useInView(ref, { once: true, margin: '-60px' });

  useEffect(() => {
    if (!inView || started.current) return;
    started.current = true;
    let frame;
    const start = performance.now();
    const tick  = (now) => {
      const t      = Math.min((now - start) / duration, 1);
      const eased  = 1 - Math.pow(1 - t, 3);           // ease-out-cubic
      setCount(Math.floor(eased * target));
      if (t < 1) frame = requestAnimationFrame(tick);
      else setCount(target);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, target, duration]);

  return { count, ref };
}

// ─── STAT CARD (memoized — only re-renders when its own props change) ─────────
const StatCard = memo(function StatCard({ icon: Icon, label, value, suffix = '', prefix = '', color }) {
  const { count, ref } = useCountUp(value);
  return (
    <div ref={ref} className="flex flex-col items-center gap-2 p-6 text-center">
      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${color} shadow-sm`}>
        <Icon size={22} className="text-white" />
      </div>
      <p className="mt-1 text-3xl font-extrabold text-blue-900 md:text-4xl">
        {prefix}{count.toLocaleString('en-IN')}{suffix}
      </p>
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{label}</p>
    </div>
  );
});

// ─── SECTION HEADER (memoized) ────────────────────────────────────────────────
const SectionHeader = memo(function SectionHeader({ eyebrow, title, cta, href }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-500">{eyebrow}</p>
        <h2 className="mt-1 text-3xl font-extrabold text-blue-800 md:text-4xl">{title}</h2>
      </div>
      {cta && href && (
        <Link
          to={href}
          className="flex w-fit items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
        >
          {cta} <ArrowRight size={14} />
        </Link>
      )}
    </div>
  );
});

// ─── FALLBACK AVATAR (handles broken image URLs) ──────────────────────────────
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

// ─── CONTRIBUTION TYPE CONFIG ─────────────────────────────────────────────────
const typeConfig = {
  'Guest Lecture':      { color: 'bg-emerald-100 text-emerald-700', icon: BookOpen },
  'Mentoring':          { color: 'bg-blue-100    text-blue-700',    icon: Users },
  'Scholarship':        { color: 'bg-purple-100  text-purple-700',  icon: Gift },
  'Internship Support': { color: 'bg-amber-100   text-amber-700',   icon: Briefcase },
};

const TABS = ['All', 'Guest Lecture', 'Mentoring', 'Scholarship', 'Internship Support'];

// ─── STATIC DATA (module-level — never recreated across renders) ───────────────
const newAlumni = [
  { name: 'Akash Mendhekar',   branch: 'CSE',        batch: '2024', company: 'Infosys, Pune',        photo: 'https://i.pravatar.cc/150?img=32' },
  { name: 'Priyanka Sable',    branch: 'IT',         batch: '2023', company: 'TCS, Mumbai',           photo: 'https://i.pravatar.cc/150?img=48' },
  { name: 'Rohit Deshmukh',    branch: 'E&TC',       batch: '2024', company: 'Wipro Technologies',    photo: 'https://i.pravatar.cc/150?img=25' },
  { name: 'Snehal Khandelwal', branch: 'Mechanical', batch: '2022', company: 'Bajaj Auto, Pune',      photo: 'https://i.pravatar.cc/150?img=44' },
  { name: 'Vishal Shirsat',    branch: 'Civil',      batch: '2023', company: 'L&T Construction',      photo: 'https://i.pravatar.cc/150?img=17' },
  { name: 'Manasi Bawankar',   branch: 'Electrical', batch: '2024', company: 'Siemens India, Nashik', photo: 'https://i.pravatar.cc/150?img=56' },
  { name: 'Gaurav Wankhede',   branch: 'CSE',        batch: '2023', company: 'Persistent Systems',    photo: 'https://i.pravatar.cc/150?img=11' },
  { name: 'Rutuja Thakare',    branch: 'IT',         batch: '2024', company: 'Cognizant, Pune',       photo: 'https://i.pravatar.cc/150?img=60' },
];

const distinguishedAlumni = [
  {
    name: 'Dr. Suresh Kulkarni', batch: 'Batch of 2005',
    role: 'Chief Technology Officer', company: 'Tata Consultancy Services', location: 'Pune, MH',
    achievement: 'Led digital transformation for 3 Fortune 500 clients. Holds 2 patents in distributed computing systems.',
    photo: 'https://i.pravatar.cc/200?img=12',
  },
  {
    name: 'Anita Bhosale', batch: 'Batch of 2008',
    role: 'Deputy Collector', company: 'Government of Maharashtra', location: 'Nagpur, MH',
    achievement: 'IAS officer who revamped water distribution across 4 districts, impacting 2.5 million citizens.',
    photo: 'https://i.pravatar.cc/200?img=47',
  },
  {
    name: 'Nikhil Waghmare', batch: 'Batch of 2011',
    role: 'Founder & CEO', company: 'NovaTech Solutions', location: 'Bengaluru, KA',
    achievement: 'Built a 120-person SaaS company from Vidarbha. Named in Forbes India 30 Under 30, 2021.',
    photo: 'https://i.pravatar.cc/200?img=33',
  },
  {
    name: 'Pallavi Meshram', batch: 'Batch of 2007',
    role: 'Senior Principal Engineer', company: 'Intel Corporation', location: 'Bengaluru, KA',
    achievement: "Contributed to Intel's 12th Gen Core processor design. Active alumni mentor for SSGMCE students.",
    photo: 'https://i.pravatar.cc/200?img=45',
  },
];

// Each row is doubled so the marquee can loop seamlessly
const galleryRow1 = [
  { src: meetImg,      alt: 'Grand Alumni Meet 2024' },
  { src: sessionImg,   alt: 'Faculty Interaction Session' },
  { src: ceremonyImg,  alt: 'Award Ceremony' },
  { src: 'https://placehold.co/420x280/dbeafe/1e3a8f?text=Cultural+Evening',  alt: 'Cultural Evening' },
  { src: 'https://placehold.co/420x280/dcfce7/14532d?text=Annual+Dinner',     alt: 'Annual Alumni Dinner' },
  { src: 'https://placehold.co/420x280/fef9c3/713f12?text=Tech+Talk',         alt: 'Tech Talk by Alumni' },
];

const galleryRow2 = [
  { src: 'https://placehold.co/420x280/f3e8ff/581c87?text=Campus+Walk',  alt: 'Campus Walk' },
  { src: ceremonyImg,                                                       alt: 'Award Night' },
  { src: 'https://placehold.co/420x280/fee2e2/7f1d1d?text=Sports+Meet',  alt: 'Sports Meet' },
  { src: meetImg,                                                           alt: 'Group Photo' },
  { src: 'https://placehold.co/420x280/d1fae5/065f46?text=Lab+Tour',     alt: 'Lab Tour' },
  { src: sessionImg,                                                        alt: 'Workshop Session' },
];

// ─── HOME PAGE ────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [activeTab, setActiveTab] = useState('All');

  // Derived state — recomputed only when activeTab changes, not on every render
  const filtered = useMemo(
    () => activeTab === 'All'
      ? contributions
      : contributions.filter((c) => c.type === activeTab),
    [activeTab],
  );

  return (
    <div className="space-y-10 pb-10">

      {/* ── HERO SLIDER ─────────────────────────────────────────────────────── */}
      <HeroSlider />

      {/* ── STATS STRIP ─────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1425px]">
        <div className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-lg shadow-blue-950/10">
          {/*
            divide-x draws vertical lines between columns.
            divide-y draws horizontal lines between rows (2-col mobile layout).
            md:divide-y-0 removes the horizontal lines on desktop (all 4 in one row).
          */}
          <div className="grid grid-cols-2 divide-x divide-y divide-blue-100 md:grid-cols-4 md:divide-y-0">
            <StatCard icon={GraduationCap}  label="Alumni Registered"   value={1200} suffix="+"  color="bg-blue-700" />
            <StatCard icon={Users}          label="Active Batches"       value={35}   suffix="+"  color="bg-indigo-600" />
            <StatCard icon={Award}          label="Distinguished Alumni" value={48}               color="bg-amber-500" />
            <StatCard icon={HeartHandshake} label="Total Contributions"  value={50}   prefix="₹" suffix="L+" color="bg-emerald-600" />
          </div>
        </div>
      </section>

      {/* ── NEWSROOM ─────────────────────────────────────────────────────────── */}
      <Newsroom />

      {/* ── ABOUT ALUMNI CELL ───────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1425px] overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-lg shadow-blue-950/10">
        <div className="grid md:grid-cols-5">

          {/* Left: text */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="col-span-3 p-7 md:p-10"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-500">Who We Are</p>
            <h2 className="mt-2 text-3xl font-extrabold leading-snug text-blue-800 md:text-4xl">
              SSGMCE Alumni Cell
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              The SSGMCE Alumni Association is the lifeline connecting thousands of graduates
              across generations. We strengthen the bond between alumni and the institution
              through mentorship, knowledge-sharing, and contributions that shape SSGMCE's future.
            </p>
            <ul className="mt-5 space-y-2.5">
              {[
                'Facilitate networking among alumni across all batches',
                'Support students through mentoring and placement drives',
                'Organize annual meets, reunions, and academic events',
                'Channel alumni contributions towards college development',
              ].map((point) => (
                <li key={point} className="flex items-start gap-2.5 text-sm text-slate-600">
                  <ChevronRight size={15} className="mt-0.5 shrink-0 text-blue-500" />
                  {point}
                </li>
              ))}
            </ul>
            <Link
              to="/about/alumni-cell"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-800"
            >
              Learn More <ArrowRight size={16} />
            </Link>
          </motion.div>

          {/* Right: quick facts */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="col-span-2 border-t border-blue-100 bg-gradient-to-br from-blue-950 via-blue-800 to-blue-700 p-7 text-white md:border-l md:border-t-0 md:p-10"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-200">Quick Facts</p>
            <h3 className="mt-2 text-2xl font-extrabold">Alumni Cell at a Glance</h3>
            <div className="mt-7 space-y-5">
              {[
                { label: 'Established',    value: '1983' },
                { label: 'Location',       value: 'Shegaon, Dist. Buldhana, MH' },
                { label: 'Total Members',  value: '1,200+' },
                { label: 'Annual Meet',    value: 'Every December, SSGMCE Campus' },
                { label: 'Departments',    value: '6 Engineering Branches' },
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

      {/* ── NEWLY REGISTERED ALUMNI ─────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1425px]">
        <div className="rounded-2xl border border-blue-100 bg-white px-7 pb-7 pt-6 shadow-lg shadow-blue-950/10 md:px-8 md:pb-8 md:pt-7">
          <SectionHeader eyebrow="Welcome" title="Newly Registered Alumni" cta="Register Now" href="/register" />

          {/* Hide scrollbar cross-browser while keeping scroll functionality */}
          <div className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="flex gap-4"
            >
              {newAlumni.map((a) => (
                <motion.div
                  key={a.name}
                  variants={fadeUp}
                  className="flex min-w-[190px] flex-col items-center rounded-xl border border-blue-100 bg-slate-50 p-5 text-center"
                >
                  <Avatar
                    src={a.photo}
                    alt={a.name}
                    className="h-16 w-16 rounded-full object-cover ring-4 ring-white shadow-sm"
                  />
                  <p className="mt-3 text-sm font-bold text-slate-800">{a.name}</p>
                  <span className="mt-1.5 rounded-full bg-blue-100 px-3 py-0.5 text-xs font-semibold text-blue-700">
                    {a.branch} · {a.batch}
                  </span>
                  <p className="mt-2 flex items-center gap-1 text-xs text-slate-500">
                    <Building2 size={11} className="shrink-0" />
                    <span className="truncate max-w-[140px]">{a.company}</span>
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── LATEST CONTRIBUTIONS ────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1425px] overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-lg shadow-blue-950/10">
        <div className="p-7 md:p-8">
          <SectionHeader eyebrow="Alumni in Action" title="Latest Contributions" cta="View All" href="/contribution" />

          {/* Tab filter */}
          <div className="mb-6 flex flex-wrap gap-2">
            {TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${
                  activeTab === tab
                    ? 'bg-blue-700 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Cards — whileInView so animation fires when cards enter the viewport */}
          <motion.div
            key={activeTab}                      // re-mounts grid on tab change → re-triggers animation
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: false, margin: '-40px' }}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {filtered.slice(0, 6).map((c) => {
              const cfg  = typeConfig[c.type] ?? { color: 'bg-slate-100 text-slate-600', icon: Award };
              const Icon = cfg.icon;
              return (
                <motion.div
                  key={c.id}
                  variants={fadeUp}
                  className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${cfg.color}`}>
                      <Icon size={11} /> {c.type}
                    </span>
                    <span className="text-xs font-medium text-slate-400">Batch {c.batch}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Avatar src={c.photo} alt={c.name} className="h-10 w-10 shrink-0 rounded-full object-cover" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-800">{c.name}</p>
                      <p className="truncate text-xs text-slate-500">{c.branch}</p>
                    </div>
                  </div>
                  <p className="text-sm leading-6 text-slate-600">{c.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ── DISTINGUISHED ALUMNI (flip cards) ───────────────────────────────── */}
      <section className="mx-auto max-w-[1425px]">
        <div className="rounded-2xl border border-blue-100 bg-white px-7 pb-7 pt-6 shadow-lg shadow-blue-950/10 md:px-8 md:pb-8 md:pt-7">
          <SectionHeader eyebrow="Pride of SSGMCE" title="Distinguished Alumni" cta="View All" href="/about/distinguished-alumni" />
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
          >
            {distinguishedAlumni.map((person) => (
              <motion.div key={person.name} variants={fadeUp} className="flip-card h-72">
                <div className="flip-card-inner">
                  {/* Front */}
                  <div className="flip-card-front flex flex-col items-center justify-center gap-3 border border-blue-100 bg-slate-50 p-5 text-center shadow-sm">
                    <Avatar
                      src={person.photo}
                      alt={person.name}
                      className="h-20 w-20 rounded-full object-cover ring-4 ring-white shadow"
                    />
                    <div>
                      <p className="text-sm font-extrabold text-blue-800">{person.name}</p>
                      <p className="mt-0.5 text-xs font-semibold text-blue-500">{person.batch}</p>
                      <p className="mt-1.5 text-xs text-slate-500">{person.role}</p>
                      <p className="mt-0.5 text-xs font-semibold text-slate-700">{person.company}</p>
                    </div>
                    <p className="text-[11px] italic text-slate-400">Hover to know more</p>
                  </div>
                  {/* Back */}
                  <div className="flip-card-back flex flex-col justify-between bg-gradient-to-br from-blue-950 via-blue-800 to-blue-700 p-5 text-white">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-widest text-blue-300">{person.batch}</p>
                      <p className="mt-1 text-sm font-extrabold leading-snug">{person.name}</p>
                      <p className="mt-0.5 text-xs text-blue-200">{person.role} · {person.company}</p>
                      <p className="mt-3 text-[13px] leading-[1.65] text-blue-50">{person.achievement}</p>
                    </div>
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-blue-300">
                      <MapPin size={11} /> {person.location}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── LAST MEET GALLERY (dual-row infinite marquee) ────────────────────── */}
      <section className="mx-auto max-w-[1425px] overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-lg shadow-blue-950/10">
        <div className="p-7 md:p-8">
          <SectionHeader eyebrow="Memories" title="Last Meet Gallery" cta="Full Gallery" href="/gallery" />
        </div>
        <div className="space-y-3 pb-7" aria-label="Alumni meet photo gallery">
          {/* Row 1 — scrolls left */}
          <div className="gallery-marquee-row">
            <div className="gallery-marquee-track gallery-marquee-track-left" style={{ '--marquee-speed': '32s' }}>
              {[...galleryRow1, ...galleryRow1].map((img, i) => (
                <div key={`r1-${i}`} className="gallery-marquee-item">
                  <img src={img.src} alt={img.alt} loading="lazy" />
                  <div className="gallery-marquee-item-overlay" aria-hidden="true">
                    <span>{img.alt}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Row 2 — scrolls right */}
          <div className="gallery-marquee-row">
            <div className="gallery-marquee-track gallery-marquee-track-right" style={{ '--marquee-speed': '38s' }}>
              {[...galleryRow2, ...galleryRow2].map((img, i) => (
                <div key={`r2-${i}`} className="gallery-marquee-item">
                  <img src={img.src} alt={img.alt} loading="lazy" />
                  <div className="gallery-marquee-item-overlay" aria-hidden="true">
                    <span>{img.alt}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
