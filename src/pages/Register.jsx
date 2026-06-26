import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { GraduationCap, Loader2, Mail, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
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

const currentYear = new Date().getFullYear();

const COURSES = ['B.E', 'M.E', 'MBA', 'PhD'];
const BRANCHES = [
  'Computer Science & Engineering',
  'Information Technology',
  'Electronics & Telecommunication',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
];

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
  const [busy, setBusy] = useState(''); // 'google' | 'linkedin' | 'email' | ''
  const [otpSent, setOtpSent] = useState('');

  const {
    register,
    trigger,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { yearOfAdmission: '', yearOfPassout: '' },
  });

  // Surface errors bounced back via the URL (e.g. LinkedIn cancel / no-email).
  useEffect(() => {
    const urlError = searchParams.get('error');
    if (urlError) setError(friendlyAuthError(urlError));
  }, [searchParams]);

  // Validate the form and return the details object (or null if invalid).
  const collectDetails = async () => {
    setError('');
    const ok = await trigger();
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
        // popped === true means the popup completed in-page
        const { user } = await registerWithBackend(details);
        clearAuthIntent();
        finish(user);
      }
      // null → a redirect was triggered; AuthCallback completes registration
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
          We sent a one-time verification link to <strong>{otpSent}</strong>. Open it on this device
          to finish your registration. Your request will then be sent to the admin for approval.
        </p>
        <button onClick={() => setOtpSent('')} className="text-xs text-primary-700 font-medium hover:underline">
          Use different details
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8"
    >
      <div className="text-center mb-7">
        <div className="w-14 h-14 bg-primary-700 rounded-2xl mx-auto mb-4 flex items-center justify-center">
          <GraduationCap size={28} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Register as Alumni</h1>
        <p className="text-gray-500 text-sm mt-1">
          Your request is reviewed by an admin before your account is activated.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-5 text-sm">
          {error}
        </div>
      )}

      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input
            {...register('name')}
            type="text"
            placeholder="Your full name"
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            {...register('email')}
            type="email"
            placeholder="you@example.com"
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          <p className="text-xs text-gray-400 mt-1">
            Use the same email as your Google / LinkedIn account if verifying that way.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
          <select
            {...register('course')}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
          >
            <option value="">Select course</option>
            {COURSES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          {errors.course && <p className="text-red-500 text-xs mt-1">{errors.course.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Branch / Department</label>
          <select
            {...register('branch')}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
          >
            <option value="">Select branch</option>
            {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
          {errors.branch && <p className="text-red-500 text-xs mt-1">{errors.branch.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Admission Year</label>
            <input
              {...register('yearOfAdmission', { valueAsNumber: true })}
              type="number"
              placeholder="e.g. 2019"
              min="1990"
              max={currentYear}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
            />
            {errors.yearOfAdmission && <p className="text-red-500 text-xs mt-1">{errors.yearOfAdmission.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Passout Year</label>
            <input
              {...register('yearOfPassout', { valueAsNumber: true })}
              type="number"
              placeholder="e.g. 2023"
              min="1990"
              max={currentYear + 6}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
            />
            {errors.yearOfPassout && <p className="text-red-500 text-xs mt-1">{errors.yearOfPassout.message}</p>}
          </div>
        </div>
      </form>

      {/* Divider */}
      <div className="relative my-6">
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
          disabled={!!busy}
          className="w-full bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {busy === 'email' ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
          {busy === 'email' ? 'Sending…' : 'Verify with email link'}
        </button>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleGoogle}
            disabled={!!busy}
            className="flex items-center justify-center gap-2 border border-gray-300 rounded-lg py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60 transition-colors"
          >
            {busy === 'google' ? <Loader2 size={16} className="animate-spin" /> : <GoogleIcon />}
            Google
          </button>
          <button
            onClick={handleLinkedIn}
            disabled={!!busy}
            className="flex items-center justify-center gap-2 bg-[#0A66C2] hover:bg-[#004182] disabled:opacity-60 rounded-lg py-2.5 text-sm font-medium text-white transition-colors"
          >
            <LinkedInIcon />
            LinkedIn
          </button>
        </div>
      </div>

      <p className="text-center text-xs text-gray-400 mt-6">
        Already registered?{' '}
        <Link to="/sign-in" className="text-primary-700 font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </motion.div>
  );
};
