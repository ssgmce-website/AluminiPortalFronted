import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { signInWithCustomToken, getRedirectResult } from 'firebase/auth';
import { Loader2, AlertTriangle, Mail } from 'lucide-react';
import { auth } from '../firebase/firebase';
import { useAuth } from '../contexts/AuthContext';
import {
  isEmailLink,
  completeEmailLink,
  getAuthIntent,
  getRegistrationDetails,
  clearAuthIntent,
  registerWithBackend,
  loginWithBackend,
  logout,
  checkEmailRegistered,
} from '../services/authService';
import { friendlyAuthError } from '../utils/authErrors';
import { routeForProfile } from '../utils/authRoutes';

export const AuthCallback = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { setUserProfile } = useAuth();
  const [status, setStatus] = useState('Completing registration…');
  const [error, setError] = useState('');
  const [retrying, setRetrying] = useState(false);
  const [needEmail, setNeedEmail] = useState(false); // email-link opened on another device
  const [emailInput, setEmailInput] = useState('');

  const finish = (profile) => {
    setUserProfile(profile);
    navigate(routeForProfile(profile), { replace: true });
  };

  // Firebase auth is now established. Either register (with the stashed details)
  // or log in, depending on what the user was doing before they left the page.
  const completeBackend = async () => {
    const intent = getAuthIntent();

    if (intent === 'register') {
      const details = getRegistrationDetails();
      if (!details) {
        // Verification-first flow: the user verified their email, now check if they already exist
        setStatus('Checking account status…');
        try {
          const email = auth.currentUser?.email;
          if (!email) {
            throw new Error('Email not found in auth provider.');
          }
          const { exists, status: alumniStatus } = await checkEmailRegistered(email);
          if (exists) {
            clearAuthIntent();
            await logout();
            navigate(alumniStatus === 'approved' ? '/login?error=already_registered' : '/pending', { replace: true });
            return;
          }
          // Not registered yet. Redirect to /register to fill details.
          navigate('/register', { replace: true });
        } catch (err) {
          clearAuthIntent();
          await logout();
          navigate('/register?error=verification_failed', { replace: true });
        }
        return;
      }

      const verifiedEmail = auth.currentUser?.email;
      if (verifiedEmail && verifiedEmail.toLowerCase().trim() !== details.email.toLowerCase().trim()) {
        clearAuthIntent();
        await logout();
        navigate(`/register?error=${encodeURIComponent(`The verified email (${verifiedEmail}) does not match the email entered in the registration form (${details.email}).`)}`, { replace: true });
        return;
      }

      setStatus('Submitting your registration…');
      try {
        const { user } = await registerWithBackend(details);
        clearAuthIntent();
        finish(user);
      } catch (err) {
        if (err?.response?.status === 409) {
          // Already registered — send them to login (or pending).
          clearAuthIntent();
          const st = err.response.data?.status;
          navigate(st === 'approved' ? '/login?error=already_registered' : '/pending', { replace: true });
          return;
        }
        throw err;
      }
      return;
    }

    // Login
    setStatus('Loading your profile…');
    try {
      const { user } = await loginWithBackend();
      clearAuthIntent();
      finish(user);
    } catch (err) {
      if (err?.response?.status === 404) {
        clearAuthIntent();
        await logout(); // sign the unregistered user back out of Firebase
        navigate('/login?error=not_registered', { replace: true });
        return;
      }
      throw err;
    }
  };

  const handle = async (fallbackEmail) => {
    setError('');
    setRetrying(false);

    // OAuth error bounced back from the backend (e.g. LinkedIn).
    const oauthError = params.get('error');
    if (oauthError) {
      navigate(`/login?error=${encodeURIComponent(oauthError)}`, { replace: true });
      return;
    }

    try {
      // 1) LinkedIn — backend minted a Firebase custom token
      const customToken = params.get('customToken');
      if (customToken) {
        setStatus('Verifying with LinkedIn…');
        await signInWithCustomToken(auth, customToken);
        await completeBackend();
        return;
      }

      // 2) Email OTP — this URL is a Firebase passwordless email link
      if (isEmailLink()) {
        setStatus('Verifying your email link…');
        await completeEmailLink(fallbackEmail);
        await completeBackend();
        return;
      }

      // 3) Google — returning from a signInWithRedirect fallback
      setStatus('Completing Google registration…');
      const result = await getRedirectResult(auth);
      if (result?.user) {
        await completeBackend();
        return;
      }

      // Nothing to complete here — go back to login.
      navigate('/login', { replace: true });
    } catch (err) {
      if (err?.code === 'auth/missing-email') {
        // The link was opened on a different device/browser; ask for the email.
        setNeedEmail(true);
        setStatus('');
        return;
      }
      console.error('[AuthCallback] Registration failed:', err?.code || err?.message, err);
      setError(friendlyAuthError(err));
      setStatus('');
    }
  };

  useEffect(() => {
    handle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Ask for the email when an email link was opened on a different device.
  if (needEmail) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 flex flex-col items-center justify-center text-white gap-5 p-4">
        <Mail size={40} className="text-primary-200" />
        <h2 className="text-xl font-bold">Confirm your email</h2>
        <p className="text-sm text-primary-200 max-w-sm text-center">
          For your security, please re-enter the email address you requested the registration code .
        </p>
        <form
          onSubmit={(e) => { e.preventDefault(); setNeedEmail(false); setStatus('Verifying…'); handle(emailInput); }}
          className="flex flex-col gap-3 w-full max-w-xs"
        >
          <input
            type="email"
            required
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            placeholder="you@example.com"
            className="rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
          />
          <button type="submit" className="bg-white text-primary-800 font-semibold px-5 py-2.5 rounded-lg text-sm hover:bg-primary-50 transition-colors">
            Continue
          </button>
        </form>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 flex flex-col items-center justify-center text-white gap-6 p-4">
        <AlertTriangle size={40} className="text-yellow-300" />
        <h2 className="text-xl font-bold">Registration failed</h2>
        <p className="text-sm text-primary-200 max-w-sm text-center break-all">{error}</p>
        <div className="flex gap-3 mt-2">
          <button
            onClick={() => { setStatus('Retrying…'); setRetrying(true); handle(); }}
            disabled={retrying}
            className="bg-white text-primary-800 font-semibold px-5 py-2 rounded-lg text-sm hover:bg-primary-50 transition-colors disabled:opacity-60"
          >
            {retrying ? 'Retrying…' : 'Retry'}
          </button>
          <button
            onClick={() => navigate('/signin')}
            className="border border-white text-white font-semibold px-5 py-2 rounded-lg text-sm hover:bg-white/10 transition-colors"
          >
            Back to Register
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 flex flex-col items-center justify-center text-white gap-4">
      <Loader2 size={36} className="animate-spin" />
      <p className="text-lg font-medium">{status}</p>
    </div>
  );
};
