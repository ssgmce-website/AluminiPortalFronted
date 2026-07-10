import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, CheckCircle2, RefreshCw, AlertCircle, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  googleAuth,
  linkedInRedirect,
  requestEmailOtp,
  registerWithBackend,
  checkEmailRegistered,
  setAuthIntent,
  clearAuthIntent,
} from '../services/authService';
import { friendlyAuthError } from '../utils/authErrors';
import { routeForProfile } from '../utils/authRoutes';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/logo.png';
import resisterBg from '../assets/REGISITER.png';

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const currentYear = new Date().getFullYear();

const COURSES  = ['B.E', 'M.E', 'MBA', 'PhD','BCA'];
const BRANCHES = [
  'Computer Science & Engineering',
  'Information Technology',
  'Electronics & Telecommunication',
  'Electrical Engineering',
  'Mechanical Engineering',
];

// ─── VALIDATION SCHEMA ───────────────────────────────────────────────────────
const schema = z
  .object({
    name: z.string().min(2, 'Enter your full name (at least 2 characters)'),
    email: z.string().email('Enter a valid email address'),
    contactNumber: z
      .string()
      .optional()
      .refine((v) => !v || /^\d{10}$/.test(v), { message: 'Enter a valid 10-digit mobile number' }),
    course: z.string().min(1, 'Please select your course'),
    branch: z.string().min(1, 'Please select your branch'),
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
    termsAccepted: z.boolean().refine((v) => v === true, {
      message: 'You must accept the Terms & Privacy Policy to continue',
    }),
  })
  .refine((d) => d.yearOfPassout >= d.yearOfAdmission, {
    message: 'Passout year must be ≥ admission year',
    path: ['yearOfPassout'],
  });

// ─── RESEND COUNTDOWN HOOK ───────────────────────────────────────────────────
// Uses setTimeout chain instead of setInterval — cleaner cleanup, no drift.
function useResendTimer(initialSeconds = 60) {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    if (seconds <= 0) return;
    const id = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [seconds]);

  const reset = useCallback(() => setSeconds(initialSeconds), [initialSeconds]);

  return { seconds, canResend: seconds === 0, reset };
}

// ─── CONFIRMATION SCREEN (isolated component — owns its own timer state) ─────
function ConfirmationScreen({ email, onBack }) {
  const { seconds, canResend, reset } = useResendTimer(60);
  const [resendBusy,  setResendBusy]  = useState(false);
  const [resendError, setResendError] = useState('');
  const [resendDone,  setResendDone]  = useState(false);

  const handleResend = async () => {
    setResendBusy(true);
    setResendError('');
    setResendDone(false);
    try {
      await requestEmailOtp(email);
      reset();
      setResendDone(true);
    } catch (err) {
      setResendError(friendlyAuthError(err));
    } finally {
      setResendBusy(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-[#eef2f6]/95 backdrop-blur-md border border-[#cbd5e1]/60 rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.12)] w-full max-w-[450px] p-8 text-center space-y-5 my-8"
    >
      {/* Icon */}
      <div className="flex justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 shadow-inner">
          <CheckCircle2 size={32} className="text-green-600" />
        </div>
      </div>

      {/* Heading */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Check your inbox</h2>
        <p className="mt-1 text-sm text-gray-500 font-medium">We sent a verification link to</p>
        <div className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-blue-100 bg-white px-4 py-2.5 shadow-sm">
          <Mail size={15} className="shrink-0 text-blue-600" />
          <span className="text-sm font-bold text-blue-800">{email}</span>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-gray-500">
          Open the link <strong>on this device</strong> to complete registration.
          Your account will then be sent to the admin for approval.
        </p>
      </div>

      {/* Resend section */}
      <div className="border-t border-gray-200 pt-5 text-center">
        {resendError && (
          <p className="mb-3 flex items-center justify-center gap-1.5 text-xs text-red-600 font-semibold">
            <AlertCircle size={13} /> {resendError}
          </p>
        )}
        {resendDone && !resendError && (
          <p className="mb-3 text-xs font-semibold text-green-600">Link resent successfully!</p>
        )}

        <AnimatePresence mode="wait">
          {canResend ? (
            <motion.button
              key="resend-btn"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              type="button"
              onClick={handleResend}
              disabled={resendBusy}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-blue-300 bg-blue-50 py-3 text-sm font-bold text-blue-700 transition hover:bg-blue-100 disabled:opacity-60 cursor-pointer"
            >
              {resendBusy
                ? <><Loader2 size={15} className="animate-spin" /> Resending…</>
                : <><RefreshCw size={15} /> Resend email link</>
              }
            </motion.button>
          ) : (
            <motion.p
              key="countdown"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-gray-400 font-medium"
            >
              Resend available in{' '}
              <span className="font-bold tabular-nums text-gray-600">
                0:{String(seconds).padStart(2, '0')}
              </span>
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <button
        type="button"
        onClick={onBack}
        className="text-xs text-gray-400 font-semibold hover:text-gray-600 hover:underline cursor-pointer block w-full text-center"
      >
        ← Use different email or details
      </button>
    </motion.div>
  );
}

// ─── INLINE SVG ICONS ────────────────────────────────────────────────────────
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const LinkedInIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="white" aria-hidden="true">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

// ─── REUSABLE FIELD WRAPPER ───────────────────────────────────────────────────
function FieldError({ message }) {
  if (!message) return null;
  return (
    <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
      <AlertCircle size={11} /> {message}
    </p>
  );
}

const inputCls = (hasError) =>
  `w-full rounded-lg border px-4 py-2.5 text-sm transition outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
    hasError ? 'border-red-400 bg-red-50' : 'border-gray-300'
  }`;

const selectCls = (hasError) =>
  `w-full rounded-lg border px-4 py-2.5 text-sm bg-white transition outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
    hasError ? 'border-red-400 bg-red-50' : 'border-gray-300'
  }`;

// ─── REGISTER ────────────────────────────────────────────────────────────────
export const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUserProfile } = useAuth();

  const [error,    setError]    = useState('');
  const [busy,     setBusy]     = useState(''); // 'google' | 'linkedin' | 'email' | ''
  const [otpSent,  setOtpSent]  = useState(''); // email address the link was sent to

  const {
    register,
    trigger,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      yearOfAdmission: '',
      yearOfPassout:   '',
      contactNumber:   '',
      termsAccepted:   false,
    },
  });

  // Surface errors bounced back via URL (e.g. LinkedIn cancel / no-email)
  useEffect(() => {
    const urlError = searchParams.get('error');
    if (urlError) setError(friendlyAuthError(urlError));
  }, [searchParams]);

  // Validate all fields and return the details payload (or null if invalid)
  const collectDetails = async () => {
    setError('');
    const ok = await trigger();
    if (!ok) return null;
    const v = getValues();
    return {
      name:            v.name.trim(),
      contactNumber:   v.contactNumber?.trim() || '',
      course:          v.course,
      branch:          v.branch,
      yearOfAdmission: Number(v.yearOfAdmission),
      yearOfPassout:   Number(v.yearOfPassout),
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
    } catch (err) {
      if (err?.response?.status === 409) return handleAlreadyRegistered(err.response.data?.status);
      setError(friendlyAuthError(err));
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
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setBusy('');
    }
  };

  // ── Confirmation screen or Registration form ──────────────────────────────
  return (
    <div
      className="min-h-screen w-full flex items-center justify-center lg:justify-start bg-cover bg-center p-4 sm:p-6 md:p-8 lg:pl-[6%] xl:pl-[8%] font-sans overflow-y-auto"
      style={{ backgroundImage: `url(${resisterBg})` }}
    >
      <div className="w-full max-w-[460px] my-8">
        <AnimatePresence mode="wait">
          {otpSent ? (
            <ConfirmationScreen key="confirm" email={otpSent} onBack={() => setOtpSent('')} />
          ) : (
            <motion.div
              key="register-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-[#eef2f6]/95 backdrop-blur-md border border-[#cbd5e1]/60 rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.12)] p-6 md:p-8"
            >
              {/* Header */}
              <div className=" text-center">
                <img src={logo} alt="SSGMCE Logo" className="mx-auto h-30 w-35 object-cover" />
                <h1 className="text-3xl font-extrabold text-[#1a3a75] tracking-tight">Register</h1>
                <p className="mt-1 text-sm text-gray-500 font-semibold">
                  Join our alumni community
                </p>
              </div>

              {/* Global error banner */}
              {error && (
                <div className="mb-5 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 font-medium">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  {error}
                </div>
              )}

              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>

                {/* ── Personal Info ─────────────────────────────────────────────── */}
                <p className="text-[11px] font-bold tracking-wider text-gray-400 uppercase mt-4 mb-2 px-1">Personal Information</p>

                {/* Full Name */}
                <div>
                  <div className="flex items-stretch bg-white border border-[#cbd5e1] rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-[#1a3a75]/30 focus-within:border-[#1a3a75] transition overflow-hidden">
                    <span className="w-32 shrink-0 flex items-center pl-4 bg-[#fafafa] border-r border-[#cbd5e1] select-none text-sm font-bold text-gray-500 py-3.5">
                      Full Name<span className="text-red-500 ml-0.5">*</span>
                    </span>
                    <input
                      {...register('name')}
                      type="text"
                      placeholder="Enter your name"
                      className="flex-1 px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none bg-transparent"
                    />
                  </div>
                  <FieldError message={errors.name?.message} />
                </div>

                {/* Email */}
                <div>
                  <div className="flex items-stretch bg-white border border-[#cbd5e1] rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-[#1a3a75]/30 focus-within:border-[#1a3a75] transition overflow-hidden">
                    <span className="w-32 shrink-0 flex items-center pl-4 bg-[#fafafa] border-r border-[#cbd5e1] select-none text-sm font-bold text-gray-500 py-3.5">
                      Email<span className="text-red-500 ml-0.5">*</span>
                    </span>
                    <input
                      {...register('email')}
                      type="email"
                      placeholder="Enter your email"
                      className="flex-1 px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none bg-transparent"
                    />
                  </div>
                  <FieldError message={errors.email?.message} />
                </div>

                {/* Mobile Number */}
                <div>
                  <div className="flex items-stretch bg-white border border-[#cbd5e1] rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-[#1a3a75]/30 focus-within:border-[#1a3a75] transition overflow-hidden">
                    <span className="w-32 shrink-0 flex items-center pl-4 bg-[#fafafa] border-r border-[#cbd5e1] select-none text-sm font-bold text-gray-500 py-3.5">
                      Mobile number
                    </span>
                    <input
                      {...register('contactNumber')}
                      type="tel"
                      placeholder="+91 xxxxxxxxxx"
                      maxLength={15}
                      className="flex-1 px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none bg-transparent"
                    />
                  </div>
                  <FieldError message={errors.contactNumber?.message} />
                </div>

                {/* ── Academic Info ─────────────────────────────────────────────── */}
                <p className="text-[11px] font-bold tracking-wider text-gray-400 uppercase mt-5 mb-2 px-1">Academic Information</p>

                {/* Course */}
                <div>
                  <div className="flex items-stretch bg-white border border-[#cbd5e1] rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-[#1a3a75]/30 focus-within:border-[#1a3a75] transition overflow-hidden">
                    <span className="w-32 shrink-0 flex items-center pl-4 bg-[#fafafa] border-r border-[#cbd5e1] select-none text-sm font-bold text-gray-500 py-3.5">
                      Course<span className="text-red-500 ml-0.5">*</span>
                    </span>
                    <select
                      {...register('course')}
                      className="flex-1 px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none bg-transparent appearance-none cursor-pointer"
                    >
                      <option value="">Select your course</option>
                      {COURSES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <FieldError message={errors.course?.message} />
                </div>

                {/* Branch */}
                <div>
                  <div className="flex items-stretch bg-white border border-[#cbd5e1] rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-[#1a3a75]/30 focus-within:border-[#1a3a75] transition overflow-hidden">
                    <span className="w-42 shrink-0 flex items-center pl-4 bg-[#fafafa] border-r border-[#cbd5e1] select-none text-xs md:text-sm font-bold text-gray-500 py-3.5">
                      Branch/Department<span className="text-red-500 ml-0.5">*</span>
                    </span>
                    <select
                      {...register('branch')}
                      className="flex-1 px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none bg-transparent appearance-none cursor-pointer"
                    >
                      <option value="">Select your branch</option>
                      {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <FieldError message={errors.branch?.message} />
                </div>

                {/* Branch */}
                <div>
                  <div className="flex items-stretch bg-white border border-[#cbd5e1] rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-[#1a3a75]/30 focus-within:border-[#1a3a75] transition overflow-hidden">
                    <span className="w-42 shrink-0 flex items-center pl-4 bg-[#fafafa] border-r border-[#cbd5e1] select-none text-xs md:text-sm font-bold text-gray-500 py-3.5">
                      Branch/Department<span className="text-red-500 ml-0.5">*</span>
                    </span>
                    <select
                      {...register('branch')}
                      className="flex-1 px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none bg-transparent appearance-none cursor-pointer"
                    >
                      <option value="">Select your branch</option>
                      {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <FieldError message={errors.branch?.message} />
                </div>

                {/* Admission + Passout Year */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center bg-white border border-[#cbd5e1] rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-[#1a3a75]/30 focus-within:border-[#1a3a75] transition overflow-hidden">
                      <span className="shrink-0 flex items-center justify-center whitespace-nowrap px-3 bg-[#fafafa] border-r border-[#cbd5e1] select-none text-xs font-bold text-gray-500 self-stretch">
                        Admission Year<span className="text-red-500 ml-0.5">*</span>
                      </span>
                      <input
                        {...register('yearOfAdmission', { valueAsNumber: true })}
                        type="number"
                        placeholder="e.g. 2019"
                        min="1990"
                        max={currentYear}
                        className="flex-1 min-w-0 px-2 md:px-3 py-3 text-xs md:text-sm text-gray-800 placeholder-gray-300 focus:outline-none bg-transparent"
                      />
                    </div>
                    <FieldError message={errors.yearOfAdmission?.message} />
                  </div>
                  <div>
                    <div className="flex items-center bg-white border border-[#cbd5e1] rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-[#1a3a75]/30 focus-within:border-[#1a3a75] transition overflow-hidden">
                      <span className="shrink-0 flex items-center justify-center whitespace-nowrap px-3 bg-[#fafafa] border-r border-[#cbd5e1] select-none text-xs font-bold text-gray-500 self-stretch">
                        Passout Year<span className="text-red-500 ml-0.5">*</span>
                      </span>
                      <input
                        {...register('yearOfPassout', { valueAsNumber: true })}
                        type="number"
                        placeholder="e.g. 2019"
                        min="1990"
                        max={currentYear + 6}
                        className="flex-1 min-w-0 px-2 md:px-3 py-3 text-xs md:text-sm text-gray-800 placeholder-gray-300 focus:outline-none bg-transparent"
                      />
                    </div>
                    <FieldError message={errors.yearOfPassout?.message} />
                  </div>
                </div>

                {/* Terms & Privacy */}
                <div className="flex items-start gap-2.5 px-1 py-1">
                  <input
                    {...register('termsAccepted')}
                    id="terms"
                    type="checkbox"
                    className="mt-1 h-4.5 w-4.5 rounded border-gray-300 text-[#1d4289] focus:ring-[#1d4289] cursor-pointer"
                  />
                  <label htmlFor="terms" className="cursor-pointer text-xs leading-normal text-gray-500 font-semibold select-none">
                    I confirm that the information provided is accurate and i agree to the{' '}
                    <span className="text-[#2563eb] hover:text-[#1d4ed8] font-bold hover:underline">Terms & Service</span>
                    {' '}and{' '}
                    <span className="text-[#2563eb] hover:text-[#1d4ed8] font-bold hover:underline">Privacy Policy</span>
                    {' '}of SSGMCE Alumni Connect.
                  </label>
                </div>
                <FieldError message={errors.termsAccepted?.message} />

              </form>

              {/* Divider */}
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-[#eef2f6] px-3 text-xs text-gray-400 font-medium">Choose verification method</span>
                </div>
              </div>

              {/* Auth buttons */}
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={handleEmailLink}
                  disabled={!!busy}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1d4289] hover:bg-[#153470] py-3.5 text-sm font-bold text-white shadow-md transition-all duration-200 cursor-pointer disabled:opacity-60"
                >
                  {busy === 'email' ? <Loader2 size={16} className="animate-spin" /> : null}
                  {busy === 'email' ? 'Sending link…' : 'Verify with email link'}
                </button>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleLinkedIn}
                    disabled={!!busy}
                    className="flex items-center justify-center gap-2 rounded-xl bg-[#0a66c2] hover:bg-[#004182] py-3 text-sm font-bold text-white shadow-sm transition-all duration-200 cursor-pointer disabled:opacity-60"
                  >
                    <LinkedInIcon />
                    Linkedin
                  </button>
                  <button
                    type="button"
                    onClick={handleGoogle}
                    disabled={!!busy}
                    className="flex items-center justify-center gap-2 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 py-3 text-sm font-bold text-gray-700 shadow-sm transition-all duration-200 cursor-pointer disabled:opacity-60"
                  >
                    {busy === 'google' ? <Loader2 size={16} className="animate-spin" /> : <GoogleIcon />}
                    Google
                  </button>
                </div>
              </div>

              <p className="text-center text-xs text-gray-400 mt-6 font-medium">
                Already have an account ?{" "}
                <Link to="/sign-in" className="text-[#1a3a75] font-bold hover:underline">
                  Login
                </Link>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
