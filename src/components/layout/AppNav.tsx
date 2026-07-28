import { NavLink } from "react-router-dom";
import { Home, Library, PlusCircle, Settings } from "lucide-react";
import { teacherProfile } from "../../data/workspaceData";
import { teacherLanguage as t } from "../../i18n";

const navItems = [
  { to: "/", label: t.nav.desk, icon: Home, end: true },
  { to: "/create/experience", label: t.nav.createLesson, icon: PlusCircle, end: false },
  { to: "/library", label: t.nav.library, icon: Library, end: false },
  { to: "/settings", label: t.nav.settings, icon: Settings, end: false },
] as const;

function AppNav() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-[72px] flex-col border-r border-slate-200/80 bg-white lg:w-60">
      <div className="flex h-16 items-center gap-3 px-4 lg:px-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-sm font-semibold text-white">
          P
        </div>
        <div className="hidden min-w-0 lg:block">
          <p className="truncate text-sm font-semibold tracking-tight text-slate-900">
            PRIMA
          </p>
          <p className="truncate text-xs text-slate-500">{t.nav.workspaceSubtitle}</p>
        </div>
      </div>

      <nav
        className="flex flex-1 flex-col gap-1 px-2 py-3 lg:px-3"
        aria-label={t.nav.mainNav}
      >
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              [
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200",
                isActive
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
              ].join(" ")
            }
          >
            <Icon size={20} className="shrink-0" strokeWidth={1.75} />
            <span className="hidden lg:inline">{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-100 p-3 lg:p-4">
        <NavLink
          to="/settings"
          className="flex items-center gap-3 rounded-xl px-2 py-2 text-slate-700 no-underline transition-colors hover:bg-slate-50"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
            {teacherProfile.initials}
          </div>
          <div className="hidden min-w-0 lg:block">
            <p className="truncate text-sm font-medium text-slate-900">
              {teacherProfile.fullName}
            </p>
            <p className="truncate text-xs text-slate-500">{teacherProfile.role}</p>
          </div>
        </NavLink>
      </div>
    </aside>
  );
}

export default AppNav;
