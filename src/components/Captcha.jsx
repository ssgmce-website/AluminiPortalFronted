/**
 * reCAPTCHA v3 is invisible — no checkbox / text puzzle UI.
 *
 * Forms should call getRecaptchaToken(action) on submit and send:
 *   { captchaToken, captchaAction }
 *
 * This file re-exports helpers so existing imports stay discoverable.
 * Optional privacy notice for Google's badge (if you hide .grecaptcha-badge).
 */

export {
  getRecaptchaToken,
  loadRecaptcha,
  isRecaptchaConfigured,
  RECAPTCHA_ACTIONS,
} from '../utils/recaptcha';

/**
 * Small privacy notice. Use if you hide the reCAPTCHA badge via CSS
 * (Google requires this text when the badge is hidden).
 */
export function RecaptchaNotice({ className = '' }) {
  return (
    <p className={`text-[10px] leading-snug text-slate-400 ${className}`.trim()}>
      This site is protected by reCAPTCHA and the Google{' '}
      <a
        href="https://policies.google.com/privacy"
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:text-slate-600"
      >
        Privacy Policy
      </a>{' '}
      and{' '}
      <a
        href="https://policies.google.com/terms"
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:text-slate-600"
      >
        Terms of Service
      </a>{' '}
      apply.
    </p>
  );
}

export default RecaptchaNotice;
