/**
 * Google reCAPTCHA v3 helpers.
 *
 * Loads the official script once, then calls grecaptcha.execute(siteKey, { action })
 * to get a short-lived token for the backend to verify.
 *
 * Env: VITE_RECAPTCHA_SITE_KEY (v3 site key from Google Admin Console)
 */

const SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '';

/** Canonical action names — keep in sync with backend expectedAction checks. */
export const RECAPTCHA_ACTIONS = {
  LOGIN: 'login',
  ADMIN_LOGIN: 'admin_login',
  REGISTER: 'register',
  SEND_OTP: 'send_otp',
  CONTACT_US: 'contact_us',
  FEEDBACK: 'feedback',
};

let loadPromise = null;

/**
 * Load the reCAPTCHA v3 script (idempotent).
 * @returns {Promise<typeof window.grecaptcha>}
 */
export function loadRecaptcha() {
  if (!SITE_KEY) {
    return Promise.reject(
      new Error(
        'reCAPTCHA is not configured. Set VITE_RECAPTCHA_SITE_KEY in the frontend .env (v3 site key).'
      )
    );
  }

  if (typeof window !== 'undefined' && window.grecaptcha?.execute) {
    return new Promise((resolve) => {
      window.grecaptcha.ready(() => resolve(window.grecaptcha));
    });
  }

  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const finish = () => {
      if (!window.grecaptcha) {
        loadPromise = null;
        reject(new Error('reCAPTCHA failed to initialize.'));
        return;
      }
      window.grecaptcha.ready(() => resolve(window.grecaptcha));
    };

    const existing = document.querySelector('script[data-recaptcha-v3]');
    if (existing) {
      if (window.grecaptcha) {
        finish();
      } else {
        existing.addEventListener('load', finish, { once: true });
        existing.addEventListener(
          'error',
          () => {
            loadPromise = null;
            reject(new Error('Failed to load reCAPTCHA script.'));
          },
          { once: true }
        );
      }
      return;
    }

    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(SITE_KEY)}`;
    script.async = true;
    script.defer = true;
    script.dataset.recaptchaV3 = 'true';
    script.onload = finish;
    script.onerror = () => {
      loadPromise = null;
      reject(new Error('Failed to load reCAPTCHA script.'));
    };
    document.head.appendChild(script);
  });

  return loadPromise;
}

/**
 * Execute reCAPTCHA v3 for a named action and return the token.
 * Call this right before submitting a protected form.
 *
 * @param {string} action - e.g. 'login', 'send_otp', 'contact_us', 'feedback'
 * @returns {Promise<string>} captchaToken
 */
export async function getRecaptchaToken(action) {
  if (!action || typeof action !== 'string') {
    throw new Error('reCAPTCHA action is required.');
  }
  // Actions must be alphanumeric + underscores only (Google constraint)
  const safeAction = action.replace(/[^A-Za-z0-9_/]/g, '_');
  const grecaptcha = await loadRecaptcha();
  const token = await grecaptcha.execute(SITE_KEY, { action: safeAction });
  if (!token) {
    throw new Error('Failed to obtain reCAPTCHA token. Please try again.');
  }
  return token;
}

export function isRecaptchaConfigured() {
  return Boolean(SITE_KEY);
}
