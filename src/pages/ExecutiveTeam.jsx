import PageShell from "../components/PageShell";

function ExecutiveTeam() {
  const members = [
    { name: "Dr. Faculty Coordinator", role: "Alumni Cell Coordinator" },
    { name: "Mr. Alumni President", role: "President" },
    { name: "Ms. Alumni Secretary", role: "Secretary" },
  ];

  return (
    <PageShell eyebrow="About" title="Executive Team">
      <div className="grid gap-4 md:grid-cols-3">
        {members.map((member) => (
          <div className="rounded-md border border-blue-100 bg-slate-50 p-5" key={member.name}>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-blue-700 text-lg font-bold text-white">
              {member.name.charAt(0)}
            </div>
            <h3 className="text-lg font-bold text-blue-800">{member.name}</h3>
            <p className="mt-2 text-sm text-slate-600">{member.role}</p>
          </div>
        ))}
      </div>
    </PageShell>
  );
}

export default ExecutiveTeam;
