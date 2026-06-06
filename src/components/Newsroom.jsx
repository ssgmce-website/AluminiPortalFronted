function Newsroom() {
  const news = [
    "Annual alumni meet registration is open for all batches.",
    "Alumni directory invites updated profiles and current workplace details.",
    "Scholarship contribution drive is accepting donations this month.",
  ];

  return (
    <section className="mx-auto mt-8 max-w-[1425px] border border-blue-100 bg-white shadow-xl shadow-slate-950/15">
      <div className="grid gap-6 p-6 lg:grid-cols-[1fr_420px]">
        <div>
          <div className="border-b border-blue-100 pb-4">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-500">
              Latest Updates
            </p>
            <h2 className="mt-1 text-4xl font-bold text-blue-800 md:text-5xl">
              Newsroom
            </h2>
          </div>

          <div className="mt-5 divide-y divide-blue-100">
            {news.map((item) => (
              <article className="group flex gap-4 py-4" key={item}>
                <span className="mt-2 h-2.5 w-2.5 shrink-0 bg-blue-600 transition group-hover:bg-sky-500" />
                <p className="text-base leading-7 text-slate-700">{item}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=80",
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=80",
            "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=500&q=80",
            "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=500&q=80",
          ].map((image) => (
            <img
              className="aspect-[4/3] w-full object-cover grayscale transition duration-300 hover:grayscale-0"
              src={image}
              alt="Alumni profile"
              key={image}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Newsroom;
