function DistinguishedAlumni() {
  const alumni = [
    { name: "Alumni Name One", batch: "Batch 2010", achievement: "Senior Engineer at a leading company" },
    { name: "Alumni Name Two", batch: "Batch 2012", achievement: "Founder of a technology startup" },
    { name: "Alumni Name Three", batch: "Batch 2015", achievement: "Researcher and industry mentor" },
  ];

  return (
    <section className="mx-auto mt-8 max-w-[1425px] border border-blue-100 bg-white p-8 shadow-xl shadow-slate-950/15">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-500">
        About
      </p>

      <h2 className="mt-2 text-4xl font-bold text-blue-800">
        Distinguished Alumni
      </h2>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {alumni.map((person) => (
          <div className="border border-blue-100 p-5" key={person.name}>
            <h3 className="text-lg font-bold text-blue-800">{person.name}</h3>
            <p className="mt-1 text-sm font-semibold text-blue-500">{person.batch}</p>
            <p className="mt-3 text-sm leading-6 text-slate-600">{person.achievement}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default DistinguishedAlumni;
