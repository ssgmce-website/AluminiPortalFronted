import logo from "../assets/logo.png";

function Header() {
  return (
    <header className="border-b border-blue-100 bg-white shadow-sm">
      <div className="mx-auto flex min-h-36 max-w-[1425px] flex-col items-center justify-between gap-6 px-5 py-6 text-center md:flex-row md:text-left lg:px-10">
        <div className="flex flex-col items-center gap-5 sm:flex-row">
          <div className="flex h-28 w-28 items-center justify-center border border-blue-100 bg-blue-50 p-2 shadow-sm">
            <img className="h-full w-full object-contain" src={logo} alt="SSGMCE Alumni Connect logo" />
          </div>

          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.22em] text-blue-500">
              Alumni Association
            </p>
            <h1 className="text-2xl font-extrabold leading-tight text-blue-700 md:text-[30px]">
              SSGMCE Alumni Connect
            </h1>
            <p className="mt-2 max-w-2xl text-base font-medium text-slate-500 md:text-lg">
              Shri Sant Gajanan Maharaj College of Engineering, Shegaon
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-wide">
          <a className="border border-blue-200 px-4 py-2 text-blue-700 transition hover:border-blue-600 hover:bg-blue-50" href="#register">
            Register
          </a>
          <a className="bg-blue-700 px-4 py-2 text-white shadow-sm transition hover:bg-blue-800" href="#login">
            Login
          </a>
        </div>
      </div>
    </header>
  );
}

export default Header;
