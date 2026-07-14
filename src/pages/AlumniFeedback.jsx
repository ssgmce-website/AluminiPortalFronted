import { useState } from "react";
import { RotateCcw, Send } from "lucide-react";
import PageShell from "../components/PageShell";
import FormField from "../components/FormField";
import logo from "../assets/logo.png";

const awarenessOptions = [
  "WhatsApp Communication / SMS",
  "College Website",
  "Telephonic talk",
  "E-mail",
  "Alumni Portal",
];

const ratingScale = [
  { value: "1", label: "Need Improvement" },
  { value: "2", label: "Average" },
  { value: "3", label: "Good" },
  { value: "4", label: "Very Good" },
  { value: "5", label: "Excellent" },
];

const statements = [
  "Information regarding the Alumni Meet was communicated well in advance.",
  "The date, time, and venue of the Alumni Meet were convenient.",
  "Hospitality provided by the College during the Meet.",
  "The Alumni Meet facilitated meaningful interaction with faculty, staff and students.",
  "The activities conducted during the Meet were relevant and well-organized.",
  "Overall, the Alumni Meet 2026 met my expectations.",
];

const contributionAreas = [
  "Scholarship",
  "Placement",
  "Internship",
  "Project Guidance",
  "Library books / E-books",
  "Software (Campus License) / Hardware Support",
  "Academic Interface / International University Tie-ups",
  "Technical Competition / Exhibitions / National / International Paper Contest",
  "Industrial Visit Support",
  "Entrepreneurship Support",
  "Mentoring",
  "Faculty Development",
  "R&D Support / Product / Lab Development",
  "Skill-Based / IT Certification Support",
  "Guest Lecture / Invited Talks",
  "Student Enrichment Activities",
];

function CheckOption({ name, label }) {
  return (
    <label className="flex min-h-10 items-start gap-3 text-sm font-medium text-slate-700">
      <input
        type="checkbox"
        name={name}
        value={label}
        className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 text-blue-700 focus:ring-blue-600"
      />
      <span>{label}</span>
    </label>
  );
}

function AlumniFeedback() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    setSubmitted(true);
    event.currentTarget.reset();
  }

  return (
    <PageShell eyebrow="Alumni Meet" title="Appeal / Feedback Form">
      <form onSubmit={handleSubmit} className="mx-auto max-w-6xl">
        <div className="grid gap-5 border-b border-slate-200 pb-6 md:grid-cols-[auto_1fr_auto] md:items-center">
          <img
            src={logo}
            alt="SSGMCE logo"
            className="h-20 w-20 object-contain"
          />

          <div className="text-center md:px-4">
            <p className="text-sm font-extrabold uppercase tracking-wide text-red-700 sm:text-base">
              Shri Sant Gajanan Maharaj
            </p>
            <p className="text-sm font-extrabold uppercase tracking-wide text-red-700 sm:text-base">
              College of Engineering, Shegaon
            </p>
            <p className="mt-2 text-lg font-extrabold uppercase text-slate-900 sm:text-2xl">
              Grand Alumni Meet 2026
            </p>
            <p className="mt-1 text-sm font-semibold italic text-slate-600">
              Appeal / Feedback Form
            </p>
          </div>

          <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-amber-200 bg-amber-50 text-center text-xs font-black uppercase leading-tight text-amber-700 md:justify-self-end">
            A+<br />NAAC
          </div>
        </div>

        <div className="space-y-2 border-b border-slate-200 py-6 text-sm leading-7 text-slate-700">
          <p className="font-semibold text-slate-900">Dear Alumnus,</p>
          <p>
            Thank you for participating in the Alumni Meet. As a valued alumna
            or alumnus, your feedback is important to us. We request you to
            complete this form to help us improve and further strengthen our
            institution.
          </p>
        </div>

        <section className="border-b border-slate-200 py-6">
          <h3 className="text-base font-extrabold text-slate-900">
            Alumni Details
          </h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <FormField label="Name of Alumnus" name="alumnusName" required />
            <FormField
              label="Pass out Year"
              name="passoutYear"
              required
              type="number"
              min="1950"
              max="2030"
            />
            <FormField label="Branch" name="branch" required />
            <FormField label="Email" name="email" required type="email" />
            <FormField
              label="Name of Current Organization"
              name="organization"
              required
            />
            <FormField label="Designation" name="designation" required />
            <FormField label="Mobile No." name="mobile" required type="tel" />
          </div>
        </section>

        <section className="border-b border-slate-200 py-6">
          <h3 className="text-base font-extrabold text-slate-900">
            How did you come to know about this Alumni Meet?
          </h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {awarenessOptions.map((option) => (
              <CheckOption key={option} name="awareness" label={option} />
            ))}
          </div>
        </section>

        <section className="border-b border-slate-200 py-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Kindly indicate your level of agreement
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                Rate each statement from 1 to 5.
              </p>
            </div>
            <div className="grid gap-x-4 gap-y-1 text-xs font-semibold text-slate-600 sm:grid-cols-5">
              {ratingScale.map((item) => (
                <span key={item.value}>
                  {item.value}. {item.label}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[760px] border-separate border-spacing-y-2 text-left">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-slate-500">
                  <th className="w-16 px-3 py-2">S.N</th>
                  <th className="px-3 py-2">Statements</th>
                  <th className="w-44 px-3 py-2 text-center">Rating</th>
                </tr>
              </thead>
              <tbody>
                {statements.map((statement, index) => (
                  <tr key={statement}>
                    <td className="rounded-l-md bg-slate-100 px-3 py-3 text-center text-sm font-bold text-slate-700">
                      {index + 1}
                    </td>
                    <td className="bg-slate-100 px-3 py-3 text-sm font-medium text-slate-700">
                      {statement}
                    </td>
                    <td className="rounded-r-md bg-slate-100 px-3 py-3">
                      <select
                        name={`rating-${index + 1}`}
                        required
                        defaultValue=""
                        aria-label={`Rating for statement ${index + 1}`}
                        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-center text-sm font-bold text-slate-800 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                      >
                        <option value="" disabled>
                          Select
                        </option>
                        {ratingScale.map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.value}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="border-b border-slate-200 py-6">
          <h3 className="text-base font-extrabold text-slate-900">
            Please indicate the areas in which you can contribute to the
            Department / College
          </h3>
          <div className="mt-4 grid gap-x-8 gap-y-3 md:grid-cols-2 xl:grid-cols-3">
            {contributionAreas.map((area) => (
              <CheckOption key={area} name="contributionAreas" label={area} />
            ))}
          </div>
        </section>

        <section className="py-6">
          <div className="grid gap-4 lg:grid-cols-2">
            <FormField
              label="Any exclusive achievement / award / recognition in your professional career"
              name="achievement"
              textarea
            />
            <FormField label="Suggestions" name="suggestions" textarea />
          </div>
        </section>

        {submitted && (
          <div className="mb-5 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
            Thank you. Your alumni feedback has been recorded for review.
          </div>
        )}

        <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row">
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-700 px-7 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-blue-800 active:bg-blue-900"
          >
            <Send size={17} />
            Submit Feedback
          </button>
          <button
            type="reset"
            onClick={() => setSubmitted(false)}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 px-7 py-3 text-sm font-bold uppercase tracking-wide text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-800"
          >
            <RotateCcw size={17} />
            Reset
          </button>
        </div>
      </form>
    </PageShell>
  );
}

export default AlumniFeedback;
