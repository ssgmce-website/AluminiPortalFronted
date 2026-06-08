import {
  signInWithPopup,
  signInWithRedirect,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signOut,
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase/firebase';
import api from './api';

const EMAIL_FOR_SIGNIN_KEY = 'emailForSignIn';

const syncWithBackend = async () => {
  const { data } = await api.post('/auth/sync');
  return data.user;
};

// ── Email OTP (Firebase passwordless email link) ───────────────────────────────

// Where Firebase sends the user back to after they click the email link.
const actionCodeSettings = () => ({
  url: `${window.location.origin}/auth/callback`,
  handleCodeInApp: true,
});

/**
 * Step 1 of email OTP: ask the backend to rate-limit-check (max 3/hour), then
 * have Firebase email a one-time sign-in link. We stash the email locally so we
 * can complete sign-in when the user returns via the link.
 */
export const requestEmailOtp = async (email) => {
  // Backend rate-limit gate — throws (429) with a friendly message if exceeded.
  const { data } = await api.post('/auth/otp/request', { email });
  await sendSignInLinkToEmail(auth, email, actionCodeSettings());
  window.localStorage.setItem(EMAIL_FOR_SIGNIN_KEY, email);
  return data; // { success, remaining }
};

/** True if the current URL is a Firebase email sign-in link. */
export const isEmailLink = () => isSignInWithEmailLink(auth, window.location.href);

/**
 * Step 2 of email OTP: complete sign-in from the email link. If the email isn't
 * in localStorage (e.g. link opened on a different device), the caller supplies it.
 */
export const completeEmailLink = async (fallbackEmail) => {
  let email = window.localStorage.getItem(EMAIL_FOR_SIGNIN_KEY) || fallbackEmail;
  if (!email) {
    const err = new Error('missing-email');
    err.code = 'auth/missing-email';
    throw err;
  }
  await signInWithEmailLink(auth, email, window.location.href);
  window.localStorage.removeItem(EMAIL_FOR_SIGNIN_KEY);
  return syncWithBackend();
};

// ── Google ─────────────────────────────────────────────────────────────────────

/**
 * Google sign-in via popup, falling back to a full-page redirect when the popup
 * is blocked or not supported. On redirect, completion happens in AuthCallback
 * via getRedirectResult.
 */
export const loginWithGoogle = async () => {
  try {
    await signInWithPopup(auth, googleProvider);
    return syncWithBackend();
  } catch (err) {
    // Only fall back to a full-page redirect when the popup couldn't be used.
    // If the user DELIBERATELY closed it, respect that and surface the error
    // instead of yanking them away to a redirect.
    const redirectFallbackCodes = [
      'auth/popup-blocked',
      'auth/cancelled-popup-request',
      'auth/operation-not-supported-in-this-environment',
    ];
    if (redirectFallbackCodes.includes(err.code)) {
      await signInWithRedirect(auth, googleProvider);
      return null; // completion continues after redirect in AuthCallback
    }
    throw err; // includes auth/popup-closed-by-user and account-exists-with-different-credential
  }
};

// ── LinkedIn (backend OAuth → custom token) ─────────────────────────────────────

export const loginWithLinkedIn = () => {
  window.location.href = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/v1/auth/linkedin`;
};

// ── Session ──────────────────────────────────────────────────────────────────

export const logout = () => signOut(auth);
