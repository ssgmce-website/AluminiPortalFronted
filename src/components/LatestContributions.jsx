import { Heart, BookOpen, Cpu, Users, Award, Mic } from "lucide-react";

const CONTRIBUTIONS = [
  {
    type: "Donation",
    icon: Heart,
    iconBg: "bg-rose-50",
    iconColor: "text-rose-500",
    badge: "bg-rose-100 text-rose-700",
    name: "Mr. Sushil Deshmukh",
    batch: "B.E. CSE • 2008",
    description: "Library infrastructure development fund",
    amount: "₹1,50,000",
    date: "20 Jun 2026",
  },
  {
    type: "Scholarship",
    icon: Award,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-500",
    badge: "bg-amber-100 text-amber-700",
    name: "Mr. Ashutosh Deuskar",
    batch: "B.E. CSE • 2005",
    description: "Merit scholarship for final year students",
    amount: "₹75,000",
    date: "15 Jun 2026",
  },
  {
    type: "Equipment",
    icon: Cpu,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-500",
    badge: "bg-blue-100 text-blue-700",
    name: "Ms. Priya Wankhede",
    batch: "B.E. IT • 2012",
    description: "High-performance workstations for AI/ML lab",
    amount: "₹2,20,000",
    date: "10 Jun 2026",
  },
  {
    type: "Guest Lecture",
    icon: Mic,
    iconBg: "bg-purple-50",
    iconColor: "text-purple-500",
    badge: "bg-purple-100 text-purple-700",
    name: "Mr. Rahul Patil",
    batch: "B.E. Mech • 2010",
    description: "Session on Industry 4.0 and Smart Manufacturing",
    amount: null,
    date: "5 Jun 2026",
  },
  {
    type: "Campus Drive",
    icon: Users,
    iconBg: "bg-green-50",
    iconColor: "text-green-500",
    badge: "bg-green-100 text-green-700",
    name: "Ms. Sneha Kulkarni",
    batch: "B.E. E&TC • 2014",
    description: "Campus recruitment drive — 12 students placed",
    amount: null,
    date: "1 Jun 2026",
  },
  {
    type: "Book Donation",
    icon: BookOpen,
    iconBg: "bg-teal-50",
    iconColor: "text-teal-500",
    badge: "bg-teal-100 text-teal-700",
    name: "Mr. Amit Sharma",
    batch: "B.E. Electrical • 2009",
    description: "Collection of 200+ technical reference books",
    amount: "₹40,000",
    date: "25 May 2026",
  },
];

function ContributionRow({ item, isLast }) {
  const Icon = item.icon;
  return (
    <div
      className={`group flex items-start gap-4 px-2 py-4 rounded-lg transition hover:bg-blue-50/60 ${
        !isLast ? "border-b border-blue-50" : ""
      }`}
    >
      {/* Icon */}
      <div
        className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.iconBg}`}
      >
        <Icon size={18} className={item.iconColor} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-0.5">
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${item.badge}`}
          >
            {item.type}
          </span>
          <span className="text-xs text-slate-400">{item.batch}</span>
        </div>
        <p className="text-sm font-semibold text-slate-800 group-hover:text-blue-800 truncate">
          {item.name}
        </p>
        <p className="text-sm text-slate-500 leading-snug mt-0.5">
          {item.description}
        </p>
      </div>

      {/* Right side */}
      <div className="shrink-0 text-right">
        {item.amount ? (
          <p className="text-sm font-bold text-blue-700">{item.amount}</p>
        ) : (
          <p className="text-xs font-semibold text-slate-400 italic">In-kind</p>
        )}
        <p className="mt-0.5 text-xs text-slate-400">{item.date}</p>
      </div>
    </div>
  );
}

function LatestContributions() {
  const totalDonations = CONTRIBUTIONS.filter((c) => c.amount).reduce(
    (sum, c) => sum + parseInt(c.amount.replace(/[₹,]/g, "")),
    0
  );

  const fmt = (n) =>
    n >= 100000
      ? `₹${(n / 100000).toFixed(2)} L`
      : `₹${n.toLocaleString("en-IN")}`;

  return (
    <section className="mx-auto mt-8 max-w-[1425px] rounded-lg border border-blue-100 bg-white shadow-lg shadow-blue-950/10">
      <div className="p-6 md:p-8">
        {/* Header */}
        <div className="flex flex-col gap-3 border-b border-blue-100 pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-500">
              Alumni Giving Back
            </p>
            <h2 className="mt-1 text-4xl font-bold text-blue-800 md:text-5xl">
              Latest Contributions
            </h2>
          </div>

          {/* Stats pill */}
          <div className="flex flex-wrap gap-3">
            <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-2 text-center">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-500">
                This Month
              </p>
              <p className="mt-0.5 text-lg font-extrabold text-blue-800">
                {fmt(totalDonations)}
              </p>
            </div>
            <div className="rounded-lg border border-green-100 bg-green-50 px-4 py-2 text-center">
              <p className="text-xs font-semibold uppercase tracking-wide text-green-600">
                Contributors
              </p>
              <p className="mt-0.5 text-lg font-extrabold text-green-700">
                {CONTRIBUTIONS.length}
              </p>
            </div>
          </div>
        </div>

        {/* Contribution rows */}
        <div className="mt-3">
          {CONTRIBUTIONS.map((item, i) => (
            <ContributionRow
              key={item.name + item.type}
              item={item}
              isLast={i === CONTRIBUTIONS.length - 1}
            />
          ))}
        </div>

        {/* Footer link */}
        <div className="mt-4 border-t border-blue-50 pt-4 text-center">
          <a
            href="/contribution"
            className="text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline transition"
          >
            View all contributions →
          </a>
        </div>
      </div>
    </section>
  );
}

export default LatestContributions;
