import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, Check, Loader2, User, Briefcase,
  Heart, ClipboardList, Link2, Phone, MapPin, GraduationCap,
  Building2, Lightbulb, Trophy, ChevronDown,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { updateProfile } from '../services/authService';

// ─── constants ────────────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: 'Personal',      icon: User       },
  { id: 2, label: 'Professional',  icon: Briefcase  },
  { id: 3, label: 'Engagement',    icon: Heart      },
  { id: 4, label: 'Review',        icon: ClipboardList },
];

const EMPLOYMENT_OPTIONS = [
  'Employed',
  'Entrepreneur',
  'Higher Studies',
  'Government Service',
  'Self-Employed',
  'Looking for Opportunities',
];

const INDUSTRIES = [
  'Information Technology', 'Banking & Finance', 'Healthcare', 'Education',
  'Manufacturing', 'Government / PSU', 'Automobile', 'Construction & Infrastructure',
  'Consulting', 'Research & Development', 'Telecommunications', 'Defence',
  'Agriculture', 'E-Commerce', 'Media & Entertainment', 'Other',
];

const INDIA_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi (NCT)', 'Puducherry', 'Chandigarh', 'Other',
];

// ─── small UI helpers ─────────────────────────────────────────────────────────
const Label = ({ children, required }) => (
  <label className="mb-1 block text-xs font-semibold text-slate-600">
    {children}{required && <span className="ml-0.5 text-red-500">*</span>}
  </label>
);

const inputCls = 'w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder:text-slate-400';
const selectCls = `${inputCls} cursor-pointer appearance-none`;

function Field({ label, required, children }) {
  return (
    <div>
      <Label required={required}>{label}</Label>
      {children}
    </div>
  );
}

function SelectWrap({ children }) {
  return (
    <div className="relative">
      {children}
      <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
    </div>
  );
}

function Toggle({ label, description, checked, onChange }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`flex w-full items-center justify-between rounded-xl border px-4 py-3.5 text-left transition ${
        checked
          ? 'border-blue-200 bg-blue-50'
          : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50'
      }`}
    >
      <div>
        <p className={`text-sm font-semibold ${checked ? 'text-blue-800' : 'text-slate-700'}`}>{label}</p>
        {description && (
          <p className={`mt-0.5 text-xs ${checked ? 'text-blue-500' : 'text-slate-400'}`}>{description}</p>
        )}
      </div>
      <div className={`relative ml-4 h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? 'bg-blue-600' : 'bg-slate-200'}`}>
        <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? 'left-[22px]' : 'left-0.5'}`} />
      </div>
    </button>
  );
}

// ─── STEP INDICATOR ───────────────────────────────────────────────────────────
function StepIndicator({ current }) {
  return (
    <div className="mb-8 flex items-center justify-center gap-0">
      {STEPS.map((step, idx) => {
        const done   = current > step.id;
        const active = current === step.id;
        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-bold transition-all ${
                done   ? 'border-blue-700 bg-blue-700 text-white'
                : active ? 'border-blue-700 bg-white text-blue-700 shadow-sm shadow-blue-200'
                : 'border-slate-200 bg-white text-slate-400'
              }`}>
                {done ? <Check size={15} strokeWidth={2.5} /> : step.id}
              </div>
              <span className={`hidden text-[11px] font-semibold sm:block ${
                active ? 'text-blue-700' : done ? 'text-slate-500' : 'text-slate-300'
              }`}>
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={`mx-1 mb-5 h-[2px] w-12 rounded-full sm:w-20 md:w-28 ${current > step.id ? 'bg-blue-700' : 'bg-slate-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── STEP 1 — Personal Details ────────────────────────────────────────────────
function Step1({ form, set, onChange }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-extrabold text-slate-800">Personal Details</h2>
        <p className="mt-0.5 text-sm text-slate-500">Basic information about you.</p>
        <div className="mt-3 h-1 w-10 rounded-full bg-amber-400" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Gender">
          <SelectWrap>
            <select name="gender" value={form.gender} onChange={onChange} className={selectCls}>
              <option value="">Select gender</option>
              <option>Male</option>
              <option>Female</option>
              <option>Prefer not to say</option>
            </select>
          </SelectWrap>
        </Field>

        <Field label="Date of Birth">
          <input name="dob" type="date" value={form.dob} onChange={onChange} className={inputCls} />
        </Field>

        <Field label="City" required>
          <input name="city" value={form.city} onChange={onChange} placeholder="e.g. Pune" className={inputCls} />
        </Field>

        <Field label="State">
          <SelectWrap>
            <select name="state" value={form.state} onChange={onChange} className={selectCls}>
              <option value="">Select state</option>
              {INDIA_STATES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </SelectWrap>
        </Field>

        <Field label="Country">
          <input name="country" value={form.country} onChange={onChange} placeholder="India" className={inputCls} />
        </Field>

        <Field label="Alternate Contact Number">
          <div className="flex overflow-hidden rounded-lg border border-slate-200 transition focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
            <span className="flex items-center border-r border-slate-200 bg-slate-50 px-3 text-sm text-slate-500">+91</span>
            <input
              name="alternateContact"
              type="tel"
              value={form.alternateContact}
              onChange={onChange}
              placeholder="10-digit number"
              maxLength={10}
              className="flex-1 bg-transparent px-3 py-2.5 text-sm outline-none"
            />
          </div>
        </Field>

        <Field label="LinkedIn Profile URL">
          <div className="flex overflow-hidden rounded-lg border border-slate-200 transition focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
            <span className="flex items-center border-r border-slate-200 bg-slate-50 px-3">
              <Link2 size={14} className="text-blue-600" />
            </span>
            <input
              name="linkedinUrl"
              type="url"
              value={form.linkedinUrl}
              onChange={onChange}
              placeholder="linkedin.com/in/yourname"
              className="flex-1 bg-transparent px-3 py-2.5 text-sm outline-none"
            />
          </div>
        </Field>
      </div>

      <Field label="About Yourself">
        <textarea
          name="about"
          value={form.about}
          onChange={onChange}
          rows={3}
          maxLength={500}
          placeholder="Brief bio — your journey, interests, goals…"
          className={inputCls}
        />
        <p className="mt-1 text-right text-xs text-slate-400">{(form.about || '').length}/500</p>
      </Field>
    </div>
  );
}

// ─── STEP 2 — Professional ────────────────────────────────────────────────────
function Step2({ form, set, onChange }) {
  const status = form.employmentStatus;
  const isEmployee = ['Employed', 'Government Service', 'Self-Employed'].includes(status);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-extrabold text-slate-800">Professional Background</h2>
        <p className="mt-0.5 text-sm text-slate-500">Your current work or study situation.</p>
        <div className="mt-3 h-1 w-10 rounded-full bg-amber-400" />
      </div>

      {/* Employment status — pill selector */}
      <Field label="Employment Status" required>
        <div className="flex flex-wrap gap-2">
          {EMPLOYMENT_OPTIONS.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => set('employmentStatus', opt)}
              className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
                status === opt
                  ? 'border-blue-700 bg-blue-700 text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-600'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </Field>

      {/* Conditional fields */}
      {isEmployee && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Company / Organisation" required>
            <input name="companyName" value={form.companyName} onChange={onChange} placeholder="e.g. Tata Consultancy Services" className={inputCls} />
          </Field>
          <Field label="Designation / Role" required>
            <input name="designation" value={form.designation} onChange={onChange} placeholder="e.g. Software Engineer" className={inputCls} />
          </Field>
          <Field label="Industry">
            <SelectWrap>
              <select name="industry" value={form.industry} onChange={onChange} className={selectCls}>
                <option value="">Select industry</option>
                {INDUSTRIES.map((i) => <option key={i}>{i}</option>)}
              </select>
            </SelectWrap>
          </Field>
          <Field label="Work Experience (Years)">
            <input name="workExperience" type="number" min={0} max={50} value={form.workExperience} onChange={onChange} placeholder="e.g. 3" className={inputCls} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Skills / Technologies">
              <input name="skills" value={form.skills} onChange={onChange} placeholder="e.g. React, Java, AutoCAD, Python (comma separated)" className={inputCls} />
            </Field>
          </div>
        </div>
      )}

      {status === 'Entrepreneur' && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Startup Name" required>
            <input name="startupName" value={form.startupName} onChange={onChange} placeholder="Your startup name" className={inputCls} />
          </Field>
          <Field label="Startup Website">
            <input name="startupWebsite" type="url" value={form.startupWebsite} onChange={onChange} placeholder="https://yourstartup.com" className={inputCls} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="What does your startup do?">
              <textarea name="startupDescription" value={form.startupDescription} onChange={onChange} rows={3} maxLength={500} placeholder="Brief description of your startup…" className={inputCls} />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Skills / Technologies">
              <input name="skills" value={form.skills} onChange={onChange} placeholder="e.g. Product Management, Fundraising, SaaS" className={inputCls} />
            </Field>
          </div>
        </div>
      )}

      {status === 'Higher Studies' && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="University / College Name" required>
            <input name="universityName" value={form.universityName} onChange={onChange} placeholder="e.g. IIT Bombay" className={inputCls} />
          </Field>
          <Field label="Course / Programme" required>
            <input name="higherStudiesCourse" value={form.higherStudiesCourse} onChange={onChange} placeholder="e.g. M.Tech Computer Science" className={inputCls} />
          </Field>
          <Field label="Country">
            <input name="higherStudiesCountry" value={form.higherStudiesCountry} onChange={onChange} placeholder="e.g. India" className={inputCls} />
          </Field>
        </div>
      )}

      {status === 'Looking for Opportunities' && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Skills / Technologies">
              <input name="skills" value={form.skills} onChange={onChange} placeholder="e.g. React, Java, Machine Learning" className={inputCls} />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Areas of Interest">
              <input name="areasOfExpertise" value={form.areasOfExpertise} onChange={onChange} placeholder="e.g. Full Stack Development, Data Science" className={inputCls} />
            </Field>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── STEP 3 — Engagement ──────────────────────────────────────────────────────
function Step3({ form, set }) {
  const toggles = [
    { key: 'interestedInMentoring',     label: 'Mentoring Students',         description: 'Guide current students with career and academic advice' },
    { key: 'interestedInRecruitment',   label: 'Campus Recruitment',         description: 'Help recruit talented SSGMCE students for your organisation' },
    { key: 'interestedInGuestLectures', label: 'Guest Lectures / Webinars',  description: 'Share your expertise through talks and online sessions' },
    { key: 'interestedInDonations',     label: 'Donations / Contributions',  description: 'Support college infrastructure and student scholarships' },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-extrabold text-slate-800">Alumni Engagement</h2>
        <p className="mt-0.5 text-sm text-slate-500">How you'd like to give back to the SSGMCE community.</p>
        <div className="mt-3 h-1 w-10 rounded-full bg-amber-400" />
      </div>

      <div className="space-y-3">
        {toggles.map(({ key, label, description }) => (
          <Toggle
            key={key}
            label={label}
            description={description}
            checked={!!form[key]}
            onChange={() => set(key, !form[key])}
          />
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Areas of Expertise">
          <input
            name="areasOfExpertise"
            value={form.areasOfExpertise}
            onChange={(e) => set('areasOfExpertise', e.target.value)}
            placeholder="e.g. Cloud Computing, Civil Design, Finance"
            className={inputCls}
          />
        </Field>
        <div className="sm:col-span-1" />
        <div className="sm:col-span-2">
          <Field label="Achievements / Awards">
            <textarea
              name="achievements"
              value={form.achievements}
              onChange={(e) => set('achievements', e.target.value)}
              rows={3}
              maxLength={1000}
              placeholder="Any awards, patents, publications, or notable achievements…"
              className={inputCls}
            />
            <p className="mt-1 text-right text-xs text-slate-400">{(form.achievements || '').length}/1000</p>
          </Field>
        </div>
      </div>
    </div>
  );
}

// ─── STEP 4 — Review ─────────────────────────────────────────────────────────
function ReviewRow({ label, value }) {
  if (!value && value !== false) return null;
  return (
    <div className="flex gap-4 border-b border-slate-100 py-2.5 last:border-0">
      <span className="w-44 shrink-0 text-xs font-semibold text-slate-400">{label}</span>
      <span className="text-sm text-slate-700">{typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}</span>
    </div>
  );
}

function ReviewSection({ title, children }) {
  return (
    <div className="mb-5">
      <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-400">{title}</h3>
      <div className="rounded-xl border border-slate-100 bg-slate-50 px-4">{children}</div>
    </div>
  );
}

function Step4({ form, profile, consent, setConsent }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-extrabold text-slate-800">Review Your Profile</h2>
        <p className="mt-0.5 text-sm text-slate-500">Check everything before submitting. You can still go back to edit.</p>
        <div className="mt-3 h-1 w-10 rounded-full bg-amber-400" />
      </div>

      <ReviewSection title="Personal">
        <ReviewRow label="Full Name"         value={profile.name} />
        <ReviewRow label="Email"             value={profile.email} />
        <ReviewRow label="Gender"            value={form.gender} />
        <ReviewRow label="Date of Birth"     value={form.dob ? new Date(form.dob).toLocaleDateString('en-IN') : ''} />
        <ReviewRow label="Contact"           value={profile.contactNumber ? `+91 ${profile.contactNumber}` : ''} />
        <ReviewRow label="Alternate Contact" value={form.alternateContact ? `+91 ${form.alternateContact}` : ''} />
        <ReviewRow label="City / State"      value={[form.city, form.state, form.country].filter(Boolean).join(', ')} />
        <ReviewRow label="LinkedIn"          value={form.linkedinUrl} />
        <ReviewRow label="About"             value={form.about} />
      </ReviewSection>

      <ReviewSection title="Academic">
        <ReviewRow label="Course"     value={profile.course} />
        <ReviewRow label="Branch"     value={profile.branch} />
        <ReviewRow label="Admission"  value={profile.yearOfAdmission} />
        <ReviewRow label="Passout"    value={profile.yearOfPassout} />
      </ReviewSection>

      <ReviewSection title="Professional">
        <ReviewRow label="Status"      value={form.employmentStatus} />
        <ReviewRow label="Company"     value={form.companyName} />
        <ReviewRow label="Designation" value={form.designation} />
        <ReviewRow label="Industry"    value={form.industry} />
        <ReviewRow label="Experience"  value={form.workExperience ? `${form.workExperience} years` : ''} />
        <ReviewRow label="Skills"      value={form.skills} />
        <ReviewRow label="Startup"     value={form.startupName} />
        <ReviewRow label="University"  value={form.universityName} />
        <ReviewRow label="Course"      value={form.higherStudiesCourse} />
      </ReviewSection>

      <ReviewSection title="Engagement">
        <ReviewRow label="Mentoring"       value={form.interestedInMentoring} />
        <ReviewRow label="Campus Recruit"  value={form.interestedInRecruitment} />
        <ReviewRow label="Guest Lectures"  value={form.interestedInGuestLectures} />
        <ReviewRow label="Donations"       value={form.interestedInDonations} />
        <ReviewRow label="Expertise"       value={form.areasOfExpertise} />
        <ReviewRow label="Achievements"    value={form.achievements} />
      </ReviewSection>

      {/* Consent */}
      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 hover:bg-slate-50">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-500"
        />
        <span className="text-sm text-slate-600">
          I consent to SSGMCE Alumni Association storing and using my information for alumni community purposes.
          I agree to the{' '}
          <span className="font-semibold text-blue-700">Alumni Association Terms &amp; Conditions</span>.
          <span className="ml-1 text-red-500">*</span>
        </span>
      </label>
    </div>
  );
}

// ─── PROFILE COMPLETION PAGE ──────────────────────────────────────────────────
export default function ProfileCompletion() {
  const { userProfile, setUserProfile } = useAuth();
  const navigate = useNavigate();
  const p = userProfile || {};

  const [step,    setStep]    = useState(1);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');
  const [consent, setConsent] = useState(p.dataConsentGiven || false);

  const [form, setForm] = useState({
    // Personal
    gender:           p.gender           || '',
    dob:              p.dob ? new Date(p.dob).toISOString().split('T')[0] : '',
    about:            p.about            || '',
    city:             p.city             || '',
    state:            p.state            || '',
    country:          p.country          || 'India',
    linkedinUrl:      p.linkedinUrl      || '',
    alternateContact: p.alternateContact || '',
    // Professional
    employmentStatus:     p.employmentStatus     || '',
    companyName:          p.companyName          || '',
    designation:          p.designation          || '',
    industry:             p.industry             || '',
    workExperience:       p.workExperience       || '',
    skills:               p.skills               || '',
    startupName:          p.startupName          || '',
    startupWebsite:       p.startupWebsite       || '',
    startupDescription:   p.startupDescription   || '',
    universityName:       p.universityName       || '',
    higherStudiesCourse:  p.higherStudiesCourse  || '',
    higherStudiesCountry: p.higherStudiesCountry || '',
    // Engagement
    interestedInMentoring:     p.interestedInMentoring     || false,
    interestedInRecruitment:   p.interestedInRecruitment   || false,
    interestedInGuestLectures: p.interestedInGuestLectures || false,
    interestedInDonations:     p.interestedInDonations     || false,
    areasOfExpertise: p.areasOfExpertise || '',
    achievements:     p.achievements     || '',
  });

  const set        = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));
  const onChange   = (e) => set(e.target.name, e.target.value);

  const next = () => { setError(''); setStep((s) => Math.min(s + 1, 4)); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const back = () => { setError(''); setStep((s) => Math.max(s - 1, 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const handleSubmit = async () => {
    if (!consent) { setError('Please accept the terms & conditions to continue.'); return; }
    setSaving(true);
    setError('');
    try {
      const payload = { ...form, dataConsentGiven: true, profileCompleted: true };
      await updateProfile(payload);
      setUserProfile((prev) => ({ ...prev, ...payload }));
      navigate('/dashboard');
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-56px)] bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Back link */}
        <Link
          to="/dashboard"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-blue-700"
        >
          <ArrowLeft size={15} /> Back to Profile
        </Link>

        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-slate-900">Complete Your Alumni Profile</h1>
          <p className="mt-1 text-sm text-slate-500">
            Help the SSGMCE community know you better — it takes less than 5 minutes.
          </p>
        </div>

        {/* Step indicator */}
        <StepIndicator current={step} />

        {/* Form card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {step === 1 && <Step1 form={form} set={set} onChange={onChange} />}
              {step === 2 && <Step2 form={form} set={set} onChange={onChange} />}
              {step === 3 && <Step3 form={form} set={set} />}
              {step === 4 && <Step4 form={form} profile={p} consent={consent} setConsent={setConsent} />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Error */}
        {error && (
          <p className="mt-3 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700">{error}</p>
        )}

        {/* Navigation buttons */}
        <div className="mt-5 flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={back}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <ArrowLeft size={15} /> Back
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              onClick={next}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800"
            >
              Continue <ArrowRight size={15} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 disabled:opacity-60"
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
              {saving ? 'Saving…' : 'Submit Profile'}
            </button>
          )}
        </div>

        {/* Step count footer */}
        <p className="mt-4 text-center text-xs text-slate-400">
          Step {step} of {STEPS.length} — {STEPS[step - 1].label}
        </p>
      </div>
    </div>
  );
}
