import { formatRelativeTime } from "../../../utils/date";
import { CLASSROOM_MODULES } from "../constants";
import { useClassroomStudio } from "../hooks/useClassroomStudio";
import type { ClassroomModuleId } from "../types";
import { ClassDashboard } from "./ClassDashboard";
import { ClassroomProgress } from "./ClassroomProgress";
import { GroupsPanel } from "./GroupsPanel";
import { LessonCalendar } from "./LessonCalendar";
import { PortfoliosPlaceholder } from "./PortfoliosPlaceholder";
import { TeachingMode } from "./TeachingMode";
import { TeachingTimeline } from "./TeachingTimeline";

type Props = {
  embedded?: boolean;
};

export function ClassroomStudioShell({ embedded = false }: Props) {
  const {
    project,
    session,
    module,
    setModule,
    autosave,
    lastSavedAt,
    updateSession,
    saveNow,
  } = useClassroomStudio();

  const autosaveLabel =
    autosave === "saving"
      ? "Saving…"
      : autosave === "dirty"
        ? "Editing…"
        : lastSavedAt
          ? `Saved ${formatRelativeTime(lastSavedAt)}`
          : "Synced";

  return (
    <div
      className={[
        "flex flex-col bg-[#F7F8FA] text-slate-900",
        embedded ? "min-h-[70vh]" : "min-h-screen",
      ].join(" ")}
    >
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/95 px-4 py-3 backdrop-blur sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1
              className={[
                "font-semibold tracking-tight",
                embedded ? "text-xl" : "text-2xl",
              ].join(" ")}
            >
              Classroom Studio
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {session.className} · {project.title}
              <span className="ml-2 text-xs text-slate-400">
                {autosaveLabel}
              </span>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              value={session.title}
              onChange={(e) => updateSession({ title: e.target.value })}
              className="h-10 rounded-xl border border-slate-200 px-3 text-sm"
              aria-label="Session title"
            />
            <input
              value={session.className}
              onChange={(e) => updateSession({ className: e.target.value })}
              className="h-10 w-32 rounded-xl border border-slate-200 px-3 text-sm"
              aria-label="Class name"
            />
            <button
              type="button"
              onClick={saveNow}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
            >
              Save
            </button>
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <nav className="hidden w-52 shrink-0 overflow-auto border-r border-slate-200 bg-white p-3 md:block">
          <p className="mb-2 px-2 text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-slate-400">
            Modules
          </p>
          <ul className="flex flex-col gap-0.5">
            {CLASSROOM_MODULES.map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => setModule(m.id)}
                  className={[
                    "w-full rounded-xl px-3 py-2 text-left text-sm transition",
                    module === m.id
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-50",
                  ].join(" ")}
                >
                  {m.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex gap-1 overflow-x-auto border-b border-slate-200 bg-white px-4 py-2 md:hidden">
            {CLASSROOM_MODULES.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setModule(m.id as ClassroomModuleId)}
                className={[
                  "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium",
                  module === m.id
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600",
                ].join(" ")}
              >
                {m.label}
              </button>
            ))}
          </div>

          <main className="min-h-0 flex-1 overflow-auto px-4 py-5 sm:px-6">
            {module === "dashboard" ? <ClassDashboard /> : null}
            {module === "timeline" ? <TeachingTimeline /> : null}
            {module === "groups" ? <GroupsPanel /> : null}
            {module === "portfolios" ? <PortfoliosPlaceholder /> : null}
            {module === "calendar" ? <LessonCalendar /> : null}
            {module === "progress" ? <ClassroomProgress /> : null}
            {module === "teaching" ? <TeachingMode /> : null}
          </main>
        </div>
      </div>
    </div>
  );
}
