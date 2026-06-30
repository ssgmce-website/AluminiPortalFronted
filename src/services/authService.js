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
const INTENT_KEY           = 'authIntent';        // 'login' | 'register'
const REG_DETAILS_KEY      = 'registrationDetails';

// ── Intent + registration details (survive OAuth/email-link round trips) ─────────
// Google popup completes in-page, but LinkedIn and email-link leave the page, so
// we stash what the user was doing (and the details they entered) before leaving
// and read it back in AuthCallback.

export const setAuthIntent = (intent, details = null) => {
  window.localStorage.setItem(INTENT_KEY, intent);
  if (details) window.localStorage.setItem(REG_DETAILS_KEY, JSON.stringify(details));
  else window.localStorage.removeItem(REG_DETAILS_KEY);
};

export const getAuthIntent = () => window.localStorage.getItem(INTENT_KEY) || 'login';

export const getRegistrationDetails = () => {
  try {
    return JSON.parse(window.localStorage.getItem(REG_DETAILS_KEY) || 'null');
  } catch {
    return null;
  }
};

export const clearAuthIntent = () => {
  window.localStorage.removeItem(INTENT_KEY);
  window.localStorage.removeItem(REG_DETAILS_KEY);
};

// ── Backend calls ────────────────────────────────────────────────────────────────

// LOGIN: resolve the existing account. Throws (404) if the email isn't registered.
export const loginWithBackend = () => api.post('/auth/sync').then((r) => r.data);

// UPDATE PROFILE: patch editable fields on an approved account.
export const updateProfile = (data) => api.put('/user/profile', data).then((r) => r.data);

// REGISTER: create a pending account from the verified email + alumni details.
export const registerWithBackend = (details) =>
  api.post('/auth/register', details).then((r) => r.data);

// Is this email already registered? Used before sending an email sign-in link.
export const checkEmailRegistered = (email) =>
  api.post('/auth/check-email', { email }).then((r) => r.data);

// ── Email OTP (Firebase passwordless email link) ───────────────────────────────

// Where Firebase sends the user back to after they click the email link.
const actionCodeSettings = () => ({
  url: `${window.location.origin}/auth/callback`,
  handleCodeInApp: true,
});

/**
 * Ask the backend to rate-limit-check (max 3/hour), then have Firebase email a
 * one-time sign-in link. The caller is responsible for setting the auth intent
 * (login/register) beforehand. We stash the email so we can complete sign-in
 * when the user returns via the link.
 */
export const requestEmailOtp = async (email) => {
  const { data } = await api.post('/auth/otp/request', { email });
  await sendSignInLinkToEmail(auth, email, actionCodeSettings());
  window.localStorage.setItem(EMAIL_FOR_SIGNIN_KEY, email);
  return data; // { success, remaining }
};

/** True if the current URL is a Firebase email sign-in link. */
export const isEmailLink = () => isSignInWithEmailLink(auth, window.location.href);

/**
 * Complete the Firebase sign-in from an email link. This ONLY authenticates with
 * Firebase — the caller then decides whether to register or log in. If the email
 * isn't in localStorage (link opened on another device), the caller supplies it.
 */
export const completeEmailLink = async (fallbackEmail) => {
  const email = window.localStorage.getItem(EMAIL_FOR_SIGNIN_KEY) || fallbackEmail;
  if (!email) {
    const err = new Error('missing-email');
    err.code = 'auth/missing-email';
    throw err;
  }
  await signInWithEmailLink(auth, email, window.location.href);
  window.localStorage.removeItem(EMAIL_FOR_SIGNIN_KEY);
};

// ── Google (Firebase popup, redirect fallback) ──────────────────────────────────

/**
 * Authenticate the email with Google via popup, falling back to a full-page
 * redirect when the popup is blocked. Returns true when the popup completed
 * in-page, or null when a redirect was triggered (AuthCallback finishes it).
 * Does NOT touch the backend — the caller calls register/login next.
 */
export const googleAuth = async () => {
  try {
    await signInWithPopup(auth, googleProvider);
    return true;
  } catch (err) {
    const redirectFallbackCodes = [
      'auth/popup-blocked',
      'auth/cancelled-popup-request',
      'auth/operation-not-supported-in-this-environment',
    ];
    if (redirectFallbackCodes.includes(err.code)) {
      await signInWithRedirect(auth, googleProvider);
      return null;
    }
    throw err; // includes auth/popup-closed-by-user
  }
};

// ── LinkedIn (backend OAuth → Firebase custom token) ────────────────────────────

// Full-page redirect to the backend, which authenticates the email and bounces
// back to /auth/callback?customToken=... The caller sets the intent first.
export const linkedInRedirect = () => {
  window.location.href = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/v1/auth/linkedin`;
};

// ── Session ──────────────────────────────────────────────────────────────────

export const logout = () => {
  clearAuthIntent();
  return signOut(auth);
};
