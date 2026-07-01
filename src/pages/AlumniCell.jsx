import { motion } from 'framer-motion';
import { Target, Users, Handshake, Trophy, Mail, Phone, MapPin } from 'lucide-react';

const collegeImg = '/college-building.jpeg';

const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const stagger = { show: { transition: { staggerChildren: 0.1 } } };

const PILLARS = [
  {
    icon: Users,
    title: 'Connect',
    iconBg: 'bg-blue-100 text-blue-700',
    desc: 'Build a lifelong network of SSGMCE graduates across industries and geographies.',
  },
  {
    icon: Handshake,
    title: 'Collaborate',
    iconBg: 'bg-emerald-100 text-emerald-700',
    desc: 'Partner with students, faculty, and the institution for knowledge exchange and mentorship.',
  },
  {
    icon: Trophy,
    title: 'Contribute',
    iconBg: 'bg-amber-100 text-amber-700',
    desc: 'Give back through scholarships, guest lectures, internships, and campus development.',
  },
];

const OBJECTIVES = [
  'Maintain and strengthen the bond between alumni and their alma mater',
  'Support academic and infrastructural development of SSGMCE',
  'Facilitate career guidance, mentoring, and placement assistance for students',
  'Recognise distinguished alumni and celebrate their achievements',
  'Organise annual meets, reunions, and professional development events',
  'Promote entrepreneurship and innovation among current students',
];

function AlumniCell() {
  return (
    <div className="mx-auto max-w-[1425px] overflow-hidden rounded-xl border border-blue-100 bg-white shadow-lg shadow-blue-950/10">

      {/* ── Hero image ── */}
      <div className="relative h-72 md:h-[420px] overflow-hidden">
        <img
          src={collegeImg}
          alt="SSGMCE Main Building, Shegaon"
          className="h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-blue-950/80 via-blue-900/30 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <motion.p
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-200"
          >
            About
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="mt-1 text-3xl font-extrabold leading-tight text-white md:text-5xl"
          >
            SSGMCE Alumni Cell
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="mt-2 text-sm text-blue-100"
          >
            Shri Sant Gajanan Maharaj College of Engineering, Shegaon
          </motion.p>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="p-6 md:p-10 space-y-10">

        {/* About paragraph */}
        <motion.div
          variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="max-w-4xl"
        >
          <motion.h2 variants={fadeUp} className="text-xl font-bold text-blue-900 mb-3">
            About the Cell
          </motion.h2>
          <motion.p variants={fadeUp} className="text-base leading-8 text-slate-600">
            The <strong className="text-slate-800">SSGMCE Alumni Cell</strong> is the official body that
            fosters the connection between the college and its vast network of graduates. Established to
            bridge the gap between academia and industry, the cell actively works towards academic
            excellence, professional development, and the holistic growth of students and alumni alike.
          </motion.p>
          <motion.p variants={fadeUp} className="mt-4 text-base leading-8 text-slate-600">
            With alumni spanning across global organisations, research institutions, and entrepreneurial
            ventures, the cell serves as a platform for meaningful exchange, giving back, and sustained
            engagement with one's alma mater.
          </motion.p>
        </motion.div>

        {/* Pillars */}
        <motion.div
          variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="grid gap-5 sm:grid-cols-3"
        >
          {PILLARS.map(({ icon: Icon, title, iconBg, desc }) => (
            <motion.div
              key={title}
              variants={fadeUp}
              className="rounded-xl border border-slate-100 bg-slate-50 p-6 hover:shadow-md transition-shadow"
            >
              <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${iconBg}`}>
                <Icon size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-800">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">{desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Objectives */}
        <motion.div
          variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
        >
          <motion.h2 variants={fadeUp} className="mb-5 flex items-center gap-2 text-xl font-bold text-blue-900">
            <Target size={20} className="text-blue-700" /> Objectives
          </motion.h2>
          <motion.ul variants={stagger} className="grid gap-3 sm:grid-cols-2">
            {OBJECTIVES.map((obj) => (
              <motion.li
                key={obj}
                variants={fadeUp}
                className="flex items-start gap-3 text-sm leading-6 text-slate-600"
              >
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                {obj}
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>

        {/* Contact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.5 }}
          className="rounded-xl border border-blue-100 bg-blue-50/50 p-6"
        >
          <h2 className="mb-4 text-lg font-bold text-blue-900">Contact the Alumni Cell</h2>
          <div className="flex flex-wrap gap-6 text-sm text-slate-600">
            <span className="flex items-center gap-2">
              <MapPin size={15} className="shrink-0 text-blue-600" />
              SSGMCE, Shegaon, Dist. Buldhana, Maharashtra – 444 203
            </span>
            <span className="flex items-center gap-2">
              <Mail size={15} className="shrink-0 text-blue-600" />
              alumni@ssgmce.ac.in
            </span>
            <span className="flex items-center gap-2">
              <Phone size={15} className="shrink-0 text-blue-600" />
              +91 72620 00000
            </span>
          </div>
        </motion.div>

      </div>
    </div>
  );
}

export default AlumniCell;
