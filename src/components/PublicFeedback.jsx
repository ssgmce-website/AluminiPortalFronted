import { useState } from "react";
import { MessageSquareText, X, CheckCircle2, AlertCircle } from "lucide-react";
import { RecaptchaNotice } from "./Captcha";
import { getRecaptchaToken, RECAPTCHA_ACTIONS } from "../utils/recaptcha";
import api from "../services/api";

function FieldError({ message }) {
  if (!message) return null;
  return (
    <p className="mt-1 flex items-center gap-1 text-xs text-red-500 font-semibold animate-fade-in">
      <AlertCircle size={12} className="shrink-0" />
      <span>{message}</span>
    </p>
  );
}

function PublicFeedback() {
  const [isOpen, setIsOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState("bug");
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState("Good");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setErrors({});

    const newErrors = {};

    if (!message.trim()) {
      newErrors.message = "Please enter your message or feedback.";
    }

    if (!name.trim()) {
      newErrors.name = "Please enter your name.";
    }

    if (!email.trim()) {
      newErrors.email = "Please enter your email.";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      const captchaToken = await getRecaptchaToken(RECAPTCHA_ACTIONS.FEEDBACK);
      await api.post("/public/feedback", {
        feedbackType,
        message,
        rating,
        name: name.trim(),
        email: email.trim(),
        captchaToken,
        captchaAction: RECAPTCHA_ACTIONS.FEEDBACK,
      });

      setIsSubmitted(true);
      setTimeout(() => {
        // Reset form and close modal
        setIsOpen(false);
        setIsSubmitted(false);
        setMessage("");
        setName("");
        setEmail("");
        setFeedbackType("bug");
        setRating("Good");
        setErrors({});
      }, 2500);
    } catch (err) {
      console.error("[PublicFeedback] submit error:", err);
      const errMsg = err?.response?.data?.message || err?.message || "Failed to submit feedback.";
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-3 right-3 z-50 inline-flex items-center gap-2 rounded-md bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-950/20 transition hover:bg-blue-800 sm:bottom-4 sm:right-4 sm:px-5 sm:py-3 cursor-pointer"
        aria-label="Open feedback form"
      >
        <MessageSquareText size={17} />
        <span>Feedback</span>
      </button>

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">Feedback / Support</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition p-1 hover:bg-slate-50 rounded"
                disabled={isLoading}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-sm leading-relaxed text-slate-700">
              {isSubmitted ? (
                <div className="flex flex-col items-center justify-center py-10 space-y-3">
                  <CheckCircle2 className="h-16 w-16 text-[#48bb78] animate-bounce" />
                  <h4 className="text-lg font-bold text-slate-800">Feedback Posted Successfully!</h4>
                  <p className="text-slate-500 text-center">Thank you for sharing your thoughts with us.</p>
                </div>
              ) : (
                <>
                  {/* Informational Text */}
                  <p className="text-xs text-slate-600 leading-normal bg-slate-50 p-3 rounded border border-slate-100">
                    Use this form to report bugs, request help, share ideas, or give a compliment. Your feedback goes directly to the portal support team. To contact the Shri Sant Gajanan Maharaj College of Engineering Admin, please use the <strong className="text-slate-900">'Contact Us'</strong> option.
                  </p>

                  {/* Feedback Type (Radio Group 1) */}
                  <div className="flex flex-wrap gap-x-5 gap-y-2">
                    {[
                      { value: "bug", label: "Report Bug" },
                      { value: "help", label: "Request Help" },
                      { value: "idea", label: "Suggest Ideas" },
                      { value: "compliment", label: "Compliment" }
                    ].map((item) => (
                      <label key={item.value} className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                        <input
                          type="radio"
                          name="feedbackType"
                          value={item.value}
                          checked={feedbackType === item.value}
                          onChange={() => setFeedbackType(item.value)}
                          className="h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          disabled={isLoading}
                        />
                        <span>{item.label}</span>
                      </label>
                    ))}
                  </div>

                  {/* Message Input */}
                  <div className="space-y-1">
                    <textarea
                      rows={4}
                      value={message}
                      onChange={(e) => {
                        setMessage(e.target.value);
                        if (errors.message) {
                          setErrors((prev) => ({ ...prev, message: "" }));
                        }
                      }}
                      placeholder="Please write your detailed feedback here..."
                      className={`w-full rounded border px-3 py-2 text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition ${
                        errors.message
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                          : "border-slate-300"
                      }`}
                      required
                      disabled={isLoading}
                    />
                    <FieldError message={errors.message} />
                  </div>

                  {/* Rating Selector (Radio Group 2) */}
                  <div className="space-y-2">
                    <p className="font-semibold text-slate-800">How do you feel about the site?</p>
                    <div className="flex flex-wrap gap-x-5 gap-y-2">
                      {["Bad", "Can Improve", "Good", "Very Good", "Excellent"].map((opt) => (
                        <label key={opt} className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                          <input
                            type="radio"
                            name="rating"
                            value={opt}
                            checked={rating === opt}
                            onChange={() => setRating(opt)}
                            className="h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            disabled={isLoading}
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Contact Info Heading */}
                  <div className="space-y-3">
                    <p className="text-xs font-medium text-slate-500">
                      Please provide your name & email (required).
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="flex flex-col">
                        <input
                          type="text"
                          placeholder="Name *"
                          value={name}
                          onChange={(e) => {
                            setName(e.target.value);
                            if (errors.name) {
                              setErrors((prev) => ({ ...prev, name: "" }));
                            }
                          }}
                          className={`w-full rounded border px-3 py-2 text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition ${
                            errors.name
                              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                              : "border-slate-300"
                          }`}
                          disabled={isLoading}
                          required
                        />
                        <FieldError message={errors.name} />
                      </div>
                      <div className="flex flex-col">
                        <input
                          type="email"
                          placeholder="Email *"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (errors.email) {
                              setErrors((prev) => ({ ...prev, email: "" }));
                            }
                          }}
                          className={`w-full rounded border px-3 py-2 text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition ${
                            errors.email
                              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                              : "border-slate-300"
                          }`}
                          disabled={isLoading}
                          required
                        />
                        <FieldError message={errors.email} />
                      </div>
                    </div>
                  </div>

                  {/* General Error Notification */}
                  {error && (
                    <div className="rounded border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-semibold text-red-600 flex items-start gap-2 animate-fade-in">
                      <AlertCircle size={15} className="mt-0.5 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <RecaptchaNotice />
                </>
              )}
            </div>

            {/* Footer */}
            {!isSubmitted && (
              <div className="px-6 py-4 border-t border-slate-100 flex justify-between items-center bg-slate-50">
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="px-6 py-2 rounded-full bg-[#48bb78] hover:bg-[#38a169] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-sm shadow transition cursor-pointer"
                >
                  {isLoading ? "Submitting..." : "Post Feedback"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default PublicFeedback;
