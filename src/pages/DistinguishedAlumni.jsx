import PageShell from "../components/PageShell";

function DistinguishedAlumni() {
  const alumni = [
    { name: "Alumni Name One", batch: "Batch 2010", achievement: "Senior Engineer at a leading company" },
    { name: "Alumni Name Two", batch: "Batch 2012", achievement: "Founder of a technology startup" },
    { name: "Alumni Name Three", batch: "Batch 2015", achievement: "Researcher and industry mentor" },
  ];

  return (
    <PageShell eyebrow="About" title="Distinguished Alumni">
      <div className="grid gap-4 md:grid-cols-3">
        {alumni.map((person) => (
          <div className="rounded-md border border-blue-100 bg-slate-50 p-5" key={person.name}>
            <h3 className="text-lg font-bold text-blue-800">{person.name}</h3>
            <p className="mt-1 text-sm font-semibold text-blue-500">{person.batch}</p>
            <p className="mt-3 text-sm leading-6 text-slate-600">{person.achievement}</p>
          </div>
        ))}
      </div>
    </PageShell>
  );
}

export default DistinguishedAlumni;
