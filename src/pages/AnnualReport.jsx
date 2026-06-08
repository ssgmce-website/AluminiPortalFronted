import PageShell from "../components/PageShell";

function AnnualReport() {
  const reports = [
    { year: "2025-26", status: "Report will be uploaded soon" },
    { year: "2024-25", status: "Annual alumni activities summary" },
    { year: "2023-24", status: "Events, meetings, and contribution report" },
  ];

  return (
    <PageShell eyebrow="About" title="Annual Report">
      <div className="overflow-hidden rounded-md border border-blue-100">
        {reports.map((report) => (
          <div className="grid gap-2 border-b border-blue-100 p-4 last:border-b-0 md:grid-cols-[160px_1fr]" key={report.year}>
            <p className="font-bold text-blue-800">{report.year}</p>
            <p className="text-slate-700">{report.status}</p>
          </div>
        ))}
      </div>
    </PageShell>
  );
}

export default AnnualReport;
