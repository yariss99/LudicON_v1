import { FUTURE_PLACEHOLDERS } from "../constants";
import { useClassroomStudio } from "../hooks/useClassroomStudio";

export function ClassroomProgress() {
  const { session, resources } = useClassroomStudio();
  const linked = [
    session.lessonId,
    session.presentationId,
    session.worksheetId,
    session.gameId,
    session.assessmentId,
  ].filter(Boolean).length;
  const totalMinutes = session.activities.reduce(
    (acc, a) => acc + a.estimatedMinutes,
    0,
  );
  const withNotes = session.activities.filter((a) =>
    a.teacherNotes.trim(),
  ).length;
  const readiness = Math.round(
    ((linked / 5) * 0.4 +
      (withNotes / Math.max(session.activities.length, 1)) * 0.3 +
      (session.groups.length > 0 ? 0.15 : 0) +
      (session.calendarEvents.length > 0 ? 0.15 : 0)) *
      100,
  );

  return (
    <div>
      <h2 className="text-xl font-semibold tracking-tight">
        Classroom Progress
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        Session readiness — how complete this teaching plan is.
      </p>

      <div className="mt-6 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
          Readiness
        </p>
        <p className="mt-2 text-4xl font-semibold tracking-tight text-slate-900">
          {readiness}%
        </p>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-slate-900 transition-all"
            style={{ width: `${readiness}%` }}
          />
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Linked resources", value: `${linked} / 5` },
          { label: "Timeline length", value: `${totalMinutes} min` },
          {
            label: "Activities with notes",
            value: `${withNotes} / ${session.activities.length}`,
          },
          {
            label: "Library size",
            value: String(
              resources.lessons.length +
                resources.worksheets.length +
                resources.assessments.length +
                resources.presentations.length +
                resources.games.length,
            ),
          },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-slate-200/80 bg-white p-4"
          >
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-slate-400">
              {s.label}
            </p>
            <p className="mt-2 text-xl font-semibold text-slate-900">
              {s.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-semibold tracking-tight">
          Coming to Classroom Studio
        </h3>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {FUTURE_PLACEHOLDERS.map((p) => (
            <li
              key={p.id}
              className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-3"
            >
              <p className="text-sm font-semibold text-slate-700">{p.label}</p>
              <p className="mt-0.5 text-xs text-slate-500">{p.detail}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
