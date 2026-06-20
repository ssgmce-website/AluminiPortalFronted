import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  GraduationCap, Loader2, Mail, CheckCircle2,
  ChevronRight, ChevronLeft, Upload, User,
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  googleAuth, linkedInRedirect, requestEmailOtp, registerWithBackend,
  checkEmailRegistered, setAuthIntent, clearAuthIntent,
} from '../services/authService';
import { friendlyAuthError } from '../utils/authErrors';
import { routeForProfile } from '../utils/authRoutes';
import { useAuth } from '../contexts/AuthContext';

const currentYear = new Date().getFullYear();

const COURSES = ['B.E', 'M.E', 'MBA', 'PhD', 'MCA'];
const BRANCHES = [
  'Computer Science & Engineering',
  'Information Technology',
  'Electronics & Telecommunication',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
];
const EMPLOYMENT_OPTIONS = [
  'Employed',
  'Entrepreneur',
  'Higher Studies',
  'Government Service',
  'Self-Employed',
  'Looking for Opportunities',
];
const STEPS = [
  'Personal Information',
  'Academic Information',
  'Professional Information',
  'Other Information',
];

const inp = 'w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition';
const sel = inp + ' bg-white';
const lbl = 'block text-sm font-medium text-gray-700 mb-1';
const err = 'text-red-500 text-xs mt-1';

const schema = z
  .object({
    name: z.string().min(2, 'Enter your full name'),
    email: z.string().email('Enter a valid email'),
    course: z.string().min(1, 'Select a course'),
    branch: z.string().min(1, 'Select a branch'),
    yearOfAdmission: z
      .number({ invalid_type_error: 'Enter a valid year' })
      .int()
      .min(1990, 'Year must be 1990 or later')
      .max(currentYear, `Year cannot exceed ${currentYear}`),
    yearOfPassout: z
      .number({ invalid_type_error: 'Enter a valid year' })
      .int()
      .min(1990, 'Year must be 1990 or later')
      .max(currentYear + 6, 'Year seems too far in the future'),
  })
  .refine((d) => d.yearOfPassout >= d.yearOfAdmission, {
    message: 'Passout year must be after admission year',
    path: ['yearOfPassout'],
  });

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const LinkedInIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

export const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUserProfile } = useAuth();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const [otpSent, setOtpSent] = useState('');
  const [step, setStep] = useState(0);

  const photoRef = useRef(null);
  const resumeRef = useRef(null);

  const [personal, setPersonal] = useState({
    gender: '', dob: '', photo: null, photoPreview: '',
    mobileNo: '', whatsappNo: '', alternateMobile: '',
    address: '', city: '', state: '', country: '',
    linkedIn: '', maritalStatus: '',
  });

  const [prof, setProf] = useState({
    employmentStatus: '', company: '', designation: '', industry: '',
    workExperience: '', officeLocation: '', annualPackage: '', skills: '',
    resume: null, linkedIn: '', companyWebsite: '',
    startupName: '', startupWebsite: '', startupDescription: '',
    universityName: '', universityCourseName: '', universityCountry: '',
  });

  const [other, setOther] = useState({
    mentoring: '', campusRecruitment: '', guestLectures: '', donations: '',
    expertise: '', achievements: '', volunteering: '', membershipType: '',
    comments: '', dataConsent: false, termsConsent: false,
  });

  const { register, trigger, getValues, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { yearOfAdmission: '', yearOfPassout: '' },
  });

  useEffect(() => {
    const urlError = searchParams.get('error');
    if (urlError) setError(friendlyAuthError(urlError));
  }, [searchParams]);

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPersonal((p) => ({ ...p, photo: file, photoPreview: URL.createObjectURL(file) }));
  };

  const handleResume = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setProf((p) => ({ ...p, resume: file }));
  };

  const goNext = async () => {
    if (step === 0) {
      const ok = await trigger(['name', 'email']);
      if (!ok) return;
    }
    if (step === 1) {
      const ok = await trigger(['course', 'branch', 'yearOfAdmission', 'yearOfPassout']);
      if (!ok) return;
    }
    setStep((s) => s + 1);
  };

  const collectDetails = async () => {
    setError('');
    const ok = await trigger(['name', 'email', 'course', 'branch', 'yearOfAdmission', 'yearOfPassout']);
    if (!ok) return null;
    const v = getValues();
    return {
      name: v.name.trim(),
      course: v.course,
      branch: v.branch,
      yearOfAdmission: Number(v.yearOfAdmission),
      yearOfPassout: Number(v.yearOfPassout),
    };
  };

  const finish = (profile) => {
    setUserProfile(profile);
    navigate(routeForProfile(profile), { replace: true });
  };

  const handleAlreadyRegistered = (status) => {
    clearAuthIntent();
    setError('This email is already registered. Redirecting you to sign in…');
    setTimeout(() => navigate(status === 'approved' ? '/sign-in' : '/pending'), 1500);
  };

  const handleGoogle = async () => {
    const details = await collectDetails();
    if (!details) return;
    setBusy('google');
    try {
      setAuthIntent('register', details);
      const popped = await googleAuth();
      if (popped) {
        const { user } = await registerWithBackend(details);
        clearAuthIntent();
        finish(user);
      }
    } catch (e) {
      if (e?.response?.status === 409) return handleAlreadyRegistered(e.response.data?.status);
      setError(friendlyAuthError(e));
    } finally {
      setBusy('');
    }
  };

  const handleLinkedIn = async () => {
    const details = await collectDetails();
    if (!details) return;
    setAuthIntent('register', details);
    linkedInRedirect();
  };

  const handleEmailLink = async () => {
    const details = await collectDetails();
    if (!details) return;
    const email = getValues('email');
    setBusy('email');
    try {
      const { exists, status } = await checkEmailRegistered(email);
      if (exists) return handleAlreadyRegistered(status);
      setAuthIntent('register', details);
      await requestEmailOtp(email);
      setOtpSent(email);
    } catch (e) {
      setError(friendlyAuthError(e));
    } finally {
      setBusy('');
    }
  };

  const isEntrepreneur = prof.employmentStatus === 'Entrepreneur';
  const isHigherStudies = prof.employmentStatus === 'Higher Studies';
  const isLooking = prof.employmentStatus === 'Looking for Opportunities';
  const showCompanyFields = !isHigherStudies && !isLooking && prof.employmentStatus !== '';

  if (otpSent) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center space-y-3"
      >
        <CheckCircle2 size={36} className="text-green-600 mx-auto" />
        <h2 className="text-xl font-bold text-gray-900">Verify your email</h2>
        <p className="text-sm text-gray-600">
          We sent a one-time verification link to <strong>{otpSent}</strong>. Open it on this
          device to finish your registration. Your request will then be sent to the admin for
          approval.
        </p>
        <button
          onClick={() => setOtpSent('')}
          className="text-xs text-blue-700 font-medium hover:underline"
        >
          Use different details
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl p-8"
    >
      {/* Header */}
      <div className="text-center mb-7">
        <div className="w-14 h-14 bg-blue-700 rounded-2xl mx-auto mb-4 flex items-center justify-center">
          <GraduationCap size={28} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Register as Alumni</h1>
        <p className="text-gray-500 text-sm mt-1">
          Your request is reviewed by an admin before your account is activated.
        </p>
      </div>

      {/* Step indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((label, i) => (
            <div key={label} className="flex-1 flex flex-col items-center relative">
              {i < STEPS.length - 1 && (
                <div
                  className={`absolute top-4 left-1/2 w-full h-0.5 z-0 ${
                    i < step ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                />
              )}
              <div
                className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold border-2 transition-colors ${
                  i < step
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : i === step
                    ? 'border-blue-600 text-blue-600 bg-white'
                    : 'border-gray-300 text-gray-400 bg-white'
                }`}
              >
                {i < step ? '✓' : i + 1}
              </div>
              <p
                className={`mt-2 text-xs font-semibold text-center leading-tight ${
                  i === step ? 'text-blue-700' : i < step ? 'text-blue-500' : 'text-gray-400'
                }`}
              >
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-5 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={(e) => e.preventDefault()}>
        {/* ── Step 0: Personal Information ── */}
        {step === 0 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Full Name */}
              <div>
                <label className={lbl}>Full Name <span className="text-red-500">*</span></label>
                <input {...register('name')} type="text" placeholder="Your full name" className={inp} />
                {errors.name && <p className={err}>{errors.name.message}</p>}
              </div>

              {/* Gender */}
              <div>
                <label className={lbl}>Gender</label>
                <select
                  value={personal.gender}
                  onChange={(e) => setPersonal((p) => ({ ...p, gender: e.target.value }))}
                  className={sel}
                >
                  <option value="">Select gender</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                  <option>Prefer not to say</option>
                </select>
              </div>

              {/* Date of Birth */}
              <div>
                <label className={lbl}>Date of Birth</label>
                <input
                  type="date"
                  value={personal.dob}
                  onChange={(e) => setPersonal((p) => ({ ...p, dob: e.target.value }))}
                  className={inp}
                />
              </div>

              {/* Marital Status */}
              <div>
                <label className={lbl}>Marital Status</label>
                <select
                  value={personal.maritalStatus}
                  onChange={(e) => setPersonal((p) => ({ ...p, maritalStatus: e.target.value }))}
                  className={sel}
                >
                  <option value="">Select status</option>
                  <option>Single</option>
                  <option>Married</option>
                  <option>Divorced</option>
                  <option>Widowed</option>
                </select>
              </div>
            </div>

            {/* Profile Photo */}
            <div>
              <label className={lbl}>Profile Photo</label>
              <div className="flex items-center gap-5">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-gray-200 bg-gray-100 flex items-center justify-center">
                  {personal.photoPreview ? (
                    <img src={personal.photoPreview} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <User size={32} className="text-gray-400" />
                  )}
                </div>
                <div>
                  <input
                    ref={photoRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhoto}
                  />
                  <button
                    type="button"
                    onClick={() => photoRef.current?.click()}
                    className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                  >
                    <Upload size={15} />
                    {personal.photo ? 'Change Photo' : 'Upload Photo'}
                  </button>
                  {personal.photo && (
                    <p className="mt-1 text-xs text-green-700">{personal.photo.name}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-400">JPG, PNG or GIF · Max 2 MB</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Email */}
              <div>
                <label className={lbl}>Email Address <span className="text-red-500">*</span></label>
                <input {...register('email')} type="email" placeholder="you@example.com" className={inp} />
                {errors.email && <p className={err}>{errors.email.message}</p>}
                <p className="text-xs text-gray-400 mt-1">Use the same email as your Google / LinkedIn account.</p>
              </div>

              {/* Personal Mobile */}
              <div>
                <label className={lbl}>Personal Mobile No.</label>
                <input
                  type="tel"
                  placeholder="+91 XXXXX XXXXX"
                  value={personal.mobileNo}
                  onChange={(e) => setPersonal((p) => ({ ...p, mobileNo: e.target.value }))}
                  className={inp}
                />
              </div>

              {/* WhatsApp */}
              <div>
                <label className={lbl}>WhatsApp Mobile Number</label>
                <input
                  type="tel"
                  placeholder="+91 XXXXX XXXXX"
                  value={personal.whatsappNo}
                  onChange={(e) => setPersonal((p) => ({ ...p, whatsappNo: e.target.value }))}
                  className={inp}
                />
              </div>

              {/* Alternate Mobile */}
              <div>
                <label className={lbl}>Alternate Mobile Number</label>
                <input
                  type="tel"
                  placeholder="+91 XXXXX XXXXX"
                  value={personal.alternateMobile}
                  onChange={(e) => setPersonal((p) => ({ ...p, alternateMobile: e.target.value }))}
                  className={inp}
                />
              </div>
            </div>

            {/* Current Address */}
            <div>
              <label className={lbl}>Current Address</label>
              <textarea
                rows={2}
                placeholder="House no., Street, Locality"
                value={personal.address}
                onChange={(e) => setPersonal((p) => ({ ...p, address: e.target.value }))}
                className={inp}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className={lbl}>City</label>
                <input
                  type="text"
                  placeholder="City"
                  value={personal.city}
                  onChange={(e) => setPersonal((p) => ({ ...p, city: e.target.value }))}
                  className={inp}
                />
              </div>
              <div>
                <label className={lbl}>State</label>
                <input
                  type="text"
                  placeholder="State"
                  value={personal.state}
                  onChange={(e) => setPersonal((p) => ({ ...p, state: e.target.value }))}
                  className={inp}
                />
              </div>
              <div>
                <label className={lbl}>Country</label>
                <input
                  type="text"
                  placeholder="Country"
                  value={personal.country}
                  onChange={(e) => setPersonal((p) => ({ ...p, country: e.target.value }))}
                  className={inp}
                />
              </div>
            </div>

            {/* LinkedIn */}
            <div>
              <label className={lbl}>LinkedIn Profile URL</label>
              <input
                type="url"
                placeholder="https://linkedin.com/in/yourprofile"
                value={personal.linkedIn}
                onChange={(e) => setPersonal((p) => ({ ...p, linkedIn: e.target.value }))}
                className={inp}
              />
            </div>
          </div>
        )}

        {/* ── Step 1: Academic Information ── */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={lbl}>Course <span className="text-red-500">*</span></label>
                <select {...register('course')} className={sel}>
                  <option value="">Select course</option>
                  {COURSES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.course && <p className={err}>{errors.course.message}</p>}
              </div>

              <div>
                <label className={lbl}>Department / Branch <span className="text-red-500">*</span></label>
                <select {...register('branch')} className={sel}>
                  <option value="">Select branch</option>
                  {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
                {errors.branch && <p className={err}>{errors.branch.message}</p>}
              </div>

              <div>
                <label className={lbl}>Year of Admission <span className="text-red-500">*</span></label>
                <input
                  {...register('yearOfAdmission', { valueAsNumber: true })}
                  type="number"
                  placeholder="e.g. 2019"
                  min="1990"
                  max={currentYear}
                  className={inp}
                />
                {errors.yearOfAdmission && <p className={err}>{errors.yearOfAdmission.message}</p>}
              </div>

              <div>
                <label className={lbl}>Year of Graduation / Passing <span className="text-red-500">*</span></label>
                <input
                  {...register('yearOfPassout', { valueAsNumber: true })}
                  type="number"
                  placeholder="e.g. 2023"
                  min="1990"
                  max={currentYear + 6}
                  className={inp}
                />
                {errors.yearOfPassout && <p className={err}>{errors.yearOfPassout.message}</p>}
              </div>
            </div>
          </div>
        )}

        {/* ── Step 2: Professional Information ── */}
        {step === 2 && (
          <div className="space-y-5">
            {/* Employment Status */}
            <div>
              <label className={lbl}>Employment Status <span className="text-red-500">*</span></label>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {EMPLOYMENT_OPTIONS.map((opt) => (
                  <label
                    key={opt}
                    className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition ${
                      prof.employmentStatus === opt
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-200 text-gray-700 hover:border-blue-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="employmentStatus"
                      value={opt}
                      checked={prof.employmentStatus === opt}
                      onChange={(e) => setProf((p) => ({ ...p, employmentStatus: e.target.value }))}
                      className="accent-blue-600"
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>

            {/* Company fields (Employed / Government / Self-Employed / Entrepreneur) */}
            {showCompanyFields && (
              <div className="space-y-4 rounded-lg border border-gray-100 bg-gray-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Work Details
                </p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className={lbl}>Current Company / Organization</label>
                    <input type="text" placeholder="Company name" value={prof.company}
                      onChange={(e) => setProf((p) => ({ ...p, company: e.target.value }))} className={inp} />
                  </div>
                  <div>
                    <label className={lbl}>Designation</label>
                    <input type="text" placeholder="Your role" value={prof.designation}
                      onChange={(e) => setProf((p) => ({ ...p, designation: e.target.value }))} className={inp} />
                  </div>
                  <div>
                    <label className={lbl}>Industry</label>
                    <input type="text" placeholder="e.g. IT, Finance" value={prof.industry}
                      onChange={(e) => setProf((p) => ({ ...p, industry: e.target.value }))} className={inp} />
                  </div>
                  <div>
                    <label className={lbl}>Work Experience (Years)</label>
                    <input type="number" min="0" placeholder="e.g. 3" value={prof.workExperience}
                      onChange={(e) => setProf((p) => ({ ...p, workExperience: e.target.value }))} className={inp} />
                  </div>
                  <div>
                    <label className={lbl}>Office Location</label>
                    <input type="text" placeholder="City, Country" value={prof.officeLocation}
                      onChange={(e) => setProf((p) => ({ ...p, officeLocation: e.target.value }))} className={inp} />
                  </div>
                  <div>
                    <label className={lbl}>Annual Package <span className="text-gray-400">(Optional)</span></label>
                    <input type="text" placeholder="e.g. 10 LPA" value={prof.annualPackage}
                      onChange={(e) => setProf((p) => ({ ...p, annualPackage: e.target.value }))} className={inp} />
                  </div>
                  <div>
                    <label className={lbl}>LinkedIn Profile</label>
                    <input type="url" placeholder="https://linkedin.com/in/..." value={prof.linkedIn}
                      onChange={(e) => setProf((p) => ({ ...p, linkedIn: e.target.value }))} className={inp} />
                  </div>
                  <div>
                    <label className={lbl}>Company Website <span className="text-gray-400">(Optional)</span></label>
                    <input type="url" placeholder="https://company.com" value={prof.companyWebsite}
                      onChange={(e) => setProf((p) => ({ ...p, companyWebsite: e.target.value }))} className={inp} />
                  </div>
                </div>
              </div>
            )}

            {/* Skills & Resume (shown for all) */}
            {prof.employmentStatus && (
              <div className="space-y-4">
                <div>
                  <label className={lbl}>Skills / Technologies</label>
                  <input type="text" placeholder="e.g. React, Python, AWS" value={prof.skills}
                    onChange={(e) => setProf((p) => ({ ...p, skills: e.target.value }))} className={inp} />
                </div>
                <div>
                  <label className={lbl}>Resume Upload</label>
                  <input ref={resumeRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleResume} />
                  <button
                    type="button"
                    onClick={() => resumeRef.current?.click()}
                    className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                  >
                    <Upload size={15} />
                    {prof.resume ? 'Change Resume' : 'Upload Resume'}
                  </button>
                  {prof.resume && <p className="mt-1 text-xs text-green-700">{prof.resume.name}</p>}
                  <p className="mt-1 text-xs text-gray-400">PDF, DOC or DOCX · Max 5 MB</p>
                </div>
              </div>
            )}

            {/* Entrepreneur section */}
            {isEntrepreneur && (
              <div className="space-y-4 rounded-lg border border-blue-100 bg-blue-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                  Startup Details
                </p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className={lbl}>Startup Name</label>
                    <input type="text" placeholder="Your startup name" value={prof.startupName}
                      onChange={(e) => setProf((p) => ({ ...p, startupName: e.target.value }))} className={inp} />
                  </div>
                  <div>
                    <label className={lbl}>Startup Website</label>
                    <input type="url" placeholder="https://startup.com" value={prof.startupWebsite}
                      onChange={(e) => setProf((p) => ({ ...p, startupWebsite: e.target.value }))} className={inp} />
                  </div>
                </div>
                <div>
                  <label className={lbl}>Startup Description</label>
                  <textarea rows={3} placeholder="Brief description of your startup"
                    value={prof.startupDescription}
                    onChange={(e) => setProf((p) => ({ ...p, startupDescription: e.target.value }))}
                    className={inp} />
                </div>
              </div>
            )}

            {/* Higher Studies section */}
            {isHigherStudies && (
              <div className="space-y-4 rounded-lg border border-green-100 bg-green-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
                  Higher Studies Details
                </p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className={lbl}>University Name</label>
                    <input type="text" placeholder="University name" value={prof.universityName}
                      onChange={(e) => setProf((p) => ({ ...p, universityName: e.target.value }))} className={inp} />
                  </div>
                  <div>
                    <label className={lbl}>Course Name</label>
                    <input type="text" placeholder="e.g. MS Computer Science" value={prof.universityCourseName}
                      onChange={(e) => setProf((p) => ({ ...p, universityCourseName: e.target.value }))} className={inp} />
                  </div>
                  <div>
                    <label className={lbl}>Country</label>
                    <input type="text" placeholder="Country of study" value={prof.universityCountry}
                      onChange={(e) => setProf((p) => ({ ...p, universityCountry: e.target.value }))} className={inp} />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Step 3: Other Information ── */}
        {step === 3 && (
          <div className="space-y-5">
            {/* Yes/No toggles */}
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                Alumni Engagement
              </p>
              {[
                { key: 'mentoring', label: 'Interested in Mentoring Students?' },
                { key: 'campusRecruitment', label: 'Interested in Campus Recruitment?' },
                { key: 'guestLectures', label: 'Interested in Guest Lectures / Webinars?' },
                { key: 'donations', label: 'Interested in Donations / Contributions?' },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between gap-4">
                  <span className="text-sm text-gray-700">{label}</span>
                  <div className="flex gap-3">
                    {['Yes', 'No'].map((opt) => (
                      <label key={opt} className={`flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border transition ${
                        other[key] === opt
                          ? opt === 'Yes'
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-red-400 bg-red-50 text-red-600'
                          : 'border-gray-200 text-gray-500'
                      }`}>
                        <input
                          type="radio"
                          name={key}
                          value={opt}
                          checked={other[key] === opt}
                          onChange={() => setOther((o) => ({ ...o, [key]: opt }))}
                          className="hidden"
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={lbl}>Areas of Expertise</label>
                <input type="text" placeholder="e.g. Machine Learning, Finance" value={other.expertise}
                  onChange={(e) => setOther((o) => ({ ...o, expertise: e.target.value }))} className={inp} />
              </div>
              <div>
                <label className={lbl}>Volunteering Interest</label>
                <input type="text" placeholder="e.g. Teaching, Event Management" value={other.volunteering}
                  onChange={(e) => setOther((o) => ({ ...o, volunteering: e.target.value }))} className={inp} />
              </div>
            </div>

            <div>
              <label className={lbl}>Achievements / Awards</label>
              <textarea rows={2} placeholder="List any notable achievements or awards"
                value={other.achievements}
                onChange={(e) => setOther((o) => ({ ...o, achievements: e.target.value }))}
                className={inp} />
            </div>

            {/* Membership Type */}
            <div>
              <label className={lbl}>Membership Type</label>
              <div className="mt-2 flex gap-4">
                {['Annual Member', 'Lifetime Member'].map((type) => (
                  <label key={type} className={`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition ${
                    other.membershipType === type
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-600 hover:border-blue-300'
                  }`}>
                    <input
                      type="radio"
                      name="membershipType"
                      value={type}
                      checked={other.membershipType === type}
                      onChange={() => setOther((o) => ({ ...o, membershipType: type }))}
                      className="accent-blue-600"
                    />
                    {type}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className={lbl}>Comments / Suggestions</label>
              <textarea rows={3} placeholder="Any suggestions or comments for the alumni association"
                value={other.comments}
                onChange={(e) => setOther((o) => ({ ...o, comments: e.target.value }))}
                className={inp} />
            </div>

            {/* Consents */}
            <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={other.dataConsent}
                  onChange={(e) => setOther((o) => ({ ...o, dataConsent: e.target.checked }))}
                  className="mt-0.5 h-4 w-4 accent-blue-600"
                />
                <span className="text-sm text-gray-700">
                  I consent to the storage and use of my personal data by SSGMCE Alumni Connect
                  Association for alumni engagement purposes.
                </span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={other.termsConsent}
                  onChange={(e) => setOther((o) => ({ ...o, termsConsent: e.target.checked }))}
                  className="mt-0.5 h-4 w-4 accent-blue-600"
                />
                <span className="text-sm text-gray-700">
                  I agree to the{' '}
                  <a href="#" className="text-blue-700 underline hover:text-blue-900">
                    Alumni Association Terms &amp; Conditions
                  </a>
                  .
                </span>
              </label>
            </div>

            {/* Auth / Submit buttons */}
            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-xs text-gray-400">Verify your email &amp; submit</span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleEmailLink}
                disabled={!!busy || !other.dataConsent || !other.termsConsent}
                className="w-full bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {busy === 'email' ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
                {busy === 'email' ? 'Sending…' : 'Verify with email link'}
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleGoogle}
                  disabled={!!busy || !other.dataConsent || !other.termsConsent}
                  className="flex items-center justify-center gap-2 border border-gray-300 rounded-lg py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  {busy === 'google' ? <Loader2 size={16} className="animate-spin" /> : <GoogleIcon />}
                  Google
                </button>
                <button
                  onClick={handleLinkedIn}
                  disabled={!!busy || !other.dataConsent || !other.termsConsent}
                  className="flex items-center justify-center gap-2 bg-[#0A66C2] hover:bg-[#004182] disabled:opacity-50 rounded-lg py-2.5 text-sm font-medium text-white transition-colors"
                >
                  <LinkedInIcon />
                  LinkedIn
                </button>
              </div>

              {(!other.dataConsent || !other.termsConsent) && (
                <p className="text-xs text-center text-amber-600">
                  Please accept both consents above to submit.
                </p>
              )}
            </div>
          </div>
        )}
      </form>

      {/* Navigation buttons */}
      <div className="mt-8 flex items-center justify-between">
        {step > 0 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
          >
            <ChevronLeft size={16} /> Back
          </button>
        ) : (
          <div />
        )}

        {step < 3 && (
          <button
            type="button"
            onClick={goNext}
            className="flex items-center gap-1.5 rounded-lg bg-blue-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 transition"
          >
            Next <ChevronRight size={16} />
          </button>
        )}
      </div>

      <p className="text-center text-xs text-gray-400 mt-6">
        Already registered?{' '}
        <Link to="/sign-in" className="text-blue-700 font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </motion.div>
  );
};
