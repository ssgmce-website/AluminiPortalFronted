function AnnualReport() {
  const reports = [
    { year: "2025-26", status: "Report will be uploaded soon" },
    { year: "2024-25", status: "Annual alumni activities summary" },
    { year: "2023-24", status: "Events, meetings, and contribution report" },
  ];

  return (
    <section className="mx-auto mt-8 max-w-[1425px] border border-blue-100 bg-white p-8 shadow-xl shadow-slate-950/15">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-500">
        About
      </p>

      <h2 className="mt-2 text-4xl font-bold text-blue-800">
        Annual Report
      </h2>

      <div className="mt-6 overflow-hidden border border-blue-100">
        {reports.map((report) => (
          <div className="grid gap-2 border-b border-blue-100 p-4 last:border-b-0 md:grid-cols-[160px_1fr]" key={report.year}>
            <p className="font-bold text-blue-800">{report.year}</p>
            <p className="text-slate-700">{report.status}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default AnnualReport;
