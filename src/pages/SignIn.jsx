import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, CheckCircle2, AlertCircle, Mail, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  googleAuth,
  linkedInRedirect,
  loginWithEmailPassword,
  sendPasswordReset,
  loginWithBackend,
  setAuthIntent,
  logout,
} from '../services/authService';
import { friendlyAuthError } from '../utils/authErrors';
import { routeForProfile } from '../utils/authRoutes';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/logo.png';
import loginBg from '../assets/REGISITER.png';

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const NOT_REGISTERED_MSG = 'This email is not registered. Please register first.';

// ─── VALIDATION SCHEMA ────────────────────────────────────────────────────────
const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

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

// ─── SIGN IN ─────────────────────────────────────────────────────────────────
export const SignIn = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUserProfile } = useAuth();

  const [error, setError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);

  const loginForm = useForm({ resolver: zodResolver(loginSchema) });

  // Surface errors bounced back via URL (e.g. LinkedIn cancel / no-email)
  useEffect(() => {
    const urlError = searchParams.get('error');
    if (urlError) setError(friendlyAuthError(urlError));
  }, [searchParams]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const onSubmit = async (data) => {
    setError('');
    setResetSent(false);
    try {
      setAuthIntent('login');
      // 1) Authenticate on Firebase
      await loginWithEmailPassword(data.email, data.password);
      
      // 2) Authenticate on Backend
      const { user } = await loginWithBackend();
      setUserProfile(user);
      navigate(routeForProfile(user));
    } catch (err) {
      // If user is not registered in backend database, log out of Firebase too.
      if (err?.response?.status === 404) {
        setError(NOT_REGISTERED_MSG);
        await logout();
      } else {
        setError(friendlyAuthError(err));
      }
    }
  };

  const handleForgotPassword = async () => {
    const email = loginForm.getValues('email');
    if (!email || !email.includes('@')) {
      setError('Please enter your email address in the Email field first to receive the reset link.');
      return;
    }
    setError('');
    setResetSent(false);
    setForgotPasswordLoading(true);
    try {
      await sendPasswordReset(email);
      setResetSent(true);
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setResetSent(false);
    setGoogleLoading(true);
    try {
      setAuthIntent('login');
      const popped = await googleAuth();
      if (popped) {
        const { user } = await loginWithBackend();
        setUserProfile(user);
        navigate(routeForProfile(user));
      }
    } catch (err) {
      if (err?.response?.status === 404) {
        setError(NOT_REGISTERED_MSG);
        await logout();
      } else {
        setError(friendlyAuthError(err));
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleLinkedIn = () => {
    setError('');
    setResetSent(false);
    setAuthIntent('login');
    linkedInRedirect();
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen w-full flex items-center justify-center lg:justify-start bg-cover bg-center p-4 sm:p-6 md:p-8 lg:pl-[6%] xl:pl-[8%] font-sans overflow-y-auto"
      style={{ backgroundImage: `url(${loginBg})` }}
    >
      <div className="w-full max-w-[450px] my-8">
        <AnimatePresence mode="wait">
          <motion.div
            key="signin-form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-[#eef2f6]/95 backdrop-blur-md border border-[#cbd5e1]/60 rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.12)] p-6 md:p-8"
          >
            {/* ── Header ──────────────────────────────────────────────────── */}
            <div className="text-center mb-6">
              <img src={logo} alt="SSGMCE Alumni Logo" className="mx-auto h-30 w-35 object-cover" />
              <h1 className="text-3xl font-extrabold text-[#1a3a75] tracking-tight">Welcome</h1>
              <p className="mt-1 text-sm text-gray-500 font-semibold">
                Login to SSGMCE Alumni Portal
              </p>
            </div>

            {/* ── Error / Info banner ────────────────────────────────────────── */}
            {error && (
              <div className="mb-5 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 font-medium">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                {error}
              </div>
            )}

            {resetSent && (
              <div className="mb-5 flex items-start gap-2.5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 font-medium">
                <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
                A password reset link has been sent to your email address.
              </div>
            )}

            {/* ── Credentials Form ────────────────────────────────────────── */}
            <form
              onSubmit={loginForm.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              {/* Email Field */}
              <div>
                <div className="flex items-stretch bg-white border border-[#cbd5e1] rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-[#1a3a75]/30 focus-within:border-[#1a3a75] transition overflow-hidden">
                  <span className="w-24 shrink-0 flex items-center pl-4 bg-[#fafafa] border-r border-[#cbd5e1] select-none text-sm font-bold text-gray-500 py-3.5">
                    Email
                  </span>
                  <input
                    {...loginForm.register('email')}
                    type="email"
                    placeholder="you@example.com"
                    className="flex-1 px-4 py-3.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none bg-transparent"
                  />
                </div>
                {loginForm.formState.errors.email && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-red-500 font-semibold">
                    <AlertCircle size={11} />
                    {loginForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-stretch bg-white border border-[#cbd5e1] rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-[#1a3a75]/30 focus-within:border-[#1a3a75] transition overflow-hidden">
                  <span className="w-24 shrink-0 flex items-center pl-4 bg-[#fafafa] border-r border-[#cbd5e1] select-none text-sm font-bold text-gray-500 py-3.5">
                    Password
                  </span>
                  <input
                    {...loginForm.register('password')}
                    type="password"
                    placeholder="••••••••"
                    className="flex-1 px-4 py-3.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none bg-transparent"
                  />
                </div>
                {loginForm.formState.errors.password && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-red-500 font-semibold">
                    <AlertCircle size={11} />
                    {loginForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              {/* Forgot Password Link */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={forgotPasswordLoading}
                  className="text-xs font-bold text-[#1a3a75] hover:underline cursor-pointer disabled:opacity-60"
                >
                  {forgotPasswordLoading ? 'Sending reset email...' : 'Forgot password?'}
                </button>
              </div>

              {/* Primary CTA */}
              <button
                type="submit"
                disabled={loginForm.formState.isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1d4289] hover:bg-[#153470] py-3.5 text-sm font-bold text-white shadow-md transition-all duration-200 cursor-pointer disabled:opacity-60"
              >
                {loginForm.formState.isSubmitting ? (
                  <><Loader2 size={16} className="animate-spin" /> Logging in…</>
                ) : (
                  'Login'
                )}
              </button>
            </form>

            {/* ── Divider ──────────────────────────────────────────────────── */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-[#eef2f6] px-3 text-xs text-gray-400 font-semibold">
                  Or continue with
                </span>
              </div>
            </div>

            {/* ── OAuth Buttons ────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleLinkedIn}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#0a66c2] hover:bg-[#004182] py-3 text-sm font-bold text-white shadow-sm transition-all duration-200 cursor-pointer"
              >
                <LinkedInIcon />
                Linkedin
              </button>
              <button
                type="button"
                onClick={handleGoogle}
                disabled={googleLoading}
                className="flex items-center justify-center gap-2 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 py-3 text-sm font-bold text-gray-700 shadow-sm transition-all duration-200 cursor-pointer disabled:opacity-60"
              >
                {googleLoading ? <Loader2 size={16} className="animate-spin" /> : <GoogleIcon />}
                Google
              </button>
            </div>

            {/* ── Footer ───────────────────────────────────────────────────── */}
            <p className="text-center text-xs text-gray-400 mt-6 font-medium">
              New here?{' '}
              <Link to="/register" className="text-[#1a3a75] font-bold hover:underline">
                Register as alumni
              </Link>{' '}
              – your account needs admin approval before you can sign in
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
