import PageShell from "../components/PageShell";

function Nomination() {
  return (
    <PageShell eyebrow="Membership" title="Nomination">
      <p className="max-w-4xl text-base leading-8 text-slate-700">
        Add nomination form details here. You can include eligibility rules,
        required documents, candidate details, and a submit button.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {["Candidate Name", "Batch", "Department", "Contact Number"].map((label) => (
          <label className="block" key={label}>
            <span className="text-sm font-semibold text-slate-700">{label}</span>
            <input className="mt-2 w-full rounded-md border border-blue-100 px-4 py-3 outline-none focus:border-blue-500" />
          </label>
        ))}
      </div>
    </PageShell>
  );
}

export default Nomination;
