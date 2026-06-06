function Newsroom() {
  const news = [
    "Annual alumni meet registration is open for all batches.",
    "Alumni directory invites updated profiles and current workplace details.",
    "Scholarship contribution drive is accepting donations this month.",
  ];

  return (
    <section className="mx-auto mt-8 max-w-[1425px] rounded-lg border border-blue-100 bg-white shadow-lg shadow-blue-950/10">
      <div className="p-6 md:p-8">
        <div>
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

          <div className="mt-5 grid gap-3">
            {news.map((item) => (
              <article
                className="group flex gap-4 rounded-md border border-blue-100 bg-slate-50 px-4 py-4 transition hover:border-blue-200 hover:bg-blue-50"
                key={item}
              >
                <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-600 transition group-hover:bg-sky-500" />
                <p className="text-base leading-7 text-slate-700">{item}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Newsroom;
