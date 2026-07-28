import { Link } from "react-router-dom";
import { Bell, Search, Settings, Sparkles } from "lucide-react";
import { dashboardRo } from "../../i18n";

const { header } = dashboardRo;

function DashboardHeader() {
  return (
    <div className="sticky top-0 z-50 bg-white px-6 pt-4 sm:px-12">
      <header className="mx-auto flex h-20 w-full max-w-[1440px] items-center justify-between gap-6">
        <Link
          to="/"
          className="flex shrink-0 items-center gap-3 no-underline text-inherit"
          aria-label="Acasă"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 shadow-lg shadow-indigo-300/40">
            <Sparkles className="text-white" size={18} />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900">
            LUDI<span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {" "}
              ON
            </span>
          </span>
        </Link>

        <div className="hidden flex-1 justify-center px-8 lg:flex">
          <div className="relative w-full max-w-xl">
            <Search
              className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
              size={20}
            />
            <input
              type="search"
              placeholder={header.searchPlaceholder}
              className="h-14 w-full rounded-full bg-white pl-14 pr-6 text-sm text-slate-900 shadow-[0_4px_20px_rgba(15,23,42,0.06)] outline-none transition-all placeholder:text-slate-400 focus:shadow-[0_4px_24px_rgba(15,23,42,0.1)] focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            className="relative flex h-11 w-11 items-center justify-center rounded-full bg-[#F8FAFC] text-slate-600 transition-all hover:bg-amber-50 hover:text-amber-600"
            aria-label={header.notifications}
          >
            <Bell size={18} />
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-amber-500 ring-2 ring-white" />
          </button>

          <Link
            to="/settings"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F8FAFC] text-slate-600 transition-all hover:bg-indigo-50 hover:text-indigo-600"
            aria-label={header.settings}
          >
            <Settings size={18} />
          </Link>

          <Link
            to="/settings"
            className="flex items-center gap-3 rounded-full bg-[#F8FAFC] py-1.5 pl-1.5 pr-4 no-underline transition-all hover:bg-indigo-50/80"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-xs font-semibold text-white">
              MR
            </div>
            <div className="hidden text-left md:block">
              <p className="text-sm font-medium leading-tight text-slate-900">
                Maria Radu
              </p>
              <p className="text-xs text-slate-500">{header.role}</p>
            </div>
          </Link>
        </div>
      </header>
    </div>
  );
}

export default DashboardHeader;
