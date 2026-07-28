import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { teacherProfile } from "../../../data/workspaceData";

type DeskShellProps = {
  children: ReactNode;
};

function DeskShell({ children }: DeskShellProps) {
  return (
    <div className="desk-shell relative min-h-screen overflow-x-hidden bg-[#F6F7F9] text-slate-900 antialiased">
      <div className="desk-ambient pointer-events-none absolute inset-0" aria-hidden />

      <header className="relative z-20 flex items-center justify-between border-b border-slate-200/60 px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5 no-underline">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
            <Sparkles size={16} />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight">PRIMA</p>
            <p className="text-[11px] text-slate-400">Biroul meu</p>
          </div>
        </Link>

        <div className="flex items-center gap-2">
        <Link
          to="/dna"
          className="rounded-full px-3 py-2 text-sm font-medium text-slate-500 no-underline transition-colors hover:bg-white hover:text-slate-800"
        >
          DNA
        </Link>
        <Link
          to="/classroom"
          className="rounded-full px-3 py-2 text-sm font-medium text-slate-500 no-underline transition-colors hover:bg-white hover:text-slate-800"
        >
          Memory
        </Link>
        <Link
          to="/timeline"
          className="rounded-full px-3 py-2 text-sm font-medium text-slate-500 no-underline transition-colors hover:bg-white hover:text-slate-800"
        >
          Timeline
        </Link>
        <Link
          to="/profile"
          className="inline-flex items-center gap-2 rounded-full bg-white px-2.5 py-1.5 text-sm text-slate-700 shadow-[0_4px_16px_rgba(15,23,42,0.06)] no-underline transition-transform hover:scale-[1.02]"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold">
            {teacherProfile.initials}
          </span>
          <span className="hidden pr-1 sm:inline">{teacherProfile.firstName}</span>
        </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-[1400px] px-3 py-4 sm:px-5 sm:py-6 lg:px-6">
        {children}
      </main>
    </div>
  );
}

export default DeskShell;
