import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import PageShell from '../components/PageShell';
import distinguishedAlumni from '../data/distinguishedAlumni';

const fadeUp  = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };

function DistinguishedAlumni() {
  return (
    <PageShell eyebrow="Pride of SSGMCE" title="Distinguished Alumni">
      <p className="mx-auto mb-8 max-w-3xl text-center text-sm leading-7 text-slate-500 md:text-base">
        Meet the graduates who carry the SSGMCE legacy forward — leaders, innovators, and
        changemakers across industries who continue to inspire the students and alumni who
        follow in their footsteps.
      </p>

      <motion.div
        variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
      >
        {distinguishedAlumni.map((person) => (
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
              &ldquo;
            </span>

            {/* Circular photo */}
            <div className="relative mb-4 flex justify-center">
              <img
                src={person.photo}
                alt={person.name}
                className="h-24 w-24 rounded-full object-cover ring-4 ring-white shadow-md"
              />
            </div>

            {person.company && (
              <p className="text-center text-[10px] font-bold uppercase tracking-widest text-amber-500">
                {person.company}
              </p>
            )}

            <h3 className="mt-1 text-center text-sm font-extrabold text-slate-800">
              {person.name}
            </h3>

            {person.role && (
              <p className="mt-0.5 text-center text-xs font-semibold text-amber-500">
                {person.role}
              </p>
            )}

            {person.batch && (
              <p className="mt-1 text-center text-xs text-slate-400">{person.batch}</p>
            )}

            {person.achievement && (
              <p className="mt-3 text-center text-xs leading-5 text-slate-500 line-clamp-3">
                {person.achievement}
              </p>
            )}

            {person.location && (
              <p className="mt-3 flex items-center justify-center gap-1 text-xs text-slate-400">
                <MapPin size={11} /> {person.location}
              </p>
            )}
          </motion.div>
        ))}
      </motion.div>
    </PageShell>
  );
}

export default DistinguishedAlumni;
