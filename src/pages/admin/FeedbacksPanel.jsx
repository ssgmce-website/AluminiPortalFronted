import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquareQuote, MessageSquare, Star, Search, Download, Loader2,
  XCircle, Mail, Phone, Building, Award, Lightbulb, Users, Calendar
} from 'lucide-react';
import { fetchAlumniFeedbacks, fetchPublicFeedbacks } from '../../services/adminService';
import { search } from 'fast-fuzzy';

const STATEMENT_LABELS = [
  "Information regarding Alumni Meet communicated in advance",
  "Date, time, and venue convenience",
  "Hospitality provided by College during Meet",
  "Meaningful interaction with faculty, staff & students",
  "Activities conducted relevant and well-organized",
  "Overall Alumni Meet 2026 expectations"
];

export const FeedbacksPanel = ({ tab = 'alumni' }) => {
  const [alumniFeedbacks, setAlumniFeedbacks] = useState([]);
  const [publicFeedbacks, setPublicFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, [tab]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      if (tab === 'alumni') {
        const data = await fetchAlumniFeedbacks();
        setAlumniFeedbacks(data.feedbacks || []);
      } else {
        const data = await fetchPublicFeedbacks();
        setPublicFeedbacks(data.feedbacks || []);
      }
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || 'Failed to load feedback records.');
    } finally {
      setLoading(false);
    }
  };

  // Filtered list using fast-fuzzy
  const filteredAlumni = useMemo(() => {
    if (!searchQuery.trim()) return alumniFeedbacks;
    return search(searchQuery, alumniFeedbacks, {
      threshold: 1,
      keySelector: (item) => [
        item.alumnusName || '',
        item.email || '',
        item.alumnusID || '',
        item.branch || '',
        item.organization || '',
        item.designation || '',
        item.suggestions || '',
        item.achievement || '',
        (item.contributionAreas || []).join(' '),
      ],
    });
  }, [alumniFeedbacks, searchQuery]);

  const filteredPublic = useMemo(() => {
    if (!searchQuery.trim()) return publicFeedbacks;
    return search(searchQuery, publicFeedbacks, {
      threshold: 1,
      keySelector: (item) => [
        item.name || '',
        item.email || '',
        item.feedbackType || '',
        item.rating || '',
        item.message || '',
      ],
    });
  }, [publicFeedbacks, searchQuery]);

  // Export to Excel for Alumni Feedbacks
  const exportAlumniExcel = () => {
    const rows = [
      [
        'Alumnus Name', 'Alumnus ID', 'Passout Year', 'Branch', 'Email', 'Mobile',
        'Organization', 'Designation', 'Awareness Via',
        'Q1 Rating', 'Q2 Rating', 'Q3 Rating', 'Q4 Rating', 'Q5 Rating', 'Q6 Rating',
        'Contribution Areas', 'Achievements', 'Suggestions', 'Submitted Date'
      ],
      ...filteredAlumni.map(f => [
        f.alumnusName || 'N/A',
        f.alumnusID || 'N/A',
        f.passoutYear || 'N/A',
        f.branch || 'N/A',
        f.email || 'N/A',
        f.mobile || 'N/A',
        f.organization || 'N/A',
        f.designation || 'N/A',
        (f.awareness || []).join(', '),
        f.ratings?.q1 || 5,
        f.ratings?.q2 || 5,
        f.ratings?.q3 || 5,
        f.ratings?.q4 || 5,
        f.ratings?.q5 || 5,
        f.ratings?.q6 || 5,
        (f.contributionAreas || []).join('; '),
        f.achievement || '',
        f.suggestions || '',
        f.createdAt ? new Date(f.createdAt).toLocaleDateString('en-IN') : 'N/A'
      ])
    ];

    const xml = `<?xml version="1.0"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
          xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Worksheet ss:Name="Alumni Feedbacks">
    <Table>
      ${rows.map(row =>
      `<Row>${row.map(cell =>
        `<Cell><Data ss:Type="String">${String(cell).replace(/&/g, '&amp;').replace(/</g, '&lt;')}</Data></Cell>`
      ).join('')}</Row>`
    ).join('\n      ')}
    </Table>
  </Worksheet>
</Workbook>`;

    const blob = new Blob([xml], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Alumni-Feedbacks-${new Date().toISOString().slice(0, 10)}.xls`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Export to Excel for Public Feedbacks
  const exportPublicExcel = () => {
    const rows = [
      ['Name', 'Email', 'Type', 'Rating', 'Message', 'Submitted Date'],
      ...filteredPublic.map(f => [
        f.name || 'N/A',
        f.email || 'N/A',
        f.feedbackType || 'N/A',
        f.rating || 'N/A',
        f.message || 'N/A',
        f.createdAt ? new Date(f.createdAt).toLocaleDateString('en-IN') : 'N/A'
      ])
    ];

    const xml = `<?xml version="1.0"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
          xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Worksheet ss:Name="Public Feedbacks">
    <Table>
      ${rows.map(row =>
      `<Row>${row.map(cell =>
        `<Cell><Data ss:Type="String">${String(cell).replace(/&/g, '&amp;').replace(/</g, '&lt;')}</Data></Cell>`
      ).join('')}</Row>`
    ).join('\n      ')}
    </Table>
  </Worksheet>
</Workbook>`;

    const blob = new Blob([xml], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Public-Feedbacks-${new Date().toISOString().slice(0, 10)}.xls`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Stats calculation
  const stats = useMemo(() => {
    if (tab === 'alumni') {
      const count = alumniFeedbacks.length;
      let totalRating = 0;
      let ratingCount = 0;
      alumniFeedbacks.forEach(f => {
        if (f.ratings) {
          Object.values(f.ratings).forEach(val => {
            totalRating += Number(val) || 5;
            ratingCount++;
          });
        }
      });
      const avg = ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : '5.0';
      const withContributions = alumniFeedbacks.filter(f => f.contributionAreas && f.contributionAreas.length > 0).length;
      return { count, avg, metricLabel: 'Average Score (out of 5)', metricVal: `${avg} / 5`, extraLabel: 'Willing to Contribute', extraVal: withContributions };
    } else {
      const count = publicFeedbacks.length;
      const bugs = publicFeedbacks.filter(f => f.feedbackType === 'bug').length;
      const compliments = publicFeedbacks.filter(f => f.feedbackType === 'compliment').length;
      return { count, metricLabel: 'Compliments', metricVal: compliments, extraLabel: 'Bugs / Issues', extraVal: bugs };
    }
  }, [tab, alumniFeedbacks, publicFeedbacks]);

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            {tab === 'alumni' ? (
              <MessageSquareQuote className="w-7 h-7 text-[#0A3287]" />
            ) : (
              <MessageSquare className="w-7 h-7 text-[#0A3287]" />
            )}
            {tab === 'alumni' ? 'Alumni Meet Feedback Responses' : 'Public Website Feedbacks'}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {tab === 'alumni'
              ? 'View feedback, event ratings, and contribution offers submitted by alumni.'
              : 'Review feedback, bug reports, and user suggestions from the public portal.'}
          </p>
        </div>

        {((tab === 'alumni' && alumniFeedbacks.length > 0) || (tab === 'public' && publicFeedbacks.length > 0)) && (
          <button
            onClick={tab === 'alumni' ? exportAlumniExcel : exportPublicExcel}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition shadow-md shrink-0 cursor-pointer"
          >
            <Download size={14} /> Export to Excel
          </button>
        )}
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl border bg-blue-50 border-blue-100 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Submissions</p>
            <h3 className="text-2xl font-black mt-1.5 text-blue-700">{loading ? '...' : stats.count}</h3>
          </div>
          <Users className="w-8 h-8 opacity-20 text-slate-800" />
        </div>

        <div className="p-5 rounded-2xl border bg-emerald-50 border-emerald-100 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">{stats.metricLabel}</p>
            <h3 className="text-2xl font-black mt-1.5 text-emerald-700">{loading ? '...' : stats.metricVal}</h3>
          </div>
          <Star className="w-8 h-8 opacity-20 text-slate-800" />
        </div>

        <div className="p-5 rounded-2xl border bg-indigo-50 border-indigo-100 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">{stats.extraLabel}</p>
            <h3 className="text-2xl font-black mt-1.5 text-indigo-700">{loading ? '...' : stats.extraVal}</h3>
          </div>
          <Lightbulb className="w-8 h-8 opacity-20 text-slate-800" />
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={tab === 'alumni' ? "Search by alumnus name, ID, branch, company..." : "Search by name, email, type, message..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
          />
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <Loader2 className="w-10 h-10 animate-spin text-[#0A3287] mb-3" />
          <p className="text-slate-500 font-medium">Loading feedback submissions...</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-rose-50 border border-rose-100 rounded-2xl">
          <XCircle className="w-12 h-12 text-rose-600 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-800">Failed to load</h3>
          <p className="text-sm text-slate-500 mt-1">{error}</p>
        </div>
      ) : tab === 'alumni' ? (
        filteredAlumni.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm text-slate-400">
            <MessageSquareQuote size={40} className="mb-2 opacity-50" />
            <p className="text-sm font-semibold">No alumni feedback submissions found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAlumni.map((item) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition space-y-4"
              >
                {/* Header info */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-lg font-bold text-slate-900">{item.alumnusName}</h3>
                      {item.alumnusID && (
                        <span className="bg-blue-50 text-blue-700 text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full border border-blue-100">
                          {item.alumnusID}
                        </span>
                      )}
                      <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                        {item.branch} ({item.passoutYear})
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 flex-wrap">
                      <span className="flex items-center gap-1"><Mail size={13} /> {item.email}</span>
                      <span className="flex items-center gap-1"><Phone size={13} /> {item.mobile}</span>
                      <span className="flex items-center gap-1"><Building size={13} /> {item.designation} at {item.organization}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs text-slate-400 flex items-center gap-1 justify-end">
                      <Calendar size={12} /> {item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                    </span>
                  </div>
                </div>

                {/* Awareness & Ratings */}
                <div className="grid md:grid-cols-2 gap-4 text-xs">
                  {/* Ratings breakdown */}
                  <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-100">
                    <p className="font-bold text-slate-700 uppercase tracking-wide text-[11px]">Event Satisfaction Ratings</p>
                    <div className="space-y-1.5">
                      {STATEMENT_LABELS.map((stmt, idx) => {
                        const score = item.ratings?.[`q${idx + 1}`] || 5;
                        return (
                          <div key={idx} className="flex items-center justify-between text-slate-600">
                            <span className="truncate pr-2">{idx + 1}. {stmt}</span>
                            <span className="font-extrabold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 shrink-0">
                              {score} / 5
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Awareness & Contribution */}
                  <div className="space-y-3">
                    {item.awareness && item.awareness.length > 0 && (
                      <div>
                        <p className="font-bold text-slate-700 uppercase tracking-wide text-[11px]">Came to know via</p>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {item.awareness.map(a => (
                            <span key={a} className="bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded text-[11px] font-medium">
                              {a}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {item.contributionAreas && item.contributionAreas.length > 0 && (
                      <div>
                        <p className="font-bold text-slate-700 uppercase tracking-wide text-[11px]">Willing to Contribute in</p>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {item.contributionAreas.map(ca => (
                            <span key={ca} className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded text-[11px] font-medium">
                              {ca}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Achievements & Suggestions */}
                {(item.achievement || item.suggestions) && (
                  <div className="grid md:grid-cols-2 gap-4 pt-2 border-t border-slate-100 text-xs">
                    {item.achievement && (
                      <div className="bg-purple-50/60 p-3.5 rounded-xl border border-purple-100">
                        <p className="font-bold text-purple-900 flex items-center gap-1.5 mb-1">
                          <Award size={14} className="text-purple-600" /> Professional Achievement
                        </p>
                        <p className="text-slate-700 whitespace-pre-line leading-relaxed">{item.achievement}</p>
                      </div>
                    )}
                    {item.suggestions && (
                      <div className="bg-blue-50/60 p-3.5 rounded-xl border border-blue-100">
                        <p className="font-bold text-blue-900 flex items-center gap-1.5 mb-1">
                          <Lightbulb size={14} className="text-blue-600" /> Suggestions / Comments
                        </p>
                        <p className="text-slate-700 whitespace-pre-line leading-relaxed">{item.suggestions}</p>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )
      ) : (
        /* Public Feedback Tab */
        filteredPublic.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm text-slate-400">
            <MessageSquare size={40} className="mb-2 opacity-50" />
            <p className="text-sm font-semibold">No public feedback submissions found.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-[11px] font-black text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-left">User</th>
                    <th className="px-6 py-4 text-left">Feedback Type</th>
                    <th className="px-6 py-4 text-left">Rating</th>
                    <th className="px-6 py-4 text-left">Message</th>
                    <th className="px-6 py-4 text-right">Submitted Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPublic.map((pf) => (
                    <tr key={pf._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="font-bold text-slate-800">{pf.name || 'Anonymous'}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Mail size={12} /> {pf.email || 'N/A'}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-block text-[11px] font-bold px-2.5 py-1 rounded-full uppercase border ${
                          pf.feedbackType === 'bug'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : pf.feedbackType === 'compliment'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : pf.feedbackType === 'idea'
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {pf.feedbackType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-700">
                        {pf.rating}
                      </td>
                      <td className="px-6 py-4 text-slate-700 max-w-md">
                        <p className="line-clamp-3 text-xs leading-relaxed">{pf.message}</p>
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap text-xs text-slate-400">
                        {pf.createdAt ? new Date(pf.createdAt).toLocaleDateString('en-IN') : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}
    </div>
  );
};
