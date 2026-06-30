import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, TrendingUp, IndianRupee, Download, Search,
  CheckCircle2, XCircle, AlertTriangle, Clock,
} from 'lucide-react';

const INITIAL_DONATIONS = [
  { id: 1, name: 'Rajesh Kumar',  email: 'rajesh@example.com',  amount: 5000,  date: '2025-01-15', purpose: 'Library Fund',     mode: 'UPI',    utr: null,          status: 'completed' },
  { id: 2, name: 'Priya Sharma',  email: 'priya@example.com',   amount: 10000, date: '2025-02-03', purpose: 'Scholarship Fund', mode: 'NEFT',   utr: null,          status: 'completed' },
  { id: 3, name: 'Amit Patel',    email: 'amit@example.com',    amount: 2500,  date: '2025-02-20', purpose: 'Sports Fund',      mode: 'UPI',    utr: null,          status: 'completed' },
  { id: 4, name: 'Sneha Desai',   email: 'sneha@example.com',   amount: 7500,  date: '2025-03-01', purpose: 'Infrastructure',   mode: 'NEFT',   utr: 'NEFT25030112', status: 'pending' },
  { id: 5, name: 'Vikram Singh',  email: 'vikram@example.com',  amount: 15000, date: '2025-03-10', purpose: 'Scholarship Fund', mode: 'Cheque', utr: null,          status: 'completed' },
  { id: 6, name: 'Neha Joshi',    email: 'neha@example.com',    amount: 3000,  date: '2025-03-18', purpose: 'Library Fund',     mode: 'UPI',    utr: 'UPI253180842', status: 'pending' },
  { id: 7, name: 'Ravi Sharma',   email: 'ravi.s@example.com',  amount: 5000,  date: '2025-03-22', purpose: 'Scholarship Fund', mode: 'UPI',    utr: 'UPI253220019', status: 'pending' },
  { id: 8, name: 'Anita Pillai',  email: 'anita@example.com',   amount: 20000, date: '2025-03-25', purpose: 'Infrastructure',   mode: 'RTGS',   utr: 'RTGS25325004', status: 'pending' },
];

const CONTRIBUTIONS = [
  { id: 1, name: 'Suresh Mehta',  email: 'suresh@example.com', type: 'Book Donation',    description: '25 Engineering textbooks donated to library',      date: '2025-01-20', value: '~₹12,000', status: 'received' },
  { id: 2, name: 'Kavita Rao',    email: 'kavita@example.com', type: 'Equipment',        description: 'Lab equipment for Electronics dept',               date: '2025-02-05', value: '~₹45,000', status: 'received' },
  { id: 3, name: 'Deepak Nair',   email: 'deepak@example.com', type: 'Mentorship',       description: '10-session career mentorship program for students', date: '2025-02-15', value: 'Pro-bono', status: 'ongoing' },
  { id: 4, name: 'Anita Pillai',  email: 'anita@example.com',  type: 'Book Donation',    description: '15 Management & Finance books',                    date: '2025-03-02', value: '~₹6,000',  status: 'received' },
  { id: 5, name: 'Ravi Tiwari',   email: 'ravi@example.com',   type: 'Software License', description: 'AutoCAD licenses for Civil dept (1 year)',          date: '2025-03-12', value: '~₹80,000', status: 'received' },
];

const STATUS_COLOR = {
  completed: 'bg-emerald-100 text-emerald-700',
  pending:   'bg-blue-100 text-blue-700',
  rejected:  'bg-red-100 text-red-700',
  received:  'bg-emerald-100 text-emerald-700',
  ongoing:   'bg-blue-100 text-blue-700',
};

function SummaryCard({ label, value, icon: Icon, valueColor = 'text-gray-900' }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5 flex items-center gap-4">
      <Icon size={20} className="text-gray-300 shrink-0" />
      <div>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className={`text-2xl font-bold mt-0.5 ${valueColor}`}>{value}</p>
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

function PendingConfirmations({ donations, onConfirm, onReject }) {
  const pending = donations.filter(d => d.status === 'pending');
  if (pending.length === 0) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl overflow-hidden">
      {/* Section header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-blue-200 bg-blue-100/60">
        <AlertTriangle size={16} className="text-blue-600 shrink-0" />
        <span className="font-semibold text-blue-800 text-sm">
          Pending Donation Confirmations
        </span>
        <span className="ml-auto bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
          {pending.length}
        </span>
      </div>

      <div className="divide-y divide-blue-100">
        <AnimatePresence initial={false}>
          {pending.map(d => (
            <motion.div
              key={d.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
              transition={{ duration: 0.22 }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-3">
                {/* Info */}
                <div className="flex-1 min-w-0 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                  <span className="font-semibold text-gray-900">{d.name}</span>
                  <span className="text-gray-500">{d.email}</span>
                  <span className="font-semibold text-gray-900">
                    ₹{d.amount.toLocaleString('en-IN')}
                  </span>
                  <span className="text-gray-500">{d.purpose}</span>
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock size={12} /> {new Date(d.date).toLocaleDateString('en-IN')}
                  </span>
                </div>

                {/* UTR + actions */}
                <div className="flex items-center gap-3 shrink-0 flex-wrap">
                  {d.utr && (
                    <div className="text-xs">
                      <span className="text-gray-400 mr-1">UTR:</span>
                      <span className="font-mono font-semibold text-gray-700 bg-white border border-gray-200 px-2 py-0.5 rounded">
                        {d.utr}
                      </span>
                    </div>
                  )}
                  <button
                    onClick={() => onConfirm(d.id)}
                    className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <CheckCircle2 size={13} /> Mark Confirmed
                  </button>
                  <button
                    onClick={() => onReject(d.id)}
                    className="flex items-center gap-1.5 border border-red-300 text-red-600 hover:bg-red-50 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <XCircle size={13} /> Reject
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export const FinancesPanel = ({ tab }) => {
  const [search, setSearch]     = useState('');
  const [donations, setDonations] = useState(INITIAL_DONATIONS);

  const confirm = (id) =>
    setDonations(prev => prev.map(d => d.id === id ? { ...d, status: 'completed' } : d));

  const reject = (id) =>
    setDonations(prev => prev.map(d => d.id === id ? { ...d, status: 'rejected' } : d));

  if (tab === 'donations') {
    const filtered = donations.filter(d =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.purpose.toLowerCase().includes(search.toLowerCase())
    );
    const totalReceived = donations.filter(d => d.status === 'completed').reduce((s, d) => s + d.amount, 0);
    const totalPending  = donations.filter(d => d.status === 'pending').reduce((s, d) => s + d.amount, 0);

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Heart size={24} className="text-blue-700" /> Donations
            </h1>
            <p className="text-sm text-gray-500 mt-1">Monetary donations received from alumni.</p>
          </div>
          <button className="flex items-center gap-2 text-sm text-gray-600 border border-gray-300 rounded-lg px-3 py-2 hover:bg-gray-50 transition-colors">
            <Download size={14} /> Export
          </button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4">
          <SummaryCard label="Total Received" value={`₹${totalReceived.toLocaleString('en-IN')}`} icon={IndianRupee} valueColor="text-emerald-700" />
          <SummaryCard label="Pending"        value={`₹${totalPending.toLocaleString('en-IN')}`}  icon={Clock}       valueColor="text-blue-600" />
          <SummaryCard label="Total Donors"   value={donations.length}                             icon={Heart} />
        </div>

        {/* Pending confirmations */}
        <PendingConfirmations donations={donations} onConfirm={confirm} onReject={reject} />

        {/* Search + full table */}
        <SearchBar value={search} onChange={setSearch} placeholder="Search by name or purpose…" />

        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <tr>
                {['#', 'Donor', 'Email', 'Amount', 'Purpose', 'Mode', 'UTR', 'Date', 'Status'].map(h => (
                  <th key={h} className="px-4 py-3 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((d, i) => (
                <motion.tr
                  key={d.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-blue-50/40 transition-colors"
                >
                  <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{d.name}</td>
                  <td className="px-4 py-3 text-gray-500">{d.email}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900">₹{d.amount.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 text-gray-500">{d.purpose}</td>
                  <td className="px-4 py-3 text-gray-500">{d.mode}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{d.utr || '—'}</td>
                  <td className="px-4 py-3 text-gray-400">{new Date(d.date).toLocaleDateString('en-IN')}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_COLOR[d.status] ?? 'bg-gray-100 text-gray-500'}`}>
                      {d.status}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // ── Contributions tab ──────────────────────────────────────────────────────
  const filtered = CONTRIBUTIONS.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp size={24} className="text-blue-700" /> Contributions
          </h1>
          <p className="text-sm text-gray-500 mt-1">Non-monetary contributions from alumni (books, equipment, mentorship).</p>
        </div>
        <button className="flex items-center gap-2 text-sm text-gray-600 border border-gray-300 rounded-lg px-3 py-2 hover:bg-gray-50 transition-colors">
          <Download size={14} /> Export
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <SummaryCard label="Total Contributions" value={CONTRIBUTIONS.length}                                      icon={TrendingUp} />
        <SummaryCard label="Received"            value={CONTRIBUTIONS.filter(c => c.status === 'received').length} icon={TrendingUp} valueColor="text-emerald-700" />
        <SummaryCard label="Ongoing"             value={CONTRIBUTIONS.filter(c => c.status === 'ongoing').length}  icon={TrendingUp} valueColor="text-blue-700" />
      </div>

      <SearchBar value={search} onChange={setSearch} placeholder="Search by name or type…" />

      <div className="space-y-3">
        {filtered.map(c => (
          <motion.div key={c.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg border border-gray-200 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-gray-900">{c.name}</span>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{c.type}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLOR[c.status]}`}>{c.status}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">{c.description}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                  <span>{c.email}</span>
                  <span>{new Date(c.date).toLocaleDateString('en-IN')}</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="font-semibold text-gray-900">{c.value}</p>
                <p className="text-xs text-gray-400">est. value</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
