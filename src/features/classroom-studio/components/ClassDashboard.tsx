import { useState } from "react";
import { Link } from "react-router-dom";
import { ACTIVITY_KIND_LABEL } from "../constants";
import { useClassroomStudio } from "../hooks/useClassroomStudio";
import { LaunchBundleModal } from "./LaunchBundleModal";

export function ClassDashboard() {
  const { project, session, setModule, resources } = useClassroomStudio();
  const [launchOpen, setLaunchOpen] = useState(false);
  const totalMinutes = session.activities.reduce(
    (acc, a) => acc + a.estimatedMinutes,
    0,
  );
  const active = session.activities.find(
    (a) => a.id === session.activeActivityId,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">
            Class Dashboard
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Operational hub for {project.title} — launch resources into one
            teaching experience.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setLaunchOpen(true)}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Launch lesson bundle
          </button>
          <button
            type="button"
            onClick={() => setModule("teaching")}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            Enter Teaching Mode
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Activities", value: String(session.activities.length) },
          { label: "Est. duration", value: `${totalMinutes} min` },
          { label: "Groups", value: String(session.groups.length) },
          {
            label: "Linked resources",
            value: String(
              [
                session.lessonId,
                session.presentationId,
                session.worksheetId,
                session.gameId,
                session.assessmentId,
              ].filter(Boolean).length,
            ),
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm"
          >
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-slate-400">
              {stat.label}
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold tracking-tight">Session</h3>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between gap-2">
              <dt className="text-slate-500">Title</dt>
              <dd className="font-medium text-slate-800">{session.title}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-slate-500">Class</dt>
              <dd className="font-medium text-slate-800">{session.className}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-slate-500">Current activity</dt>
              <dd className="font-medium text-slate-800">
                {active?.title || "—"}
              </dd>
            </div>
          </dl>
          <button
            type="button"
            onClick={() => setModule("timeline")}
            className="mt-4 text-sm font-semibold text-slate-700 underline"
          >
            Edit timeline
          </button>
        </section>

        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold tracking-tight">
            Project library
          </h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li>
              {resources.lessons.length} lessons ·{" "}
              {resources.presentations.length} presentations
            </li>
            <li>
              {resources.worksheets.length} worksheets ·{" "}
              {resources.games.length} games ·{" "}
              {resources.assessments.length} assessments
            </li>
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              to={`/studio/${project.id}/lessons`}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 no-underline hover:bg-slate-50"
            >
              Lessons
            </Link>
            <Link
              to={`/studio/${project.id}/presentations`}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 no-underline hover:bg-slate-50"
            >
              Presentations
            </Link>
            <Link
              to={`/studio/${project.id}/worksheets`}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 no-underline hover:bg-slate-50"
            >
              Worksheets
            </Link>
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold tracking-tight">
          Teaching timeline preview
        </h3>
        <ol className="mt-4 space-y-2">
          {[...session.activities]
            .sort((a, b) => a.order - b.order)
            .map((activity) => (
              <li
                key={activity.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm"
              >
                <span className="font-medium text-slate-800">
                  {activity.title}
                </span>
                <span className="text-xs text-slate-500">
                  {ACTIVITY_KIND_LABEL[activity.kind]} ·{" "}
                  {activity.estimatedMinutes} min
                </span>
              </li>
            ))}
        </ol>
      </section>

      {launchOpen ? (
        <LaunchBundleModal onClose={() => setLaunchOpen(false)} />
      ) : null}
    </div>
  );
}
