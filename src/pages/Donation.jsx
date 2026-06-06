import PageShell from "../components/PageShell";

function Donation() {
  return (
    <PageShell eyebrow="Giving Back" title="Donation">
      <p className="max-w-4xl text-base leading-8 text-slate-700">
        Add donation details here, such as bank details, QR code, donation
        categories, and scholarship fund information.
      </p>

      <div className="mt-8 rounded-md border border-blue-100 bg-slate-50 p-5">
        <h3 className="text-lg font-bold text-blue-800">Donation Categories</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {["Scholarship Fund", "Infrastructure Support", "Student Activities"].map((item) => (
            <div className="rounded-md bg-white p-4 text-sm font-semibold text-slate-700 shadow-sm" key={item}>
              {item}
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}

export default Donation;
