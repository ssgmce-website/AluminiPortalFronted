import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const alumni = [
  {
    name: "Mr. Ashutosh Deuskar",
    role: "Director",
    roleColor: "text-amber-600",
    company: "VDA Infosolutions",
    branch: "Computer Science and Engineering",
    location: "Pune",
    photo: null,
  },
  {
    name: "Mr. Sushil Deshmukh",
    role: "Founder and CEO",
    roleColor: "text-green-600",
    company: "Fecund Software Services",
    branch: "Computer Science and Engineering",
    location: "Hyderabad",
    photo: null,
  },
  {
    name: "Ms. Priya Wankhede",
    role: "Client Solutions",
    roleColor: "text-blue-600",
    company: "TechCorp India",
    branch: "Information Technology",
    location: "Hyderabad",
    photo: null,
  },
  {
    name: "Mr. Rahul Patil",
    role: "Senior Engineer",
    roleColor: "text-purple-600",
    company: "Infosys Ltd.",
    branch: "Mechanical Engineering",
    location: "Bengaluru",
    photo: null,
  },
  {
    name: "Ms. Sneha Kulkarni",
    role: "Product Manager",
    roleColor: "text-rose-600",
    company: "Zoho Corporation",
    branch: "Electronics & Telecommunication",
    location: "Chennai",
    photo: null,
  },
  {
    name: "Mr. Amit Sharma",
    role: "Deputy Engineer",
    roleColor: "text-teal-600",
    company: "MSEDCL",
    branch: "Electrical Engineering",
    location: "Nagpur",
    photo: null,
  },
];

const Initials = ({ name }) => {
  const parts = name.replace(/^(Mr\.|Ms\.|Mrs\.|Dr\.)\s*/i, "").split(" ");
  const init = parts
    .slice(0, 2)
    .map((p) => p[0])
    .join("");
  return (
    <span className="text-xl font-bold text-blue-700 uppercase">{init}</span>
  );
};

const AlumniCard = ({ alum }) => (
  <div className="flex flex-col items-center rounded-2xl border border-blue-100 bg-white px-6 py-7 text-center shadow-md shadow-blue-950/10 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-950/15">
    {/* Quote decoration */}
    <span className="mb-3 text-5xl leading-none text-blue-100 select-none font-serif">&ldquo;</span>

    {/* Avatar */}
    <div className="mb-4 h-20 w-20 overflow-hidden rounded-full border-4 border-blue-100 bg-blue-50 flex items-center justify-center">
      {alum.photo ? (
        <img src={alum.photo} alt={alum.name} className="h-full w-full object-cover" />
      ) : (
        <Initials name={alum.name} />
      )}
    </div>

    {/* Company */}
    <p className="mb-1 text-xs font-bold uppercase tracking-widest text-amber-600">
      {alum.company}
    </p>

    {/* Name */}
    <h3 className="text-lg font-extrabold text-slate-800 leading-tight">
      {alum.name}
    </h3>

    {/* Role */}
    <p className={`mt-1 text-sm font-bold ${alum.roleColor}`}>{alum.role}</p>

    {/* Branch */}
    <p className="mt-2 text-xs text-slate-500 leading-snug">{alum.branch}</p>

    {/* Location */}
    {alum.location && (
      <p className="mt-1 text-xs text-slate-400">{alum.location}</p>
    )}
  </div>
);

const VISIBLE = 3;

function NewlyRegisteredAlumni() {
  const [start, setStart] = useState(0);

  const prev = () => setStart((s) => Math.max(0, s - 1));
  const next = () => setStart((s) => Math.min(alumni.length - VISIBLE, s + 1));

  const visible = alumni.slice(start, start + VISIBLE);

  return (
    <section className="mx-auto mt-8 max-w-[1425px] rounded-lg border border-blue-100 bg-white shadow-lg shadow-blue-950/10">
      <div className="p-6 md:p-8">
        {/* Header */}
        <div className="flex flex-col gap-3 border-b border-blue-100 pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-500">
              Welcome New Members
            </p>
            <h2 className="mt-1 text-4xl font-bold text-blue-800 md:text-5xl">
              Newly Registered Alumni
            </h2>
          </div>
          <span className="w-fit rounded-md bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
            Class of 2026
          </span>
        </div>

        {/* Cards */}
        <div className="relative mt-8">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((alum) => (
              <AlumniCard key={alum.name} alum={alum} />
            ))}
          </div>

          {/* Navigation */}
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              onClick={prev}
              disabled={start === 0}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-blue-200 text-blue-600 transition hover:bg-blue-50 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={18} />
            </button>

            {/* Dots */}
            <div className="flex gap-2">
              {Array.from({ length: alumni.length - VISIBLE + 1 }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setStart(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === start ? "w-6 bg-blue-600" : "w-2 bg-blue-200"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={next}
              disabled={start >= alumni.length - VISIBLE}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-blue-200 text-blue-600 transition hover:bg-blue-50 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default NewlyRegisteredAlumni;
