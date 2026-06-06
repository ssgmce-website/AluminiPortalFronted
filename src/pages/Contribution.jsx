import PageShell from "../components/PageShell";

function Contribution() {
  const options = ["Mentoring", "Guest Lecture", "Internship Support", "Scholarship"];

  return (
    <PageShell eyebrow="Alumni Support" title="Contribution">
      <p className="max-w-4xl text-base leading-8 text-slate-700">
        Add contribution details here for mentoring, internships, guest
        lectures, scholarships, projects, and industry connections.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-4">
        {options.map((option) => (
          <div className="rounded-md border border-blue-100 bg-slate-50 p-5 text-center font-semibold text-blue-800" key={option}>
            {option}
          </div>
        ))}
      </div>
    </PageShell>
  );
}

export default Contribution;
