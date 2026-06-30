import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase, Activity, GraduationCap, Plus, Search, Eye, Trash2,
  MapPin, Clock, Building, Calendar, Users, CheckCircle2, XCircle,
  ChevronDown, AlertCircle,
} from 'lucide-react';

// ── Pending submissions (all types in one queue) ───────────────────────────
const INITIAL_PENDING = [
  {
    id: 'p1', kind: 'job',
    title: 'Software Engineer', company: 'TCS', location: 'Nagpur',
    experience: '3–5 yrs', salary: '₹8–12 LPA',
    postedBy: 'Ravi Sharma', email: 'ravi.s@ex.com', date: '2025-03-20',
  },
  {
    id: 'p2', kind: 'lecture',
    title: 'Machine Learning Workshop',
    speaker: 'Dr. Priya Joshi', company: 'IIT Bombay',
    dept: 'Computer Science', format: 'Online', date: '2026-01-15',
    postedBy: 'Priya Joshi', email: 'priya.j@ex.com',
  },
  {
    id: 'p3', kind: 'activity',
    title: 'Campus Clean-up Drive',
    organizer: 'Green Alumni Group', location: 'SSGMCE Campus',
    date: '2026-04-05', description: 'Monthly campus cleanliness initiative.',
    postedBy: 'Neha Tiwari', email: 'neha.t@ex.com',
  },
  {
    id: 'p4', kind: 'job',
    title: 'DevOps Engineer', company: 'Wipro', location: 'Hyderabad',
    experience: '2–4 yrs', salary: '₹6–10 LPA',
    postedBy: 'Ankit Sharma', email: 'ankit.s@ex.com', date: '2025-03-22',
  },
  {
    id: 'p5', kind: 'lecture',
    title: 'Entrepreneurship in Tech',
    speaker: 'Mr. Rohan Mehta', company: 'StartupHub',
    dept: 'All Departments', format: 'Offline', date: '2026-02-10',
    postedBy: 'Rohan Mehta', email: 'rohan.m@ex.com',
  },
  {
    id: 'p6', kind: 'activity',
    title: 'Alumni Cricket Tournament 2026',
    organizer: 'Sports Committee', location: 'Sports Ground',
    date: '2026-03-22', description: 'Inter-batch tournament — open to all alumni.',
    postedBy: 'Suresh Mehta', email: 'suresh.m@ex.com',
  },
];

// ── Approved mock data ─────────────────────────────────────────────────────
const JOBS = [
  { id: 1, title: 'Software Engineer',       company: 'TCS',        location: 'Pune',      postedBy: 'Rajesh Kumar', date: '2025-03-01', type: 'Full-time',  status: 'active',  applicants: 12 },
  { id: 2, title: 'Data Analyst',             company: 'Infosys',    location: 'Bangalore', postedBy: 'Priya Sharma', date: '2025-03-05', type: 'Full-time',  status: 'active',  applicants: 8  },
  { id: 3, title: 'Mechanical Design Intern', company: 'Bajaj Auto', location: 'Pune',      postedBy: 'Amit Patel',   date: '2025-02-20', type: 'Internship', status: 'active',  applicants: 25 },
  { id: 4, title: 'Project Manager',          company: 'L&T',        location: 'Mumbai',    postedBy: 'Sneha Desai',  date: '2025-02-10', type: 'Full-time',  status: 'expired', applicants: 15 },
  { id: 5, title: 'Civil Site Engineer',      company: 'Gammon',     location: 'Nagpur',    postedBy: 'Vikram Singh', date: '2025-03-12', type: 'Full-time',  status: 'active',  applicants: 9  },
];

const ACTIVITIES = [
  { id: 1, title: 'Tree Plantation Drive',     organizer: 'Alumni Cell',             date: '2025-02-14', location: 'SSGMCE Campus', participants: 45, status: 'completed', description: 'Planted 200+ trees across the campus.' },
  { id: 2, title: 'Blood Donation Camp',       organizer: 'Alumni Health Committee', date: '2025-03-08', location: 'SSGMCE Ground',  participants: 78, status: 'completed', description: 'Collected 65 units of blood in partnership with civil hospital.' },
  { id: 3, title: 'Coding Hackathon',          organizer: 'CS Alumni',               date: '2025-04-12', location: 'Computer Lab',   participants: 30, status: 'upcoming',  description: '24-hour hackathon open to all final-year students.' },
  { id: 4, title: 'Alumni Cricket Tournament', organizer: 'Sports Committee',        date: '2025-05-05', location: 'Sports Ground',  participants: 60, status: 'upcoming',  description: 'Inter-batch cricket tournament with trophies and prizes.' },
];

const LECTURES = [
  { id: 1, speaker: 'Dr. Rajesh Desai', topic: 'AI/ML in Industry',       batch: '2005', company: 'Google India',   date: '2025-02-22', dept: 'Computer Science', attendees: 120, status: 'completed' },
  { id: 2, speaker: 'Eng. Priya Nair',  topic: 'Sustainable Engineering', batch: '2010', company: 'L&T Green Tech', date: '2025-03-15', dept: 'Civil',             attendees: 85,  status: 'completed' },
  { id: 3, speaker: 'CA Amit Shah',     topic: 'Finance for Engineers',   batch: '2008', company: 'Deloitte',       date: '2025-04-20', dept: 'All Departments',   attendees: null, status: 'upcoming' },
  { id: 4, speaker: 'Dr. Sonal Mehta',  topic: 'Robotics & Automation',   batch: '2012', company: 'ISRO',           date: '2025-05-10', dept: 'Mechanical',        attendees: null, status: 'upcoming' },
];

const STATUS_COLOR = {
  active:    'bg-emerald-100 text-emerald-700',
  expired:   'bg-gray-100 text-gray-500',
  completed: 'bg-blue-100 text-blue-700',
  upcoming:  'bg-amber-100 text-amber-700',
};

const KIND_STYLE = {
  job:      { label: 'JOB',      bg: 'bg-blue-600',   text: 'text-white' },
  lecture:  { label: 'LECTURE',  bg: 'bg-purple-600', text: 'text-white' },
  activity: { label: 'ACTIVITY', bg: 'bg-emerald-600', text: 'text-white' },
};

function KindBadge({ kind }) {
  const s = KIND_STYLE[kind];
  return (
    <span className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  );
}

function PendingDetail({ post }) {
  if (post.kind === 'job') {
    return (
      <p className="text-sm text-gray-500 mt-0.5 flex flex-wrap gap-x-3">
        <span className="flex items-center gap-1"><MapPin size={12} />{post.location}</span>
        <span>{post.experience}</span>
        <span className="font-medium text-gray-700">{post.salary}</span>
      </p>
    );
  }
  if (post.kind === 'lecture') {
    return (
      <p className="text-sm text-gray-500 mt-0.5 flex flex-wrap gap-x-3">
        <span>By: <span className="text-gray-700 font-medium">{post.speaker}</span></span>
        <span>{post.company}</span>
        <span className="flex items-center gap-1"><MapPin size={12} />{post.format}</span>
        <span className="flex items-center gap-1"><Calendar size={12} />{new Date(post.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
      </p>
    );
  }
  return (
    <p className="text-sm text-gray-500 mt-0.5 flex flex-wrap gap-x-3">
      <span>{post.organizer}</span>
      <span className="flex items-center gap-1"><MapPin size={12} />{post.location}</span>
      <span className="flex items-center gap-1"><Calendar size={12} />{new Date(post.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
    </p>
  );
}

function PendingQueue({ pending, onApprove, onReject }) {
  const [typeFilter, setTypeFilter] = useState('all');

  const visible = typeFilter === 'all'
    ? pending
    : pending.filter(p => p.kind === typeFilter);

  if (pending.length === 0) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <AlertCircle size={15} className="text-gray-500 shrink-0" />
          <span className="font-semibold text-gray-800 text-sm">Pending Posts for Approval</span>
          <span className="bg-gray-700 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            {pending.length}
          </span>
        </div>

        {/* Type filter */}
        <div className="relative">
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="appearance-none bg-white border border-gray-200 rounded-lg pl-3 pr-7 py-1 text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer"
          >
            <option value="all">All</option>
            <option value="job">Job</option>
            <option value="lecture">Lecture</option>
            <option value="activity">Activity</option>
          </select>
          <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        <AnimatePresence initial={false}>
          {visible.map(post => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-3">
                {/* Left: badge + content */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <KindBadge kind={post.kind} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 leading-tight">
                      {post.kind === 'job'
                        ? `${post.title} @ ${post.company}`
                        : post.kind === 'lecture'
                          ? post.title
                          : post.title}
                    </p>
                    <PendingDetail post={post} />
                    <p className="text-xs text-gray-400 mt-1">
                      Submitted by {post.postedBy} · {post.email}
                    </p>
                  </div>
                </div>

                {/* Right: actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onApprove(post.id)}
                    className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <CheckCircle2 size={13} /> Approve
                  </button>
                  <button
                    onClick={() => onReject(post.id)}
                    className="flex items-center gap-1.5 border border-red-300 text-red-600 hover:bg-red-50 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <XCircle size={13} /> Reject
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {visible.length === 0 && (
          <p className="px-4 py-4 text-sm text-gray-400 text-center">
            No pending {typeFilter === 'all' ? '' : typeFilter} posts.
          </p>
        )}
      </div>
    </div>
  );
}

function SearchBar({ value, onChange, placeholder }) {
  return (
    <div className="relative">
      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
      />
    </div>
  );
}

export const PostsPanel = ({ tab }) => {
  const [search, setSearch]   = useState('');
  const [pending, setPending] = useState(INITIAL_PENDING);

  const approve = id => setPending(p => p.filter(x => x.id !== id));
  const reject  = id => setPending(p => p.filter(x => x.id !== id));

  if (tab === 'jobs') {
    const filtered = JOBS.filter(j =>
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.company.toLowerCase().includes(search.toLowerCase())
    );
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Briefcase size={24} className="text-blue-700" /> Job Posts
            </h1>
            <p className="text-sm text-gray-500 mt-1">Jobs and opportunities posted by alumni.</p>
          </div>
          <button className="flex items-center gap-2 text-sm bg-blue-700 text-white rounded-lg px-3 py-2 hover:bg-blue-800 transition-colors">
            <Plus size={14} /> Add Job
          </button>
        </div>

        <PendingQueue pending={pending} onApprove={approve} onReject={reject} />

        <SearchBar value={search} onChange={setSearch} placeholder="Search by title or company…" />

        <div className="space-y-3">
          {filtered.map(j => (
            <motion.div key={j.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg border border-gray-200 p-4 flex items-start justify-between gap-3"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-gray-900">{j.title}</h3>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLOR[j.status]}`}>{j.status}</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{j.type}</span>
                </div>
                <div className="flex items-center gap-4 mt-1.5 text-sm text-gray-500 flex-wrap">
                  <span className="flex items-center gap-1"><Building size={13} /> {j.company}</span>
                  <span className="flex items-center gap-1"><MapPin size={13} /> {j.location}</span>
                  <span className="flex items-center gap-1"><Clock size={13} /> {new Date(j.date).toLocaleDateString('en-IN')}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">Posted by {j.postedBy} · {j.applicants} applicants</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"><Eye size={15} /></button>
                <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"><Trash2 size={15} /></button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  if (tab === 'activities') {
    const filtered = ACTIVITIES.filter(a =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.organizer.toLowerCase().includes(search.toLowerCase())
    );
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Activity size={24} className="text-blue-700" /> Activities
            </h1>
            <p className="text-sm text-gray-500 mt-1">CSR and community events organized by alumni.</p>
          </div>
          <button className="flex items-center gap-2 text-sm bg-blue-700 text-white rounded-lg px-3 py-2 hover:bg-blue-800 transition-colors">
            <Plus size={14} /> Add Activity
          </button>
        </div>

        <PendingQueue pending={pending} onApprove={approve} onReject={reject} />

        <SearchBar value={search} onChange={setSearch} placeholder="Search activities…" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map(a => (
            <motion.div key={a.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg border border-gray-200 p-4"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold text-gray-900">{a.title}</h3>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${STATUS_COLOR[a.status]}`}>{a.status}</span>
              </div>
              <p className="text-sm text-gray-500 mb-3">{a.description}</p>
              <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
                <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(a.date).toLocaleDateString('en-IN')}</span>
                <span className="flex items-center gap-1"><MapPin size={12} /> {a.location}</span>
                <span className="flex items-center gap-1"><Users size={12} /> {a.participants}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  // ── Guest Lectures ─────────────────────────────────────────────────────────
  const filtered = LECTURES.filter(l =>
    l.speaker.toLowerCase().includes(search.toLowerCase()) ||
    l.topic.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <GraduationCap size={24} className="text-blue-700" /> Guest Lectures
          </h1>
          <p className="text-sm text-gray-500 mt-1">Expert talks organized by alumni for current students.</p>
        </div>
        <button className="flex items-center gap-2 text-sm bg-blue-700 text-white rounded-lg px-3 py-2 hover:bg-blue-800 transition-colors">
          <Plus size={14} /> Schedule Lecture
        </button>
      </div>

      <PendingQueue pending={pending} onApprove={approve} onReject={reject} />

      <SearchBar value={search} onChange={setSearch} placeholder="Search by speaker or topic…" />

      <div className="space-y-3">
        {filtered.map(l => (
          <motion.div key={l.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg border border-gray-200 p-4"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-gray-900">{l.topic}</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLOR[l.status]}`}>{l.status}</span>
              </div>
              <div className="flex items-center gap-4 mt-1.5 text-sm text-gray-500 flex-wrap">
                <span className="flex items-center gap-1"><GraduationCap size={13} /> {l.speaker} (Batch '{l.batch})</span>
                <span className="flex items-center gap-1"><Building size={13} /> {l.company}</span>
              </div>
              <div className="flex items-center gap-4 mt-1 text-xs text-gray-400 flex-wrap">
                <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(l.date).toLocaleDateString('en-IN')}</span>
                <span>{l.dept}</span>
                {l.attendees !== null && <span>{l.attendees} attendees</span>}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
