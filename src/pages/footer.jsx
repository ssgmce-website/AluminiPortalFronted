import { Link } from "react-router-dom";

const aboutLinks = [
  { label: "SSGMCE Alumni Cell", path: "/about/alumni-cell" },
  { label: "Executive Team", path: "/about/executive-team" },
  { label: "Activity Organized", path: "/about/activity-organized" },
  { label: "Distinguished Alumni", path: "/about/distinguished-alumni" },
  { label: "Annual Report", path: "/about/annual-report" },
];

const quickLinks = [
  { label: "Notice", path: "#" },
  { label: "AGM Report", path: "#" },
  { label: "RACA Khoj", path: "#" },
  { label: "Membership", path: "#" },
  { label: "Newsletters", path: "#" },
  { label: "Contribute", path: "#" },
  { label: "Donations", path: "#" },
];

export const Footer = () => {
  return (
    <footer className="bg-blue-900 text-blue-100">

      {/* Main footer content */}
      <div className="mx-auto max-w-[1425px] px-5 py-12 lg:px-10">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">

          {/* Column 1 — Branding */}
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.22em] text-blue-300">
              Alumni Association
            </p>
            <h2 className="mb-3 text-xl font-extrabold text-white">
              SSGMCE Alumni Connect
            </h2>
            <p className="mb-4 text-sm leading-relaxed text-blue-200">
              Shri Sant Gajanan Maharaj College of Engineering, Shegaon
            </p>
            <p className="text-sm text-blue-300">
              Connecting alumni, empowering futures, and building a stronger
              community together.
            </p>
          </div>

          {/* Column 2 — About */}
          <div>
            <h3 className="mb-4 border-b border-blue-700 pb-2 text-sm font-bold uppercase tracking-widest text-white">
              About
            </h3>
            <ul className="space-y-2">
              {aboutLinks.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className="text-sm text-blue-200 transition-colors duration-150 hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 — Quick Links */}
          <div>
            <h3 className="mb-4 border-b border-blue-700 pb-2 text-sm font-bold uppercase tracking-widest text-white">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.path}
                    className="text-sm text-blue-200 transition-colors duration-150 hover:text-white"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 — Contact */}
          <div>
            <h3 className="mb-4 border-b border-blue-700 pb-2 text-sm font-bold uppercase tracking-widest text-white">
              Contact Us
            </h3>
            <ul className="space-y-3 text-sm text-blue-200">
              <li>
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-blue-400">
                  Address
                </span>
                SSGMCE Campus, Shegaon,
                <br />
                Buldhana, Maharashtra — 444203
              </li>
              <li>
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-blue-400">
                  Email
                </span>
                <a
                  href="mailto:alumni@ssgmce.ac.in"
                  className="transition-colors duration-150 hover:text-white"
                >
                  alumni@ssgmce.ac.in
                </a>
              </li>
              <li>
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-blue-400">
                  Phone
                </span>
                +91 72620 00000
              </li>
            </ul>

            {/* Register / Login */}
            <div className="mt-6 flex gap-3">
              <a
                href="#register"
                className="border border-blue-400 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-blue-200 transition hover:border-white hover:text-white"
              >
                Register
              </a>
              <a
                href="#login"
                className="bg-blue-600 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-blue-500"
              >
                Login
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-blue-800">
        <div className="mx-auto flex max-w-[1425px] flex-col items-center justify-between gap-3 px-5 py-4 text-center text-xs text-blue-400 md:flex-row lg:px-10">
          <p>
            © {new Date().getFullYear()} SSGMCE Alumni Connect. All rights reserved.
          </p>
          <p>
            Shri Sant Gajanan Maharaj College of Engineering, Shegaon
          </p>
        </div>
      </div>

    </footer>
  );
};
