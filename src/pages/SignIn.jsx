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
  loginWithBackend,
  checkEmailRegistered,
  setAuthIntent,
  logout,
} from '../services/authService';
import { friendlyAuthError } from '../utils/authErrors';
import { routeForProfile } from '../utils/authRoutes';
import { useAuth } from '../contexts/AuthContext';

const NOT_REGISTERED_MSG = 'This email is not registered. Please register first.';

const otpSchema = z.object({ email: z.email('Enter a valid email') });

const RESEND_COOLDOWN = 60; // seconds

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

export const SignIn = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUserProfile } = useAuth();
  const [error, setError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);

  // Email-link (OTP) state
  const [otpSent, setOtpSent] = useState('');   // the email a link was sent to
  const [cooldown, setCooldown] = useState(0);  // seconds until resend allowed
  const [lockedOut, setLockedOut] = useState(false); // hit the 3/hour limit

  const otpForm = useForm({ resolver: zodResolver(otpSchema) });

  // Surface errors bounced back via the URL (e.g. LinkedIn cancel / no-email).
  useEffect(() => {
    const urlError = searchParams.get('error');
    if (urlError) setError(friendlyAuthError(urlError));
  }, [searchParams]);

  // Resend cooldown countdown.
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const sendLink = async (email) => {
    setError('');
    try {
      // Login only: refuse to email a link to an email that isn't registered.
      const { exists } = await checkEmailRegistered(email);
      if (!exists) {
        setError(NOT_REGISTERED_MSG);
        return;
      }
      setAuthIntent('login');
      const { remaining } = await requestEmailOtp(email);
      setOtpSent(email);
      setCooldown(RESEND_COOLDOWN);
      if (remaining === 0) setLockedOut(true); // that was the last allowed request
    } catch (err) {
      if (err?.response?.status === 429) setLockedOut(true);
      setError(friendlyAuthError(err));
    }
  };

  const handleGoogle = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      setAuthIntent('login');
      const popped = await googleAuth();
      if (popped) { // null means a redirect was triggered; AuthCallback finishes it
        const { user } = await loginWithBackend();
        setUserProfile(user);
        navigate(routeForProfile(user));
      }
    } catch (err) {
      if (err?.response?.status === 404) {
        setError(NOT_REGISTERED_MSG);
        await logout(); // sign the unregistered user back out of Firebase
      } else {
        setError(friendlyAuthError(err));
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleLinkedIn = () => {
    setError('');
    setAuthIntent('login');
    linkedInRedirect();
  };

  const resetOtp = () => { setOtpSent(''); setLockedOut(false); setCooldown(0); setError(''); };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8"
    >
      <div className="text-center mb-8">
        <div className="w-14 h-14 bg-primary-700 rounded-2xl mx-auto mb-4 flex items-center justify-center">
          <GraduationCap size={28} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome</h1>
        <p className="text-gray-500 text-sm mt-1">Sign in to SSGMCE Alumni Portal</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-5 text-sm">
          {error}
        </div>
      )}

      {/* Email sign-in link (passwordless) */}
      {otpSent ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-5 text-center space-y-3">
          <CheckCircle2 size={32} className="text-green-600 mx-auto" />
          <p className="text-sm font-semibold text-green-800">Check your inbox</p>
          <p className="text-xs text-green-700">
            We sent a one-time sign-in link to <strong>{otpSent}</strong>. Open it on this device to finish signing in.
          </p>

          <button
            onClick={() => sendLink(otpSent)}
            disabled={cooldown > 0 || lockedOut}
            className="w-full bg-primary-700 border border-green-300 text-green-800 text-sm font-medium py-2 rounded-lg hover:bg-green-100 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {lockedOut
              ? 'Resend limit reached'
              : cooldown > 0
                ? `Resend link in ${cooldown}s`
                : 'Didn’t get it? Resend link'}
          </button>

          {lockedOut && (
            <p className="text-xs text-red-600">
              You’ve reached the maximum of 3 link requests per hour. Please try again later or use Google / LinkedIn.
            </p>
          )}

          <button onClick={resetOtp} className="text-xs text-primary-700 font-medium hover:underline">
            Use a different email
          </button>
        </div>
      ) : (
        <form onSubmit={otpForm.handleSubmit(({ email }) => sendLink(email))} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              {...otpForm.register('email')}
              type="email"
              placeholder="you@example.com"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
            />
            {otpForm.formState.errors.email && (
              <p className="text-red-500 text-xs mt-1">{otpForm.formState.errors.email.message}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={otpForm.formState.isSubmitting}
            className="w-full bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {otpForm.formState.isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
            {otpForm.formState.isSubmitting ? 'Sending…' : 'Email me a sign-in link'}
          </button>
          <p className="text-xs text-gray-400 text-center">No password needed — we&apos;ll email you a secure link.</p>
        </form>
      )}

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-xs text-gray-400">Or continue with</span>
        </div>
      </div>

      {/* OAuth Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={handleGoogle}
          disabled={googleLoading}
          className="flex items-center justify-center gap-2 border border-gray-300 rounded-lg py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60 transition-colors"
        >
          {googleLoading ? <Loader2 size={16} className="animate-spin" /> : <GoogleIcon />}
          Google
        </button>
        <button
          onClick={handleLinkedIn}
          className="flex items-center justify-center gap-2 bg-[#0A66C2] hover:bg-[#004182] rounded-lg py-2.5 text-sm font-medium text-white transition-colors"
        >
          <LinkedInIcon />
          LinkedIn
        </button>
      </div>

      <p className="text-center text-xs text-gray-400 mt-6">
        New here?{' '}
        <Link to="/register" className="text-primary-700 font-medium hover:underline">
          Register as alumni
        </Link>{' '}
        — your account needs admin approval before you can sign in.
      </p>
    </motion.div>
  );
};
