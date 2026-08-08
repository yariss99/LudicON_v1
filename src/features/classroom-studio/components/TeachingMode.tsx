import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ACTIVITY_KIND_LABEL, CLASSROOM_AI_SUGGESTIONS } from "../constants";
import { useClassroomStudio } from "../hooks/useClassroomStudio";

export function TeachingMode() {
  const {
    session,
    setActiveActivity,
    updateActivity,
    updateSession,
    setModule,
  } = useClassroomStudio();

  const activities = useMemo(
    () => [...session.activities].sort((a, b) => a.order - b.order),
    [session.activities],
  );
  const index = activities.findIndex((a) => a.id === session.activeActivityId);
  const current = index >= 0 ? activities[index] : activities[0];
  const next = current
    ? activities[activities.findIndex((a) => a.id === current.id) + 1]
    : undefined;
  const totalMinutes = activities.reduce(
    (acc, a) => acc + a.estimatedMinutes,
    0,
  );

  if (!current) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center">
        <p className="text-sm text-slate-500">
          Add activities to the timeline first.
        </p>
        <button
          type="button"
          className="mt-4 text-sm font-semibold underline"
          onClick={() => setModule("timeline")}
        >
          Open timeline
        </button>
      </div>
    );
  }

  const go = (dir: -1 | 1) => {
    const i = activities.findIndex((a) => a.id === current.id);
    const target = activities[i + dir];
    if (target) setActiveActivity(target.id);
  };

  return (
    <div className="flex min-h-[70vh] flex-col gap-4 lg:flex-row">
      <div className="flex min-w-0 flex-1 flex-col rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm lg:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[0.65rem] font-semibold text-slate-500">
            Teaching Mode
          </span>
          <span className="text-xs text-slate-400">
            Activity {(index >= 0 ? index : 0) + 1} / {activities.length} · ~
            {totalMinutes} min session
          </span>
        </div>
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.1em] text-slate-400">
          Current activity · {ACTIVITY_KIND_LABEL[current.kind]}
        </p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          {current.title}
        </h2>
        <p className="mt-3 text-sm text-slate-500">
          Estimated duration · {current.estimatedMinutes} min
        </p>

        <div className="mt-8 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={index <= 0}
            onClick={() => go(-1)}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium disabled:opacity-40"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={!next}
            onClick={() => go(1)}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
          >
            Next activity
          </button>
          {current.resourceHref ? (
            <Link
              to={current.resourceHref}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-800 no-underline hover:bg-slate-50"
            >
              Open resource
            </Link>
          ) : null}
        </div>

        <div className="mt-8">
          <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
            Quick resource switch
          </h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {activities
              .filter((a) => a.resourceHref)
              .map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setActiveActivity(a.id)}
                  className={[
                    "rounded-lg px-3 py-1.5 text-xs font-medium",
                    a.id === current.id
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200",
                  ].join(" ")}
                >
                  {ACTIVITY_KIND_LABEL[a.kind]}
                </button>
              ))}
          </div>
        </div>
      </div>

      <aside className="flex w-full shrink-0 flex-col gap-4 lg:w-80">
        <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold tracking-tight">
            Teacher notes
          </h3>
          <textarea
            value={current.teacherNotes}
            onChange={(e) =>
              updateActivity(current.id, { teacherNotes: e.target.value })
            }
            rows={5}
            className="mt-2 w-full resize-y rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm outline-none"
            placeholder="Facilitation notes for this activity…"
          />
        </section>

        <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold tracking-tight">
            Next activity
          </h3>
          {next ? (
            <div className="mt-2">
              <p className="font-medium text-slate-800">{next.title}</p>
              <p className="mt-1 text-xs text-slate-500">
                {ACTIVITY_KIND_LABEL[next.kind]} · {next.estimatedMinutes} min
              </p>
            </div>
          ) : (
            <p className="mt-2 text-sm text-slate-400">End of session</p>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold tracking-tight">
            Session notes
          </h3>
          <textarea
            value={session.teachingNotes}
            onChange={(e) => updateSession({ teachingNotes: e.target.value })}
            rows={3}
            className="mt-2 w-full rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm outline-none"
            placeholder="Whole-class observations…"
          />
        </section>

        <section className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-4">
          <h3 className="text-sm font-semibold tracking-tight">
            Classroom suggestions
          </h3>
          <ul className="mt-3 space-y-2">
            {CLASSROOM_AI_SUGGESTIONS.map((s) => (
              <li
                key={s.id}
                className="rounded-xl border border-slate-100 bg-white px-3 py-2"
              >
                <p className="text-xs font-semibold text-slate-700">
                  {s.label}
                </p>
                <p className="mt-0.5 text-[0.7rem] text-slate-500">
                  {s.detail}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </aside>
    </div>
  );
}
