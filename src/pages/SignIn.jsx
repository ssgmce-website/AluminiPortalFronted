import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, CheckCircle2 } from 'lucide-react';
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
import loginBg from '../assets/Downloads/loginbg.png';

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
  const [rememberMe, setRememberMe] = useState(false);

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

  // Load remembered email if present
  useEffect(() => {
    const rememberedEmail = window.localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      otpForm.setValue('email', rememberedEmail);
      setRememberMe(true);
    }
  }, [otpForm]);

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

      // Persist email if remember me is checked
      if (rememberMe) {
        window.localStorage.setItem('rememberedEmail', email);
      } else {
        window.localStorage.removeItem('rememberedEmail');
      }
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
    <div
      className="min-h-screen w-full flex items-center justify-center lg:justify-start bg-cover bg-center p-4 sm:p-6 md:p-10 lg:pl-[6%] xl:pl-[8%] font-sans"
      style={{ backgroundImage: `url(${loginBg})` }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#eef2f6]/95 backdrop-blur-md border border-[#cbd5e1]/60 rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.12)] w-full max-w-[450px] p-8 md:p-10"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-[#1a3a75] tracking-tight">Welcome Back !</h1>
          <p className="text-gray-500 font-medium text-sm mt-1">
            Login to your account
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-5 text-sm font-medium">
            {error}
          </div>
        )}

        {/* Email sign-in link (passwordless) */}
        {otpSent ? (
          <div className="bg-green-50/80 border border-green-200 rounded-2xl p-6 text-center space-y-4">
            <CheckCircle2 size={36} className="text-green-600 mx-auto" />
            <p className="text-base font-bold text-green-900">
              Check your inbox
            </p>
            <p className="text-xs text-green-700 leading-relaxed">
              We sent a one-time sign-in link to <strong className="font-semibold text-green-950">{otpSent}</strong>. Open
              it on this device to finish signing in.
            </p>

            <button
              onClick={() => sendLink(otpSent)}
              disabled={cooldown > 0 || lockedOut}
              className="w-full bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-3 rounded-xl disabled:opacity-60 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              {lockedOut
                ? "Resend limit reached"
                : cooldown > 0
                  ? `Resend link in ${cooldown}s`
                  : "Didn’t get it? Resend link"}
            </button>

            {lockedOut && (
              <p className="text-[11px] text-red-600 font-medium">
                You’ve reached the maximum of 3 link requests per hour. Please try
                again later or use Google / LinkedIn.
              </p>
            )}

            <button
              onClick={resetOtp}
              className="text-xs text-[#1a3a75] font-bold hover:underline block mx-auto cursor-pointer"
            >
              Use a different email
            </button>
          </div>
        ) : (
          <form
            onSubmit={otpForm.handleSubmit(({ email }) => sendLink(email))}
            className="space-y-5"
          >
            {/* Email Field */}
            <div className="flex flex-col">
              <div className="flex items-stretch bg-white border border-[#cbd5e1] rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-[#1a3a75]/30 focus-within:border-[#1a3a75] transition overflow-hidden">
                <span className="w-24 shrink-0 flex items-center justify-center font-bold text-gray-500 text-sm bg-[#fafafa] border-r border-[#cbd5e1] select-none py-3.5">
                  Email
                </span>
                <input
                  {...otpForm.register("email")}
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none bg-transparent"
                />
              </div>
              {otpForm.formState.errors.email && (
                <p className="text-red-500 text-xs mt-1.5 ml-2 font-medium">
                  {otpForm.formState.errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field (Visual match) */}
            <div className="flex flex-col">
              <div className="flex items-stretch bg-white border border-[#cbd5e1] rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-[#1a3a75]/30 focus-within:border-[#1a3a75] transition overflow-hidden">
                <span className="w-24 shrink-0 flex items-center justify-center font-bold text-gray-500 text-sm bg-[#fafafa] border-r border-[#cbd5e1] select-none py-3.5">
                  Password
                </span>
                <input
                  type="password"
                  placeholder="Enter your password"
                  className="flex-1 px-4 py-3.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none bg-transparent"
                />
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs font-semibold text-gray-500 px-1 pt-1">
              <label className="flex items-center gap-2 cursor-pointer hover:text-gray-700 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4.5 w-4.5 rounded border-gray-300 text-[#1a3a75] focus:ring-[#1a3a75] cursor-pointer"
                />
                Remember Me
              </label>
              <button
                type="button"
                onClick={() => {
                  alert("This portal uses secure, passwordless authentication. Just enter your email and click Login — we'll email you a secure link to sign in!");
                }}
                className="text-[#2563eb] hover:text-[#1d4ed8] hover:underline"
              >
                Forgot Password ?
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={otpForm.formState.isSubmitting}
              className="w-full bg-[#1d4289] hover:bg-[#153470] disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 mt-6 cursor-pointer"
            >
              {otpForm.formState.isSubmitting ? (
                <Loader2 size={18} className="animate-spin" />
              ) : null}
              {otpForm.formState.isSubmitting ? "Logging in..." : "Login"}
            </button>
          </form>
        )}

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-[#eef2f6] px-3 text-xs text-gray-400 font-medium">
              Or continue with
            </span>
          </div>
        </div>

        {/* OAuth Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleGoogle}
            disabled={googleLoading}
            className="flex items-center justify-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl py-3 text-sm font-bold text-gray-700 shadow-sm transition-all duration-200 cursor-pointer disabled:opacity-60"
          >
            {googleLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <GoogleIcon />
            )}
            Google
          </button>
          <button
            onClick={handleLinkedIn}
            className="flex items-center justify-center gap-2 bg-[#0A66C2] hover:bg-[#004182] rounded-xl py-3 text-sm font-bold text-white shadow-sm transition-all duration-200 cursor-pointer"
          >
            <LinkedInIcon />
            LinkedIn
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6 font-medium">
          New here?{" "}
          <Link
            to="/register"
            className="text-[#1a3a75] font-bold hover:underline"
          >
            Register as alumni
          </Link>
        </p>
      </motion.div>
    </div>
  );
};
