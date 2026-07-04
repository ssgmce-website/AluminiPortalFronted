import { Link } from 'react-router-dom';
import donations from '../data/donations';

const TOTAL_CONTRIBUTIONS = donations.reduce((sum, d) => sum + d.amount, 0);
const TOTAL_DONORS = donations.length;

// Most recent donations first, for the home page teaser.
const RECENT_DONATIONS = [...donations]
  .sort((a, b) => new Date(b.receiptDate) - new Date(a.receiptDate))
  .slice(0, 6);

const fmtINR = (n) => `₹${n.toLocaleString('en-IN')}`;

export default function AlumniContributions() {
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

      <div className="flex flex-col gap-6 md:flex-row">
        {/* Left stat box */}
        <div className="flex shrink-0 flex-col items-start gap-1 rounded-xl bg-amber-50 p-6 md:w-56">
          <p className="text-sm text-slate-500">Total Contributions</p>
          <p className="text-2xl font-extrabold text-amber-500">
            {fmtINR(TOTAL_CONTRIBUTIONS)}
          </p>
          <p className="mt-3 text-sm text-slate-500">Total Donors</p>
          <p className="text-lg font-bold text-slate-800">{TOTAL_DONORS}</p>
          <Link
            to="/contribution"
            className="mt-4 w-full rounded-lg bg-blue-900 px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-blue-800"
          >
            Contribute Now
          </Link>
        </div>

        {/* Right donation list */}
        <div className="flex-1 space-y-3 rounded-xl border-2 border-dashed border-indigo-200 p-4">
          {RECENT_DONATIONS.map((d) => (
            <div
              key={`${d.srNo}-${d.name}`}
              className="flex items-center justify-between rounded-lg border border-slate-100 bg-white px-5 py-3 shadow-sm"
            >
              <p className="text-sm font-bold text-blue-900">
                {d.name}
              </p>
              <p className="font-bold text-amber-500">{fmtINR(d.amount)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
