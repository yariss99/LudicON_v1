import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ACTIVITY_KIND_LABEL } from "../constants";
import { useClassroomStudio } from "../hooks/useClassroomStudio";
import type { ClassroomActivityKind } from "../types";

export function TeachingTimeline() {
  const {
    session,
    addActivity,
    updateActivity,
    deleteActivity,
    reorderActivities,
    setActiveActivity,
  } = useClassroomStudio();
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const fromRef = useRef<number | null>(null);

  const activities = useMemo(
    () => [...session.activities].sort((a, b) => a.order - b.order),
    [session.activities],
  );

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            Teaching Timeline
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Sequence the class period — drag to reorder.
          </p>
        </div>
        <button
          type="button"
          onClick={() => addActivity()}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
        >
          Add activity
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {activities.map((activity, index) => (
          <article
            key={activity.id}
            draggable
            onDragStart={() => {
              setDraggingId(activity.id);
              fromRef.current = index;
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              const from = fromRef.current;
              if (from != null) reorderActivities(from, index);
              setDraggingId(null);
              fromRef.current = null;
            }}
            className={[
              "rounded-2xl border bg-white p-4 shadow-sm",
              session.activeActivityId === activity.id
                ? "border-slate-900/25"
                : "border-slate-200/80",
              draggingId === activity.id ? "opacity-50" : "",
            ].join(" ")}
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="cursor-grab text-slate-300">⋮⋮</span>
              <input
                value={activity.title}
                onChange={(e) =>
                  updateActivity(activity.id, { title: e.target.value })
                }
                className="min-w-0 flex-1 border-none bg-transparent text-base font-semibold outline-none"
              />
              <select
                value={activity.kind}
                onChange={(e) =>
                  updateActivity(activity.id, {
                    kind: e.target.value as ClassroomActivityKind,
                  })
                }
                className="h-8 rounded-lg border border-slate-200 px-2 text-xs"
              >
                {Object.entries(ACTIVITY_KIND_LABEL).map(([id, label]) => (
                  <option key={id} value={id}>
                    {label}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={1}
                value={activity.estimatedMinutes}
                onChange={(e) =>
                  updateActivity(activity.id, {
                    estimatedMinutes: Number(e.target.value) || 5,
                  })
                }
                className="h-8 w-16 rounded-lg border border-slate-200 px-2 text-xs"
                title="Minutes"
              />
              <button
                type="button"
                className="rounded-lg px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                onClick={() => setActiveActivity(activity.id)}
              >
                Set current
              </button>
              <button
                type="button"
                className="rounded-lg px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                onClick={() => deleteActivity(activity.id)}
              >
                Delete
              </button>
            </div>
            <textarea
              value={activity.teacherNotes}
              onChange={(e) =>
                updateActivity(activity.id, { teacherNotes: e.target.value })
              }
              rows={2}
              placeholder="Teacher notes…"
              className="mt-2 w-full resize-y rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2 text-xs text-slate-600 outline-none"
            />
            {activity.resourceHref ? (
              <Link
                to={activity.resourceHref}
                className="mt-2 inline-flex text-xs font-semibold text-slate-700 underline"
              >
                Open resource
              </Link>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
}
