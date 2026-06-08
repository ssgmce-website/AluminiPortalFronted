import logo from "../assets/logo.png";
import { LogIn, UserPlus } from "lucide-react";

function Header() {
  return (
    <header className="border-b border-blue-100 bg-white shadow-sm">
      <div className="mx-auto flex min-h-32 max-w-[1425px] flex-col items-center justify-between gap-5 px-4 py-5 text-center sm:px-5 md:flex-row md:text-left lg:px-10">
        <div className="flex flex-col items-center gap-5 sm:flex-row">
          <div className="flex h-20 w-20 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 p-2 shadow-sm sm:h-24 sm:w-24">
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
            <h1 className="text-xl font-extrabold leading-tight text-blue-800 sm:text-2xl md:text-[32px]">
              SSGMCE Alumni Connect
            </h1>
            <p className="mt-2 max-w-2xl text-sm font-medium text-slate-600 sm:text-base md:text-lg">
              Shri Sant Gajanan Maharaj College of Engineering, Shegaon
            </p>
          </div>
        </div>

        <div className="flex w-full flex-col items-stretch gap-2 text-sm font-semibold uppercase tracking-wide sm:w-auto sm:flex-row sm:items-center sm:gap-3">
          <a
            className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-700 px-4 py-2 text-white shadow-sm transition hover:bg-blue-800"
            href="/sign-in"
          >
            <LogIn size={16} />
            Sign In
          </a>
        </div>
      </div>
    </header>
  );
}

export default Header;
