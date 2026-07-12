import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import { LogIn, UserPlus, LayoutDashboard } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { routeForProfile } from "../utils/authRoutes";

function Header() {
  const { currentUser, userProfile } = useAuth();
  const loggedIn = currentUser && userProfile;

  return (
    <header className="border-b border-blue-100 bg-white shadow-sm">
      <div className="mx-auto flex min-h-32 max-w-[1425px] flex-col items-center justify-between gap-5 px-4 py-5 text-center sm:px-5 md:flex-row md:text-left lg:px-10">

        <div className="flex flex-col items-center gap-5 sm:flex-row">
          <Link
            to="/"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="shrink-0 transition hover:opacity-90"
          >
            <img
              className="h-20 w-20 object-contain sm:h-24 sm:w-24"
              src={logo}
              alt="SSGMCE Alumni Connect logo"
            />
          </Link>

          <div>
            <h1 className="text-xl font-extrabold leading-tight text-blue-800 sm:text-2xl md:text-[32px]">
              SSGMCE Alumni Connect
            </h1>
            <p className="mt-2 max-w-2xl text-sm font-medium text-slate-600 sm:text-base md:text-lg">
              Shri Sant Gajanan Maharaj College of Engineering, Shegaon
            </p>
          </div>
        </div>

        <div className="flex w-full flex-col items-stretch gap-2 text-sm font-semibold uppercase tracking-wide sm:w-auto sm:flex-row sm:items-center sm:gap-3">
          {loggedIn ? (
            <Link
              className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-700 px-4 py-2 text-white shadow-sm transition hover:bg-blue-800"
              to={routeForProfile(userProfile)}
            >
              <LayoutDashboard size={16} />
              {userProfile.role === 'admin' ? 'Admin Portal' : 'Dashboard'}
            </Link>
          ) : (
            <>
              <Link
                className="inline-flex items-center justify-center gap-2 rounded-md border border-blue-700 px-4 py-2 text-blue-700 shadow-sm transition hover:bg-blue-50"
                to="/register"
              >
                <UserPlus size={16} />
                Register
              </Link>
              <Link
                className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-700 px-4 py-2 text-white shadow-sm transition hover:bg-blue-800"
                to="/login"
              >
                <LogIn size={16} />
                Login
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
