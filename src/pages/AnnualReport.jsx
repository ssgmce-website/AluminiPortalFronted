import React, { useState, useEffect } from "react";
import { FileText, Eye, Loader2, AlertCircle, ExternalLink } from "lucide-react";
import PageShell from "../components/PageShell";
import { fetchPublicAnnualReports } from "../services/annualReportService";

function AnnualReport() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await fetchPublicAnnualReports();
      setReports(data.reports || []);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to load annual reports.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell eyebrow="About SSGMCE Alumni" title="Annual Reports">
      <div className="space-y-6">
        {/* Reports Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <Loader2 className="h-10 w-10 animate-spin text-blue-700 mb-3" />
            <p className="text-slate-500 font-semibold text-sm">Loading annual reports...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center bg-rose-50 border border-rose-100 rounded-2xl">
            <AlertCircle className="w-10 h-10 text-rose-600 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-800">Unable to load reports</h3>
            <p className="text-sm text-slate-500 mt-1">{error}</p>
            <button
              onClick={loadReports}
              className="mt-4 px-4 py-2 bg-blue-700 text-white text-xs font-bold rounded-xl shadow hover:bg-blue-800 transition"
            >
              Try Again
            </button>
          </div>
        ) : reports.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-100 shadow-sm">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-700">No Annual Reports Published Yet</h3>
            <p className="text-sm text-slate-400 mt-1">
              Annual reports uploaded by the administration will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm divide-y divide-blue-50">
            {reports.map((report) => {
              const reportId = report._id || report.id;

              return (
                <div key={reportId} className="transition-colors hover:bg-slate-50/50 p-5">
                  <div className="grid gap-4 md:grid-cols-[140px_1fr_auto] md:items-center">
                    {/* Year badge */}
                    <div>
                      <span className="inline-block rounded-xl bg-blue-50 border border-blue-200/60 px-3.5 py-1.5 text-sm font-extrabold text-blue-900 shadow-sm">
                        {report.year}
                      </span>
                    </div>

                    {/* Title */}
                    <div>
                      <h3 className="font-bold text-slate-800 text-base">
                        {report.title || `Annual Report ${report.year}`}
                      </h3>
                      {report.fileName && (
                        <p className="mt-1 text-[11px] text-slate-400 font-medium flex items-center gap-1">
                          <FileText size={12} className="text-slate-400" />
                          Document: {report.fileName} {report.fileSize ? `(${report.fileSize})` : ''}
                        </p>
                      )}
                    </div>

                    {/* Action button - Opens PDF directly in a new tab */}
                    <div className="flex items-center gap-2">
                      <a
                        href={report.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-blue-800"
                      >
                        <Eye size={14} />
                        View PDF
                        <ExternalLink size={12} className="opacity-75" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PageShell>
  );
}

export default AnnualReport;
