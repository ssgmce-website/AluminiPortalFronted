import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { GraduationCap, Loader2, Mail, CheckCircle2, Phone, RefreshCw, AlertCircle } from 'lucide-react';
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

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const currentYear = new Date().getFullYear();

const COURSES  = ['B.E', 'M.E', 'MBA', 'PhD'];
const BRANCHES = [
  'Computer Science & Engineering',
  'Information Technology',
  'Electronics & Telecommunication',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
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
      className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl"
    >
      {/* Icon */}
      <div className="mb-5 flex justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 size={32} className="text-green-600" />
        </div>
      </div>

      {/* Heading */}
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900">Check your inbox</h2>
        <p className="mt-1 text-sm text-gray-500">We sent a verification link to</p>
        <div className="mt-3 flex items-center justify-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-4 py-2.5">
          <Mail size={15} className="shrink-0 text-blue-600" />
          <span className="text-sm font-semibold text-blue-800">{email}</span>
        </div>
        <p className="mt-4 text-sm leading-6 text-gray-500">
          Open the link <strong>on this device</strong> to complete registration.
          Your account will then be sent to the admin for approval.
        </p>
      </div>

      {/* Resend section */}
      <div className="mt-6 border-t border-gray-100 pt-5 text-center">
        {resendError && (
          <p className="mb-3 flex items-center justify-center gap-1.5 text-xs text-red-600">
            <AlertCircle size={13} /> {resendError}
          </p>
        )}
        {resendDone && !resendError && (
          <p className="mb-3 text-xs font-medium text-green-600">Link resent successfully!</p>
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
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-blue-300 bg-blue-50 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 disabled:opacity-60"
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
              className="text-sm text-gray-400"
            >
              Resend available in{' '}
              <span className="font-semibold tabular-nums text-gray-600">
                0:{String(seconds).padStart(2, '0')}
              </span>
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <button
        type="button"
        onClick={onBack}
        className="mt-4 w-full text-center text-xs text-gray-400 hover:text-gray-600 hover:underline"
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

  // ── Confirmation screen ────────────────────────────────────────────────────
  if (otpSent) {
    return (
      <AnimatePresence>
        <ConfirmationScreen email={otpSent} onBack={() => setOtpSent('')} />
      </AnimatePresence>
    );
  }

  // ── Registration form ──────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl"
    >
      {/* Header */}
      <div className="mb-7 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-700">
          <GraduationCap size={28} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Register as Alumni</h1>
        <p className="mt-1 text-sm text-gray-500">
          Your request is reviewed by an admin before activation.
        </p>
      </div>

      {/* Global error banner */}
      {error && (
        <div className="mb-5 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>

        {/* ── Personal Info ─────────────────────────────────────────────── */}
        <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Personal Information</p>

        {/* Full Name */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            {...register('name')}
            type="text"
            placeholder="As per college records"
            className={inputCls(!!errors.name)}
          />
          <FieldError message={errors.name?.message} />
        </div>

        {/* Email */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            {...register('email')}
            type="email"
            placeholder="you@example.com"
            className={inputCls(!!errors.email)}
          />
          <FieldError message={errors.email?.message} />
          <p className="mt-1 text-xs text-gray-400">
            Use the same email as your Google / LinkedIn account if verifying that way.
          </p>
        </div>

        {/* Phone Number */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Mobile Number <span className="text-xs font-normal text-gray-400">(optional)</span>
          </label>
          <div className={`flex overflow-hidden rounded-lg border transition focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent ${errors.contactNumber ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}>
            <span className="flex items-center gap-1.5 border-r border-gray-300 bg-gray-50 px-3 text-sm text-gray-500 select-none">
              <Phone size={13} /> +91
            </span>
            <input
              {...register('contactNumber')}
              type="tel"
              placeholder="10-digit mobile number"
              maxLength={10}
              className="flex-1 bg-transparent px-3 py-2.5 text-sm outline-none"
            />
          </div>
          <FieldError message={errors.contactNumber?.message} />
        </div>

        {/* ── Academic Info ─────────────────────────────────────────────── */}
        <p className="pt-1 text-[11px] font-bold uppercase tracking-widest text-gray-400">Academic Information</p>

        {/* Course */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Course <span className="text-red-500">*</span>
          </label>
          <select {...register('course')} className={selectCls(!!errors.course)}>
            <option value="">Select your course</option>
            {COURSES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <FieldError message={errors.course?.message} />
        </div>

        {/* Branch */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Branch / Department <span className="text-red-500">*</span>
          </label>
          <select {...register('branch')} className={selectCls(!!errors.branch)}>
            <option value="">Select your branch</option>
            {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
          <FieldError message={errors.branch?.message} />
        </div>

        {/* Admission + Passout Year */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Admission Year <span className="text-red-500">*</span>
            </label>
            <input
              {...register('yearOfAdmission', { valueAsNumber: true })}
              type="number"
              placeholder="e.g. 2019"
              min="1990"
              max={currentYear}
              className={inputCls(!!errors.yearOfAdmission)}
            />
            <FieldError message={errors.yearOfAdmission?.message} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Passout Year <span className="text-red-500">*</span>
            </label>
            <input
              {...register('yearOfPassout', { valueAsNumber: true })}
              type="number"
              placeholder="e.g. 2023"
              min="1990"
              max={currentYear + 6}
              className={inputCls(!!errors.yearOfPassout)}
            />
            <FieldError message={errors.yearOfPassout?.message} />
          </div>
        </div>

        {/* Terms & Privacy */}
        <div className={`flex items-start gap-2.5 rounded-lg border p-3 ${errors.termsAccepted ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'}`}>
          <input
            {...register('termsAccepted')}
            id="terms"
            type="checkbox"
            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary-700 focus:ring-primary-500 cursor-pointer"
          />
          <label htmlFor="terms" className="cursor-pointer text-xs leading-5 text-gray-600">
            I confirm that the information provided is accurate and I agree to the{' '}
            <span className="font-semibold text-primary-700">Terms of Service</span>
            {' '}and{' '}
            <span className="font-semibold text-primary-700">Privacy Policy</span>
            {' '}of SSGMCE Alumni Connect.
          </label>
        </div>
        <FieldError message={errors.termsAccepted?.message} />

      </form>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-xs text-gray-400">Choose verification method</span>
        </div>
      </div>

      {/* Auth buttons */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={handleEmailLink}
          disabled={!!busy}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-700 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 disabled:opacity-60"
        >
          {busy === 'email' ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
          {busy === 'email' ? 'Sending link…' : 'Verify with email link'}
        </button>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleGoogle}
            disabled={!!busy}
            className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
          >
            {busy === 'google' ? <Loader2 size={16} className="animate-spin" /> : <GoogleIcon />}
            Google
          </button>
          <button
            type="button"
            onClick={handleLinkedIn}
            disabled={!!busy}
            className="flex items-center justify-center gap-2 rounded-lg bg-[#0A66C2] py-2.5 text-sm font-medium text-white transition hover:bg-[#004182] disabled:opacity-60"
          >
            <LinkedInIcon />
            LinkedIn
          </button>
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-gray-400">
        Already registered?{' '}
        <Link to="/sign-in" className="font-medium text-primary-700 hover:underline">
          Sign in
        </Link>
      </p>
    </motion.div>
  );
};
