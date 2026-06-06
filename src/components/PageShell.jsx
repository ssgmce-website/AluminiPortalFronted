function PageShell({ eyebrow, title, children }) {
  return (
    <section className="mx-auto max-w-[1425px] rounded-lg border border-blue-100 bg-white shadow-lg shadow-blue-950/10">
      <div className="border-b border-blue-100 bg-gradient-to-r from-blue-950 to-blue-700 px-6 py-7 text-white md:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-100">
          {eyebrow}
        </p>
        <h2 className="mt-2 text-3xl font-extrabold leading-tight md:text-5xl">
          {title}
        </h2>
      </div>

      <div className="p-6 md:p-8">{children}</div>
    </section>
  );
}

export default PageShell;
