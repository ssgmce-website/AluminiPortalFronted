import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Clock, CheckCircle2, XCircle, RefreshCw, Loader2, Mail,
  GraduationCap, AlertTriangle, LayoutGrid, ChevronDown, ChevronRight, Download, IdCard,
  Briefcase, User as UserIcon, Heart, Link2,
} from 'lucide-react';
import { fetchRequests, approveRequest, rejectRequest, fetchDeptWiseAlumni } from '../../services/adminService';

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

const DetailItem = ({ label, value }) => (
  <div>
    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</span>
    <span className="text-sm font-semibold text-gray-700 break-all">{value || '—'}</span>
  </div>
);

const DetailCheckbox = ({ label, checked }) => (
  <div className="flex items-center gap-2 text-sm">
    {checked ? (
      <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
    ) : (
      <XCircle size={16} className="text-gray-300 shrink-0" />
    )}
    <span className={checked ? 'text-gray-700 font-semibold' : 'text-gray-400 font-medium'}>{label}</span>
  </div>
);

const MemberCard = ({ u, onApprove, onReject, actingId }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition flex flex-col gap-4"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          {u.profilePhoto ? (
            <img src={u.profilePhoto} alt="" className="w-14 h-14 rounded-full object-cover ring-2 ring-slate-100 shrink-0" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-lg ring-2 ring-slate-100 shrink-0">
              {u.name?.[0]?.toUpperCase() || u.email?.[0]?.toUpperCase() || '?'}
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-gray-900 text-base truncate">{u.name || 'Unnamed'}</h3>
              <StatusBadge status={u.status} />
              {u.role === 'admin' && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">admin</span>
              )}
            </div>
            <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-0.5 truncate">
              <Mail size={13} className="text-gray-400" /> {u.email}
            </p>
            <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400 flex-wrap">
              <span className="flex items-center gap-1"><GraduationCap size={13} /> {u.course} ({u.branch})</span>
              {u.yearOfAdmission && u.yearOfPassout && (
                <span>{u.yearOfAdmission}–{u.yearOfPassout}</span>
              )}
            </div>
          </div>
        </div>

        {/* Buttons / Actions */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-sm font-semibold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg transition shrink-0"
          >
            {expanded ? 'Hide Details' : 'View Details'}
            <ChevronDown size={16} className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
          </button>
          
          {u.role !== 'admin' && (
            <>
              {u.status !== 'approved' && (
                <button
                  onClick={() => onApprove(u.id)}
                  disabled={actingId === u.id}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-semibold px-3 py-2 rounded-lg shadow-sm transition"
                >
                  {actingId === u.id ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
                  Approve
                </button>
              )}
              {u.status !== 'rejected' && (
                <button
                  onClick={() => onReject(u.id)}
                  disabled={actingId === u.id}
                  className="flex items-center gap-1.5 border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-60 text-sm font-semibold px-3 py-2 rounded-lg transition"
                >
                  <XCircle size={15} /> Reject
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {u.alumniId && (
        <div className="self-start">
          <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-100 bg-emerald-50 px-2.5 py-0.5 font-mono text-xs font-semibold tracking-wide text-emerald-700">
            <IdCard size={13} /> {u.alumniId}
          </span>
        </div>
      )}

      {u.status === 'rejected' && u.rejectionReason && (
        <div className="bg-red-50 text-red-700 text-xs rounded-lg px-3 py-2 border border-red-100">
          <strong>Rejection Reason:</strong> {u.rejectionReason}
        </div>
      )}

      {/* Expanded details view */}
      {expanded && (
        <div className="border-t border-slate-100 pt-4 mt-2 grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50/50 p-4 rounded-xl">
          {/* Column 1: Personal Profile */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-1.5">
              <UserIcon size={16} className="text-blue-700" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Personal Info</h4>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <DetailItem label="Gender" value={u.gender} />
              <DetailItem label="Date of Birth" value={u.dob ? new Date(u.dob).toLocaleDateString('en-IN') : '—'} />
              <DetailItem label="Contact Number" value={u.contactNumber ? `+91 ${u.contactNumber}` : '—'} />
              <DetailItem label="Location" value={[u.address, u.city, u.state, u.country, u.pinCode].filter(Boolean).join(', ') || '—'} />
            </div>
          </div>

          {/* Column 2: Professional Profile */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-1.5">
              <Briefcase size={16} className="text-blue-700" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Professional Info</h4>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <DetailItem label="Employment Status" value={u.employmentStatus} />
              
              {/* Employed conditional info */}
              {u.employmentStatus === 'Employed' && (
                <>
                  <DetailItem label="Company / Organisation" value={u.companyName} />
                  <DetailItem label="Work Email" value={u.workEmail} />
                  <DetailItem label="Office Address" value={[u.officeAddress, u.officeCity, u.officeState, u.officeCountry, u.officePinCode].filter(Boolean).join(', ') || '—'} />
                  <DetailItem label="Designation / Role" value={u.designation} />
                  <DetailItem label="Industry" value={u.industry} />
                  <DetailItem label="Experience" value={u.workExperience ? `${u.workExperience} years` : '—'} />
                </>
              )}

              {/* Entrepreneur conditional info */}
              {u.employmentStatus === 'Entrepreneur' && (
                <>
                  <DetailItem label="Startup Name" value={u.startupName} />
                  <DetailItem
                    label="Startup Website"
                    value={
                      u.startupWebsite ? (
                        <a href={u.startupWebsite} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {u.startupWebsite}
                        </a>
                      ) : '—'
                    }
                  />
                  <DetailItem label="Startup Description" value={u.startupDescription} />
                </>
              )}

              {/* Higher Studies conditional info */}
              {u.employmentStatus === 'Higher Studies' && (
                <>
                  <DetailItem label="University / College" value={u.universityName} />
                  <DetailItem label="Course / Programme" value={u.higherStudiesCourse} />
                  <DetailItem label="Country" value={u.higherStudiesCountry} />
                </>
              )}

              <DetailItem
                label="LinkedIn Profile"
                value={
                  u.linkedinUrl ? (
                    <a href={u.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">
                      <Link2 size={12} className="text-blue-600" /> View Profile
                    </a>
                  ) : '—'
                }
              />
            </div>
          </div>

          {/* Column 3: Engagement Profile */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-1.5">
              <Heart size={16} className="text-blue-700" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Alumni Engagement</h4>
            </div>
            <div className="space-y-3 pt-1">
              <DetailCheckbox label="Mentoring Students" checked={u.interestedInMentoring} />
              <DetailCheckbox label="Campus Recruitment" checked={u.interestedInRecruitment} />
              <DetailCheckbox label="Guest Lectures / Webinars" checked={u.interestedInGuestLectures} />
              <DetailCheckbox label="Donations / Sponsorships" checked={u.interestedInDonations} />
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

const DeptWiseView = ({ groups }) => {
  const [expanded, setExpanded] = useState({});
  const sorted = Object.entries(groups || {}).sort(([, a], [, b]) => b.length - a.length);
  const max = sorted[0]?.[1].length || 1;

  const downloadCSV = () => {
    const header = ['Name', 'Email', 'Department', 'Batch', 'Course'];
    const allMembers = Object.values(groups || {}).flat();
    const lines = [
      header.join(','),
      ...allMembers.map(m =>
        [
          `"${m.name || ''}"`,
          `"${m.email || ''}"`,
          `"${m.branch || m.course || 'Unspecified'}"`,
          m.yearOfPassout || '',
          `"${m.course || ''}"`,
        ].join(',')
      ),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'alumni-dept-wise.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Bar chart summary card */}
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800">Department-wise Alumni Count</h2>
          <button
            onClick={downloadCSV}
            className="flex items-center gap-1.5 text-sm text-gray-600 border border-gray-300 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors"
          >
            <Download size={14} /> Download CSV
          </button>
        </div>

        <div className="space-y-3">
          {sorted.map(([dept, list]) => {
            const pct = Math.round((list.length / max) * 100);
            return (
              <div key={dept} className="flex items-center gap-3">
                <span className="w-24 shrink-0 text-sm font-medium text-gray-600 truncate text-right">{dept}</span>
                <div className="flex-1 h-6 bg-gray-100 rounded overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="h-full bg-blue-600 rounded"
                  />
                </div>
                <span className="w-20 shrink-0 text-sm text-gray-500">
                  {list.length} alumni
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Collapsible dept accordions */}
      {sorted.map(([dept, list]) => (
          <div key={dept} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <button
              onClick={() => setExpanded(e => ({ ...e, [dept]: !e[dept] }))}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <GraduationCap size={15} className="text-blue-600" />
                <span className="font-semibold text-gray-800">{dept}</span>
                <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">{list.length}</span>
              </div>
              {expanded[dept]
                ? <ChevronDown size={15} className="text-gray-400" />
                : <ChevronRight size={15} className="text-gray-400" />}
            </button>
            {expanded[dept] && (
              <div className="border-t border-gray-100 divide-y divide-gray-50">
                {list.map(u => (
                  <div key={u.id} className="flex items-center gap-3 px-4 py-2.5">
                    {u.profilePhoto ? (
                      <img src={u.profilePhoto} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-semibold shrink-0">
                        {u.name?.[0]?.toUpperCase() || '?'}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{u.name || 'Unnamed'}</p>
                      <p className="text-xs text-gray-400 truncate">{u.email}</p>
                      {u.alumniId && (
                        <p className="font-mono text-xs font-semibold text-emerald-700 truncate">{u.alumniId}</p>
                      )}
                    </div>
                    {u.yearOfPassout && (
                      <span className="text-xs text-gray-400 shrink-0">Batch {u.yearOfPassout}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
    </div>
  );
};

const TAB_META = {
  pending:    { label: 'Pending Requests',        icon: Clock },
  approved:   { label: 'Approved Members',        icon: CheckCircle2 },
  rejected:   { label: 'Rejected Requests',       icon: XCircle },
  'dept-wise': { label: 'Department-wise Members', icon: LayoutGrid },
};

export const MembersPanel = ({ tab }) => {
  const [members, setMembers]   = useState([]);
  const [deptGroups, setDeptGroups] = useState({});
  const [counts, setCounts]     = useState({ pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [actingId, setActingId] = useState(null);

  const apiStatus = tab === 'dept-wise' ? 'approved' : tab;

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      if (tab === 'dept-wise') {
        const data = await fetchDeptWiseAlumni();
        setDeptGroups(data.grouped || {});
        if (data.counts) setCounts(data.counts);
      } else {
        const data = await fetchRequests(apiStatus);
        setMembers(data.requests || []);
        if (data.counts) setCounts(data.counts);
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [tab, apiStatus]);

  useEffect(() => { load(); }, [load]);

  const handleApprove = async (id) => {
    setActingId(id);
    try {
      await approveRequest(id);
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    } finally {
      setActingId(null);
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt('Reason for rejection (optional):', '');
    if (reason === null) return;
    setActingId(id);
    try {
      await rejectRequest(id, reason);
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
    } finally {
      setActingId(null);
    }
  };

  const { label, icon: TitleIcon } = TAB_META[tab] || TAB_META.pending;

  const isListEmpty = tab === 'dept-wise'
    ? Object.keys(deptGroups).length === 0
    : members.length === 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <TitleIcon size={24} className="text-blue-700" />
            {label}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {tab === 'dept-wise'
              ? 'Approved members grouped by department / branch.'
              : 'Manage alumni account requests.'}
          </p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg px-3 py-2 hover:bg-gray-50 transition-colors"
        >
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { key: 'pending',  label: 'Pending Requests',  icon: Clock,        valueColor: 'text-amber-600' },
          { key: 'approved', label: 'Approved Members',  icon: CheckCircle2, valueColor: 'text-emerald-700' },
          { key: 'rejected', label: 'Rejected Requests', icon: XCircle,      valueColor: 'text-red-600' },
        ].map(({ key, label: lbl, icon: Icon, valueColor }) => (
          <div key={key} className="bg-white rounded-lg border border-gray-200 p-5 flex items-center gap-4">
            <Icon size={20} className="text-gray-300 shrink-0" />
            <div>
              <p className="text-xs text-gray-500 font-medium">{lbl}</p>
              <p className={`text-3xl font-bold mt-0.5 ${valueColor}`}>{counts[key] ?? 0}</p>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
          <AlertTriangle size={15} /> {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16 text-gray-400">
          <Loader2 size={28} className="animate-spin" />
        </div>
      ) : isListEmpty ? (
        <div className="text-center py-16 text-gray-400">
          <Users size={36} className="mx-auto mb-3" />
          <p className="text-sm">No {tab === 'dept-wise' ? 'approved' : tab} members.</p>
        </div>
      ) : tab === 'dept-wise' ? (
        <DeptWiseView groups={deptGroups} />
      ) : (
        <div className="space-y-3">
          {members.map(u => (
            <MemberCard
              key={u.id}
              u={u}
              onApprove={handleApprove}
              onReject={handleReject}
              actingId={actingId}
            />
          ))}
        </div>
      )}
    </div>
  );
};
