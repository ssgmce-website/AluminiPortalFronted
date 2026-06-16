import { useState } from "react";
import PageShell from "../components/PageShell";

const inputCls =
  "mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600";

const labelCls = "block text-sm font-semibold text-slate-700";

function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <PageShell eyebrow="Contact" title="Contact Us">
      <p className="mb-6 text-sm text-slate-600">
        Please use the form below to contact us
      </p>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Contact info */}
        <div className="rounded-lg border border-blue-100 bg-blue-50 p-6 text-sm leading-8 text-slate-700">
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
            <span className="font-semibold text-blue-800">Phone:</span> +91
            72620 00000
          </p>
        </div>

        {/* Contact form */}
        {submitted ? (
          <div className="flex items-center justify-center rounded-lg border border-green-200 bg-green-50 p-8">
            <p className="text-center text-sm font-semibold text-green-700">
              Thank you for contacting us! We will get back to you shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className={labelCls}>
                Name <span className="text-red-600">*</span>
              </span>
              <input type="text" required className={inputCls} />
            </label>

            <label className="block">
              <span className={labelCls}>
                Personal Email ID <span className="text-red-600">*</span>
              </span>
              <input type="email" required className={inputCls} />
            </label>

            <label className="block">
              <span className={labelCls}>
                Contact No. <span className="text-red-600">*</span>
              </span>
              <input type="tel" required className={inputCls} />
            </label>

            <label className="block">
              <span className={labelCls}>
                Subject <span className="text-red-600">*</span>
              </span>
              <input type="text" required className={inputCls} />
            </label>

            <label className="block">
              <span className={labelCls}>
                Message <span className="text-red-600">*</span>
              </span>
              <textarea
                rows={4}
                required
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </label>

            <button
              type="submit"
              className="rounded-md bg-blue-700 px-8 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-blue-800 active:bg-blue-900"
            >
              Submit
            </button>
          </form>
        )}
      </div>
    </PageShell>
  );
}

export default ContactPage;
