import { useState, useEffect } from "react";
import { RotateCcw, Send, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { getCountryCallingCode } from "libphonenumber-js";
import PageShell from "../components/PageShell";
import FormField from "../components/FormField";
import logo from "../assets/logo.png";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";

const getFormattedPhone = (profile) => {
  if (!profile) return "";

  const nationalNumber =
    profile.profile?.nationalNumber || profile.nationalNumber;

  const countryCode =
    profile.profile?.countryCode || profile.countryCode;

  if (!nationalNumber) return "";

  try {
    const callingCode = getCountryCallingCode(countryCode.toUpperCase());
    return `+${callingCode} ${nationalNumber}`;
  } catch {
    return nationalNumber;
  }
};

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

const contributionAreasOptions = [
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

function AlumniFeedback() {
  const { userProfile } = useAuth();

  const [formData, setFormData] = useState({
    alumnusName: "",
    alumnusID: "",
    passoutYear: "",
    branch: "",
    email: "",
    organization: "",
    designation: "",
    mobile: "",
    achievement: "",
    suggestions: "",
  });

  const [awareness, setAwareness] = useState("");
  const [ratings, setRatings] = useState({
    q1: "",
    q2: "",
    q3: "",
    q4: "",
    q5: "",
    q6: "",
  });
  const [contributionAreas, setContributionAreas] = useState([]);

  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  // Pre-fill user details if logged in
  useEffect(() => {
    if (userProfile) {
      const status = userProfile.professional?.employmentStatus || userProfile.employmentStatus;

      let org = "";
      let desig = "";

      if (status === "Entrepreneur") {
        org = userProfile.startup?.startupName || userProfile.professional?.companyName || userProfile.startupName || userProfile.companyName || "";
        desig = userProfile.professional?.designation || "Founder / Entrepreneur";
      } else if (status === "Higher Studies") {
        org = userProfile.higherStudies?.universityName || userProfile.universityName || "";
        desig = userProfile.higherStudies?.higherStudiesCourse || userProfile.higherStudiesCourse || "";
      } else {
        // Employed or general fallback
        org = userProfile.professional?.companyName || userProfile.startup?.startupName || userProfile.higherStudies?.universityName || userProfile.companyName || "";
        desig = userProfile.professional?.designation || userProfile.higherStudies?.higherStudiesCourse || userProfile.designation || "";
      }

      setFormData((prev) => ({
        ...prev,
        alumnusName: userProfile.profile?.name || userProfile.name || prev.alumnusName,
        alumnusID: userProfile.alumniId || prev.alumnusID,
        passoutYear: userProfile.academic?.yearOfPassout || userProfile.yearOfPassout || prev.passoutYear,
        branch: userProfile.academic?.branch || userProfile.branch || prev.branch,
        email: userProfile.email || prev.email,
        organization: org || prev.organization,
        designation: desig || prev.designation,
        mobile: getFormattedPhone(userProfile) || prev.mobile,
      }));
    }
  }, [userProfile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleAwarenessSelect = (option) => {
    setAwareness(option);
    if (fieldErrors.awareness) {
      setFieldErrors((prev) => ({ ...prev, awareness: "" }));
    }
  };

  const handleContributionToggle = (option) => {
    setContributionAreas((prev) =>
      prev.includes(option) ? prev.filter((item) => item !== option) : [...prev, option]
    );
  };

  const handleRatingChange = (qKey, value) => {
    setRatings((prev) => ({ ...prev, [qKey]: value }));
    if (fieldErrors.ratings?.[qKey] || fieldErrors.ratingsGeneral) {
      setFieldErrors((prev) => ({
        ...prev,
        ratings: { ...prev.ratings, [qKey]: "" },
        ratingsGeneral: "",
      }));
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setError("");
    setFieldErrors({});
    setAwareness("");
    setContributionAreas([]);
    setRatings({ q1: "", q2: "", q3: "", q4: "", q5: "", q6: "" });
    if (!userProfile) {
      setFormData({
        alumnusName: "",
        alumnusID: "",
        passoutYear: "",
        branch: "",
        email: "",
        organization: "",
        designation: "",
        mobile: "",
        achievement: "",
        suggestions: "",
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        achievement: "",
        suggestions: "",
      }));
    }
  };

  async function handleSubmit(event) {
    event.preventDefault();

    const errors = {};

    if (!formData.alumnusName?.trim()) {
      errors.alumnusName = "Name of alumnus is required.";
    }
    if (!formData.passoutYear) {
      errors.passoutYear = "Pass out year is required.";
    } else if (Number(formData.passoutYear) < 1950 || Number(formData.passoutYear) > new Date().getFullYear() + 6) {
      errors.passoutYear = "Enter a valid pass out year.";
    }
    if (!formData.branch?.trim()) {
      errors.branch = "Branch is required.";
    }
    if (!formData.email?.trim()) {
      errors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Enter a valid email address.";
    }

    const empStatus = userProfile?.professional?.employmentStatus || userProfile?.employmentStatus;
    if (!formData.organization?.trim()) {
      errors.organization = empStatus === "Higher Studies"
        ? "University name is required."
        : empStatus === "Entrepreneur"
          ? "Company / Startup name is required."
          : "Organization name is required.";
    }
    if (!formData.designation?.trim()) {
      errors.designation = empStatus === "Higher Studies"
        ? "Course / Specialization is required."
        : "Designation is required.";
    }
    if (!formData.mobile?.trim()) {
      errors.mobile = "Mobile number is required.";
    }

    if (!awareness) {
      errors.awareness = "Please select how you came to know about this Alumni Meet.";
    }

    const missingRatings = {};
    ["q1", "q2", "q3", "q4", "q5", "q6"].forEach((qKey) => {
      if (!ratings[qKey]) {
        missingRatings[qKey] = "Required";
      }
    });

    if (Object.keys(missingRatings).length > 0) {
      errors.ratings = missingRatings;
      errors.ratingsGeneral = "Please select a rating level (1 to 5) for all statements.";
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      setError("Please fill in all mandatory fields highlighted below.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSubmitted(false);

    try {
      const payload = {
        ...formData,
        awareness: awareness ? [awareness] : [],
        ratings,
        contributionAreas,
      };

      await api.post("/event/feedback", payload);
      setSubmitted(true);
    } catch (err) {
      console.error("Failed to submit feedback:", err);
      setError(err?.response?.data?.message || "Failed to submit feedback. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageShell eyebrow="Alumni Meet" title="Appeal / Feedback Form">
      <form onSubmit={handleSubmit} className="mx-auto max-w-6xl space-y-6">
        {/* Header Branding */}
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

        <div className="space-y-2 border-b border-slate-200 py-4 text-sm leading-7 text-slate-700">
          <p className="font-semibold text-slate-900">Dear Alumnus,</p>
          <p>
            Thank you for participating in the Alumni Meet. As a valued alumna
            or alumnus, your feedback is important to us. We request you to
            complete this form to help us improve and further strengthen our
            institution.
          </p>
        </div>

        {/* Section 1: Alumni Details */}
        <section className="border-b border-slate-200 pb-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              Alumni Details
              {userProfile && (
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  Locked (Synced from Profile)
                </span>
              )}
            </h3>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <FormField
              label="Name of Alumnus"
              name="alumnusName"
              value={formData.alumnusName}
              onChange={handleInputChange}
              readOnly={Boolean(userProfile)}
              error={fieldErrors.alumnusName}
              required
            />
            <FormField
              label="Alumnus ID"
              name="alumnusID"
              value={formData.alumnusID}
              onChange={handleInputChange}
              readOnly={Boolean(userProfile)}
              error={fieldErrors.alumnusID}
            />
            <FormField
              label="Pass out Year"
              name="passoutYear"
              value={formData.passoutYear}
              onChange={handleInputChange}
              readOnly={Boolean(userProfile)}
              error={fieldErrors.passoutYear}
              required
              type="number"
              min="1950"
              max="2030"
            />
            <FormField
              label="Branch"
              name="branch"
              value={formData.branch}
              onChange={handleInputChange}
              readOnly={Boolean(userProfile)}
              error={fieldErrors.branch}
              required
            />
            <FormField
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              readOnly={Boolean(userProfile)}
              error={fieldErrors.email}
              required
              type="email"
            />
            <FormField
              label={
                (userProfile?.professional?.employmentStatus || userProfile?.employmentStatus) === "Higher Studies"
                  ? "University Name"
                  : (userProfile?.professional?.employmentStatus || userProfile?.employmentStatus) === "Entrepreneur"
                    ? "Company / Startup Name"
                    : "Name of Current Organization"
              }
              name="organization"
              value={formData.organization}
              onChange={handleInputChange}
              readOnly={Boolean(userProfile)}
              error={fieldErrors.organization}
              required
            />
            <FormField
              label={
                (userProfile?.professional?.employmentStatus || userProfile?.employmentStatus) === "Higher Studies"
                  ? "Course / Specialization"
                  : "Designation"
              }
              name="designation"
              value={formData.designation}
              onChange={handleInputChange}
              readOnly={Boolean(userProfile)}
              error={fieldErrors.designation}
              required
            />
            <FormField
              label="Mobile No."
              name="mobile"
              value={formData.mobile}
              onChange={handleInputChange}
              readOnly={Boolean(userProfile)}
              error={fieldErrors.mobile}
              required
              type="tel"
            />
          </div>
        </section>

        {/* Section 2: Awareness */}
        <section className="border-b border-slate-200 pb-6">
          <h3 className="text-base font-extrabold text-slate-900">
            How did you come to know about this Alumni Meet? <span className="text-red-600">*</span>
          </h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {awarenessOptions.map((option) => (
              <label
                key={option}
                className="flex min-h-10 cursor-pointer items-start gap-3 text-sm font-medium text-slate-700 hover:text-slate-900"
              >
                <input
                  type="radio"
                  name="awareness"
                  value={option}
                  checked={awareness === option}
                  onChange={() => handleAwarenessSelect(option)}
                  required
                  className="mt-1 h-4 w-4 shrink-0 border-slate-300 text-blue-700 focus:ring-blue-600"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
          {fieldErrors.awareness && (
            <p className="mt-2 text-xs font-semibold text-red-600 flex items-center gap-1">
              <AlertCircle size={14} /> {fieldErrors.awareness}
            </p>
          )}
        </section>

        {/* Section 3: Level of Agreement Ratings */}
        <section className="border-b border-slate-200 pb-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Kindly indicate your level of agreement <span className="text-red-600">*</span>
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
                {statements.map((statement, index) => {
                  const qKey = `q${index + 1}`;
                  const isQError = fieldErrors.ratings?.[qKey];
                  return (
                    <tr key={statement}>
                      <td className="rounded-l-md bg-slate-100 px-3 py-3 text-center text-sm font-bold text-slate-700">
                        {index + 1}
                      </td>
                      <td className="bg-slate-100 px-3 py-3 text-sm font-medium text-slate-700">
                        {statement}
                      </td>
                      <td className="rounded-r-md bg-slate-100 px-3 py-3">
                        <select
                          value={ratings[qKey]}
                          onChange={(e) => handleRatingChange(qKey, e.target.value)}
                          required
                          aria-label={`Rating for statement ${index + 1}`}
                          className={`w-full rounded-md border ${
                            isQError ? "border-red-500 ring-1 ring-red-500" : "border-slate-300"
                          } bg-white px-3 py-2 text-center text-sm font-bold text-slate-800 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600`}
                        >
                          <option value="" disabled>Select</option>
                          {ratingScale.map((item) => (
                            <option key={item.value} value={item.value}>
                              {item.value}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {fieldErrors.ratingsGeneral && (
            <p className="mt-3 text-xs font-semibold text-red-600 flex items-center gap-1">
              <AlertCircle size={14} /> {fieldErrors.ratingsGeneral}
            </p>
          )}
        </section>

        {/* Section 4: Contribution Areas */}
        <section className="border-b border-slate-200 pb-6">
          <h3 className="text-base font-extrabold text-slate-900">
            Please indicate the areas in which you can contribute to the
            Department / College
          </h3>
          <div className="mt-4 grid gap-x-8 gap-y-3 md:grid-cols-2 xl:grid-cols-3">
            {contributionAreasOptions.map((area) => (
              <label
                key={area}
                className="flex min-h-10 cursor-pointer items-start gap-3 text-sm font-medium text-slate-700 hover:text-slate-900"
              >
                <input
                  type="checkbox"
                  checked={contributionAreas.includes(area)}
                  onChange={() => handleContributionToggle(area)}
                  className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 text-blue-700 focus:ring-blue-600"
                />
                <span>{area}</span>
              </label>
            ))}
          </div>
        </section>

        {/* Section 5: Achievements & Suggestions */}
        <section className="pb-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <FormField
              label="Any exclusive achievement / award / recognition in your professional career"
              name="achievement"
              value={formData.achievement}
              onChange={handleInputChange}
              textarea
            />
            <FormField
              label="Suggestions"
              name="suggestions"
              value={formData.suggestions}
              onChange={handleInputChange}
              textarea
            />
          </div>
        </section>

        {/* Error notification */}
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-center gap-2">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Success notification */}
        {submitted && (
          <div className="rounded-md border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-800 flex items-center gap-2">
            <CheckCircle2 size={18} className="text-green-600 shrink-0" />
            <span>Thank you! Your alumni feedback has been recorded successfully.</span>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-700 px-7 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-blue-800 active:bg-blue-900 disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 size={17} className="animate-spin" />
            ) : (
              <Send size={17} />
            )}
            {submitting ? "Submitting..." : "Submit Feedback"}
          </button>
          <button
            type="button"
            onClick={handleReset}
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 px-7 py-3 text-sm font-bold uppercase tracking-wide text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-800 disabled:opacity-50"
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
