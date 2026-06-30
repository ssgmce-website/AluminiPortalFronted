import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users, Clock, Calendar, Megaphone, CheckCircle2, XCircle,
  Mail, GraduationCap, ArrowRight, TrendingUp,
} from 'lucide-react';
import { fetchRequests } from '../../services/adminService';
import { useAuth } from '../../contexts/AuthContext';

function StatCard({ label, value, icon: Icon, iconBg, iconColor, sub, to }) {
  const card = (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-start gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
        <Icon size={20} className={iconColor} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
        <p className="text-3xl font-bold text-gray-900 mt-0.5 leading-none">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-1.5">{sub}</p>}
      </div>
      {to && <ArrowRight size={14} className="text-gray-300 mt-1 shrink-0" />}
    </div>
  );

  return to ? <Link to={to}>{card}</Link> : card;
}

function MiniBar({ label, value, max, color }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm text-gray-600">{label}</span>
        <span className="text-sm font-semibold text-gray-900">{value}</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  );
}

export const AdminOverview = () => {
  const { userProfile } = useAuth();
  const [counts, setCounts]           = useState({ pending: 0, approved: 0, rejected: 0 });
  const [recentPending, setRecent]    = useState([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchRequests('pending');
        setRecent(data.requests?.slice(0, 5) || []);
        if (data.counts) setCounts(data.counts);
      } catch (_) {}
      finally { setLoading(false); }
    })();
  }, []);

  const firstName = userProfile?.name?.split(' ')[0] || 'Admin';
  const total     = counts.approved + counts.pending + counts.rejected;

  return (
    <div className="space-y-6">

      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Welcome back, {firstName}. Here's your overview.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Total Members"
          value={counts.approved}
          icon={Users}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          sub="Approved alumni"
          to="/admin/members/approved"
        />
        <StatCard
          label="Pending Approvals"
          value={counts.pending}
          icon={Clock}
          iconBg="bg-amber-50"
          iconColor="text-amber-500"
          sub="Awaiting review"
          to="/admin/members"
        />
        <StatCard
          label="Events"
          value={3}
          icon={Calendar}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          sub="Upcoming events"
          to="/admin/events/current"
        />
        <StatCard
          label="Active Posts"
          value={5}
          icon={Megaphone}
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
          sub="Jobs & activities"
          to="/admin/posts/jobs"
        />
      </div>

      {/* Lower section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent pending requests */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Pending Approvals</h2>
            {counts.pending > 0 && (
              <span className="text-xs bg-amber-100 text-amber-700 font-semibold px-2 py-0.5 rounded-full">
                {counts.pending} waiting
              </span>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12 text-gray-400 text-sm">
              Loading...
            </div>
          ) : recentPending.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <CheckCircle2 size={28} className="mb-2 text-emerald-400" />
              <p className="text-sm">All caught up — no pending requests</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentPending.map(u => (
                <div key={u.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold shrink-0">
                    {u.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{u.name || 'Unnamed'}</p>
                    <p className="text-xs text-gray-400 truncate flex items-center gap-1">
                      <Mail size={11} /> {u.email}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    {u.branch && <p className="text-xs text-gray-600">{u.branch}</p>}
                    {u.yearOfPassout && (
                      <p className="text-xs text-gray-400">Batch {u.yearOfPassout}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {counts.pending > 5 && (
            <div className="px-5 py-3 border-t border-gray-100">
              <Link
                to="/admin/members"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 transition-colors"
              >
                View all {counts.pending} requests <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </div>

        {/* Member overview */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Member Overview</h2>
          </div>
          <div className="px-5 py-5 space-y-4">
            <MiniBar label="Approved"         value={counts.approved} max={total} color="bg-emerald-500" />
            <MiniBar label="Pending Approval" value={counts.pending}  max={total} color="bg-amber-400" />
            <MiniBar label="Rejected"         value={counts.rejected} max={total} color="bg-red-400" />
          </div>

          <div className="mx-5 border-t border-gray-100 py-4 space-y-2.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 flex items-center gap-1.5">
                <GraduationCap size={14} className="text-gray-400" />
                Total Registrations
              </span>
              <span className="font-bold text-gray-900">{total}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 flex items-center gap-1.5">
                <TrendingUp size={14} className="text-gray-400" />
                Approval Rate
              </span>
              <span className="font-bold text-emerald-700">
                {total > 0 ? `${Math.round((counts.approved / total) * 100)}%` : '—'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 flex items-center gap-1.5">
                <XCircle size={14} className="text-gray-400" />
                Rejection Rate
              </span>
              <span className="font-bold text-red-600">
                {total > 0 ? `${Math.round((counts.rejected / total) * 100)}%` : '—'}
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
