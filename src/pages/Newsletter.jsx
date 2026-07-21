import React, { useState, useEffect } from "react";
import { FileText, Eye, Loader2, AlertCircle, ExternalLink, Newspaper } from "lucide-react";
import PageShell from "../components/PageShell";
import { fetchPublicNewsletters } from "../services/newsletterService";

function Newsletter() {
  const [newsletters, setNewsletters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadNewsletters();
  }, []);

  const loadNewsletters = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await fetchPublicNewsletters();
      setNewsletters(data.newsletters || []);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to load newsletters.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell eyebrow="Updates & Publications" title="Alumni Newsletter">
      <div className="space-y-6">
        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <Loader2 className="h-10 w-10 animate-spin text-blue-700 mb-3" />
            <p className="text-slate-500 font-semibold text-sm">Loading newsletters...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center bg-rose-50 border border-rose-100 rounded-2xl">
            <AlertCircle className="w-10 h-10 text-rose-600 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-800">Unable to load newsletters</h3>
            <p className="text-sm text-slate-500 mt-1">{error}</p>
            <button
              onClick={loadNewsletters}
              className="mt-4 px-4 py-2 bg-blue-700 text-white text-xs font-bold rounded-xl shadow hover:bg-blue-800 transition"
            >
              Try Again
            </button>
          </div>
        ) : newsletters.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-100 shadow-sm">
            <Newspaper className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-700">No Newsletters Uploaded Yet</h3>
            <p className="text-sm text-slate-400 mt-1">
              Newsletters uploaded by the administration will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm divide-y divide-blue-50">
            {newsletters.map((newsletter) => {
              const newsletterId = newsletter._id || newsletter.id;

              return (
                <div key={newsletterId} className="transition-colors hover:bg-slate-50/50 p-5">
                  <div className="grid gap-4 md:grid-cols-[140px_1fr_auto] md:items-center">
                    {/* Year / Edition badge */}
                    <div>
                      <span className="inline-block rounded-xl bg-blue-50 border border-blue-200/60 px-3.5 py-1.5 text-sm font-extrabold text-blue-900 shadow-sm">
                        {newsletter.year}
                      </span>
                    </div>

                    {/* Title */}
                    <div>
                      <h3 className="font-bold text-slate-800 text-base">
                        {newsletter.title || `Alumni Newsletter ${newsletter.year}`}
                      </h3>
                      {newsletter.fileName && (
                        <p className="mt-1 text-[11px] text-slate-400 font-medium flex items-center gap-1">
                          <FileText size={12} className="text-slate-400" />
                          Document: {newsletter.fileName} {newsletter.fileSize ? `(${newsletter.fileSize})` : ''}
                        </p>
                      )}
                    </div>

                    {/* Action button - Opens PDF directly in a new tab */}
                    <div className="flex items-center gap-2">
                      <a
                        href={newsletter.fileUrl}
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

export default Newsletter;
