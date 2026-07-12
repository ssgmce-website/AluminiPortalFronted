import { useMemo, useState } from "react";
import { BookOpen, GraduationCap, Layers, Users } from "lucide-react";
import PageShell from "../components/PageShell";
import contributions from "../data/contributions.json";

const YEARS = Array.from({ length: 10 }, (_, index) => 2017 + index);

const BRANCHES = [
  { value: "cse", label: "CSE" },
  { value: "it", label: "IT" },
  { value: "entc", label: "ENTC" },
  { value: "elpo", label: "ELPO" },
  { value: "mech", label: "MECH" },
  { value: "mba", label: "MBA" },
  { value: "mca", label: "MCA" },
];

const companyWords = new Set([
  "abb",
  "accenture",
  "adani",
  "aakash",
  "badve",
  "barclays",
  "bosch",
  "byju",
  "byjus",
  "capgemini",
  "cisco",
  "coe",
  "company",
  "credit",
  "etech",
  "fidelity",
  "global",
  "group",
  "india",
  "industries",
  "industry",
  "infosys",
  "investments",
  "jade",
  "limited",
  "ltd",
  "mahagenco",
  "marico",
  "mindtree",
  "momentum",
  "mit",
  "msedcl",
  "phronesis",
  "pvt",
  "reliance",
  "service",
  "services",
  "siemens",
  "solutions",
  "suisse",
  "system",
  "systems",
  "tcs",
  "technology",
  "technologies",
  "unistal",
  "value",
  "whirlpool",
  "wipro",
  "work",
  "works",
]);

const honorifics = new Set(["mr", "mrs", "ms", "miss", "dr", "prof", "shri", "smt", "late"]);

function cleanAlumniName(name = "") {
  let value = String(name).replace(/\s+/g, " ").trim();

  value = value
    .replace(/^\d+\)\s*/, "")
    .replace(/Hon,\s*ble\s+/gi, "")
    .replace(/([a-z])(?=(Vice|Manager|Lead|Director|Engineer|President|Professor|Asst|Officer|Owner|Founder|CEO|MD|HR|Badve)\b)/g, "$1 ")
    .replace(/([a-z])VC\b/g, "$1")
    .replace(/\s*\([^)]*\)/g, "")
    .split(",")[0]
    .trim()
    .replace(/\s*[-–]\s*(Lead|Manager|Vice|President|Director|Professor|Engineer|Owner|Officer|Founder|CEO|MD|HR|Asst\.?|Asstt\.?|Senior|Junior|Project|Production|Supplychain|S\/W|Software|System|Systems|Scientist|Consultant|Executive|Partner|TCS|Infosys|Reliance|Jade|Wipro|Value|Momentum|Etech|Global).*$/i, "")
    .replace(/\s+(Senior\s+Vice\s+President|Vice\s+President|Lead\s+Analyst|General\s+Manager|National\s+Head|Production\s+Head|Supplychain\s+Manager|Data\s+Scientist|Manager|Director|Professor|Engineer|Officer|Owner|Founder|CEO|MD|Dean|HR|Asst\.?|Asstt\.?|Senior|Junior|Technical|Software|System|Systems|Scientist|Consultant|Executive|Partner|DGM|GM|Entrepreneur|Cofounder)\b.*$/i, "")
    .replace(/\b(pass\s*out|passed\s*out)\b.*$/i, "")
    .replace(/\b\d{4}\b/g, "")
    .trim();

  const words = value.split(/\s+/).filter(Boolean);
  const cleanedWords = [];
  let nameWordCount = 0;

  for (const word of words) {
    const token = word.replace(/[.,;:()]/g, "");
    const lower = token.toLowerCase();
    const isHonorific = honorifics.has(lower);

    if (nameWordCount >= 2 && companyWords.has(lower)) break;
    if (nameWordCount >= 1 && /^(AE|SSE|DGM|GM)$/.test(token)) break;
    if (nameWordCount >= 2 && /^[A-Z]{2,}$/.test(token)) break;

    cleanedWords.push(word);
    if (!isHonorific) nameWordCount += 1;
  }

  return cleanedWords.join(" ").replace(/\s+/g, " ").trim() || name;
}

const rows = contributions
  .map((item) => ({
    id: item.id,
    name: cleanAlumniName(item.name),
    year: Number(item.contributionYear || item.year),
    branch: item.departmentKey,
    passoutYear: item.passoutYear || "-",
    contribution: item.contribution,
    contributionDate: item.contributionDate,
    details: item.details,
  }))
  .filter((item) => YEARS.includes(item.year) && item.branch)
  .sort((a, b) => a.name.localeCompare(b.name));

function TabButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
        active
          ? "border-blue-700 bg-blue-700 text-white shadow-sm"
          : "border-blue-100 bg-white text-slate-600 hover:border-blue-300 hover:bg-blue-50"
      }`}
    >
      {children}
    </button>
  );
}

function ContributionTable({ data, selectedBranch, selectedYear }) {
  const branchLabel = BRANCHES.find((branch) => branch.value === selectedBranch)?.label;

  return (
    <div className="overflow-hidden rounded-lg border border-blue-100 bg-white shadow-sm">
      <div className="flex flex-col gap-2 border-b border-blue-100 bg-slate-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
            Selected List
          </p>
          <h3 className="mt-1 text-lg font-extrabold text-slate-900">
            {branchLabel} alumni contributions for {selectedYear}
          </h3>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-800">
          <Users size={14} />
          {data.length} {data.length === 1 ? "entry" : "entries"}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100 text-left">
          <thead className="bg-white">
            <tr>
              <th className="px-4 py-3 text-xs font-extrabold uppercase tracking-wide text-slate-500">
                Name
              </th>
              <th className="px-4 py-3 text-xs font-extrabold uppercase tracking-wide text-slate-500">
                Passout Year
              </th>
              <th className="px-4 py-3 text-xs font-extrabold uppercase tracking-wide text-slate-500">
                Contribution
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.length > 0 ? (
              data.map((row) => (
                <tr key={row.id} className="align-top">
                  <td className="px-4 py-4 text-sm font-bold text-slate-900">
                    {row.name}
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-600">
                    <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 font-semibold">
                      <GraduationCap size={14} />
                      {row.passoutYear}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm leading-6 text-slate-700">
                    <p>{row.contribution || "-"}</p>
                    {(row.contributionDate || row.details) && (
                      <p className="mt-1 text-xs font-semibold text-slate-500">
                        {[row.contributionDate && `Date: ${row.contributionDate}`, row.details]
                          .filter(Boolean)
                          .join(" | ")}
                      </p>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-4 py-10 text-center text-sm font-semibold text-slate-500">
                  No alumni contributions are available for this year and branch yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Contribution() {
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState("");

  const filteredRows = useMemo(() => {
    if (!selectedYear || !selectedBranch) return [];

    return rows.filter(
      (item) => item.year === selectedYear && item.branch === selectedBranch,
    );
  }, [selectedBranch, selectedYear]);

  const showList = Boolean(selectedYear && selectedBranch);

  return (
    <PageShell eyebrow="Alumni Support" title="Contribution">
      <div className="space-y-8">
        <section className="rounded-lg border border-blue-100 bg-blue-50/50 p-4 md:p-5">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-white p-2 text-blue-700 shadow-sm">
              <BookOpen size={20} />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">
                Select passout year and branch
              </h3>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                The contribution list appears after both tabs are selected.
              </p>
            </div>
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center gap-2 text-sm font-extrabold text-slate-800">
            <GraduationCap size={18} className="text-blue-700" />
            Passout Year
          </div>
          <div className="flex flex-wrap gap-2">
            {YEARS.map((year) => (
              <TabButton
                key={year}
                active={selectedYear === year}
                onClick={() => setSelectedYear(year)}
              >
                {year}
              </TabButton>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center gap-2 text-sm font-extrabold text-slate-800">
            <Layers size={18} className="text-blue-700" />
            Branch
          </div>
          <div className="flex flex-wrap gap-2">
            {BRANCHES.map((branch) => (
              <TabButton
                key={branch.value}
                active={selectedBranch === branch.value}
                onClick={() => setSelectedBranch(branch.value)}
              >
                {branch.label}
              </TabButton>
            ))}
          </div>
        </section>

        {showList ? (
          <ContributionTable
            data={filteredRows}
            selectedBranch={selectedBranch}
            selectedYear={selectedYear}
          />
        ) : (
          <div className="rounded-lg border border-dashed border-blue-200 bg-white px-4 py-8 text-center text-sm font-semibold text-slate-500">
            Choose one year and one branch to view alumni name, passout year, and contribution.
          </div>
        )}
      </div>
    </PageShell>
  );
}

export default Contribution;
