import { useState } from "react";
import { X, MapPin, Users, GraduationCap, ArrowRight, BookOpen, HeartHandshake, Briefcase, Award } from "lucide-react";
import PageShell from "../components/PageShell";
import contributions from "../data/contributions.json";

const TYPE_LABELS = {
  "Mentoring":          "Mentoring",
  "Guest Lecture":      "Guest Lecture",
  "Internship Support": "Internship Support",
  "Scholarship":        "Scholarship",
};

const typeConfig = {
  "Mentoring":          { badge: "bg-blue-100 text-blue-700",   icon: HeartHandshake },
  "Guest Lecture":      { badge: "bg-green-100 text-green-700", icon: BookOpen       },
  "Scholarship":        { badge: "bg-purple-100 text-purple-700", icon: Award        },
  "Internship Support": { badge: "bg-amber-100 text-amber-700", icon: Briefcase      },
};

function getBannerTitle(url) {
  try {
    const text = new URL(url).searchParams.get("text") || "";
    return text.replace(/\+/g, " ");
  } catch {
    return "";
  }
}

/* ── Modal ── */
function Modal({ c, onClose }) {
  if (!c) return null;
  const cfg = typeConfig[c.type] ?? { badge: "bg-slate-100 text-slate-600", icon: Award };
  const Icon = cfg.icon;

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

        {/* Donation image — top half */}
        <div className="relative h-64 w-full bg-slate-100">
          {c.donationImage ? (
            <img src={c.donationImage} alt={c.description} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-slate-100" />
          )}
          <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent" />

          {/* Type badge */}
          <span className={`absolute top-4 left-4 flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${cfg.badge} bg-white/80 backdrop-blur-sm`}>
            <Icon size={11} /> {TYPE_LABELS[c.type] || c.type}
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
          <div>
            <p className="text-slate-900 text-2xl font-extrabold leading-tight">{c.name}</p>
            <p className="text-slate-500 text-sm mt-1">
              Batch {c.batch}&nbsp;·&nbsp;{c.branch}
            </p>
          </div>
          <div className="border-t border-slate-200" />
          <p className="text-slate-700 text-base leading-7">{c.description}</p>
        </div>
      </div>
    </div>
  );
}

/* ── Card ── */
function ContributionCard({ c, onClick }) {
  const cfg   = typeConfig[c.type] ?? { badge: "bg-slate-100 text-slate-600", icon: Award };
  const Icon  = cfg.icon;
  const title = getBannerTitle(c.donationImage);

  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full text-left overflow-hidden rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-lg transition-shadow"
    >
      {/* Image with type badge overlay */}
      <div className="relative h-52 overflow-hidden">
        <img
          src={c.donationImage}
          alt={title}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur-sm">
          <Icon size={10} /> {c.type}
        </span>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Branch as location */}
        <p className="flex items-center gap-1 text-xs text-slate-400">
          <MapPin size={11} className="shrink-0" />
          {c.branch}
        </p>

        {/* Title */}
        <h3 className="mt-1 text-base font-extrabold text-slate-800 leading-snug">
          {title}
        </h3>

        {/* Stats row */}
        <div className="mt-3 flex items-center gap-4 border-b border-slate-100 pb-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Users size={12} className="shrink-0 text-slate-400" />
            {c.name}
          </span>
          <span className="flex items-center gap-1">
            <GraduationCap size={12} className="shrink-0 text-slate-400" />
            Batch {c.batch}
          </span>
        </div>

        {/* Footer: description + CTA */}
        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-xs text-slate-400 line-clamp-1 flex-1">
            {c.description}
          </p>
          <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-700 px-4 py-1.5 text-xs font-semibold text-white">
            Explore <ArrowRight size={12} />
          </span>
        </div>
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
          {contributions.map((c) => (
            <ContributionCard
              key={c.id}
              c={c}
              onClick={() => setSelected(c)}
            />
          ))}
        </div>
      </PageShell>

      {selected && (
        <Modal c={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}

export default Contribution;
