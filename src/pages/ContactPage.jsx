import { useState } from "react";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import PageShell from "../components/PageShell";
import FormField from "../components/FormField";
import { RecaptchaNotice } from "../components/Captcha";
import { getRecaptchaToken, RECAPTCHA_ACTIONS } from "../utils/recaptcha";
import api from "../services/api";

function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contactNo: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    setErrors({});

    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Please enter your name.";
    if (!formData.email.trim()) {
      newErrors.email = "Please enter your email.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }
    if (!formData.contactNo.trim()) newErrors.contactNo = "Please enter your contact number.";
    if (!formData.subject.trim()) newErrors.subject = "Please enter a subject.";
    if (!formData.message.trim()) newErrors.message = "Please enter your message.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      const captchaToken = await getRecaptchaToken(RECAPTCHA_ACTIONS.CONTACT_US);
      await api.post("/public/contact-us", {
        name: formData.name.trim(),
        email: formData.email.trim(),
        contactNo: formData.contactNo.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim(),
        captchaToken,
        captchaAction: RECAPTCHA_ACTIONS.CONTACT_US,
      });

      setSubmitted(true);
    } catch (err) {
      console.error("[ContactPage] submission error:", err);
      const errMsg = err?.response?.data?.message || err?.message || "Failed to send message. Please try again.";
      setServerError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: "",
      email: "",
      contactNo: "",
      subject: "",
      message: "",
    });
    setErrors({});
    setServerError("");
    setSubmitted(false);
  };

  return (
    <PageShell eyebrow="Contact" title="Contact Us">
      <p className="mb-6 text-sm text-slate-600">
        Please use the form below to contact us
      </p>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Contact info */}
        <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-6 text-sm leading-8 text-slate-700 shadow-sm h-fit">
          <p className="mb-1 text-base font-extrabold text-blue-900">
            SSGMCE Alumni Connect
          </p>
          <p>Shri Sant Gajanan Maharaj College of Engineering, Shegaon</p>
          <p>Buldhana, Maharashtra – 444203</p>
          <p className="mt-3">
            <span className="font-semibold text-blue-800">Email:</span>{" "}
            <a
              href="mailto:alumni@ssgmce.ac.in"
              className="text-blue-700 hover:underline"
            >
              alumni@ssgmce.ac.in
            </a>
          </p>
          <p>
            <span className="font-semibold text-blue-800">Phone Number:</span> +91 9420834621
          </p>
          <p>
            <span className="font-semibold text-blue-800">Alt.Number:</span> +91 9545956114
          </p>
        </div>

        {/* Contact form */}
        {submitted ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50/70 p-8 text-center space-y-4 shadow-sm">
            <CheckCircle2 className="h-14 w-14 text-emerald-600 animate-bounce" />
            <h3 className="text-lg font-bold text-emerald-900">Message Sent Successfully!</h3>
            <p className="text-sm text-emerald-700 max-w-md">
              Thank you for contacting us. Your message has been sent to the SSGMCE admin team. We will get back to you shortly!
            </p>
            <button
              onClick={handleReset}
              className="mt-2 rounded-xl bg-blue-700 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-800 transition cursor-pointer"
            >
              Send Another Message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            {serverError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0 text-rose-600" />
                <span>{serverError}</span>
              </div>
            )}

            <FormField
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              disabled={loading}
              required
            />
            <FormField
              label="Personal Email ID"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              disabled={loading}
              required
            />
            <FormField
              label="Contact No."
              name="contactNo"
              type="tel"
              value={formData.contactNo}
              onChange={handleChange}
              error={errors.contactNo}
              disabled={loading}
              required
            />
            <FormField
              label="Subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              error={errors.subject}
              disabled={loading}
              required
            />
            <FormField
              label="Message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              error={errors.message}
              disabled={loading}
              required
              textarea
            />

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-700 px-8 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-blue-800 active:bg-blue-900 disabled:bg-slate-300 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Sending...
                </>
              ) : (
                "SUBMIT"
              )}
            </button>

            <RecaptchaNotice />
          </form>
        )}
      </div>
    </PageShell>
  );
}

export default ContactPage;
