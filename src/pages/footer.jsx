import { Link } from "react-router-dom";

const aboutLinks = [
  { label: "SSGMCE Alumni Cell", path: "/about/alumni-cell" },
  { label: "Executive Team", path: "/about/executive-team" },
  { label: "Alumni Cell Activities", path: "/about/activity-organized" },
  { label: "Distinguished Alumni", path: "/about/distinguished-alumni" },
  { label: "Alumni Meet Report", path: "/about/annual-report" },
];

const quickLinks = [
  { label: "SSGMCE", path: "https://www.ssgmce.ac.in/" },
  { label: "SSGMCE News", path: "https://www.ssgmce.ac.in/news" },
  { label: "Contribution", path: "/contribution" },
  { label: "Newsletter", path: "/newsletter" },
  { label: "Event Registration", path: "/event/registration" },
  { label: "Contact", path: "/contact" },
];

export const Footer = () => {
  return (
    <footer className="bg-[#3964C3] text-blue-100">
      <div className="mx-auto max-w-[1425px] px-5 py-12 lg:px-10">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-3">
              <div>
                <img
                  src="/logo.png"
                  alt="SSGMCE Alumni Connect Logo"
                  className="mb-4 h-12 w-auto"
                />
              </div>
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.22em] text-blue-300">
                  Alumni Cell
                </p>
                <h2 className="mb-3 text-xl font-extrabold text-white">
                  SSGMCE Alumni Connect
                </h2>
              </div>
            </div>
            <p className="mb-4 text-sm leading-relaxed text-blue-200">
              Shri Sant Gajanan Maharaj College of Engineering, Shegaon
            </p>
            <p className="text-sm leading-6 text-blue-300">
              Connecting alumni, empowering futures, and building a stronger
              community together.
            </p>
          </div>

          <div>
            <h3 className="mb-4 border-b border-blue-800 pb-2 text-sm font-bold uppercase tracking-widest text-white">
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

          <div>
            <h3 className="mb-4 border-b border-blue-800 pb-2 text-sm font-bold uppercase tracking-widest text-white">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((item) => (
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

          <div>
            <h3 className="mb-4 border-b border-blue-800 pb-2 text-sm font-bold uppercase tracking-widest text-white">
              Contact Us
            </h3>
            <ul className="space-y-3 text-sm text-blue-200">
              <li>
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-blue-400">
                  Address
                </span>
                SSGMCE Campus, Shegaon,
                <br />
                Buldhana, Maharashtra - 444203
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
                  Phone Number
                </span>
                +91 9420834621
              </li>
              <li>
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-blue-400">
                  Alt. Number
                </span>
                +91 9545956114
              </li>

            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-blue-900">
        <div className="mx-auto flex max-w-[1425px] flex-col items-center justify-between gap-3 px-5 py-4 text-center text-xs text-blue-400 md:flex-row lg:px-10">
          <p>
            Copyright {new Date().getFullYear()} SSGMCE Alumni Connect. All
            rights reserved.
          </p>
          <p>Shri Sant Gajanan Maharaj College of Engineering, Shegaon</p>
        </div>
      </div>
    </footer>
  );
};
