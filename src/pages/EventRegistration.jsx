import PageShell from "../components/PageShell";

function EventRegistration() {
  return (
    <PageShell eyebrow="Event" title="Event Registration">
      <p className="max-w-4xl text-base leading-8 text-slate-700">
        Add event registration form details here, such as alumni name, batch,
        department, contact number, event name, and submit button.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {["Alumni Name", "Batch", "Department", "Event Name"].map((label) => (
          <label className="block" key={label}>
            <span className="text-sm font-semibold text-slate-700">{label}</span>
            <input className="mt-2 w-full rounded-md border border-blue-100 px-4 py-3 outline-none focus:border-blue-500" />
          </label>
        ))}
      </div>
    </PageShell>
  );
}

export default EventRegistration;
