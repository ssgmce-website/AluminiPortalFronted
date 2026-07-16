import { useState } from "react";
import { MessageSquareText, X, CheckCircle2 } from "lucide-react";

function PublicFeedback() {
  const [isOpen, setIsOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState("bug");
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState("Good");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [recaptchaChecked, setRecaptchaChecked] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!message.trim()) {
      setError("Please enter your message or feedback.");
      return;
    }

    if (email.trim() && !/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!recaptchaChecked) {
      setError("Please check the 'I'm not a robot' box.");
      return;
    }

    // Simulate API Submission
    setIsSubmitted(true);
    setTimeout(() => {
      // Reset form and close modal
      setIsOpen(false);
      setIsSubmitted(false);
      setMessage("");
      setName("");
      setEmail("");
      setRecaptchaChecked(false);
      setFeedbackType("bug");
      setRating("Good");
    }, 2500);
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
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Please write your detailed feedback here..."
                      className="w-full rounded border border-slate-300 px-3 py-2 text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                      required
                    />
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
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Contact Info Heading */}
                  <div className="space-y-3">
                    <p className="text-xs font-medium text-slate-500">
                      Please drop in your name & email, in case you would like us to get back to you.
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <input
                        type="text"
                        placeholder="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full rounded border border-slate-300 px-3 py-2 text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                      />
                      <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded border border-slate-300 px-3 py-2 text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                      />
                    </div>
                  </div>

                  {/* Google reCAPTCHA Simulation Box */}
                  <div className="flex items-center justify-between rounded border border-[#d3d3d3] bg-[#f9f9f9] p-3 max-w-[300px] shadow-sm select-none">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={recaptchaChecked}
                        onChange={(e) => setRecaptchaChecked(e.target.checked)}
                        className="h-6 w-6 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <span className="text-xs font-semibold text-slate-700">I'm not a robot</span>
                    </label>
                    <div className="flex flex-col items-center">
                      <img
                        src="https://www.gstatic.com/recaptcha/api2/logo_48.png"
                        alt="reCAPTCHA"
                        className="h-8 w-8 object-contain"
                      />
                      <span className="text-[8px] text-slate-500 mt-0.5">reCAPTCHA</span>
                      <div className="flex gap-1 text-[8px] text-slate-400">
                        <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="hover:underline">Privacy</a>
                        <span>•</span>
                        <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="hover:underline">Terms</a>
                      </div>
                    </div>
                  </div>

                  {/* Error Notification */}
                  {error && (
                    <div className="rounded border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-semibold text-red-600">
                      {error}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            {!isSubmitted && (
              <div className="px-6 py-4 border-t border-slate-100 flex justify-between items-center bg-slate-50">
                <button
                  onClick={handleSubmit}
                  className="px-6 py-2 rounded-full bg-[#48bb78] hover:bg-[#38a169] text-white font-bold text-sm shadow transition cursor-pointer"
                >
                  Post Feedback
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
