function ExecutiveTeam() {
  const members = [
    { name: "Dr. Faculty Coordinator", role: "Alumni Cell Coordinator" },
    { name: "Mr. Alumni President", role: "President" },
    { name: "Ms. Alumni Secretary", role: "Secretary" },
  ];

  return (
    <section className="mx-auto mt-8 max-w-[1425px] border border-blue-100 bg-white p-8 shadow-xl shadow-slate-950/15">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-500">
        About
      </p>

      <h2 className="mt-2 text-4xl font-bold text-blue-800">
        Executive Team
      </h2>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {members.map((member) => (
          <div className="border border-blue-100 bg-blue-50 p-5" key={member.name}>
            <h3 className="text-lg font-bold text-blue-800">{member.name}</h3>
            <p className="mt-2 text-sm text-slate-600">{member.role}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default ExecutiveTeam;
