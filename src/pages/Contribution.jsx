import { useState } from "react";
import { X } from "lucide-react";
import PageShell from "../components/PageShell";
import contributions from "../data/contributions.json";

const TYPE_LABELS = {
  "Mentoring":          "Mentoring",
  "Guest Lecture":      "Guest Lecture",
  "Internship Support": "Internship Support",
  "Scholarship":        "Scholarship",
};

const CARD_COLORS = [
  { bg: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-200",   heading: "text-blue-900"   },
  { bg: "bg-emerald-50",text: "text-emerald-700", border: "border-emerald-200",heading: "text-emerald-900"},
  { bg: "bg-violet-50", text: "text-violet-700",  border: "border-violet-200", heading: "text-violet-900" },
  { bg: "bg-rose-50",   text: "text-rose-700",    border: "border-rose-200",   heading: "text-rose-900"   },
  { bg: "bg-sky-50",    text: "text-sky-700",     border: "border-sky-200",    heading: "text-sky-900"    },
  { bg: "bg-teal-50",   text: "text-teal-700",    border: "border-teal-200",   heading: "text-teal-900"   },
  { bg: "bg-amber-50",  text: "text-amber-700",   border: "border-amber-200",  heading: "text-amber-900"  },
  { bg: "bg-indigo-50", text: "text-indigo-700",  border: "border-indigo-200", heading: "text-indigo-900" },
  { bg: "bg-cyan-50",   text: "text-cyan-700",    border: "border-cyan-200",   heading: "text-cyan-900"   },
  { bg: "bg-lime-50",   text: "text-lime-700",    border: "border-lime-200",   heading: "text-lime-900"   },
];

const AVATAR_BG = [
  "bg-blue-600",   "bg-emerald-600", "bg-violet-600",
  "bg-rose-600",   "bg-sky-600",     "bg-teal-600",
  "bg-amber-600",  "bg-indigo-600",  "bg-cyan-600",
  "bg-lime-600",
];

function Avatar({ name, photo, index, size = "lg" }) {
  const initials = name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const dim = size === "lg" ? "w-28 h-28 text-3xl" : "w-14 h-14 text-lg";
  if (photo) {
    return <img src={photo} alt={name} className={`${dim} rounded-full object-cover ring-4 ring-white/20 shadow-md shrink-0`} />;
  }
  return (
    <div className={`${dim} rounded-full ${AVATAR_BG[index % AVATAR_BG.length]} flex items-center justify-center text-white font-bold ring-4 ring-white/10 shadow-md shrink-0`}>
      {initials}
    </div>
  );
}

/* ── Modal ── */
function Modal({ c, index, onClose }) {
  if (!c) return null;
  const col = CARD_COLORS[index % CARD_COLORS.length];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 transition"
        >
          <X size={18} />
        </button>

        {/* Donation photo — top half */}
        <div className="relative h-64 w-full bg-slate-100">
          {c.donationImage ? (
            <img src={c.donationImage} alt={c.description} className="w-full h-full object-cover" />
          ) : (
            <div className={`w-full h-full ${col.bg}`} />
          )}
          <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent" />

          {/* Type badge */}
          <span className={`absolute top-4 left-4 rounded-full border ${col.border} px-3 py-1 text-xs font-semibold ${col.text} bg-white/80 backdrop-blur-sm`}>
            {TYPE_LABELS[c.type] || c.type}
          </span>

          {/* Alumni photo overlapping bottom edge */}
          <div className="absolute -bottom-10 left-6">
            <img
              src={c.photo}
              alt={c.name}
              className="w-20 h-20 rounded-full object-cover ring-4 ring-white shadow-xl"
              onError={(e) => { e.target.style.display = "none"; }}
            />
          </div>
        </div>

        {/* Bottom panel */}
        <div className="pt-12 px-6 pb-6 flex flex-col gap-4">
          {/* Name + meta */}
          <div>
            <p className="text-slate-900 text-2xl font-extrabold leading-tight">{c.name}</p>
            <p className="text-slate-500 text-sm mt-1">
              Batch {c.batch}&nbsp;·&nbsp;{c.branch}
            </p>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-200" />

          {/* Description */}
          <p className="text-slate-700 text-base leading-7">{c.description}</p>
        </div>
      </div>
    </div>
  );
}

/* ── Card ── */
function ContributionCard({ c, index, onClick }) {
  const col = CARD_COLORS[index % CARD_COLORS.length];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group w-full text-left rounded-2xl ${col.bg} shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer`}
    >
      <div className="flex flex-col items-center gap-5 p-8 h-80 justify-center relative">
        <Avatar name={c.name} photo={c.photo} index={index} size="lg" />

        <div className="text-center">
          <p className={`${col.heading} text-xl font-bold leading-snug`}>{c.name}</p>
          <p className={`${col.text} text-sm mt-1.5`}>Batch {c.batch} · {c.branch}</p>
        </div>

        <span className={`rounded-full border ${col.border} px-4 py-1.5 text-sm font-semibold ${col.text} bg-white/60`}>
          {TYPE_LABELS[c.type] || c.type}
        </span>

        {/* Click hint */}
        <p className={`absolute bottom-3 left-0 right-0 text-center ${col.text} opacity-40 text-sm group-hover:opacity-70 transition-opacity`}>
          click to view contribution
        </p>
      </div>
    </button>
  );
}

/* ── Summary bar ── */
function SummaryBar({ data }) {
  const counts = data.reduce((acc, c) => { acc[c.type] = (acc[c.type] || 0) + 1; return acc; }, {});
  return (
    <div className="mb-8 flex flex-wrap gap-3">
      {Object.keys(TYPE_LABELS).map((type) => (
        <div key={type} className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600">
          {type}
          <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-bold text-slate-700">
            {counts[type] || 0}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ── Page ── */
function Contribution() {
  const [selected, setSelected] = useState(null);

  return (
    <>
      <PageShell eyebrow="Alumni Support" title="Contribution">
        <SummaryBar data={contributions} />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {contributions.map((c, idx) => (
            <ContributionCard
              key={c.id}
              c={c}
              index={idx}
              onClick={() => setSelected({ c, idx })}
            />
          ))}
        </div>
      </PageShell>

      {selected && (
        <Modal c={selected.c} index={selected.idx} onClose={() => setSelected(null)} />
      )}
    </>
  );
}

export default Contribution;
