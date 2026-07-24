import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Heart, GraduationCap, Building2 } from 'lucide-react';
import api from '../services/api';

const extractNumber = (val) => {
  if (!val) return 0;
  const match = String(val).match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
};

export default function AlumniContributions() {
  const [recentContributions, setRecentContributions] = useState([]);
  const [stats, setStats] = useState({ totalBenefited: 0, totalContributors: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContributions = async () => {
      try {
        const { data } = await api.get('/public/contributions');
        const dbList = data?.data?.contributions || [];

        // 1. Process database contributions
        const dbRows = dbList.map((item) => {
          const yearVal = item.paymentDate
            ? new Date(item.paymentDate).getFullYear()
            : new Date(item.createdAt).getFullYear();

          return {
            id: item._id,
            name: item.alumnusName, // Raw name, no cleaning
            passoutYear: item.passoutYear,
            branch: item.branch,
            company: item.organization || '',
            designation: item.designation || '',
            contributionType: item.contributionType,
            beneficiaries: item.beneficiaries || null,
            date: item.paymentDate || item.createdAt
          };
        });

        // Get unique alumni contributors count based on name
        const uniqueAlumniNames = new Set(dbRows.map(item => item.name.trim().toLowerCase()));

        // Sum up students benefited
        const totalBenefited = dbRows.reduce((sum, item) => sum + extractNumber(item.beneficiaries), 0);

        setRecentContributions(dbRows.slice(0, 5));
        setStats({
          totalBenefited,
          totalContributors: uniqueAlumniNames.size
        });
      } catch (err) {
        console.error('Failed to load homepage contributions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchContributions();
  }, []);

  return (
    <section className="mx-auto max-w-[1425px] rounded-2xl border border-slate-200 bg-white p-8 shadow-sm md:p-10">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-extrabold text-blue-900 md:text-3xl">
          Alumni Contributions
        </h2>
        <Link
          to="/contribution"
          className="rounded-full border border-slate-200 px-4 py-1.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
        >
          View All
        </Link>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Left stat box */}
        <div className="flex shrink-0 flex-col items-start gap-1 rounded-xl bg-amber-50 p-6 lg:w-60 justify-center">
          {loading ? (
            <div className="w-full flex justify-center py-6">
              <Loader2 className="animate-spin text-amber-500" size={24} />
            </div>
          ) : (
            <>
              <p className="text-sm font-medium text-slate-500">Total benifisheries</p>
              <p className="text-3xl font-extrabold text-amber-500">
                {stats.totalBenefited.toLocaleString('en-IN')}+
              </p>
              <p className="mt-4 text-sm font-medium text-slate-500">Total Alumni Contributed</p>
              <p className="text-2xl font-bold text-slate-800">
                {stats.totalContributors.toLocaleString('en-IN')}+
              </p>
            </>
          )}
          <Link
            to="/contribution"
            className="mt-6 w-full rounded-lg bg-blue-900 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-blue-800"
          >
            Contribute Now
          </Link>
        </div>

        {/* Right donation list table */}
        <div className="flex-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-4">Alumnus Details</th>
                  <th className="px-6 py-4">Contribution Area</th>
                  <th className="px-6 py-4">No. of benifisheries</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="3" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Loader2 className="animate-spin text-blue-900 mb-2" size={24} />
                        <span className="text-xs text-slate-400 font-semibold">Loading recent contributions...</span>
                      </div>
                    </td>
                  </tr>
                ) : recentContributions.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="px-6 py-12 text-center text-slate-400 font-medium">
                      No contributions recorded yet.
                    </td>
                  </tr>
                ) : (
                  recentContributions.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Column 1: Alumnus Details */}
                      <td className="px-6 py-4 max-w-md">
                        <p className="font-extrabold text-blue-900 text-sm leading-snug">
                          {c.name}
                        </p>
                        {(c.passoutYear || c.branch) && (
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-semibold mt-1">
                            <GraduationCap size={12} className="text-slate-400 shrink-0" />
                            <span>
                              {c.passoutYear ? `Class of ${c.passoutYear}` : ''}
                              {c.passoutYear && c.branch ? ' · ' : ''}
                              {c.branch || ''}
                            </span>
                          </div>
                        )}
                        {(c.designation || c.company) && (
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium mt-0.5">
                            <Building2 size={12} className="text-slate-300 shrink-0" />
                            <span>
                              {c.designation || ''}
                              {c.designation && c.company ? ' at ' : ''}
                              {c.company || ''}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Column 2: Contribution Area */}
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 border border-blue-100 uppercase tracking-wider">
                          {c.contributionType}
                        </span>
                      </td>

                      {/* Column 3: Students Benefited */}
                      <td className="px-6 py-4">
                        {c.beneficiaries ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-extrabold text-emerald-700 border border-emerald-100 uppercase tracking-wider">
                            <Heart size={10} className="fill-emerald-500 text-emerald-500 shrink-0" />
                            {c.beneficiaries}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium italic">-</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
