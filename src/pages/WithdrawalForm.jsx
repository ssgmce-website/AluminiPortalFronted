import PageShell from "../components/PageShell";

function WithdrawalForm() {
  return (
    <PageShell eyebrow="Membership" title="Withdrawal Form">
      <p className="max-w-4xl text-base leading-8 text-slate-700">
        Add withdrawal form fields here, such as member name, membership ID,
        email, reason for withdrawal, and confirmation checkbox.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {["Member Name", "Membership ID", "Email", "Reason"].map((label) => (
          <label className="block" key={label}>
            <span className="text-sm font-semibold text-slate-700">{label}</span>
            <input className="mt-2 w-full rounded-md border border-blue-100 px-4 py-3 outline-none focus:border-blue-500" />
          </label>
        ))}
      </div>
    </PageShell>
  );
}

export default WithdrawalForm;
