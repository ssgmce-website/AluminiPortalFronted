import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Clock, CheckCircle2, XCircle, RefreshCw, Loader2, Mail, GraduationCap, AlertTriangle,
} from 'lucide-react';
import { fetchRequests, approveRequest, rejectRequest } from '../services/adminService';

const TABS = [
  { key: 'pending',  label: 'Pending',  icon: Clock },
  { key: 'approved', label: 'Approved', icon: CheckCircle2 },
  { key: 'rejected', label: 'Rejected', icon: XCircle },
];

const StatusBadge = ({ status }) => {
  const styles = {
    pending:  'bg-amber-100 text-amber-700',
    approved: 'bg-emerald-100 text-emerald-700',
    rejected: 'bg-red-100 text-red-700',
  }[status] || 'bg-gray-100 text-gray-600';
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${styles}`}>
      {status}
    </span>
  );
};

export const AdminPortal = () => {
  const [tab, setTab]           = useState('pending');
  const [requests, setRequests] = useState([]);
  const [counts, setCounts]     = useState({ pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [actingId, setActingId] = useState(null); // id being approved/rejected

  const load = useCallback(async (status) => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchRequests(status);
      setRequests(data.requests || []);
      if (data.counts) setCounts(data.counts);
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(tab); }, [tab, load]);

  const handleApprove = async (id) => {
    setActingId(id);
    try {
      await approveRequest(id);
      await load(tab);
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    } finally {
      setActingId(null);
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt('Reason for rejection (optional — shown to the user):', '');
    if (reason === null) return; // cancelled
    setActingId(id);
    try {
      await rejectRequest(id, reason);
      await load(tab);
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    } finally {
      setActingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users size={24} className="text-blue-700" />
            Account Requests
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Approve or reject alumni sign-up requests.
          </p>
        </div>
        <button
          onClick={() => load(tab)}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg px-3 py-2 hover:bg-gray-50 transition-colors"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        {TABS.map(({ key, label, icon: Icon }) => (
          <div key={key} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <Icon size={20} className="text-gray-400" />
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
              <p className="text-xl font-bold text-gray-900">{counts[key] ?? 0}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === key
                ? 'border-blue-700 text-blue-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {label}
            {key === 'pending' && counts.pending > 0 && (
              <span className="ml-2 bg-amber-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                {counts.pending}
              </span>
            )}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16 text-gray-400">
          <Loader2 size={28} className="animate-spin" />
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Users size={36} className="mx-auto mb-3" />
          <p className="text-sm">No {tab} requests.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((u) => (
            <motion.div
              key={u.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row sm:items-center gap-4"
            >
              {/* Avatar */}
              {u.profilePhoto ? (
                <img src={u.profilePhoto} alt="" className="w-11 h-11 rounded-full object-cover shrink-0" />
              ) : (
                <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold shrink-0">
                  {u.name?.[0]?.toUpperCase() || u.email?.[0]?.toUpperCase() || '?'}
                </div>
              )}

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-gray-900 truncate">{u.name || 'Unnamed'}</p>
                  <StatusBadge status={u.status} />
                  {u.role === 'admin' && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">admin</span>
                  )}
                </div>
                <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-0.5 truncate">
                  <Mail size={13} /> {u.email}
                </p>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-400 flex-wrap">
                  <span className="flex items-center gap-1">
                    <GraduationCap size={13} /> via {u.createdVia}
                  </span>
                  {u.course && <span>{u.course}</span>}
                  {u.branch && <span>{u.branch}</span>}
                  {u.yearOfAdmission && u.yearOfPassout
                    ? <span>{u.yearOfAdmission}–{u.yearOfPassout}</span>
                    : u.yearOfPassout && <span>Batch {u.yearOfPassout}</span>}
                  <span>{new Date(u.createdAt).toLocaleDateString('en-IN')}</span>
                </div>
                {u.status === 'rejected' && u.rejectionReason && (
                  <p className="text-xs text-red-600 mt-1">Reason: {u.rejectionReason}</p>
                )}
              </div>

              {/* Actions */}
              {u.role !== 'admin' && (
                <div className="flex items-center gap-2 shrink-0">
                  {u.status !== 'approved' && (
                    <button
                      onClick={() => handleApprove(u.id)}
                      disabled={actingId === u.id}
                      className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-medium px-3 py-2 rounded-lg transition-colors"
                    >
                      {actingId === u.id ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
                      Approve
                    </button>
                  )}
                  {u.status !== 'rejected' && (
                    <button
                      onClick={() => handleReject(u.id)}
                      disabled={actingId === u.id}
                      className="flex items-center gap-1.5 border border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-60 text-sm font-medium px-3 py-2 rounded-lg transition-colors"
                    >
                      <XCircle size={15} />
                      Reject
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
