import PageShell from "../components/PageShell";

function AlumniCell() {
  return (
    <PageShell eyebrow="About" title="SSGMCE Alumni Cell">
      <p className="max-w-4xl text-base leading-8 text-slate-700">
        The SSGMCE Alumni Cell connects alumni, students, and faculty. You can
        add details about the cell objectives, office bearers, contact details,
        and alumni programs here.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {["Connect", "Collaborate", "Contribute"].map((item) => (
          <div className="rounded-md border border-blue-100 bg-slate-50 p-5" key={item}>
            <h3 className="text-lg font-bold text-blue-800">{item}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Build strong alumni relationships and support college growth.
            </p>
          </div>
        ))}
      </div>
    </PageShell>
  );
}

export default AlumniCell;
