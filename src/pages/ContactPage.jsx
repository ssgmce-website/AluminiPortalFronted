import { useState } from "react";
import PageShell from "../components/PageShell";
import FormField from "../components/FormField";

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
            <span className="font-semibold text-blue-800">Phone Number:</span> +91
            9420834621
          </p>
          <p>
            <span className="font-semibold text-blue-800">Alt.Number:</span> +91
            9545956114
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
            <FormField label="Name" required />
            <FormField label="Personal Email ID" required type="email" />
            <FormField label="Contact No." required type="tel" />
            <FormField label="Subject" required />
            <FormField label="Message" required textarea />

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
