import { motion } from 'framer-motion';
import {
  Target, Users, Handshake, Trophy, Mail, Phone, MapPin,
  GraduationCap, CalendarDays, Building2, BookOpen,
  Lightbulb, Star, Globe, CheckCircle2,
} from 'lucide-react';

const collegeImg = '/college-building.jpeg';

const fadeUp  = { hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };

/* ── Data ───────────────────────────────────────────────────────────────────── */

const STATS = [
  { value: '15,000+', label: 'Registered Alumni',   icon: GraduationCap },
  { value: '1983',    label: 'Year Established',     icon: Building2     },
  { value: '8',       label: 'Departments',          icon: BookOpen      },
  { value: '40+',     label: 'Years of Excellence',  icon: Star          },
];

const PILLARS = [
  {
    icon: Users,
    title: 'Connect',
    iconBg: 'bg-blue-100 text-blue-700',
    border: 'border-blue-100',
    desc: 'Build a lifelong network of SSGMCE graduates spanning industries and geographies worldwide.',
  },
  {
    icon: Handshake,
    title: 'Collaborate',
    iconBg: 'bg-emerald-100 text-emerald-700',
    border: 'border-emerald-100',
    desc: 'Partner with students, faculty, and the institution for meaningful knowledge exchange and mentorship.',
  },
  {
    icon: Trophy,
    title: 'Contribute',
    iconBg: 'bg-amber-100 text-amber-700',
    border: 'border-amber-100',
    desc: 'Give back through scholarships, guest lectures, internships, and campus infrastructure development.',
  },
];

const ACTIVITIES = [
  { icon: CalendarDays, title: 'Annual Alumni Meet',     desc: 'A grand reunion that reconnects graduates from every batch and department.' },
  { icon: BookOpen,     title: 'Guest Lectures',         desc: 'Industry leaders share insights and real-world experience with current students.' },
  { icon: GraduationCap,title: 'Scholarship Programs',  desc: 'Financial support for meritorious and underprivileged students.' },
  { icon: Globe,        title: 'Career Guidance',        desc: 'Placement drives, resume workshops, and mock interview sessions.' },
  { icon: Lightbulb,   title: 'Innovation & Startups',  desc: 'Mentorship and seed support for student entrepreneurs and innovators.' },
  { icon: Users,        title: 'Mentorship Network',     desc: 'One-on-one mentoring by alumni for academic and career growth.' },
];

const OBJECTIVES = [
  'Maintain and strengthen the bond between alumni and their alma mater',
  'Support academic and infrastructural development of SSGMCE',
  'Facilitate career guidance, mentoring, and placement assistance for students',
  'Recognise distinguished alumni and celebrate their achievements',
  'Organise annual meets, reunions, and professional development events',
  'Promote entrepreneurship and innovation among current students',
];

/* ── Section heading ─────────────────────────────────────────────────────────── */
function SectionHeading({ eyebrow, title, center = false }) {
  return (
    <div className={center ? 'text-center' : ''}>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600 mb-1">{eyebrow}</p>
      <h2 className="text-2xl font-extrabold text-slate-900 md:text-3xl">{title}</h2>
      <div className={`mt-3 h-1 w-12 rounded-full bg-blue-600 ${center ? 'mx-auto' : ''}`} />
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────────── */
function AlumniCell() {
  return (
    <div className="mx-auto max-w-[1425px] overflow-hidden rounded-xl border border-blue-100 bg-white shadow-lg shadow-blue-950/10">

      {/* ── Hero ── */}
      <div className="relative h-72 md:h-[460px] overflow-hidden">
        <img
          src={collegeImg}
          alt="SSGMCE Main Building, Shegaon"
          className="h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-blue-950/85 via-blue-900/40 to-blue-800/10" />

        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
          <motion.p
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="text-xs font-bold uppercase tracking-[0.22em] text-blue-300"
          >
            About Us
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="mt-2 text-3xl font-extrabold leading-tight text-white md:text-5xl lg:text-6xl"
          >
            SSGMCE Alumni Cell
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            className="mt-3 max-w-xl text-sm leading-6 text-blue-100 md:text-base"
          >
            Shri Sant Gajanan Maharaj College of Engineering, Shegaon — bridging alumni, students &amp; institution since 1983.
          </motion.p>
        </div>
      </div>

      {/* ── Stats strip ── */}
      <motion.div
        variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
        className="grid grid-cols-2 divide-x divide-y divide-slate-100 border-b border-slate-100 md:grid-cols-4 md:divide-y-0"
      >
        {STATS.map(({ value, label, icon: Icon }) => (
          <motion.div
            key={label}
            variants={fadeUp}
            className="flex flex-col items-center gap-2 py-7 px-4 text-center"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Icon size={20} />
            </div>
            <p className="text-2xl font-extrabold text-slate-900 md:text-3xl">{value}</p>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* ── About + Mission/Vision ── */}
      <div className="p-6 md:p-12 space-y-14">

        <motion.div
          variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-start"
        >
          {/* About text */}
          <motion.div variants={fadeUp}>
            <SectionHeading eyebrow="Who We Are" title="About the Alumni Cell" />
            <p className="mt-6 text-base leading-8 text-slate-600">
              The <strong className="text-slate-800">SSGMCE Alumni Cell</strong> is the official body that
              fosters a lasting connection between the college and its vast network of graduates. Established
              to bridge the gap between academia and industry, the cell actively drives academic excellence,
              professional development, and the holistic growth of students and alumni alike.
            </p>
            <p className="mt-4 text-base leading-8 text-slate-600">
              With alumni spanning global organisations, research institutions, and entrepreneurial ventures,
              the cell is a vibrant platform for meaningful exchange, giving back, and sustained engagement
              with one's alma mater.
            </p>
          </motion.div>

          {/* Mission & Vision */}
          <motion.div variants={fadeUp} className="space-y-5">
            <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
                  <Target size={17} />
                </div>
                <h3 className="text-base font-bold text-blue-900">Our Mission</h3>
              </div>
              <p className="text-sm leading-7 text-slate-600">
                To cultivate a strong, engaged alumni community that actively contributes to the growth of
                SSGMCE — through mentorship, resources, and industry partnerships.
              </p>
            </div>

            <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white">
                  <Lightbulb size={17} />
                </div>
                <h3 className="text-base font-bold text-emerald-900">Our Vision</h3>
              </div>
              <p className="text-sm leading-7 text-slate-600">
                To be a premier alumni network that empowers graduates and elevates SSGMCE to national and
                global recognition through collective achievement and continuous collaboration.
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* ── Pillars ── */}
        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <motion.div variants={fadeUp}>
            <SectionHeading eyebrow="Core Principles" title="What We Stand For" center />
          </motion.div>
          <motion.div
            variants={stagger}
            className="mt-8 grid gap-5 sm:grid-cols-3"
          >
            {PILLARS.map(({ icon: Icon, title, iconBg, border, desc }) => (
              <motion.div
                key={title}
                variants={fadeUp}
                className={`rounded-xl border ${border} bg-white p-7 text-center shadow-sm hover:shadow-md transition-shadow`}
              >
                <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${iconBg}`}>
                  <Icon size={24} />
                </div>
                <h3 className="text-lg font-bold text-slate-800">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* ── Key Activities ── */}
        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <motion.div variants={fadeUp}>
            <SectionHeading eyebrow="What We Do" title="Key Activities &amp; Programs" />
          </motion.div>
          <motion.div
            variants={stagger}
            className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {ACTIVITIES.map(({ icon: Icon, title, desc }) => (
              <motion.div
                key={title}
                variants={fadeUp}
                className="flex gap-4 rounded-xl border border-slate-100 bg-slate-50 p-5 hover:shadow-sm transition-shadow"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                  <Icon size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">{title}</h4>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* ── Objectives ── */}
        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <motion.div variants={fadeUp}>
            <SectionHeading eyebrow="Our Goals" title="Objectives" />
          </motion.div>
          <motion.ul
            variants={stagger}
            className="mt-8 grid gap-3 sm:grid-cols-2"
          >
            {OBJECTIVES.map((obj, i) => (
              <motion.li
                key={obj}
                variants={fadeUp}
                className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3"
              >
                <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-blue-500" />
                <span className="text-sm leading-6 text-slate-600">{obj}</span>
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>

        {/* ── Contact ── */}
        <motion.div
          variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
        >
          <motion.div variants={fadeUp}>
            <SectionHeading eyebrow="Get In Touch" title="Contact the Alumni Cell" />
          </motion.div>
          <motion.div
            variants={stagger}
            className="mt-8 grid gap-4 sm:grid-cols-3"
          >
            {[
              {
                icon: MapPin,
                label: 'Address',
                value: 'SSGMCE, Shegaon, Dist. Buldhana, Maharashtra – 444 203',
                color: 'bg-rose-50 text-rose-600 border-rose-100',
              },
              {
                icon: Mail,
                label: 'Email',
                value: 'alumni@ssgmce.ac.in',
                color: 'bg-blue-50 text-blue-600 border-blue-100',
              },
              {
                icon: Phone,
                label: 'Phone',
                value: '+91 72620 00000',
                color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
              },
            ].map(({ icon: Icon, label, value, color }) => (
              <motion.div
                key={label}
                variants={fadeUp}
                className={`flex items-start gap-4 rounded-xl border p-5 ${color.split(' ')[2]} bg-white shadow-sm`}
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${color.split(' ')[0]} ${color.split(' ')[1]}`}>
                  <Icon size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-1">{label}</p>
                  <p className="text-sm font-medium text-slate-700 leading-5">{value}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

      </div>
    </div>
  );
}

export default AlumniCell;
