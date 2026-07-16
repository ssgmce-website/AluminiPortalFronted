import ReCAPTCHA from "react-google-recaptcha";

function Captcha({ onVerify }) {
  return (
    <ReCAPTCHA
      sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
      onChange={onVerify}
    />
  );
}

export default Captcha;