// Single source of truth for turning auth failures (Firebase codes, backend
// axios errors, or LinkedIn URL ?error= codes) into friendly, actionable text.
export const friendlyAuthError = (err) => {
  // Backend (axios) error — e.g. OTP rate limit (429), linking conflict (409)
  if (err?.response?.data?.message) return err.response.data.message;

  // Accept either an Error-with-code, or a raw string code (from URL ?error=)
  const code = typeof err === 'string' ? err : err?.code;

  switch (code) {
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a while and try again.';

    // ── Email OTP (passwordless code────────────────────────────────
    case 'auth/invalid-action-code':
      return 'This registration code invalid or has already been used. Please request a new one.';
    case 'auth/expired-action-code':
      return 'This registration code expired. Please request a new one.';
    case 'auth/missing-email':
      return 'Please enter the email address you requested the registration code for.';
    case 'auth/operation-not-allowed':
      return 'Email-code verification isn’t enabled yet. Please contact the portal administrator.';

    // ── Google popup / redirect ───────────────────────────────────────
    case 'auth/popup-closed-by-user':
      return 'You closed the Google registration window before finishing. Please try again.';
    case 'auth/popup-blocked':
      return 'Your browser blocked the registration popup, so we’re redirecting you instead…';
    case 'auth/cancelled-popup-request':
      return 'Another registration is already in progress.';
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with this email using a different registration method. Please log in with that method first, then link this one from your profile.';

    // ── LinkedIn (codes arrive via the URL ?error= param) ─────────────
    case 'linkedin_cancelled':
    case 'user_cancelled_login':
    case 'user_cancelled_authorize':
      return 'LinkedIn registration was cancelled.';
    case 'linkedin_no_email':
      return 'LinkedIn didn’t share an email for your account. Please use another registration method.';

    // ── Admin-approved registration ──────────────────────────────────
    case 'not_registered':
      return 'This email is not registered. Please register first.';
    case 'already_registered':
      return 'This email is already registered. Please log in instead.';
    case 'missing_details':
      return 'Your registration details were lost. Please fill the form again.';

    // ── Network / session ─────────────────────────────────────────────
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.';
    case 'auth/user-token-expired':
    case 'auth/user-disabled':
      return 'Your session is no longer valid. Please log in again.';
    case 'auth/requires-recent-login':
      return 'For security reasons, this action requires a recent registration session. Please re-authenticate or register again.';

    default:
      if (typeof code === 'string' && code) return `Registration failed: ${code}`;
      return 'Something went wrong. Please try again.';
  }
};
