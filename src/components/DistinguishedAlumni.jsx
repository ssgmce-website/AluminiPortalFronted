import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PageShell from '../components/PageShell';
import { fetchDistinguishedAlumni } from '../services/alumniService';
import distinguishedAlumni, {
  mapBranchToAbbreviation,
  getAlumniBranchId
} from '../data/distinguishedAlumni.js';

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } }
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } }
};

const BRANCHES = [
  { id: 'cse', name: 'CSE', label: 'Computer Science & Engineering (CSE)' },
  { id: 'it', name: 'IT', label: 'Information Technology (IT)' },
  { id: 'entc', name: 'ENTC', label: 'Electronics & Telecommunication (ENTC)' },
  { id: 'elpo', name: 'ELPO', label: 'Electrical (Electronics & Power) Engineering (ELPO)' },
  { id: 'mech', name: 'MECH', label: 'Mechanical Engineering (MECH)' },
  { id: 'mba', name: 'MBA', label: 'Master of Business Administration (MBA)' },
];

function DistinguishedAlumni() {
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [alumniList, setAlumniList] = useState(distinguishedAlumni);

  useEffect(() => {
    fetchDistinguishedAlumni()
      .then((dbAlumni) => {
        // Merge the static list and database list
        // Filter out any static entries that are now in the database (matching by name)
        const dbNames = new Set((dbAlumni || []).map(a => a.name.toLowerCase().trim()));
        const uniqueStatic = distinguishedAlumni.filter(a => !dbNames.has(a.name.toLowerCase().trim()));
        setAlumniList([...uniqueStatic, ...(dbAlumni || [])]);
      })
      .catch((err) => {
        console.error('Failed to fetch database distinguished alumni:', err);
      });
  }, []);

  return (
    <PageShell eyebrow="Pride of SSGMCE" title="Distinguished Alumni">
      <p className="mx-auto mb-8 max-w-3xl text-center text-sm leading-7 text-slate-500 md:text-base">
        Meet the graduates who carry the SSGMCE legacy forward — leaders, innovators, and
        changemakers across industries who continue to inspire the students and alumni who
        follow in their footsteps.
      </p>

      {/* Branch Tabs Filter */}
      <div className="flex flex-wrap justify-center gap-2.5 mb-12">
        <button
          onClick={() => setSelectedBranch('all')}
          className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
            selectedBranch === 'all'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-800 border border-slate-200'
          }`}
        >
          All Branches
        </button>
        {BRANCHES.map((branch) => (
          <button
            key={branch.id}
            onClick={() => setSelectedBranch(branch.id)}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
              selectedBranch === branch.id
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-800 border border-slate-200'
            }`}
          >
            {branch.name}
          </button>
        ))}
      </div>

      {/* Separated Alumni Sections */}
      <div className="space-y-12">
        {BRANCHES.map((branch) => {
          // If a specific branch is selected, only show that branch
          if (selectedBranch !== 'all' && selectedBranch !== branch.id) return null;

          const branchAlumni = alumniList.filter(
            (person) => getAlumniBranchId(person.branch) === branch.id
          );

          // If we show "All", we can skip rendering empty branches to keep the page clean
          if (selectedBranch === 'all' && branchAlumni.length === 0) return null;

          return (
            <div key={branch.id} className="space-y-6">
              <div className="flex items-center gap-3">
                <h2 className="text-sm sm:text-base font-extrabold text-slate-800 uppercase tracking-wider">
                  {branch.label}
                </h2>
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                  {branchAlumni.length} {branchAlumni.length === 1 ? 'Alumnus' : 'Alumni'}
                </span>
              </div>

              {branchAlumni.length > 0 ? (
                <motion.div
                  variants={stagger}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                >
                  {branchAlumni.map((person) => (
                    <motion.div
                      key={person.name}
                      variants={fadeUp}
                      className="flex items-stretch overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all duration-300 min-h-[120px]"
                    >
                      {/* Photo on Left */}
                      <div className="w-24 sm:w-28 shrink-0 bg-slate-50/50 flex items-center justify-center p-2.5">
                        {person.photo ? (
                          <img
                            src={person.photo}
                            alt={person.name}
                            className="h-20 w-20 sm:h-24 sm:w-24 rounded-lg object-cover object-top shadow-sm border border-slate-100"
                          />
                        ) : (
                          <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xl sm:text-2xl border border-slate-100">
                            {person.name?.[0]?.toUpperCase()}
                          </div>
                        )}
                      </div>

                      {/* Vertical Separator */}
                      <div className="w-px bg-slate-200 self-stretch" />

                      {/* Text on Right */}
                      <div className="flex-1 p-3 sm:p-4 flex flex-col justify-center min-w-0">
                        <h3 className="text-sm sm:text-base font-extrabold text-slate-800 leading-snug">
                          {person.name}
                        </h3>
                        
                        <p className="mt-1 text-xs text-slate-600 font-medium line-clamp-2 leading-relaxed">
                          {person.role}
                          {person.role && person.company && ' at '}
                          {person.company}
                        </p>

                        <p className="mt-1.5 text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider">
                          {mapBranchToAbbreviation(person.branch)} {person.batch || '1993'}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
                  <p className="text-sm text-slate-400 font-medium">
                    No distinguished alumni listed under {branch.name} branch yet.
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </PageShell>
  );
}

export default DistinguishedAlumni;
