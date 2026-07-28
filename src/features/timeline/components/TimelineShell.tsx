import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, Sparkles } from "lucide-react";

type TimelineShellProps = {
  children: ReactNode;
};

function TimelineShell({ children }: TimelineShellProps) {
  return (
    <div className="timeline-shell min-h-screen text-slate-900 antialiased">
      <div className="timeline-atmosphere pointer-events-none fixed inset-0" aria-hidden />
      <header className="relative z-20 flex items-center justify-between px-5 py-4 sm:px-8">
        <Link to="/" className="flex items-center gap-2.5 no-underline">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white">
            <Sparkles size={16} />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight text-slate-900">
              PRIMA
            </p>
            <p className="text-[11px] text-slate-400">Timeline</p>
          </div>
        </Link>

        <div className="flex items-center gap-1">
          <span className="hidden items-center gap-1.5 rounded-full bg-white/70 px-3 py-1.5 text-xs font-medium text-slate-500 ring-1 ring-slate-200/60 sm:inline-flex">
            <CalendarDays size={13} />
            Navigate by week
          </span>
          <Link
            to="/classroom"
            className="rounded-full px-3 py-2 text-sm font-medium text-slate-500 no-underline transition-colors hover:bg-white/80 hover:text-slate-800"
          >
            Memory
          </Link>
          <Link
            to="/desk"
            className="rounded-full px-3 py-2 text-sm font-medium text-slate-500 no-underline transition-colors hover:bg-white/80 hover:text-slate-800"
          >
            Desk
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-3xl px-5 pb-24 sm:px-8">
        {children}
      </main>
    </div>
  );
}

export default TimelineShell;
