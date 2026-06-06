import { useState } from "react";
import { Link, NavLink } from "react-router-dom";

const linkClass =
  "block min-w-24 border-l border-blue-100 px-6 py-4 text-center text-[15px] font-medium text-slate-700 transition hover:bg-blue-50 hover:text-blue-700";

const dropdownClass =
  "block w-full border-b border-blue-50 px-5 py-3 text-left text-sm font-medium text-slate-700 transition last:border-b-0 hover:bg-blue-50 hover:text-blue-700";

function DropdownMenu({ name, label, mainPath, items, openMenu, setOpenMenu }) {
  return (
    <div
      className="relative"
      onMouseEnter={() => setOpenMenu(name)}
      onMouseLeave={() => setOpenMenu("")}
    >
      <Link to={mainPath} className={linkClass}>
        {label}
      </Link>

      {openMenu === name && (
        <div className="absolute left-0 top-full z-30 w-64 border border-blue-100 bg-white shadow-xl">
          {items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setOpenMenu("")}
              className={dropdownClass}
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

  const aboutItems = [
    { label: "SSGMCE ALUMNI CELL", path: "/about/alumni-cell" },
    { label: "Executive Team", path: "/about/executive-team" },
    { label: "Activity Organized", path: "/about/activity-organized" },
    { label: "Distinguished Alumni", path: "/about/distinguished-alumni" },
    { label: "Annual Report", path: "/about/annual-report" },
  ];

  const membershipItems = [
    { label: "Nomination", path: "/membership/nomination" },
    { label: "Withdrawal Form", path: "/membership/withdrawal-form" },
  ];

  const eventItems = [
    { label: "Event Registration", path: "/event/registration" },
  ];

  return (
    <nav className="sticky top-0 z-20 border-b border-blue-100 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-[1425px] flex-wrap justify-center">
        <DropdownMenu
          name="about"
          label="About"
          mainPath="/about/alumni-cell"
          items={aboutItems}
          openMenu={openMenu}
          setOpenMenu={setOpenMenu}
        />

        <DropdownMenu
          name="membership"
          label="Membership"
          mainPath="/membership/nomination"
          items={membershipItems}
          openMenu={openMenu}
          setOpenMenu={setOpenMenu}
        />

        <NavLink to="/contribution" className={linkClass}>
          Contribution
        </NavLink>

        <NavLink to="/newsletter" className={linkClass}>
          Newsletter
        </NavLink>

        <NavLink to="/donation" className={linkClass}>
          Donation
        </NavLink>

        <DropdownMenu
          name="event"
          label="Event"
          mainPath="/event/registration"
          items={eventItems}
          openMenu={openMenu}
          setOpenMenu={setOpenMenu}
        />

        <NavLink to="/contact" className={`${linkClass} border-r`}>
          Contact
        </NavLink>
      </div>
    </nav>
  );
}

export default Navbar;
