import PageShell from "../components/PageShell";

function Newsletter() {
  const editions = ["June 2026 Edition", "Annual Alumni Bulletin", "Department Updates"];

  return (
    <PageShell eyebrow="Updates" title="Newsletter">
      <p className="max-w-4xl text-base leading-8 text-slate-700">
        Add newsletter PDFs, alumni stories, announcements, and college
        achievements here.
      </p>

      <div className="mt-8 divide-y divide-blue-100 rounded-md border border-blue-100">
        {editions.map((edition) => (
          <div className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between" key={edition}>
            <span className="font-semibold text-blue-800">{edition}</span>
            <button className="w-fit rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">
              View
            </button>
          </div>
        ))}
      </div>
    </PageShell>
  );
}

export default Newsletter;
