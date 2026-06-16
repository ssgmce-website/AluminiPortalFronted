import { useState } from "react";
import PageShell from "../components/PageShell";

const inputCls =
  "mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600";

const labelCls = "block text-sm font-semibold text-slate-700";

const allowedTypes = [".doc", ".docx", ".pdf", ".png", ".jpeg", ".jpg", ".zip"];

function Field({ label, required, type = "text", ...props }) {
  return (
    <label className="block">
      <span className={labelCls}>
        {label} {required && <span className="text-red-600">*</span>}
      </span>
      <input type={type} className={inputCls} required={required} {...props} />
    </label>
  );
}

function WithdrawalForm() {
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState("");

  function handleFile(e) {
    const selected = e.target.files[0];
    if (!selected) return;
    const ext = "." + selected.name.split(".").pop().toLowerCase();
    if (!allowedTypes.includes(ext)) {
      setFileError("File type not allowed.");
      setFile(null);
      return;
    }
    const isZip = ext === ".zip";
    const maxBytes = isZip ? 10 * 1024 * 1024 : 2 * 1024 * 1024;
    if (selected.size > maxBytes) {
      setFileError(
        isZip ? "ZIP file must be less than 10 MB." : "File must be less than 2 MB."
      );
      setFile(null);
      return;
    }
    setFileError("");
    setFile(selected);
  }

  function handleSubmit(e) {
    e.preventDefault();
  }

  return (
    <PageShell eyebrow="Membership" title="Withdrawal Form">
      {/* Form header */}
      <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-5">
        <h2 className="mb-3 text-xl font-extrabold text-blue-900">
          Nomination Withdrawal Form SSGMCE Director-2026
        </h2>

        <p className="text-sm leading-6 text-slate-700">
          <span className="font-semibold">To,</span> The Election Officer,
          <br />
          <span className="font-semibold">SSGMCE ALUMNI CONNECT ASSOCIATION</span>
          <br />
          Shri Sant Gajanan Maharaj College of Engineering,
          <br />
          Shegaon, Buldhana, Maharashtra – 444203
        </p>

        <div className="mt-4 rounded border border-blue-100 bg-white p-4 text-sm leading-7 text-slate-700">
          <span className="font-semibold">Dear Sir,</span>
          <br />
          I had filed the Nomination Form for election to the post of Director
          of SSGMCE Alumni Connect Association dated mentioned below. However, I
          would like to withdraw my nomination from the election process due to
          personal reasons. Further I confirm that, this decision is not under
          undue influence / duress which please note.
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* ── Candidate Details ── */}
        <section>
          <h3 className="mb-4 border-b border-blue-200 pb-1 text-base font-bold uppercase tracking-wide text-blue-800">
            Candidate Details
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Name" required />
            <Field label="Personal Email ID" required type="email" />
            <Field label="Contact No." required type="tel" />
            <Field label="Candidate Membership No" required />
          </div>
        </section>

        {/* ── Attachment ── */}
        <section>
          <h3 className="mb-4 border-b border-blue-200 pb-1 text-base font-bold uppercase tracking-wide text-blue-800">
            Attachment
          </h3>
          <p className="mb-2 text-sm text-slate-700">
            Kindly upload the Candidate Signature for confirming your consent
            for Withdrawal. <span className="text-red-600">*</span>
          </p>
          <input
            type="file"
            accept=".doc,.docx,.pdf,.png,.jpeg,.jpg,.zip"
            required
            onChange={handleFile}
            className="block w-full text-sm text-slate-600 file:mr-4 file:cursor-pointer file:rounded file:border-0 file:bg-blue-700 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-blue-800"
          />
          {file && (
            <p className="mt-1 text-xs text-green-700">Selected: {file.name}</p>
          )}
          {fileError && (
            <p className="mt-1 text-xs text-red-600">{fileError}</p>
          )}
          <div className="mt-2 space-y-0.5 text-xs text-slate-500">
            <p>* Allowed file types: .doc, .docx, .pdf, .png, .jpeg, .jpg, .zip</p>
            <p>* File size should be less than 10 MB for ZIP files and less than 2 MB for others.</p>
          </div>
        </section>

        {/* ── Submit ── */}
        <div>
          <button
            type="submit"
            className="rounded-md bg-blue-700 px-8 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-blue-800 active:bg-blue-900"
          >
            Submit
          </button>
        </div>
      </form>
    </PageShell>
  );
}

export default WithdrawalForm;
