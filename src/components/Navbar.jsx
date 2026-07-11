import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ChevronDown, Menu, X } from "lucide-react";

const linkClass =
  "block min-w-24 border-l border-blue-100 px-5 py-4 text-center text-[15px] font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-blue-800";

const dropdownClass =
  "block w-full border-b border-blue-50 px-5 py-3 text-left text-sm font-medium text-slate-700 transition last:border-b-0 hover:bg-blue-50 hover:text-blue-800";

const navLinkClass = ({ isActive }) =>
  `${linkClass} ${isActive ? "bg-blue-50 text-blue-800" : ""}`;

function DropdownMenu({ name, label, mainPath, items, openMenu, setOpenMenu, active }) {
  return (
    <div
      className="relative"
      onMouseEnter={() => setOpenMenu(name)}
      onMouseLeave={() => setOpenMenu("")}
    >
      <Link
        to={mainPath}
        className={`${linkClass} flex items-center justify-center gap-1.5 ${active ? "bg-blue-50 text-blue-800" : ""}`}
      >
        {label}
        <ChevronDown size={15} />
      </Link>

      {openMenu === name && (
        <div className="absolute left-0 top-full z-30 w-64 rounded-b-lg border border-blue-100 bg-white shadow-xl shadow-blue-950/10">
          {items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setOpenMenu("")}
              className={({ isActive }) =>
                `${dropdownClass} ${isActive ? "bg-blue-50 text-blue-800" : ""}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

function MobileDropdown({ name, label, mainPath, items, openMenu, setOpenMenu, active, onNavigate }) {
  const isOpen = openMenu === name;

  return (
    <div className="border-b border-blue-100 last:border-b-0">
      <div className="flex">
        <NavLink
          to={mainPath}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex-1 px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-blue-800 ${
              active || isActive ? "bg-blue-50 text-blue-800" : ""
            }`
          }
        >
          {label}
        </NavLink>
        <button
          type="button"
          onClick={() => setOpenMenu(isOpen ? "" : name)}
          className="border-l border-blue-100 px-4 text-slate-600 transition hover:bg-blue-50 hover:text-blue-800"
          aria-label={`Toggle ${label} menu`}
          aria-expanded={isOpen}
        >
          <ChevronDown
            size={18}
            className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {isOpen && (
        <div className="bg-slate-50">
          {items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onNavigate}
              className={({ isActive }) =>
                `block border-t border-blue-100 px-6 py-3 text-sm font-medium text-slate-700 transition hover:bg-blue-50 hover:text-blue-800 ${
                  isActive ? "bg-blue-50 text-blue-800" : ""
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

function Navbar() {
  const [openMenu, setOpenMenu] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const aboutItems = [
    { label: "ALUMNI CELL", path: "/about/alumni-cell" },
    { label: "Executive Team", path: "/about/executive-team" },
    { label: "Activity Organized", path: "/about/activity-organized" },
    { label: "Distinguished Alumni", path: "/about/distinguished-alumni" },
    { label: "Annual Report", path: "/about/annual-report" },
  ];

  const eventItems = [
    { label: "Event Registration", path: "/event/registration" },
    { label: "Gallery", path: "/event/gallery" },
  ];

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setOpenMenu("");
  };

  return (
    <nav className="sticky top-0 z-20 border-b border-blue-100 bg-white/95 shadow-md shadow-blue-950/5 backdrop-blur">
      <div className="mx-auto max-w-[1425px]">
        <div className="flex items-center justify-between px-4 py-3 md:hidden">
          <span className="text-sm font-bold uppercase tracking-[0.2em] text-blue-800">Menu</span>
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen((prev) => !prev);
              setOpenMenu("");
            }}
            className="inline-flex items-center gap-2 rounded-md border border-blue-200 px-3 py-2 text-sm font-semibold text-blue-800 transition hover:bg-blue-50"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            {mobileMenuOpen ? "Close" : "Open"}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-blue-100 md:hidden">
            <MobileDropdown
              name="about"
              label="About"
              mainPath="/about/alumni-cell"
              items={aboutItems}
              openMenu={openMenu}
              setOpenMenu={setOpenMenu}
              active={location.pathname.startsWith("/about")}
              onNavigate={closeMobileMenu}
            />

            <NavLink
              to="/gallery"
              onClick={closeMobileMenu}
              className={({ isActive }) =>
                `block border-b border-blue-100 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-blue-800 ${
                  isActive ? "bg-blue-50 text-blue-800" : ""
                }`
              }
            >
              Gallery
            </NavLink>

            <NavLink
              to="/contribution"
              onClick={closeMobileMenu}
              className={({ isActive }) =>
                `block border-b border-blue-100 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-blue-800 ${
                  isActive ? "bg-blue-50 text-blue-800" : ""
                }`
              }
            >
              Contribution
            </NavLink>

            <NavLink
              to="/newsletter"
              onClick={closeMobileMenu}
              className={({ isActive }) =>
                `block border-b border-blue-100 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-blue-800 ${
                  isActive ? "bg-blue-50 text-blue-800" : ""
                }`
              }
            >
              Newsletter
            </NavLink>

            <MobileDropdown
              name="event"
              label="Event"
              mainPath="/event/registration"
              items={eventItems}
              openMenu={openMenu}
              setOpenMenu={setOpenMenu}
              active={location.pathname.startsWith("/event")}
              onNavigate={closeMobileMenu}
            />

            <NavLink
              to="/contact"
              onClick={closeMobileMenu}
              className={({ isActive }) =>
                `block px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-blue-800 ${
                  isActive ? "bg-blue-50 text-blue-800" : ""
                }`
              }
            >
              Contact
            </NavLink>
          </div>
        )}

        <div className="hidden flex-wrap justify-center md:flex">
          <DropdownMenu
            name="about"
            label="About"
            mainPath="/about/alumni-cell"
            items={aboutItems}
            openMenu={openMenu}
            setOpenMenu={setOpenMenu}
            active={location.pathname.startsWith("/about")}
          />

          <NavLink to="/gallery" className={navLinkClass}>
            Gallery
          </NavLink>

          <NavLink to="/contribution" className={navLinkClass}>
            Contribution
          </NavLink>

          <NavLink to="/newsletter" className={navLinkClass}>
            Newsletter
          </NavLink>

          <DropdownMenu
            name="event"
            label="Event"
            mainPath="/event/registration"
            items={eventItems}
            openMenu={openMenu}
            setOpenMenu={setOpenMenu}
            active={location.pathname.startsWith("/event")}
          />

          <NavLink to="/contact" className={({ isActive }) => `${linkClass} border-r ${isActive ? "bg-blue-50 text-blue-800" : ""}`}>
            Contact
          </NavLink>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
