import logo from "../assets/logo.png";
import { LogIn, UserPlus } from "lucide-react";

function Header() {
  return (
    <header className="border-b border-blue-100 bg-white shadow-sm">
      <div className="bg-blue-950 text-blue-50">
        <div className="mx-auto flex max-w-[1425px] flex-col items-center justify-between gap-2 px-5 py-2 text-center text-xs font-medium sm:flex-row sm:text-left lg:px-10">
          <span>Official Alumni Network</span>
          <span>Shri Sant Gajanan Maharaj College of Engineering, Shegaon</span>
        </div>
      </div>

      <div className="mx-auto flex min-h-32 max-w-[1425px] flex-col items-center justify-between gap-6 px-5 py-6 text-center md:flex-row md:text-left lg:px-10">
        <div className="flex flex-col items-center gap-5 sm:flex-row">
          <div className="flex h-24 w-24 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 p-2 shadow-sm">
            <img
              className="h-full w-full object-contain"
              src={logo}
              alt="SSGMCE Alumni Connect logo"
            />
          </div>

          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.22em] text-blue-500">
              Alumni Association
            </p>
            <h1 className="text-2xl font-extrabold leading-tight text-blue-800 md:text-[32px]">
              SSGMCE Alumni Connect
            </h1>
            <p className="mt-2 max-w-2xl text-base font-medium text-slate-600 md:text-lg">
              Shri Sant Gajanan Maharaj College of Engineering, Shegaon
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-wide">
          <a
            className="inline-flex items-center gap-2 rounded-md border border-blue-200 px-4 py-2 text-blue-700 transition hover:border-blue-600 hover:bg-blue-50"
            href="#register"
          >
            <UserPlus size={16} />
            Register
          </a>
          <a
            className="inline-flex items-center gap-2 rounded-md bg-blue-700 px-4 py-2 text-white shadow-sm transition hover:bg-blue-800"
            href="#login"
          >
            <LogIn size={16} />
            Login
          </a>
        </div>
      </div>
    </header>
  );
}

export default Header;
