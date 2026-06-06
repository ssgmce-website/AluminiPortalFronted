import PageShell from "../components/PageShell";

function ContactPage() {
  return (
    <PageShell eyebrow="Contact" title="Contact Us">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-md border border-blue-100 bg-slate-50 p-5 text-base leading-8 text-slate-700">
          <p className="font-bold text-blue-800">SSGMCE Alumni Connect</p>
          <p>Shri Sant Gajanan Maharaj College of Engineering, Shegaon</p>
          <p>Email: alumni@ssgmce.ac.in</p>
          <p>Phone: +91 00000 00000</p>
        </div>

        <div className="grid gap-4">
          {["Name", "Email", "Message"].map((label) => (
            <label className="block" key={label}>
              <span className="text-sm font-semibold text-slate-700">{label}</span>
              <input className="mt-2 w-full rounded-md border border-blue-100 px-4 py-3 outline-none focus:border-blue-500" />
            </label>
          ))}
        </div>
      </div>
    </PageShell>
  );
}

export default ContactPage;
