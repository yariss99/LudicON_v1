import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  Brain,
  CalendarDays,
  Fingerprint,
  FolderKanban,
  Sparkles,
} from "lucide-react";

type StudioShellProps = {
  children: ReactNode;
  /** Full-bleed calm canvas without side nav */
  dense?: boolean;
};

function StudioShell({ children, dense = false }: StudioShellProps) {
  return (
    <div className="studio-shell min-h-screen bg-[#FAFBFC] text-slate-900 antialiased">
      <header className="flex items-center justify-between px-6 py-5 sm:px-10">
        <Link to="/" className="flex items-center gap-2.5 no-underline">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white">
            <Sparkles size={16} />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight text-slate-900">
              PRIMA
            </p>
            <p className="text-[11px] text-slate-400">Studio</p>
          </div>
        </Link>

        <div className="flex items-center gap-1">
          <Link
            to="/dna"
            className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-slate-500 no-underline transition-colors hover:bg-white hover:text-slate-800"
          >
            <Fingerprint size={16} />
            DNA
          </Link>
          <Link
            to="/classroom"
            className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-slate-500 no-underline transition-colors hover:bg-white hover:text-slate-800"
          >
            <Brain size={16} />
            Memory
          </Link>
          <Link
            to="/timeline"
            className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-slate-500 no-underline transition-colors hover:bg-white hover:text-slate-800"
          >
            <CalendarDays size={16} />
            Timeline
          </Link>
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-slate-500 no-underline transition-colors hover:bg-white hover:text-slate-800"
          >
            <FolderKanban size={16} />
            Projects
          </Link>
        </div>
      </header>

      <main
        className={
          dense
            ? "px-4 pb-10 sm:px-6 lg:px-8"
            : "mx-auto flex min-h-[calc(100vh-88px)] w-full max-w-3xl flex-col px-6 pb-16 pt-6 sm:px-8"
        }
      >
        {children}
      </main>
    </div>
  );
}

export default StudioShell;
