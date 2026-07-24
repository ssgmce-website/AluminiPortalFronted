import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, Search, CheckCircle2, XCircle, Clock, Eye, Globe, Check, Loader2
} from 'lucide-react';
import {
  fetchContributionsAdmin,
  updateContributionStatusAdmin,
  updateContributionBeneficiariesAdmin,
  toggleContributionPublicAdmin
} from '../../services/adminService';

const STATUS_COLOR = {
  Approved:  'bg-emerald-100 text-emerald-700 border border-emerald-200',
  Pending:   'bg-blue-100 text-blue-700 border border-blue-200',
  Rejected:  'bg-red-100 text-red-700 border border-red-200',
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

export const FinancesPanel = () => {
  const [search, setSearch] = useState('');

  // Contributions state
  const [contributions, setContributions] = useState([]);
  const [loadingContribs, setLoadingContribs] = useState(true);
  const [beneficiaryInputs, setBeneficiaryInputs] = useState({});
  const [savingBeneficiaryId, setSavingBeneficiaryId] = useState(null);

  useEffect(() => {
    loadContributions();
  }, []);

  const loadContributions = async () => {
    setLoadingContribs(true);
    try {
      const data = await fetchContributionsAdmin();
      setContributions(data?.contributions || []);
      const inputs = {};
      (data?.contributions || []).forEach(c => {
        inputs[c._id] = c.beneficiaries || '';
      });
      setBeneficiaryInputs(inputs);
    } catch (err) {
      console.error('Failed to load contributions:', err);
    } finally {
      setLoadingContribs(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateContributionStatusAdmin(id, status);
      setContributions(prev =>
        prev.map(c => (c._id === id ? { ...c, status } : c))
      );
    } catch (err) {
      alert(err.message || 'Failed to update status');
    }
  };

  const handleBeneficiaryInputChange = (id, val) => {
    setBeneficiaryInputs(prev => ({ ...prev, [id]: val }));
  };

  const handleBeneficiariesSave = async (id) => {
    setSavingBeneficiaryId(id);
    try {
      const val = beneficiaryInputs[id] || '';
      await updateContributionBeneficiariesAdmin(id, val);
      setContributions(prev =>
        prev.map(c => (c._id === id ? { ...c, beneficiaries: val } : c))
      );
      alert('Beneficiaries updated and notification email sent to alumni!');
    } catch (err) {
      alert(err.message || 'Failed to update beneficiaries');
    } finally {
      setSavingBeneficiaryId(null);
    }
  };

  const handlePublicToggle = async (id, currentVal) => {
    try {
      const newVal = !currentVal;
      await toggleContributionPublicAdmin(id, newVal);
      setContributions(prev =>
        prev.map(c => (c._id === id ? { ...c, isPublic: newVal } : c))
      );
      if (newVal) {
        alert('Contribution is now live on the public website and notification email has been sent!');
      } else {
        alert('Contribution has been removed from the public website.');
      }
    } catch (err) {
      alert(err.message || 'Failed to toggle public status');
    }
  };

  const filtered = contributions.filter(c =>
    (c.alumnusName || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.contributionType || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.target || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp size={24} className="text-blue-700" /> Contributions
          </h1>
          <p className="text-sm text-gray-500 mt-1">Monetary and non-monetary support requests from alumni.</p>
        </div>
        <button 
          onClick={loadContributions} 
          disabled={loadingContribs}
          className="flex items-center gap-2 text-sm text-gray-600 border border-gray-300 rounded-lg px-3 py-2 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          {loadingContribs ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <SummaryCard label="Total Requests" value={contributions.length} icon={TrendingUp} />
        <SummaryCard label="Pending Approval" value={contributions.filter(c => c.status === 'Pending').length} icon={Clock} valueColor="text-blue-700" />
        <SummaryCard label="Approved / Public" value={contributions.filter(c => c.status === 'Approved' && c.isPublic).length} icon={Globe} valueColor="text-emerald-700" />
      </div>

      <SearchBar value={search} onChange={setSearch} placeholder="Search by name, department, or contribution type…" />

      {loadingContribs ? (
        <div className="text-center py-10">
          <Loader2 className="animate-spin text-blue-700 mx-auto" size={32} />
          <p className="text-sm text-gray-500 mt-2">Loading contributions...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-sm text-gray-500 font-semibold">
              No matching contributions found.
            </div>
          ) : (
            filtered.map(c => (
              <motion.div 
                key={c._id} 
                initial={{ opacity: 0, y: 6 }} 
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm space-y-4 hover:border-blue-200 transition-all"
              >
                {/* Upper row: Status & Type */}
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-gray-900 text-base">{c.alumnusName}</span>
                      <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded border border-slate-200">
                        {c.branch} ({c.passoutYear})
                      </span>
                      <span className="text-xs bg-blue-50 text-blue-800 font-semibold px-2 py-0.5 rounded border border-blue-100">
                        For: {c.target}
                      </span>
                      <span className="text-xs bg-indigo-50 text-indigo-800 font-semibold px-2 py-0.5 rounded border border-indigo-100">
                        Type: {c.contributionType}
                      </span>
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${STATUS_COLOR[c.status]}`}>
                        {c.status}
                      </span>
                    </div>
                    
                    {/* Alumnus Job Details & Contact */}
                    <div className="text-xs text-gray-500 mt-1.5 space-y-0.5">
                      <p>
                        <span className="font-semibold text-gray-700">Profile:</span> {c.designation} at {c.organization}
                      </p>
                      <p>
                        <span className="font-semibold text-gray-700">Contact:</span> {c.email} | {c.mobile}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-slate-400 block uppercase">Mode</span>
                    <span className="font-extrabold text-slate-700 text-sm block">
                      {c.typeOfContribution === 'Money' ? 'Financial (Money)' : 'Non-Financial'}
                    </span>
                  </div>
                </div>

                {/* Details Section */}
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 space-y-2.5">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Description</span>
                    <p className="text-sm text-slate-700 font-medium leading-relaxed">{c.description || '—'}</p>
                  </div>

                  {c.typeOfContribution === 'Money' && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-slate-200/60 text-xs">
                      <div>
                        <span className="text-gray-400 block font-semibold">Amount</span>
                        <span className="font-bold text-gray-900">₹{Number(c.amount).toLocaleString('en-IN')}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block font-semibold">UTR/Transaction ID</span>
                        <span className="font-mono text-gray-900 bg-white border px-1.5 py-0.5 rounded font-bold">{c.transactionId}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block font-semibold">Transaction Date</span>
                        <span className="font-bold text-gray-900">{c.paymentDate ? new Date(c.paymentDate).toLocaleDateString('en-IN') : '—'}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block font-semibold">Receipt / Proof</span>
                        {c.receiptUrl ? (
                          <a 
                            href={c.receiptUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-bold underline cursor-pointer"
                          >
                            <Eye size={12} /> View Receipt
                          </a>
                        ) : (
                          <span className="text-red-500 font-medium">No proof uploaded</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Admin Actions */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100">
                  {/* Action 1: Pending Verification */}
                  {c.status === 'Pending' ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleStatusChange(c._id, 'Approved')}
                        className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors shadow-sm"
                      >
                        <CheckCircle2 size={14} /> Approve Contribution
                      </button>
                      <button
                        onClick={() => handleStatusChange(c._id, 'Rejected')}
                        className="flex items-center gap-1.5 border border-red-300 text-red-600 hover:bg-red-50 text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors"
                      >
                        <XCircle size={14} /> Reject Request
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                      Status settled as: <span className="font-bold text-slate-800">{c.status}</span>
                    </div>
                  )}

                  {/* Action 2: Approved details (Beneficiaries + Make Public) */}
                  {c.status === 'Approved' && (
                    <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                      
                      {/* Beneficiaries String Input */}
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-gray-500 shrink-0">Beneficiaries:</label>
                        <input
                          type="text"
                          value={beneficiaryInputs[c._id] || ''}
                          onChange={(e) => handleBeneficiaryInputChange(c._id, e.target.value)}
                          placeholder="e.g. 10 students"
                          className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 w-36"
                        />
                        <button
                          onClick={() => handleBeneficiariesSave(c._id)}
                          disabled={savingBeneficiaryId === c._id}
                          className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg transition-colors flex items-center justify-center shrink-0 disabled:opacity-50"
                          title="Save Beneficiaries"
                        >
                          {savingBeneficiaryId === c._id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Check size={14} />
                          )}
                        </button>
                      </div>

                      {/* Make Public Toggle */}
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-gray-500 cursor-pointer flex items-center gap-1.5">
                          <input
                            type="checkbox"
                            checked={c.isPublic || false}
                            onChange={() => handlePublicToggle(c._id, c.isPublic)}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                          Make Public on Static Web
                        </label>
                      </div>

                    </div>
                  )}
                </div>

              </motion.div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
