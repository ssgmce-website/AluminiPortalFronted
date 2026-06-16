const news = [
  { text: "Annual alumni meet registration is open for all batches.", date: "1 Jun 2026" },
  { text: "Alumni directory invites updated profiles and current workplace details.", date: "20 May 2026" },
  { text: "Scholarship contribution drive is accepting donations this month.", date: "10 May 2026" },
  { text: "New newsletter edition is now available for download.", date: "1 May 2026" },
  { text: "Distinguished Alumni Awards nominations are now open.", date: "15 Apr 2026" },
];

function Newsroom() {
  return (
    <section className="mx-auto mt-8 max-w-[1425px] rounded-lg border border-blue-100 bg-white shadow-lg shadow-blue-950/10">
      <div className="p-6 md:p-8">
        <div className="flex flex-col gap-3 border-b border-blue-100 pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-500">
              Latest Updates
            </p>
            <h2 className="mt-1 text-4xl font-bold text-blue-800 md:text-5xl">
              Newsroom
            </h2>
          </div>
          <span className="w-fit rounded-md bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
            Alumni Desk
          </span>
        </div>

        <div className="mt-4 divide-y divide-blue-50">
          {news.map((item) => (
            <article
              key={item.text}
              className="group flex items-center justify-between gap-4 rounded px-2 py-4 transition hover:bg-blue-50"
            >
              <p className="text-sm leading-6 text-slate-700 group-hover:text-blue-800">
                {item.text}
              </p>
              <span className="shrink-0 text-xs text-slate-400">{item.date}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Newsroom;
