import { useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Pencil, Settings, MoreHorizontal, Camera, GraduationCap,
  Briefcase, Phone, Mail, CalendarDays, CheckCircle,
  AlertTriangle, Building2, User, Loader2, X, Save,
  Users, Clock, BookOpen, IdCard, Copy, Check, CalendarCheck,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { updateProfile } from '../services/authService';
import { uploadProfilePhoto } from '../services/uploadService';
import { Onboarding } from '../components/Onboarding';
import { EventRegistrationForm } from '../components/EventRegistrationForm';
import { AlumniContributionForm } from '../components/AlumniContributionForm';

// ─── constants ────────────────────────────────────────────────────────────────
const TABS = ['Overview', 'Events', 'Contributions', 'Connections', 'Activity'];

const COMPLETION_FIELDS = [
  { key: 'contactNumber', label: 'Contact Number' },
  { key: 'dob', label: 'Date of Birth' },
  { key: 'about', label: 'About Me' },
  { key: 'companyName', label: 'Company' },
  { key: 'designation', label: 'Designation' },
];

// ─── tiny helpers ──────────────────────────────────────────────────────────────
const Field = ({ label, value }) => (
  <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-6">
    <span className="w-40 shrink-0 text-xs font-semibold uppercase tracking-wide text-slate-400">
      {label}
    </span>
    <span className="text-sm text-slate-700">{value || <em className="text-slate-400">Not set</em>}</span>
  </div>
);

const Input = ({ label, ...props }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-semibold text-slate-500">{label}</label>
    <input
      className="rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
      {...props}
    />
  </div>
);

// ─── inline save/cancel bar ───────────────────────────────────────────────────
function SaveBar({ saving, onSave, onCancel }) {
  return (
    <div className="mt-4 flex items-center gap-2">
      <button
        onClick={onSave}
        disabled={saving}
        className="inline-flex items-center gap-1.5 rounded-md bg-blue-700 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:opacity-60"
      >
        {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
        Save
      </button>
      <button
        onClick={onCancel}
        className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-4 py-1.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
      >
        <X size={14} /> Cancel
      </button>
    </div>
  );
}

// ─── section wrapper ──────────────────────────────────────────────────────────
function Section({ title, onEdit, children }) {
  return (
    <div className="border-b border-slate-100 py-6 last:border-0">
      <div className="mb-3 flex items-center gap-2">
        <h3 className="text-sm font-bold text-slate-800">{title}</h3>
        <button
          onClick={onEdit}
          className="rounded p-0.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          title={`Edit ${title}`}
        >
          <Pencil size={13} />
        </button>
      </div>
      {children}
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
export const Dashboard = () => {
  const { userProfile, setUserProfile, backendError } = useAuth();
  const [activeTab, setActiveTab] = useState('Overview');
  const [editSection, setEditSection] = useState(null);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [copied, setCopied] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const photoInputRef = useRef(null);

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same file next time
    if (!file) return;

    setPhotoError('');
    setPhotoUploading(true);
    try {
      const url = await uploadProfilePhoto(file);
      await updateProfile({ profilePhoto: url });
      setUserProfile((prev) => ({ ...prev, profilePhoto: url }));
    } catch (err) {
      setPhotoError(err?.response?.data?.message || err.message || 'Could not upload photo.');
    } finally {
      setPhotoUploading(false);
    }
  };

  const copyAlumniId = useCallback((id) => {
    if (!id) return;
    navigator.clipboard?.writeText(id).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, []);

  // ── edit helpers ────────────────────────────────────────────────────────────
  const startEdit = useCallback((section, fields) => {
    setEditSection(section);
    setEditData(fields);
    setSaveError('');
  }, []);

  const cancelEdit = useCallback(() => {
    setEditSection(null);
    setEditData({});
    setSaveError('');
  }, []);

  if (userProfile && !userProfile.isOnboarded) return <Onboarding />;

  // ── profile completion ──────────────────────────────────────────────────────
  const missingFields = COMPLETION_FIELDS.filter((f) => !userProfile?.[f.key]);
  const completionPct = Math.round(
    ((COMPLETION_FIELDS.length - missingFields.length) / COMPLETION_FIELDS.length) * 100,
  );

  const handleChange = (e) =>
    setEditData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const saveEdit = async () => {
    setSaving(true);
    setSaveError('');
    try {
      await updateProfile(editData);
      setUserProfile((prev) => ({ ...prev, ...editData }));
      setEditSection(null);
    } catch (err) {
      setSaveError(err?.response?.data?.message || 'Could not save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const p = userProfile || {};
  const dobFormatted = p.dob ? new Date(p.dob).toLocaleDateString('en-IN') : '';
  const dobISO = p.dob ? new Date(p.dob).toISOString().split('T')[0] : '';

  return (
    <div>
      {/* ── BACKEND ERROR ───────────────────────────────────────────────────── */}
      {backendError && (
        <div className="bg-red-50 px-4 py-3">
          <div className="mx-auto flex max-w-4xl items-start gap-2">
            <AlertTriangle size={16} className="mt-0.5 shrink-0 text-red-500" />
            <p className="text-xs text-red-700">{backendError}</p>
          </div>
        </div>
      )}

      {photoError && (
        <div className="bg-red-50 px-4 py-3">
          <div className="mx-auto flex max-w-4xl items-start gap-2">
            <AlertTriangle size={16} className="mt-0.5 shrink-0 text-red-500" />
            <p className="text-xs text-red-700">{photoError}</p>
          </div>
        </div>
      )}

      {/* ── PROFILE HEADER ──────────────────────────────────────────────────── */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-4xl px-4 pt-6 sm:px-6 lg:px-8">

          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">

            {/* Avatar + name */}
            <div className="flex items-end gap-4">
              <div className="flex flex-col items-center gap-1.5">
                <div className="relative">
                  {p.profilePhoto ? (
                    <img
                      src={p.profilePhoto}
                      alt={p.name}
                      className="h-24 w-24 rounded-full object-cover ring-4 ring-white shadow-md"
                    />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-800 text-3xl font-extrabold text-white ring-4 ring-white shadow-md">
                      {p.name?.[0]?.toUpperCase() || 'A'}
                    </div>
                  )}
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    title={photoUploading ? 'Uploading…' : 'Change photo'}
                    disabled={photoUploading}
                    onClick={() => photoInputRef.current?.click()}
                    className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-slate-700 text-white opacity-90 transition hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {photoUploading ? <Loader2 size={13} className="animate-spin" /> : <Camera size={13} />}
                  </button>
                </div>

                {/* Extra-visible prompt until a photo is set */}
                {!p.profilePhoto && (
                  <button
                    type="button"
                    disabled={photoUploading}
                    onClick={() => photoInputRef.current?.click()}
                    className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 transition hover:text-blue-800 disabled:opacity-60"
                  >
                    <Camera size={11} /> {photoUploading ? 'Uploading…' : 'Add photo'}
                  </button>
                )}
              </div>

              <div className="pb-1">
                <h1 className="text-xl font-extrabold text-slate-900">{p.name}</h1>
                <p className="mt-0.5 text-sm text-slate-500">
                  Shri Sant Gajanan Maharaj College of Engineering (SSGMCE) Shegaon
                </p>
                <p className="mt-1 text-sm text-blue-600">
                  0 Connections &nbsp;•&nbsp; Alumni since {p.yearOfPassout || '—'}
                </p>

                {/* Alumni ID — assigned once an admin approves the account */}
                {p.alumniId && (
                  <div className="mt-2 inline-flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-1.5">
                    <IdCard size={15} className="shrink-0 text-blue-600" />
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      Alumni ID
                    </span>
                    <span className="font-mono text-sm font-bold tracking-wide text-slate-800">
                      {p.alumniId}
                    </span>
                    <button
                      onClick={() => copyAlumniId(p.alumniId)}
                      title={copied ? 'Copied!' : 'Copy Alumni ID'}
                      className="rounded p-0.5 text-slate-400 transition hover:bg-blue-100 hover:text-blue-700"
                    >
                      {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex shrink-0 items-center gap-2">
              <Link
                to="/dashboard/profile"
                className="flex items-center gap-1.5 rounded border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <Pencil size={13} /> Edit Profile
              </Link>
              <button
                title="Settings (coming soon)"
                className="rounded border border-slate-300 bg-white p-1.5 text-slate-600 transition hover:bg-slate-50"
              >
                <Settings size={15} />
              </button>
              <button
                title="More options"
                className="rounded border border-slate-300 bg-white p-1.5 text-slate-600 transition hover:bg-slate-50"
              >
                <MoreHorizontal size={15} />
              </button>
            </div>
          </div>

          {/* ── TABS ──────────────────────────────────────────────────────── */}
          <div className="mt-5 flex gap-1 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative whitespace-nowrap pb-3 pr-4 text-sm font-semibold transition-colors ${activeTab === tab
                    ? 'text-slate-900'
                    : 'text-slate-400 hover:text-slate-600'
                  }`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div
                    layoutId="tab-underline"
                    className="absolute bottom-0 left-0 right-4 h-[2px] rounded-full bg-slate-800"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── TAB CONTENT ─────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          {activeTab === 'Overview' ? (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Profile completion banner */}
              {!p.profileCompleted && (
                <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50 px-5 py-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-blue-800">
                        Complete your profile to let others know you better.
                        <span className="ml-2 font-bold text-blue-600">{completionPct}% done</span>
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {missingFields.map((f) => (
                          <span key={f.key} className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-600">
                            {f.label}
                          </span>
                        ))}
                      </div>
                    </div>
                    <Link
                      to="/dashboard/profile"
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-blue-700 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-blue-800"
                    >
                      Complete Profile →
                    </Link>
                  </div>
                  <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-blue-100">
                    <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${completionPct}%` }} />
                  </div>
                </div>
              )}

              {/* Save error */}
              {saveError && (
                <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                  {saveError}
                </div>
              )}

              <div className="rounded-xl border border-slate-200 bg-white px-6">

                {/* ── Basic Information ──────────────────────────────────── */}
                <Section
                  title="Basic Information"
                  onEdit={() =>
                    startEdit('basic', {
                      name: p.name || '',
                      contactNumber: p.contactNumber || '',
                      alternateEmail: p.alternateEmail || '',
                      dob: dobISO,
                    })
                  }
                >
                  {editSection === 'basic' ? (
                    <>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Input label="Full Name" name="name" value={editData.name || ''} onChange={handleChange} placeholder="Your full name" />
                        <Input label="Contact Number" name="contactNumber" value={editData.contactNumber || ''} onChange={handleChange} placeholder="10-digit mobile" maxLength={10} />
                        <Input label="Alternate Email" name="alternateEmail" value={editData.alternateEmail || ''} onChange={handleChange} placeholder="Other email address" type="email" />
                        <Input label="Date of Birth" name="dob" value={editData.dob || ''} onChange={handleChange} type="date" />
                      </div>
                      <SaveBar saving={saving} onSave={saveEdit} onCancel={cancelEdit} />
                    </>
                  ) : p.name || p.contactNumber || p.alternateEmail || p.dob ? (
                    <div className="space-y-3">
                      {p.name && <Field label="Full Name" value={p.name} />}
                      {p.contactNumber && <Field label="Contact" value={`+91 ${p.contactNumber}`} />}
                      {p.alternateEmail && <Field label="Alternate Email" value={p.alternateEmail} />}
                      {p.dob && <Field label="Date of Birth" value={dobFormatted} />}
                      <Field label="Primary Email" value={p.email} />
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400">
                      Edit your name, contact, alternate email, and date of birth.
                    </p>
                  )}
                </Section>

                {/* ── About Me ──────────────────────────────────────────── */}
                <Section
                  title="About Me"
                  onEdit={() => startEdit('about', { about: p.about || '' })}
                >
                  {editSection === 'about' ? (
                    <>
                      <textarea
                        name="about"
                        value={editData.about || ''}
                        onChange={handleChange}
                        rows={4}
                        maxLength={500}
                        placeholder="Write a short bio — your journey, interests, achievements…"
                        className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                      <p className="mt-1 text-right text-xs text-slate-400">
                        {(editData.about || '').length}/500
                      </p>
                      <SaveBar saving={saving} onSave={saveEdit} onCancel={cancelEdit} />
                    </>
                  ) : p.about ? (
                    <p className="text-sm leading-6 text-slate-700">{p.about}</p>
                  ) : (
                    <p className="text-sm text-slate-400">Let others know more about you.</p>
                  )}
                </Section>

                {/* ── Professional Experience ────────────────────────────── */}
                <Section
                  title="Professional Experience"
                  onEdit={() =>
                    startEdit('experience', {
                      companyName: p.companyName || '',
                      designation: p.designation || '',
                    })
                  }
                >
                  {editSection === 'experience' ? (
                    <>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Input label="Company / Organisation" name="companyName" value={editData.companyName || ''} onChange={handleChange} placeholder="e.g. Infosys, DRDO, …" />
                        <Input label="Designation / Role" name="designation" value={editData.designation || ''} onChange={handleChange} placeholder="e.g. Software Engineer" />
                      </div>
                      <SaveBar saving={saving} onSave={saveEdit} onCancel={cancelEdit} />
                    </>
                  ) : p.companyName || p.designation ? (
                    <div className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                        <Briefcase size={17} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          {p.designation || 'Professional'}
                        </p>
                        <p className="text-xs text-slate-500">{p.companyName}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400">Add your work experience.</p>
                  )}
                </Section>

                {/* ── Education ─────────────────────────────────────────── */}
                <Section
                  title="Education"
                  onEdit={() =>
                    startEdit('education', {
                      course: p.course || '',
                      branch: p.branch || '',
                      yearOfAdmission: p.yearOfAdmission || '',
                      yearOfPassout: p.yearOfPassout || '',
                    })
                  }
                >
                  {editSection === 'education' ? (
                    <>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Input label="Course" name="course" value={editData.course || ''} onChange={handleChange} placeholder="e.g. B.E." />
                        <Input label="Branch" name="branch" value={editData.branch || ''} onChange={handleChange} placeholder="e.g. Computer Science" />
                        <Input label="Year of Admission" name="yearOfAdmission" value={editData.yearOfAdmission || ''} onChange={handleChange} type="number" placeholder="e.g. 2019" />
                        <Input label="Year of Passout" name="yearOfPassout" value={editData.yearOfPassout || ''} onChange={handleChange} type="number" placeholder="e.g. 2023" />
                      </div>
                      <SaveBar saving={saving} onSave={saveEdit} onCancel={cancelEdit} />
                    </>
                  ) : (
                    <div className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                        <GraduationCap size={17} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-blue-700">
                          Shri Sant Gajanan Maharaj College of Engineering (SSGMCE) Shegaon
                        </p>
                        {(p.course || p.branch) && (
                          <p className="mt-0.5 text-xs text-slate-500">
                            {[p.course, p.branch].filter(Boolean).join(' — ')}
                          </p>
                        )}
                      </div>
                      {p.yearOfPassout && (
                        <span className="shrink-0 text-sm font-semibold text-slate-500">
                          {p.yearOfPassout}
                        </span>
                      )}
                    </div>
                  )}
                </Section>

              </div>
            </motion.div>
          ) : activeTab === 'Events' ? (
            /* ── Event Registration tab ──────────────────────────────── */
            // <motion.div
            //   key="events"
            //   initial={{ opacity: 0, y: 8 }}
            //   animate={{ opacity: 1, y: 0 }}
            //   exit={{ opacity: 0 }}
            //   transition={{ duration: 0.2 }}
            // >
            //   {/* Header banner */}
            //   <div className="mb-6 flex items-center gap-4 rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-5">
            //     <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 shadow-sm">
            //       <CalendarCheck size={24} className="text-white" />
            //     </div>
            //     <div>
            //       <h2 className="text-base font-extrabold text-slate-800">Event Registration</h2>
            //       <p className="mt-0.5 text-sm text-slate-500">
            //         Register for upcoming SSGMCE alumni events, reunions, and guest lectures.
            //       </p>
            //     </div>
            //   </div>

            //   {/* Coming-soon placeholder card */}
            //   <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-blue-200 bg-white py-16 text-center">
            //     <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
            //       <CalendarCheck size={32} className="text-blue-400" />
            //     </div>
            //     <p className="text-lg font-bold text-slate-700">No Events Available Yet</p>
            //     <p className="mt-2 max-w-sm text-sm text-slate-400">
            //       Alumni events and registration forms will appear here once they are published
            //       by the Alumni Cell. Stay tuned!
            //     </p>
            //     <span className="mt-4 inline-block rounded-full bg-blue-50 px-4 py-1.5 text-xs font-semibold text-blue-500">
            //       Coming Soon
            //     </span>
            //   </div>
            // </motion.div>
            <EventRegistrationForm />
          ) : activeTab === 'Contributions' ? (
            <AlumniContributionForm />
          ) : (
            /* ── Other coming-soon tabs ───────────────────────────────── */
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white py-16 text-center"
            >
              {activeTab === 'Connections' && <Users size={32} className="mb-3 text-slate-300" />}
              {activeTab === 'Activity' && <Clock size={32} className="mb-3 text-slate-300" />}
              <p className="font-semibold text-slate-500">{activeTab}</p>
              <p className="mt-1 text-sm text-slate-400">This section is coming soon.</p>
              <span className="mt-3 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-400">
                Coming soon
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
