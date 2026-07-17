import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, CheckCircle2, RefreshCw, AlertCircle, Mail, ChevronRight, ChevronLeft, Award, Briefcase, GraduationCap, User, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  googleAuth,
  linkedInRedirect,
  requestEmailOtp,
  verifyEmailOtp,
  registerWithBackend,
  checkEmailRegistered,
  setAuthIntent,
  clearAuthIntent,
  logout,
  loginWithBackend,
  verifyCaptchaOnBackend,
} from '../services/authService';
import Captcha from '../components/Captcha';
import { auth } from '../firebase/firebase';
import { updatePassword } from 'firebase/auth';
import { friendlyAuthError } from '../utils/authErrors';
import { routeForProfile } from '../utils/authRoutes';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/logo.png';
import resisterBg from '../assets/REGISITER.png';
import { Controller } from "react-hook-form";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { uploadProfilePhoto } from '../services/uploadService';
import PhoneInput from "../components/PhoneInput";
import { parsePhoneNumberFromString } from "libphonenumber-js";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const currentYear = new Date().getFullYear();

const COURSES = ['B.E/B.Tech', 'M.E/M.Tech', 'MBA', 'MCA', 'PhD'];

const EMPLOYMENT_STATUSES = [
  'Employed',
  'Entrepreneur',
  'Higher Studies',
];

// ─── VALIDATION SCHEMA ───────────────────────────────────────────────────────
const schema = z
  .object({
    // Step 0: Personal
    name: z.string().min(2, 'Enter your full name (at least 2 characters)'),
    email: z.string().email('Enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    nationalNumber: z
      .string()
      .regex(/^\d{7,15}$/, 'Enter a valid phone number'),
    countryCode: z.string().min(2, 'Country code is required'),
    profilePhoto: z.string().min(1, 'Profile photo is required'),
    dob: z.union([
      z.date(),
      z.string().min(1, 'Date of birth is required'),
    ]).refine((val) => {
      if (val instanceof Date) {
        return !isNaN(val.getTime());
      }
      return val && val.trim().length > 0;
    }, { message: 'Date of birth is required' }),
    gender: z.string().min(1, 'Please select your gender'),
    address: z.string().min(1, 'Address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    country: z.string().min(1, 'Country is required'),
    pinCode: z.string().regex(/^\d{6}$/, 'Enter a valid 6-digit pin code'),
    linkedinUrl: z.string().optional(),

    // Step 1: Academic
    course: z.string().min(1, 'Please select your course'),
    branch: z.string().min(1, 'Please select your branch'),
    yearOfAdmission: z
      .number({ invalid_type_error: 'Enter a valid year' })
      .int()
      .min(1983, 'Year must be 1983 or later')
      .max(currentYear, 'Year of admission cannot be in the future'),
    yearOfPassout: z
      .number({ invalid_type_error: 'Enter a valid year' })
      .int()
      .min(1986, 'Year must be 1986 or later')
      .max(currentYear + 6, 'Year of passout is too far in the future'),

    // Step 2: Professional
    employmentStatus: z.string().min(1, 'Please select your employment status'),
    companyName: z.string().optional(),
    designation: z.string().optional(),
    industry: z.string().optional(),
    workExperience: z
      .number()
      .optional()
      .or(z.literal(''))
      .or(z.nan()),
    officeLocation: z.string().optional(),
    officeAddress: z.string().optional(),
    officeCity: z.string().optional(),
    officeState: z.string().optional(),
    officeCountry: z.string().optional(),
    officePinCode: z.string().optional(),
    companyWebsite: z.string().optional(),
    workEmail: z.string().email('Invalid work email address').optional().or(z.literal('')),
    startupName: z.string().optional(),
    startupWebsite: z.string().optional(),
    startupDescription: z.string().optional(),
    universityName: z.string().optional(),
    higherStudiesCourse: z.string().optional(),
    higherStudiesCountry: z.string().optional(),
    termsAccepted: z.literal(true, {
      errorMap: () => ({ message: 'You must agree to the Terms of Use to register' }),
    }),
  })
  .refine((d) => d.yearOfPassout >= d.yearOfAdmission, {
    message: 'Year of passout cannot be before the year of admission',
    path: ['yearOfPassout'],
  })
  .refine((d) => d.yearOfPassout - d.yearOfAdmission >= 2, {
    message: 'Gap between year of admission and year of passout must be at least 2 years',
    path: ['yearOfPassout'],
  })
  .superRefine((val, ctx) => {
    if (val.employmentStatus === 'Employed') {
      if (!val.companyName || val.companyName.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Company name is required',
          path: ['companyName'],
        });
      }
      if (!val.designation || val.designation.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Designation is required',
          path: ['designation'],
        });
      }
    } else if (val.employmentStatus === 'Entrepreneur') {
      if (!val.startupName || val.startupName.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Startup name is required',
          path: ['startupName'],
        });
      }
    } else if (val.employmentStatus === 'Higher Studies') {
      if (!val.universityName || val.universityName.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'University name is required',
          path: ['universityName'],
        });
      }
      if (!val.higherStudiesCourse || val.higherStudiesCourse.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Course name is required',
          path: ['higherStudiesCourse'],
        });
      }
    }
  });

// ─── RESEND COUNTDOWN HOOK ───────────────────────────────────────────────────
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

// ─── CONFIRMATION SCREEN ─────────────────────────────────────────────────────
function ConfirmationScreen({ email, onBack, onVerify }) {
  const { seconds, canResend, reset } = useResendTimer(60);
  const [resendBusy, setResendBusy] = useState(false);
  const [resendError, setResendError] = useState('');
  const [resendDone, setResendDone] = useState(false);

  const [otpCode, setOtpCode] = useState('');
  const [verifyBusy, setVerifyBusy] = useState(false);
  const [verifyError, setVerifyError] = useState('');

  const handleResend = async () => {
    setResendBusy(true);
    setResendError('');
    setResendDone(false);
    try {
      await requestEmailOtp(email, undefined, true);
      reset();
      setResendDone(true);
    } catch (err) {
      setResendError(friendlyAuthError(err));
    } finally {
      setResendBusy(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!otpCode.trim()) {
      setVerifyError('Please enter the verification code.');
      return;
    }
    setVerifyBusy(true);
    setVerifyError('');
    try {
      await onVerify(otpCode.trim());
    } catch (err) {
      setVerifyError(friendlyAuthError(err));
    } finally {
      setVerifyBusy(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-[#eef2f6]/95 backdrop-blur-md border border-[#cbd5e1]/60 rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.12)] w-full max-w-[450px] p-8 text-center space-y-5 my-8"
    >
      <div className="flex justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 shadow-inner">
          <CheckCircle2 size={32} className="text-green-600" />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900">Check your inbox</h2>
        <p className="mt-1 text-sm text-gray-500 font-medium">We sent a verification link to</p>
        <div className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-blue-100 bg-white px-4 py-2.5 shadow-sm">
          <Mail size={15} className="shrink-0 text-blue-600" />
          <span className="text-sm font-bold text-blue-800">{email}</span>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-gray-500">
          Open the link <strong>on this device</strong>, OR copy the verification code (the <strong>oobCode</strong> from the email link) and paste it below:
        </p>
      </div>

      {/* OTP verification input form */}
      <form onSubmit={handleVerify} className="space-y-4 text-left border-t border-gray-200/50 pt-5">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            Verification Code / Link
          </label>
          <div className="flex items-stretch bg-white border border-[#cbd5e1] rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-[#1a3a75]/30 focus-within:border-[#1a3a75] transition overflow-hidden">
            <input
              type="text"
              required
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              placeholder="Paste code or link here"
              className="flex-1 px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none bg-transparent"
            />
          </div>
          {verifyError && (
            <p className="mt-2 flex items-center gap-1 text-xs text-red-500 font-semibold">
              <AlertCircle size={11} /> {verifyError}
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={verifyBusy}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1a3a75] hover:bg-[#153470] py-3.5 text-sm font-bold text-white shadow-md transition-all duration-200 cursor-pointer disabled:opacity-60"
        >
          {verifyBusy ? <Loader2 size={16} className="animate-spin" /> : null}
          Verify Code
        </button>
      </form>

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
        ← Use different email
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
    <p className="mt-1 flex items-center gap-1 text-xs text-red-500 font-semibold">
      <AlertCircle size={11} /> {message}
    </p>
  );
}

// ─── REGISTER ────────────────────────────────────────────────────────────────
export const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUserProfile, currentUser } = useAuth();

  const [error, setError] = useState('');
  const [busy, setBusy] = useState(''); // 'google' | 'linkedin' | 'email' | 'register' | ''
  const [otpSent, setOtpSent] = useState(''); // email address the link was sent to
  const [step, setStep] = useState(0);
  const [emailInput, setEmailInput] = useState('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [captchaToken, setCaptchaToken] = useState('');
  const [phone, setPhone] = useState("");
  const [reauthEmail, setReauthEmail] = useState('');
  const [reauthOtpSent, setReauthOtpSent] = useState(false);
  const [reauthOtpCode, setReauthOtpCode] = useState('');
  const [reauthError, setReauthError] = useState('');
  const [reauthBusy, setReauthBusy] = useState(false);
  const { seconds: reauthSeconds, canResend: reauthCanResend, reset: reauthResetTimer } = useResendTimer(60);

  const isVerified = currentUser && currentUser.email;

  const {
    register,
    trigger,
    getValues,
    watch,
    setValue,
    control,
    setError: setErrorField,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      nationalNumber: '',
      countryCode: '',
      profilePhoto: '',
      dob: '',
      gender: '',
      address: '',
      city: '',
      state: '',
      country: 'India',
      pinCode: '',
      linkedinUrl: '',
      course: '',
      branch: '',
      yearOfAdmission: '',
      yearOfPassout: '',
      employmentStatus: '',
      companyName: '',
      designation: '',
      industry: '',
      workExperience: '',
      officeLocation: '',
      officeAddress: '',
      officeCity: '',
      officeState: '',
      officeCountry: 'India',
      officePinCode: '',
      companyWebsite: '',
      workEmail: '',
      startupName: '',
      startupWebsite: '',
      startupDescription: '',
      universityName: '',
      higherStudiesCourse: '',
      higherStudiesCountry: '',
      termsAccepted: false,
    },
  });

  const employmentStatus = watch('employmentStatus');
  const isEntrepreneur = employmentStatus === 'Entrepreneur';
  const isHigherStudies = employmentStatus === 'Higher Studies';
  const showCompanyFields = employmentStatus === 'Employed';

  const selectedCourse = watch('course');

  // Pre-fill and lock email when user is authenticated with Firebase
  useEffect(() => {
    if (isVerified) {
      setValue('email', currentUser.email);
    }
  }, [isVerified, currentUser, setValue]);

  useEffect(() => {
    if (selectedCourse === 'MCA') {
      setValue('branch', 'MCA');
    } else if (selectedCourse === 'MBA') {
      setValue('branch', 'MBA');
    } else {
      const currentBranch = getValues('branch');
      if (currentBranch === 'MCA' || currentBranch === 'MBA') {
        setValue('branch', '');
      }
    }
  }, [selectedCourse, setValue, getValues]);

  // Surface errors bounced back via URL (e.g. LinkedIn cancel / no-email)
  useEffect(() => {
    const urlError = searchParams.get('error');
    if (urlError) {
      setError(friendlyAuthError(urlError));
      if (urlError === 'already_registered') {
        const status = searchParams.get('status') || 'approved';
        setTimeout(() => navigate(status === 'approved' ? '/login' : '/pending'), 2500);
      }
    }
  }, [searchParams, navigate]);



  // Validate all fields and return the details payload (or null if invalid)
  const collectDetails = async () => {
    setError('');
    const ok = await trigger();
    if (!ok) {
      setError('Please fix all the validation errors on the form before submitting.');
      return null;
    }
    const v = getValues();
    return {
      // Core fields
      name: v.name.trim(),
      email: currentUser.email.toLowerCase().trim(), // enforce email from Firebase session
      course: v.course,
      branch: v.branch,
      yearOfAdmission: Number(v.yearOfAdmission),
      yearOfPassout: Number(v.yearOfPassout),

      // Personal
      nationalNumber: v.nationalNumber.trim(),
      countryCode: v.countryCode,
      profilePhoto: v.profilePhoto,
      dob: v.dob,
      gender: v.gender,
      address: v.address.trim(),
      city: v.city.trim(),
      state: v.state.trim(),
      country: v.country.trim(),
      pinCode: v.pinCode.trim(),
      linkedinUrl: v.linkedinUrl?.trim() || undefined,

      // Professional
      employmentStatus: v.employmentStatus,
      companyName: showCompanyFields ? (v.companyName?.trim() || undefined) : undefined,
      designation: showCompanyFields ? (v.designation?.trim() || undefined) : undefined,
      industry: showCompanyFields ? (v.industry?.trim() || undefined) : undefined,
      workExperience: showCompanyFields && v.workExperience ? Number(v.workExperience) : undefined,
      officeLocation: showCompanyFields ? (v.officeLocation?.trim() || undefined) : undefined,
      officeAddress: showCompanyFields ? (v.officeAddress?.trim() || undefined) : undefined,
      officeCity: showCompanyFields ? (v.officeCity?.trim() || undefined) : undefined,
      officeState: showCompanyFields ? (v.officeState?.trim() || undefined) : undefined,
      officeCountry: showCompanyFields ? (v.officeCountry?.trim() || undefined) : undefined,
      officePinCode: showCompanyFields ? (v.officePinCode?.trim() || undefined) : undefined,
      companyWebsite: showCompanyFields ? (v.companyWebsite?.trim() || undefined) : undefined,
      workEmail: showCompanyFields ? (v.workEmail?.trim() || undefined) : undefined,
      startupName: isEntrepreneur ? (v.startupName?.trim() || undefined) : undefined,
      startupWebsite: isEntrepreneur ? (v.startupWebsite?.trim() || undefined) : undefined,
      startupDescription: isEntrepreneur ? (v.startupDescription?.trim() || undefined) : undefined,
      universityName: isHigherStudies ? (v.universityName?.trim() || undefined) : undefined,
      higherStudiesCourse: isHigherStudies ? (v.higherStudiesCourse?.trim() || undefined) : undefined,
      higherStudiesCountry: isHigherStudies ? (v.higherStudiesCountry?.trim() || undefined) : undefined,

      // Engagement (Implicit Consent / Defaulted)
      interestedInMentoring: false,
      interestedInRecruitment: false,
      interestedInGuestLectures: false,
      interestedInDonations: false,
      dataConsentGiven: true,
    };
  };

  const finish = (profile) => {
    setUserProfile(profile);
    navigate(routeForProfile(profile), { replace: true });
  };

  const handleAlreadyRegistered = (status) => {
    clearAuthIntent();
    setError('This email is already registered. Redirecting you to login…');
    setTimeout(() => navigate(status === 'approved' ? '/login' : '/pending'), 1500);
  };

  const handleGoogle = async () => {
    setError('');
    if (!captchaToken) {
      setError('Please verify that you are not a robot first.');
      return;
    }
    setBusy('google');
    try {
      await verifyCaptchaOnBackend(captchaToken);
      setAuthIntent('register');
      const popped = await googleAuth();
      if (popped) {
        // Pop-up flow finished in-page. Check if the authenticated email is already registered.
        const email = auth.currentUser?.email;
        if (email) {
          const { exists, status } = await checkEmailRegistered(email);
          if (exists) {
            clearAuthIntent();
            await logout();
            return handleAlreadyRegistered(status);
          }
        }
        // Not registered yet. Keep Firebase session, page re-renders to show form!
        clearAuthIntent();
      }
    } catch (err) {
      setError(err?.response?.data?.message || friendlyAuthError(err));
    } finally {
      setBusy('');
    }
  };

  const handleLinkedIn = async () => {
    setError('');
    if (!captchaToken) {
      setError('Please verify that you are not a robot first.');
      return;
    }
    setBusy('email');
    try {
      await verifyCaptchaOnBackend(captchaToken);
      setAuthIntent('register');
      linkedInRedirect();
    } catch (err) {
      setError(err?.response?.data?.message || 'Captcha verification failed.');
    } finally {
      setBusy('');
    }
  };

  const handleEmailVerificationRequest = async (e) => {
    e.preventDefault();
    setError('');
    const email = emailInput.trim();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!captchaToken) {
      setError('Please verify that you are not a robot first.');
      return;
    }
    setBusy('email');
    try {
      const { exists, status } = await checkEmailRegistered(email);
      if (exists) return handleAlreadyRegistered(status);
      setAuthIntent('register');
      await requestEmailOtp(email, captchaToken);
      setOtpSent(email);
    } catch (err) {
      setError(err?.response?.data?.message || friendlyAuthError(err));
    } finally {
      setBusy('');
    }
  };

  const handleRegisterSubmit = async () => {
    setError('');
    const details = await collectDetails();
    if (!details) return;

    setBusy('register');
    try {
      // 1) Link/Set password on Firebase (if session is fresh, or fallback)
      const password = getValues('password');
      if (auth.currentUser && password) {
        try {
          await updatePassword(auth.currentUser, password);
        } catch (err) {
          if (err?.code === 'auth/requires-recent-login') {
            setReauthEmail(getValues('email') || currentUser?.email);
            setReauthOtpSent(false);
            setReauthOtpCode('');
            setReauthError('');
            setBusy('');
            return; // Stop final submission until re-verified
          }
          throw err;
        }
      }

      // 2) Call backend API to create registration request
      const { user } = await registerWithBackend(details);
      clearAuthIntent();
      finish(user);
    } catch (err) {
      if (err?.response?.status === 409) return handleAlreadyRegistered(err.response.data?.status);
      setError(friendlyAuthError(err));
    } finally {
      setBusy('');
    }
  };

  const handleVerifyOtp = async (code) => {
    setError('');
    let otp = code.trim();
    if (otp.startsWith('http')) {
      try {
        const url = new URL(otp);
        otp = url.searchParams.get('oobCode') || otp;
      } catch (e) {
        // Ignore parsing error
      }
    }
    await verifyEmailOtp(otpSent, otp);
    try {
      const { user } = await loginWithBackend();
      handleAlreadyRegistered(user.status);
    } catch (err) {
      if (err?.response?.status === 404) {
        // Not registered (expected) -> proceeds to form
        setOtpSent('');
      } else {
        throw err;
      }
    }
  };

  const handleSendReauthOtp = async () => {
    setReauthError('');
    setReauthBusy(true);
    try {
      await requestEmailOtp(reauthEmail, undefined, true);
      setReauthOtpSent(true);
      reauthResetTimer();
    } catch (err) {
      setReauthError(friendlyAuthError(err));
    } finally {
      setReauthBusy(false);
    }
  };

  const handleVerifyReauthOtp = async () => {
    setReauthError('');
    setReauthBusy(true);
    try {
      await verifyEmailOtp(reauthEmail, reauthOtpCode);
      setReauthEmail('');
      // Now that they are authenticated again, proceed with submit
      handleRegisterSubmit();
    } catch (err) {
      setReauthError(friendlyAuthError(err));
    } finally {
      setReauthBusy(false);
    }
  };

  const handleGoogleReauth = async () => {
    setReauthError('');
    setReauthBusy(true);
    try {
      await googleAuth();
      setReauthEmail('');
      handleRegisterSubmit();
    } catch (err) {
      setReauthError(friendlyAuthError(err));
    } finally {
      setReauthBusy(false);
    }
  };

  const handleLinkedInReauth = async () => {
    const details = await collectDetails();
    if (details) {
      setAuthIntent('register', details);
    }
    linkedInRedirect();
  };

  const validateAndGoNext = async () => {
    setError('');
    let ok = false;
    if (step === 0) {
      ok = await trigger([
        'name',
        'email',
        'password',
        'nationalNumber',
        'countryCode',
        'profilePhoto',
        'dob',
        'gender',
        'address',
        'city',
        'state',
        'country',
        'pinCode',
      ]);
    } else if (step === 1) {
      ok = await trigger(['course', 'branch', 'yearOfAdmission', 'yearOfPassout']);
      if (ok) {
        const admission = Number(watch('yearOfAdmission'));
        const passout = Number(watch('yearOfPassout'));
        if (passout < admission) {
          setErrorField('yearOfPassout', {
            type: 'custom',
            message: 'Year of passout cannot be before the year of admission',
          });
          ok = false;
        } else if (passout - admission < 2) {
          setErrorField('yearOfPassout', {
            type: 'custom',
            message: 'Gap between year of admission and year of passout must be at least 2 years',
          });
          ok = false;
        }
      }
    } else if (step === 2) {
      ok = await trigger(['linkedinUrl', 'termsAccepted']);
    }
    if (ok) {
      setStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setError('Please fill the required fields in the current step before proceeding.');
    }
  };

  const goBack = () => {
    setError('');
    setStep((s) => Math.max(0, s - 1));
  };

  const handleLogoutAndStartOver = async () => {
    await logout();
    setError('');
    setStep(0);
    setEmailInput('');
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center lg:justify-start bg-cover bg-center p-4 sm:p-6 md:p-8 lg:pl-[6%] xl:pl-[8%] font-sans overflow-y-auto"
      style={{ backgroundImage: `url(${resisterBg})` }}
    >
      <div className={`w-full ${otpSent || !isVerified ? 'max-w-[450px]' : 'max-w-3xl'} my-8 transition-all duration-300`}>
        <AnimatePresence mode="wait">
          {otpSent ? (
            <ConfirmationScreen
              key="confirm"
              email={otpSent}
              onBack={() => setOtpSent('')}
              onVerify={handleVerifyOtp}
            />
          ) : !isVerified ? (
            /* ─── EMAIL VERIFICATION SCREEN ─── */
            <motion.div
              key="verification-screen"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-[#eef2f6]/95 backdrop-blur-md border border-[#cbd5e1]/60 rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.12)] p-6 md:p-8"
            >
              {/* Header */}
              <div className="text-center mb-6">
                <img src={logo} alt="SSGMCE Logo" className="mx-auto h-20 w-24 object-contain" />
                <h1 className="text-2xl font-extrabold text-[#1a3a75] tracking-tight">Alumni Registration</h1>
                <p className="mt-1 text-sm text-gray-500 font-semibold">
                  Verify your email address to get started
                </p>
              </div>

              {/* Global error banner */}
              {error && (
                <div className="mb-5 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 font-medium">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  {error}
                </div>
              )}

              <form onSubmit={handleEmailVerificationRequest} className="space-y-4">
                <div>
                  <div className="flex items-stretch bg-white border border-[#cbd5e1] rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-[#1a3a75]/30 focus-within:border-[#1a3a75] transition overflow-hidden">
                    <span className="w-16 shrink-0 flex items-center justify-center bg-[#fafafa] border-r border-[#cbd5e1] select-none text-gray-400">
                      <Mail size={18} />
                    </span>
                    <input
                      type="email"
                      required
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="Enter email address"
                      className="flex-1 px-4 py-3.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none bg-transparent"
                    />
                  </div>
                </div>

                {/* reCAPTCHA verification container */}
                <div className="flex justify-center py-2">
                  <Captcha onVerify={setCaptchaToken} />
                </div>

                <button
                  type="submit"
                  disabled={busy === 'email'}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1a3a75] hover:bg-[#153470] py-3.5 text-sm font-bold text-white shadow-md transition-all duration-200 cursor-pointer disabled:opacity-60"
                >
                  {busy === 'email' ? <Loader2 size={16} className="animate-spin" /> : null}
                  {busy === 'email' ? 'Sending link…' : 'Verify Email Address'}
                  {busy !== 'email' && <ArrowRight size={16} />}
                </button>
              </form>

              {/* Social Login/Verification Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-[#eef2f6] px-3 text-xs text-gray-400 font-semibold">Or verify using</span>
                </div>
              </div>

              {/* Social Verification Buttons */}
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

              <p className="text-center text-xs text-gray-400 mt-6 font-medium">
                Already have an account?{" "}
                <Link to="/login" className="text-[#1a3a75] font-bold hover:underline">
                  Login
                </Link>
              </p>
            </motion.div>
          ) : (
            /* ─── MULTI-STEP REGISTRATION FORM ─── */
            <motion.div
              key="register-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-[#eef2f6]/95 backdrop-blur-md border border-[#cbd5e1]/60 rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.12)] p-6 md:p-8"
            >
              {/* Header */}
              <div className="text-center mb-6">
                <img src={logo} alt="SSGMCE Logo" className="mx-auto h-20 w-24 object-contain" />
                <h1 className="text-2xl font-extrabold text-[#1a3a75] tracking-tight">Alumni Registration</h1>
                <p className="mt-1 text-xs text-gray-500 font-semibold">
                  Registering as <span className="text-[#1a3a75] font-bold">{currentUser.email}</span>. Not you?{' '}
                  <button onClick={handleLogoutAndStartOver} className="text-red-500 underline font-bold hover:text-red-700">
                    Start over
                  </button>
                </p>
              </div>

              {/* Progress Indicator */}
              <div className="mb-8">
                <div className="flex items-center justify-between">
                  {['Personal', 'Academic', 'Professional'].map((label, i) => (
                    <div key={label} className="flex-1 flex flex-col items-center relative">
                      {i < 2 && (
                        <div
                          className={`absolute top-4 left-1/2 w-full h-0.5 z-0 ${i < step ? 'bg-[#1a3a75]' : 'bg-gray-200'
                            }`}
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          if (i < step) setStep(i);
                        }}
                        className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold border-2 transition-all ${i < step
                          ? 'bg-[#1a3a75] border-[#1a3a75] text-white cursor-pointer hover:bg-[#153470]'
                          : i === step
                            ? 'border-[#1a3a75] text-[#1a3a75] bg-white cursor-default shadow-sm ring-2 ring-[#1a3a75]/20'
                            : 'border-gray-300 text-gray-400 bg-white cursor-not-allowed'
                          }`}
                      >
                        {i < step ? '✓' : i + 1}
                      </button>
                      <p
                        className={`mt-2 text-[10px] md:text-xs font-bold text-center leading-tight ${i === step ? 'text-[#1a3a75]' : i < step ? 'text-gray-500 cursor-pointer' : 'text-gray-400'
                          }`}
                        onClick={() => {
                          if (i < step) setStep(i);
                        }}
                      >
                        {label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Global error banner */}
              {error && (
                <div className="mb-5 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 font-medium">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  {error}
                </div>
              )}

              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                {/* ── Step 0: Personal Information ── */}
                {step === 0 && (
                  <div className="space-y-4">
                    <p className="text-[11px] font-bold tracking-wider text-gray-400 uppercase mb-2 px-1">Personal Information</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Full Name */}
                      <div>
                        <div className="flex items-stretch bg-white border border-[#cbd5e1] rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-[#1a3a75]/30 focus-within:border-[#1a3a75] transition overflow-hidden">
                          <span className="w-28 shrink-0 flex items-center pl-4 bg-[#fafafa] border-r border-[#cbd5e1] select-none text-xs md:text-sm font-bold text-gray-500 py-3.5">
                            Full Name<span className="text-red-500 ml-0.5">*</span>
                          </span>
                          <input
                            {...register('name')}
                            type="text"
                            placeholder="Enter full name"
                            className="flex-1 px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none bg-transparent"
                          />
                        </div>
                        <FieldError message={errors.name?.message} />
                      </div>

                      {/* Email (Read Only) */}
                      <div>
                        <div className="flex items-stretch bg-gray-50 border border-[#cbd5e1] rounded-xl shadow-sm overflow-hidden opacity-80">
                          <span className="w-28 shrink-0 flex items-center pl-4 bg-[#fafafa] border-r border-[#cbd5e1] select-none text-xs md:text-sm font-bold text-gray-500 py-3.5">
                            Email<span className="text-red-500 ml-0.5">*</span>
                          </span>
                          <input
                            {...register('email')}
                            type="email"
                            readOnly
                            placeholder="Enter email address"
                            className="flex-1 px-4 py-3 text-sm text-gray-500 bg-transparent focus:outline-none cursor-not-allowed font-semibold"
                          />
                        </div>
                        <FieldError message={errors.email?.message} />
                      </div>

                      {/* Password */}
                      <div className="md:col-span-2">
                        <div className="flex items-center bg-white border border-[#cbd5e1] rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-[#1a3a75]/30 focus-within:border-[#1a3a75] transition overflow-hidden pr-3">
                          <span className="w-28 shrink-0 flex items-center pl-4 bg-[#fafafa] border-r border-[#cbd5e1] select-none text-xs md:text-sm font-bold text-gray-500 py-3.5">
                            Password<span className="text-red-500 ml-0.5">*</span>
                          </span>
                          <input
                            {...register('password')}
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Create account password (min 6 characters)"
                            className="flex-1 px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none bg-transparent"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className=" bg-[#fafafa] text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                          >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                        <FieldError message={errors.password?.message} />
                      </div>

                      {/* Primary Contact */}
                      <div>
                        <div className="flex items-stretch bg-white border border-[#cbd5e1] rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-[#1a3a75]/30 focus-within:border-[#1a3a75] transition">
                          <span className="w-28 shrink-0 flex items-center pl-4 bg-[#fafafa] border-r border-[#cbd5e1] select-none text-xs md:text-sm font-bold text-gray-500 py-3.5 rounded-l-xl">
                            Mobile<span className="text-red-500 ml-0.5">*</span>
                          </span>
                          <PhoneInput
                            value={phone}
                            onChange={(val) => {
                              setPhone(val || '');
                              const parsed = parsePhoneNumberFromString(val || '');
                              if (parsed && parsed.isValid()) {
                                setValue('nationalNumber', parsed.nationalNumber, { shouldValidate: true });
                                setValue('countryCode', parsed.country, { shouldValidate: true });
                              } else {
                                setValue('nationalNumber', '', { shouldValidate: true });
                                setValue('countryCode', '', { shouldValidate: true });
                              }
                            }}
                            placeholder="Enter your phone number"
                          />
                        </div>
                        <FieldError message={errors.nationalNumber?.message || errors.countryCode?.message} />
                      </div>

                      {/* Date of Birth */}
                      <div>
                        <div className="flex items-stretch bg-white border border-[#cbd5e1] rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-[#1a3a75]/30 focus-within:border-[#1a3a75] transition overflow-hidden">
                          <span className="w-28 shrink-0 flex items-center pl-4 bg-[#fafafa] border-r border-[#cbd5e1] select-none text-xs md:text-sm font-bold text-gray-500 py-3.5">
                            DOB<span className="text-red-500 ml-0.5">*</span>
                          </span>
                          <Controller
                            control={control}
                            name="dob"
                            render={({ field }) => (
                              <DatePicker
                                selected={field.value ? new Date(field.value) : null}
                                onChange={(date) => field.onChange(date)}
                                dateFormat="dd/MM/yyyy"
                                placeholderText="DD/MM/YYYY"
                                className="w-full px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none bg-transparent"
                                wrapperClassName="flex-1"
                                showMonthDropdown
                                showYearDropdown
                                dropdownMode="select"
                                maxDate={new Date()}
                              />
                            )}
                          />
                        </div>
                        <FieldError message={errors.dob?.message} />
                      </div>

                      {/* Gender */}
                      <div>
                        <div className="flex items-stretch bg-white border border-[#cbd5e1] rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-[#1a3a75]/30 focus-within:border-[#1a3a75] transition overflow-hidden">
                          <span className="w-28 shrink-0 flex items-center pl-4 bg-[#fafafa] border-r border-[#cbd5e1] select-none text-xs md:text-sm font-bold text-gray-500 py-3.5">
                            Gender<span className="text-red-500 ml-0.5">*</span>
                          </span>
                          <select
                            {...register('gender')}
                            className="flex-1 px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none bg-transparent appearance-none cursor-pointer"
                          >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                          </select>
                        </div>
                        <FieldError message={errors.gender?.message} />
                      </div>

                      {/* Address */}
                      <div className="md:col-span-2">
                        <div className="flex items-stretch bg-white border border-[#cbd5e1] rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-[#1a3a75]/30 focus-within:border-[#1a3a75] transition overflow-hidden">
                          <span className="w-28 shrink-0 flex items-center pl-4 bg-[#fafafa] border-r border-[#cbd5e1] select-none text-xs md:text-sm font-bold text-gray-500 py-3.5">
                            Address<span className="text-red-500 ml-0.5">*</span>
                          </span>
                          <input
                            {...register('address')}
                            type="text"
                            placeholder="Street, locality etc."
                            className="flex-1 px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none bg-transparent"
                          />
                        </div>
                        <FieldError message={errors.address?.message} />
                      </div>

                      {/* District */}
                      <div>
                        <div className="flex items-stretch bg-white border border-[#cbd5e1] rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-[#1a3a75]/30 focus-within:border-[#1a3a75] transition overflow-hidden">
                          <span className="w-28 shrink-0 flex items-center pl-4 bg-[#fafafa] border-r border-[#cbd5e1] select-none text-xs md:text-sm font-bold text-gray-500 py-3.5">
                            District<span className="text-red-500 ml-0.5">*</span>
                          </span>
                          <input
                            {...register('city')}
                            type="text"
                            placeholder="Enter city"
                            className="flex-1 px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none bg-transparent"
                          />
                        </div>
                        <FieldError message={errors.city?.message} />
                      </div>

                      {/* State */}
                      <div>
                        <div className="flex items-stretch bg-white border border-[#cbd5e1] rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-[#1a3a75]/30 focus-within:border-[#1a3a75] transition overflow-hidden">
                          <span className="w-28 shrink-0 flex items-center pl-4 bg-[#fafafa] border-r border-[#cbd5e1] select-none text-xs md:text-sm font-bold text-gray-500 py-3.5">
                            State<span className="text-red-500 ml-0.5">*</span>
                          </span>
                          <input
                            {...register('state')}
                            type="text"
                            placeholder="Enter state"
                            className="flex-1 px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none bg-transparent"
                          />
                        </div>
                        <FieldError message={errors.state?.message} />
                      </div>

                      {/* Country */}
                      <div>
                        <div className="flex items-stretch bg-white border border-[#cbd5e1] rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-[#1a3a75]/30 focus-within:border-[#1a3a75] transition overflow-hidden">
                          <span className="w-28 shrink-0 flex items-center pl-4 bg-[#fafafa] border-r border-[#cbd5e1] select-none text-xs md:text-sm font-bold text-gray-500 py-3.5">
                            Country<span className="text-red-500 ml-0.5">*</span>
                          </span>
                          <input
                            {...register('country')}
                            type="text"
                            placeholder="Enter country"
                            className="flex-1 px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none bg-transparent"
                          />
                        </div>
                        <FieldError message={errors.country?.message} />
                      </div>

                      {/* Pin Code */}
                      <div>
                        <div className="flex items-stretch bg-white border border-[#cbd5e1] rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-[#1a3a75]/30 focus-within:border-[#1a3a75] transition overflow-hidden">
                          <span className="w-28 shrink-0 flex items-center pl-4 bg-[#fafafa] border-r border-[#cbd5e1] select-none text-xs md:text-sm font-bold text-gray-500 py-3.5">
                            Pin Code<span className="text-red-500 ml-0.5">*</span>
                          </span>
                          <input
                            {...register('pinCode')}
                            type="text"
                            placeholder="Enter pin code"
                            className="flex-1 px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none bg-transparent"
                          />
                        </div>
                        <FieldError message={errors.pinCode?.message} />
                      </div>

                      {/* Profile Photo Upload */}
                      <div className="md:col-span-2 flex flex-col items-center gap-3 bg-white/50 border border-[#cbd5e1]/80 rounded-2xl p-4 shadow-sm">
                        <div className="relative group">
                          <div className="h-24 w-24 overflow-hidden rounded-full border-2 border-[#1a3a75]/20 bg-gray-50 flex items-center justify-center shadow-inner relative">
                            {isUploadingPhoto ? (
                              <Loader2 className="h-8 w-8 text-[#1a3a75] animate-spin" />
                            ) : watch('profilePhoto') ? (
                              <img src={watch('profilePhoto')} alt="Profile Preview" className="h-full w-full object-cover" />
                            ) : (
                              <User size={40} className="text-gray-400" />
                            )}
                          </div>
                          <label className={`absolute bottom-0 right-0 h-8 w-8 rounded-full bg-[#1a3a75] hover:bg-[#153470] border-2 border-white flex items-center justify-center cursor-pointer shadow transition text-white ${isUploadingPhoto ? 'opacity-50 pointer-events-none' : ''}`}>
                            <span className="text-xs font-bold">+</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              disabled={isUploadingPhoto}
                              onChange={async (e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  if (file.size > 2 * 1024 * 1024) {
                                    setError('Profile photo must be smaller than 2MB.');
                                    return;
                                  }
                                  try {
                                    setIsUploadingPhoto(true);
                                    setError('');
                                    const imageUrl = await uploadProfilePhoto(file);
                                    setValue('profilePhoto', imageUrl, { shouldValidate: true });
                                  } catch (err) {
                                    setError(err.message || 'Failed to upload photo.');
                                  } finally {
                                    setIsUploadingPhoto(false);
                                  }
                                }
                              }}
                            />
                          </label>
                        </div>
                        <div className="text-center">
                          <p className="text-xs font-bold text-[#1a3a75]">Profile Photo<span className="text-red-500 ml-0.5">*</span></p>
                          <p className="text-[10px] text-gray-400">JPG, PNG or WEBP · Max 2MB</p>
                          <FieldError message={errors.profilePhoto?.message} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Step 1: Academic Information ── */}
                {step === 1 && (
                  <div className="space-y-4">
                    <p className="text-[11px] font-bold tracking-wider text-gray-400 uppercase mb-2 px-1">Academic Information</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Course */}
                      <div>
                        <div className="flex items-stretch bg-white border border-[#cbd5e1] rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-[#1a3a75]/30 focus-within:border-[#1a3a75] transition overflow-hidden">
                          <span className="w-28 shrink-0 flex items-center pl-4 bg-[#fafafa] border-r border-[#cbd5e1] select-none text-xs md:text-sm font-bold text-gray-500 py-3.5">
                            Course<span className="text-red-500 ml-0.5">*</span>
                          </span>
                          <select
                            {...register('course')}
                            className="flex-1 px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none bg-transparent appearance-none cursor-pointer"
                          >
                            <option value="">Select Course</option>
                            {COURSES.map((c) => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                        <FieldError message={errors.course?.message} />
                      </div>

                      {/* Branch */}
                      {selectedCourse && (selectedCourse === 'MCA' || selectedCourse === 'MBA') ? (
                        <div>
                          <div className="flex items-stretch bg-gray-50 border border-[#cbd5e1] rounded-xl shadow-sm overflow-hidden opacity-80">
                            <span className="w-40 shrink-0 flex items-center pl-4 bg-[#fafafa] border-r border-[#cbd5e1] select-none text-xs md:text-sm font-bold text-gray-500 py-3.5">
                              Branch/Dept<span className="text-red-500 ml-0.5">*</span>
                            </span>
                            <input
                              type="text"
                              value={selectedCourse}
                              disabled
                              className="flex-1 px-4 py-3 text-sm text-gray-500 bg-transparent focus:outline-none cursor-not-allowed font-semibold"
                            />
                            <input type="hidden" {...register('branch')} />
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-stretch bg-white border border-[#cbd5e1] rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-[#1a3a75]/30 focus-within:border-[#1a3a75] transition overflow-hidden">
                            <span className="w-40 shrink-0 flex items-center pl-4 bg-[#fafafa] border-r border-[#cbd5e1] select-none text-xs md:text-sm font-bold text-gray-500 py-3.5">
                              Branch/Dept<span className="text-red-500 ml-0.5">*</span>
                            </span>
                            <select
                              {...register('branch')}
                              disabled={!selectedCourse}
                              className="flex-1 px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none bg-transparent appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <option value="">{selectedCourse ? 'Select Branch' : 'Select Course First'}</option>
                              {['Computer Science & Engineering', 'Information Technology', 'Electronics & Telecommunication', 'Electrical Engineering', 'Mechanical Engineering'].map((b) => (
                                <option key={b} value={b}>{b}</option>
                              ))}
                            </select>
                          </div>
                          <FieldError message={errors.branch?.message} />
                        </div>
                      )}

                      {/* Admission Year */}
                      <div>
                        <div className="flex items-stretch bg-white border border-[#cbd5e1] rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-[#1a3a75]/30 focus-within:border-[#1a3a75] transition overflow-hidden">
                          <span className="w-40 shrink-0 flex items-center pl-4 bg-[#fafafa] border-r border-[#cbd5e1] select-none text-xs md:text-sm font-bold text-gray-500 py-3.5">
                            Admission Year<span className="text-red-500 ml-0.5">*</span>
                          </span>
                          <input
                            {...register('yearOfAdmission', { valueAsNumber: true })}
                            type="number"
                            placeholder="e.g. 2019"
                            min="1990"
                            max={currentYear}
                            className="flex-1 px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none bg-transparent"
                          />
                        </div>
                        <FieldError message={errors.yearOfAdmission?.message} />
                      </div>

                      {/* Passout Year */}
                      <div>
                        <div className="flex items-stretch bg-white border border-[#cbd5e1] rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-[#1a3a75]/30 focus-within:border-[#1a3a75] transition overflow-hidden">
                          <span className="w-40 shrink-0 flex items-center pl-4 bg-[#fafafa] border-r border-[#cbd5e1] select-none text-xs md:text-sm font-bold text-gray-500 py-3.5">
                            Passout Year<span className="text-red-500 ml-0.5">*</span>
                          </span>
                          <input
                            {...register('yearOfPassout', { valueAsNumber: true })}
                            type="number"
                            placeholder="e.g. 2023"
                            min="1990"
                            max={currentYear + 6}
                            className="flex-1 px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none bg-transparent"
                          />
                        </div>
                        <FieldError message={errors.yearOfPassout?.message} />
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Step 2: Professional Information ── */}
                {step === 2 && (
                  <div className="space-y-4">
                    <p className="text-[11px] font-bold tracking-wider text-gray-400 uppercase mb-2 px-1">Professional Information</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Employment Status */}
                      <div className="md:col-span-2">
                        <div className="flex items-stretch bg-white border border-[#cbd5e1] rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-[#1a3a75]/30 focus-within:border-[#1a3a75] transition overflow-hidden">
                          <span className="w-40 shrink-0 flex items-center pl-4 bg-[#fafafa] border-r border-[#cbd5e1] select-none text-xs md:text-sm font-bold text-gray-500 py-3.5">
                            Employment Status<span className="text-red-500 ml-0.5">*</span>
                          </span>
                          <select
                            {...register('employmentStatus')}
                            className="flex-1 px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none bg-transparent appearance-none cursor-pointer"
                          >
                            <option value="">Select Status</option>
                            {EMPLOYMENT_STATUSES.map((status) => (
                              <option key={status} value={status}>{status}</option>
                            ))}
                          </select>
                        </div>
                        <FieldError message={errors.employmentStatus?.message} />
                      </div>

                      {/* Company Fields */}
                      {showCompanyFields && (
                        <>
                          <div>
                            <div className="flex items-stretch bg-white border border-[#cbd5e1] rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-[#1a3a75]/30 focus-within:border-[#1a3a75] transition overflow-hidden">
                              <span className="w-40 shrink-0 flex items-center pl-4 bg-[#fafafa] border-r border-[#cbd5e1] select-none text-xs md:text-sm font-bold text-gray-500 py-3.5">
                                Company Name<span className="text-red-500 ml-0.5">*</span>
                              </span>
                              <input
                                {...register('companyName')}
                                type="text"
                                placeholder="Company / Org Name"
                                className="flex-1 px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none bg-transparent"
                              />
                            </div>
                            <FieldError message={errors.companyName?.message} />
                          </div>

                          <div>
                            <div className="flex items-stretch bg-white border border-[#cbd5e1] rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-[#1a3a75]/30 focus-within:border-[#1a3a75] transition overflow-hidden">
                              <span className="w-40 shrink-0 flex items-center pl-4 bg-[#fafafa] border-r border-[#cbd5e1] select-none text-xs md:text-sm font-bold text-gray-500 py-3.5">
                                Designation<span className="text-red-500 ml-0.5">*</span>
                              </span>
                              <input
                                {...register('designation')}
                                type="text"
                                placeholder="e.g. Software Engineer"
                                className="flex-1 px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none bg-transparent"
                              />
                            </div>
                            <FieldError message={errors.designation?.message} />
                          </div>

                          <div>
                            <div className="flex items-stretch bg-white border border-[#cbd5e1] rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-[#1a3a75]/30 focus-within:border-[#1a3a75] transition overflow-hidden">
                              <span className="w-40 shrink-0 flex items-center pl-4 bg-[#fafafa] border-r border-[#cbd5e1] select-none text-xs md:text-sm font-bold text-gray-500 py-3.5">
                                Industry
                              </span>
                              <input
                                {...register('industry')}
                                type="text"
                                placeholder="e.g. IT, Finance"
                                className="flex-1 px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none bg-transparent"
                              />
                            </div>
                            <FieldError message={errors.industry?.message} />
                          </div>

                          <div>
                            <div className="flex items-stretch bg-white border border-[#cbd5e1] rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-[#1a3a75]/30 focus-within:border-[#1a3a75] transition overflow-hidden">
                              <span className="w-40 shrink-0 flex items-center pl-4 bg-[#fafafa] border-r border-[#cbd5e1] select-none text-xs md:text-sm font-bold text-gray-500 py-3.5">
                                Experience (Years)
                              </span>
                              <input
                                {...register('workExperience', { valueAsNumber: true })}
                                type="number"
                                placeholder="e.g. 3"
                                className="flex-1 px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none bg-transparent"
                              />
                            </div>
                            <FieldError message={errors.workExperience?.message} />
                          </div>

                          <div className="md:col-span-2">
                            <div className="flex items-stretch bg-white border border-[#cbd5e1] rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-[#1a3a75]/30 focus-within:border-[#1a3a75] transition overflow-hidden">
                              <span className="w-40 shrink-0 flex items-center pl-4 bg-[#fafafa] border-r border-[#cbd5e1] select-none text-xs md:text-sm font-bold text-gray-500 py-3.5">
                                Office Address
                              </span>
                              <input
                                {...register('officeAddress')}
                                type="text"
                                placeholder="Street, building etc."
                                className="flex-1 px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none bg-transparent"
                              />
                            </div>
                            <FieldError message={errors.officeAddress?.message} />
                          </div>

                          <div>
                            <div className="flex items-stretch bg-white border border-[#cbd5e1] rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-[#1a3a75]/30 focus-within:border-[#1a3a75] transition overflow-hidden">
                              <span className="w-40 shrink-0 flex items-center pl-4 bg-[#fafafa] border-r border-[#cbd5e1] select-none text-xs md:text-sm font-bold text-gray-500 py-3.5">
                                Office City
                              </span>
                              <input
                                {...register('officeCity')}
                                type="text"
                                placeholder="Enter city"
                                className="flex-1 px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none bg-transparent"
                              />
                            </div>
                            <FieldError message={errors.officeCity?.message} />
                          </div>

                          <div>
                            <div className="flex items-stretch bg-white border border-[#cbd5e1] rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-[#1a3a75]/30 focus-within:border-[#1a3a75] transition overflow-hidden">
                              <span className="w-40 shrink-0 flex items-center pl-4 bg-[#fafafa] border-r border-[#cbd5e1] select-none text-xs md:text-sm font-bold text-gray-500 py-3.5">
                                Office State
                              </span>
                              <input
                                {...register('officeState')}
                                type="text"
                                placeholder="Enter state"
                                className="flex-1 px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none bg-transparent"
                              />
                            </div>
                            <FieldError message={errors.officeState?.message} />
                          </div>

                          <div>
                            <div className="flex items-stretch bg-white border border-[#cbd5e1] rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-[#1a3a75]/30 focus-within:border-[#1a3a75] transition overflow-hidden">
                              <span className="w-40 shrink-0 flex items-center pl-4 bg-[#fafafa] border-r border-[#cbd5e1] select-none text-xs md:text-sm font-bold text-gray-500 py-3.5">
                                Office Country
                              </span>
                              <input
                                {...register('officeCountry')}
                                type="text"
                                placeholder="Enter country"
                                className="flex-1 px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none bg-transparent"
                              />
                            </div>
                            <FieldError message={errors.officeCountry?.message} />
                          </div>

                          <div>
                            <div className="flex items-stretch bg-white border border-[#cbd5e1] rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-[#1a3a75]/30 focus-within:border-[#1a3a75] transition overflow-hidden">
                              <span className="w-40 shrink-0 flex items-center pl-4 bg-[#fafafa] border-r border-[#cbd5e1] select-none text-xs md:text-sm font-bold text-gray-500 py-3.5">
                                Office Pin Code
                              </span>
                              <input
                                {...register('officePinCode')}
                                type="text"
                                placeholder="Enter pin code"
                                className="flex-1 px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none bg-transparent"
                              />
                            </div>
                            <FieldError message={errors.officePinCode?.message} />
                          </div>

                          <div className="md:col-span-2">
                            <div className="flex items-stretch bg-white border border-[#cbd5e1] rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-[#1a3a75]/30 focus-within:border-[#1a3a75] transition overflow-hidden">
                              <span className="w-40 shrink-0 flex items-center pl-4 bg-[#fafafa] border-r border-[#cbd5e1] select-none text-xs md:text-sm font-bold text-gray-500 py-3.5">
                                Company Website
                              </span>
                              <input
                                {...register('companyWebsite')}
                                type="url"
                                placeholder="https://example.com"
                                className="flex-1 px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none bg-transparent"
                              />
                            </div>
                            <FieldError message={errors.companyWebsite?.message} />
                          </div>

                          <div className="md:col-span-2">
                            <div className="flex items-stretch bg-white border border-[#cbd5e1] rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-[#1a3a75]/30 focus-within:border-[#1a3a75] transition overflow-hidden">
                              <span className="w-40 shrink-0 flex items-center pl-4 bg-[#fafafa] border-r border-[#cbd5e1] select-none text-xs md:text-sm font-bold text-gray-500 py-3.5">
                                Work Email
                              </span>
                              <input
                                {...register('workEmail')}
                                type="text"
                                placeholder="name@company.com"
                                className="flex-1 px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none bg-transparent"
                              />
                            </div>
                            <FieldError message={errors.workEmail?.message} />
                          </div>
                        </>
                      )}

                      {/* Entrepreneur Fields */}
                      {isEntrepreneur && (
                        <>
                          <div>
                            <div className="flex items-stretch bg-white border border-[#cbd5e1] rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-[#1a3a75]/30 focus-within:border-[#1a3a75] transition overflow-hidden">
                              <span className="w-40 shrink-0 flex items-center pl-4 bg-[#fafafa] border-r border-[#cbd5e1] select-none text-xs md:text-sm font-bold text-gray-500 py-3.5">
                                Startup Name<span className="text-red-500 ml-0.5">*</span>
                              </span>
                              <input
                                {...register('startupName')}
                                type="text"
                                placeholder="Startup / Venture Name"
                                className="flex-1 px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none bg-transparent"
                              />
                            </div>
                            <FieldError message={errors.startupName?.message} />
                          </div>

                          <div>
                            <div className="flex items-stretch bg-white border border-[#cbd5e1] rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-[#1a3a75]/30 focus-within:border-[#1a3a75] transition overflow-hidden">
                              <span className="w-40 shrink-0 flex items-center pl-4 bg-[#fafafa] border-r border-[#cbd5e1] select-none text-xs md:text-sm font-bold text-gray-500 py-3.5">
                                Startup Website
                              </span>
                              <input
                                {...register('startupWebsite')}
                                type="url"
                                placeholder="https://example.com"
                                className="flex-1 px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none bg-transparent"
                              />
                            </div>
                            <FieldError message={errors.startupWebsite?.message} />
                          </div>

                          <div className="md:col-span-2">
                            <div className="flex items-stretch bg-white border border-[#cbd5e1] rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-[#1a3a75]/30 focus-within:border-[#1a3a75] transition overflow-hidden">
                              <span className="w-40 shrink-0 flex items-center pl-4 bg-[#fafafa] border-r border-[#cbd5e1] select-none text-xs md:text-sm font-bold text-gray-500 py-3.5">
                                Description
                              </span>
                              <textarea
                                {...register('startupDescription')}
                                placeholder="Describe your startup venture..."
                                rows={3}
                                className="flex-1 px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none bg-transparent resize-none"
                              />
                            </div>
                            <FieldError message={errors.startupDescription?.message} />
                          </div>
                        </>
                      )}

                      {/* Higher Studies Fields */}
                      {isHigherStudies && (
                        <>
                          <div>
                            <div className="flex items-stretch bg-white border border-[#cbd5e1] rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-[#1a3a75]/30 focus-within:border-[#1a3a75] transition overflow-hidden">
                              <span className="w-40 shrink-0 flex items-center pl-4 bg-[#fafafa] border-r border-[#cbd5e1] select-none text-xs md:text-sm font-bold text-gray-500 py-3.5">
                                University Name<span className="text-red-500 ml-0.5">*</span>
                              </span>
                              <input
                                {...register('universityName')}
                                type="text"
                                placeholder="University / College Name"
                                className="flex-1 px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none bg-transparent"
                              />
                            </div>
                            <FieldError message={errors.universityName?.message} />
                          </div>

                          <div>
                            <div className="flex items-stretch bg-white border border-[#cbd5e1] rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-[#1a3a75]/30 focus-within:border-[#1a3a75] transition overflow-hidden">
                              <span className="w-40 shrink-0 flex items-center pl-4 bg-[#fafafa] border-r border-[#cbd5e1] select-none text-xs md:text-sm font-bold text-gray-500 py-3.5">
                                Course Name<span className="text-red-500 ml-0.5">*</span>
                              </span>
                              <input
                                {...register('higherStudiesCourse')}
                                type="text"
                                placeholder="e.g. M.Tech, MBA, MS"
                                className="flex-1 px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none bg-transparent"
                              />
                            </div>
                            <FieldError message={errors.higherStudiesCourse?.message} />
                          </div>

                          <div className="md:col-span-2">
                            <div className="flex items-stretch bg-white border border-[#cbd5e1] rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-[#1a3a75]/30 focus-within:border-[#1a3a75] transition overflow-hidden">
                              <span className="w-40 shrink-0 flex items-center pl-4 bg-[#fafafa] border-r border-[#cbd5e1] select-none text-xs md:text-sm font-bold text-gray-500 py-3.5">
                                Country
                              </span>
                              <input
                                {...register('higherStudiesCountry')}
                                type="text"
                                placeholder="Country of University"
                                className="flex-1 px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none bg-transparent"
                              />
                            </div>
                            <FieldError message={errors.higherStudiesCountry?.message} />
                          </div>
                        </>
                      )}

                      {/* LinkedIn URL */}
                      {employmentStatus && (
                        <div className="md:col-span-2">
                          <div className="flex items-stretch bg-white border border-[#cbd5e1] rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-[#1a3a75]/30 focus-within:border-[#1a3a75] transition overflow-hidden">
                            <span className="w-40 shrink-0 flex items-center pl-4 bg-[#fafafa] border-r border-[#cbd5e1] select-none text-xs md:text-sm font-bold text-gray-500 py-3.5">
                              LinkedIn URL
                            </span>
                            <input
                              {...register('linkedinUrl')}
                              type="url"
                              placeholder="https://linkedin.com/in/..."
                              className="flex-1 px-4 py-3 text-sm text-gray-800 placeholder-gray-300 focus:outline-none bg-transparent"
                            />
                          </div>
                          <FieldError message={errors.linkedinUrl?.message} />
                        </div>
                      )}
                    </div>

                    {/* Terms and Conditions Checkbox */}
                    <div className="mt-6 border-t border-gray-200/50 pt-5">
                      <label className="flex items-start gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          {...register('termsAccepted')}
                          className="mt-1 h-4.5 w-4.5 rounded border-gray-300 text-[#1a3a75] focus:ring-[#1a3a75]/30 cursor-pointer"
                        />
                        <span className="text-xs text-gray-500 font-semibold leading-relaxed group-hover:text-gray-700 select-none">
                          I agree to all the{' '}
                          <Link to="/terms" target="_blank" className="text-[#1a3a75] underline hover:text-[#153470] font-bold">
                            Terms of Use
                          </Link>{' '}
                          and understand that I would create an alumni account on signup, which is used for authentication.
                        </span>
                      </label>
                      <FieldError message={errors.termsAccepted?.message} />
                    </div>
                  </div>
                )}
              </form>

              {/* Navigation controls */}
              <div className="mt-8 flex items-center justify-between border-t border-gray-200/50 pt-5">
                {step > 0 ? (
                  <button
                    type="button"
                    onClick={goBack}
                    className="flex items-center gap-1.5 rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 transition shadow-sm cursor-pointer"
                  >
                    <ChevronLeft size={16} /> Back
                  </button>
                ) : (
                  <div />
                )}

                {step < 2 ? (
                  <button
                    type="button"
                    onClick={validateAndGoNext}
                    className="flex items-center gap-1.5 rounded-xl bg-[#1a3a75] hover:bg-[#153470] px-6 py-2.5 text-sm font-bold text-white shadow transition cursor-pointer"
                  >
                    Next <ChevronRight size={16} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleRegisterSubmit}
                    disabled={!!busy}
                    className="flex items-center gap-1.5 rounded-xl bg-[#1a3a75] hover:bg-[#153470] px-6 py-2.5 text-sm font-bold text-white shadow transition cursor-pointer disabled:opacity-60"
                  >
                    {busy === 'register' ? <Loader2 size={16} className="animate-spin" /> : null}
                    {busy === 'register' ? 'Registering…' : 'Register'}
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Re-authentication modal */}
      {reauthEmail && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#eef2f6]/95 backdrop-blur-md border border-[#cbd5e1]/60 rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.12)] p-6 md:p-8 max-w-[450px] w-full relative">
            
            {/* Header */}
            <div className="text-center mb-6">
              <h2 className="text-xl font-extrabold text-[#1a3a75] tracking-tight">Session Expired</h2>
              <p className="mt-2 text-sm text-gray-500 font-semibold leading-relaxed">
                Your session has expired. Please verify your email once again. Your registration details are already saved.
              </p>
            </div>

            {/* Error message inside modal */}
            {reauthError && (
              <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 font-medium">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                {reauthError}
              </div>
            )}

            {!reauthOtpSent ? (
              <div className="space-y-4">
                <div className="flex items-stretch bg-white border border-[#cbd5e1] rounded-xl shadow-sm pr-3">
                  <span className="w-16 shrink-0 flex items-center justify-center bg-[#fafafa] border-r border-[#cbd5e1] select-none text-gray-400">
                    <Mail size={18} />
                  </span>
                  <input
                    type="email"
                    readOnly
                    value={reauthEmail}
                    className="flex-1 px-4 py-3.5 text-sm text-gray-500 bg-transparent focus:outline-none cursor-not-allowed font-semibold"
                  />
                </div>



                <button
                  type="button"
                  onClick={handleSendReauthOtp}
                  disabled={reauthBusy}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1a3a75] hover:bg-[#153470] py-3.5 text-sm font-bold text-white shadow-md transition-all duration-200 cursor-pointer disabled:opacity-60"
                >
                  {reauthBusy ? <Loader2 size={16} className="animate-spin" /> : null}
                  {reauthBusy ? 'Sending code…' : 'Verify Email Again'}
                  {reauthBusy !== 'reauth' && <ArrowRight size={16} />}
                </button>

                {/* Social Login option (optional re-auth path) */}
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-[#eef2f6] px-3 text-xs text-gray-400 font-semibold">Or verify using</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleLinkedInReauth}
                    className="flex items-center justify-center gap-2 rounded-xl bg-[#0a66c2] hover:bg-[#004182] py-3 text-sm font-bold text-white shadow-sm transition-all duration-200 cursor-pointer"
                  >
                    Linkedin
                  </button>
                  <button
                    type="button"
                    onClick={handleGoogleReauth}
                    disabled={reauthBusy}
                    className="flex items-center justify-center gap-2 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 py-3 text-sm font-bold text-gray-700 shadow-sm transition-all duration-200 cursor-pointer disabled:opacity-60"
                  >
                    Google
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-sm text-[#1a3a75] font-semibold text-center mb-2">
                  Enter the verification code sent to {reauthEmail}
                </div>
                <div className="flex items-stretch bg-white border border-[#cbd5e1] rounded-xl shadow-sm pr-3">
                  <span className="w-16 shrink-0 flex items-center justify-center bg-[#fafafa] border-r border-[#cbd5e1] select-none text-gray-400">
                    <Lock size={18} />
                  </span>
                  <input
                    type="text"
                    required
                    value={reauthOtpCode}
                    onChange={(e) => setReauthOtpCode(e.target.value)}
                    placeholder="Enter code"
                    className="flex-1 px-4 py-3.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none bg-transparent"
                  />
                </div>

                {/* Resend OTP timer/button */}
                <div className="text-center pt-2">
                  <AnimatePresence mode="wait">
                    {reauthCanResend ? (
                      <motion.button
                        key="reauth-resend-btn"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        type="button"
                        onClick={handleSendReauthOtp}
                        disabled={reauthBusy}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-blue-300 bg-blue-50 py-2.5 text-xs font-bold text-blue-700 transition hover:bg-blue-100 disabled:opacity-60 cursor-pointer"
                      >
                        {reauthBusy ? (
                          <><Loader2 size={14} className="animate-spin" /> Resending…</>
                        ) : (
                          <><RefreshCw size={14} /> Resend verification code</>
                        )}
                      </motion.button>
                    ) : (
                      <motion.p
                        key="reauth-countdown"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-xs text-gray-400 font-medium"
                      >
                        Resend available in{' '}
                        <span className="font-bold tabular-nums text-gray-600">
                          0:{String(reauthSeconds).padStart(2, '0')}
                        </span>
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setReauthOtpSent(false)}
                    className="flex-1 rounded-xl border border-gray-300 bg-white py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 transition cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleVerifyReauthOtp}
                    disabled={reauthBusy}
                    className="flex-[2] flex items-center justify-center gap-2 rounded-xl bg-[#1a3a75] hover:bg-[#153470] py-3 text-sm font-bold text-white shadow-md transition-all duration-200 cursor-pointer disabled:opacity-60"
                  >
                    {reauthBusy ? <Loader2 size={16} className="animate-spin" /> : null}
                    Confirm & Register
                  </button>
                </div>
              </div>
            )}
            
            {/* Close modal button */}
            <button
              type="button"
              onClick={() => setReauthEmail('')}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer font-bold text-lg"
            >
              &times;
            </button>

          </div>
        </div>
      )}
    </div>
  );
};
