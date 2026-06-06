import { useState } from "react";
import { Link, NavLink } from "react-router-dom";

function Navbar() {
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  const navItems = [
    { label: "Notice", isNew: true },
    { label: "AGM Report", isNew: true },
    { label: "RACA Khoj" },
    { label: "Membership", isNew: true },
    { label: "Newsletters" },
    { label: "Contribute" },
    { label: "Donations", isNew: true },
    { label: "More" },
  ];

  const aboutItems = [
    { label: "SSGMCE ALUMNI CELL", path: "/about/alumni-cell" },
    { label: "Executive Team", path: "/about/executive-team" },
    { label: "Activity Organized", path: "/about/activity-organized" },
    { label: "Distinguished Alumni", path: "/about/distinguished-alumni" },
    { label: "Annual Report", path: "/about/annual-report" },
  ];

  return (
    <nav className="sticky top-0 z-20 border-b border-blue-100 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-[1425px] flex-wrap justify-center">
        <div
          className="relative"
          onMouseEnter={() => setIsAboutOpen(true)}
          onMouseLeave={() => setIsAboutOpen(false)}
        >
          <Link
            to="/about/alumni-cell"
            className="block min-w-24 border-l border-blue-100 px-6 py-4 text-center text-[15px] font-medium text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
          >
            About
          </Link>

          {isAboutOpen && (
            <div className="absolute left-0 top-full z-30 w-64 border border-blue-100 bg-white shadow-xl">
              {aboutItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsAboutOpen(false)}
                  className="block w-full border-b border-blue-50 px-5 py-3 text-left text-sm font-medium text-slate-700 transition last:border-b-0 hover:bg-blue-50 hover:text-blue-700"
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          )}
        </div>

        {navItems.map((item) => (
          <a
            className="relative min-w-24 border-l border-blue-100 px-6 py-4 text-center text-[15px] font-medium text-slate-700 transition hover:bg-blue-50 hover:text-blue-700 last:border-r"
            href="#"
            key={item.label}
          >
            {item.isNew && (
              <span className="absolute right-1 top-1.5 bg-amber-300 px-1 text-[10px] font-bold leading-none text-slate-900">
                NEW
              </span>
            )}
            {item.label}
          </a>
        ))}
      </div>
    </nav>
  );
}

export default Navbar;
