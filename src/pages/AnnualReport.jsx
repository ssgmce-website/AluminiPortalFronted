import { useRef, useState } from "react";
import PageShell from "../components/PageShell";

const initialReports = [
  { year: "2025-26", description: "Annual alumni activities summary" },
  { year: "2024-25", description: "Events, meetings, and contribution report" },
  { year: "2023-24", description: "Events, meetings, and contribution report" },
];

function AnnualReport() {
  const [files, setFiles] = useState({});
  const [viewing, setViewing] = useState(null);
  const inputRefs = useRef({});

  function handleUpload(year, e) {
    const selected = e.target.files[0];
    if (!selected) return;
    const url = URL.createObjectURL(selected);
    setFiles((prev) => ({ ...prev, [year]: { name: selected.name, url } }));
    if (viewing !== year) setViewing(null);
  }

  function handleView(year) {
    setViewing((prev) => (prev === year ? null : year));
  }

  function handleDelete(year) {
    setFiles((prev) => {
      const next = { ...prev };
      if (next[year]?.url) URL.revokeObjectURL(next[year].url);
      delete next[year];
      return next;
    });
    if (viewing === year) setViewing(null);
  }

  return (
    <PageShell eyebrow="About" title="Annual Report">
      <div className="overflow-hidden rounded-md border border-blue-100">
        {initialReports.map((report) => {
          const uploaded = files[report.year];
          return (
            <div key={report.year} className="border-b border-blue-100 last:border-b-0">
              <div className="grid gap-3 p-4 md:grid-cols-[160px_1fr_auto] md:items-center">
                <p className="font-bold text-blue-800">{report.year}</p>
                <div>
                  <p className="text-sm text-slate-700">{report.description}</p>
                  {uploaded && (
                    <p className="mt-0.5 text-xs text-green-700">
                      Uploaded: {uploaded.name}
                    </p>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap gap-2">
                  {/* Upload */}
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    ref={(el) => (inputRefs.current[report.year] = el)}
                    onChange={(e) => handleUpload(report.year, e)}
                  />
                  <button
                    onClick={() => inputRefs.current[report.year]?.click()}
                    className="rounded-md border border-blue-600 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-blue-700 transition hover:bg-blue-50"
                  >
                    {uploaded ? "Re-upload" : "Upload"}
                  </button>

                  {/* View */}
                  <button
                    onClick={() => handleView(report.year)}
                    disabled={!uploaded}
                    className={`rounded-md px-4 py-1.5 text-xs font-bold uppercase tracking-wide transition ${
                      uploaded
                        ? "bg-blue-700 text-white hover:bg-blue-800"
                        : "cursor-not-allowed border border-slate-200 text-slate-400"
                    }`}
                  >
                    {viewing === report.year ? "Close" : "View"}
                  </button>

                  {/* Delete */}
                  {uploaded && (
                    <button
                      onClick={() => handleDelete(report.year)}
                      className="rounded-md border border-red-200 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-red-600 transition hover:bg-red-50"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>

              {/* Inline PDF viewer */}
              {viewing === report.year && uploaded && (
                <div className="border-t border-blue-100">
                  <iframe
                    src={uploaded.url}
                    title={`Annual Report ${report.year}`}
                    className="h-[600px] w-full"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </PageShell>
  );
}

export default AnnualReport;
