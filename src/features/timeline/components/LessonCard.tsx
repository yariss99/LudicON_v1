import { Link } from "react-router-dom";
import type {
  TimelineLesson,
  TimelineRelatedResource,
  TimelineWeek,
} from "../../../types/timeline";
import { RESOURCE_KIND_LABEL } from "../constants";
import StatusBadge from "./StatusBadge";

type LessonCardProps = {
  lesson: TimelineLesson;
  related: TimelineRelatedResource[];
  weeks: TimelineWeek[];
  isCurrentWeek: boolean;
  onMoveRequest: (lessonId: string, toWeekId: string) => void;
};

function formatDateRange(week: TimelineWeek): string {
  const start = new Date(week.startDate);
  const end = new Date(week.endDate);
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  return `${start.toLocaleDateString("en-US", opts)} – ${end.toLocaleDateString("en-US", opts)}`;
}

function LessonCard({
  lesson,
  related,
  weeks,
  isCurrentWeek,
  onMoveRequest,
}: LessonCardProps) {
  const otherWeeks = weeks.filter((week) => week.id !== lesson.weekId);

  return (
    <article
      className={[
        "group relative rounded-2xl bg-white p-4 shadow-sm shadow-slate-900/[0.03] ring-1 transition-shadow",
        isCurrentWeek
          ? "ring-sky-200/90 shadow-sky-900/[0.04]"
          : "ring-slate-200/70 hover:shadow-md hover:shadow-slate-900/[0.05]",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={lesson.status} />
            <span className="text-[11px] text-slate-400">
              {lesson.durationMinutes} min
            </span>
          </div>
          <h4 className="mt-2 text-[15px] font-semibold tracking-tight text-slate-900">
            {lesson.title}
          </h4>
          <p className="mt-0.5 text-xs text-slate-500">
            {lesson.subject} · {lesson.grade}
          </p>
        </div>
        {lesson.projectId ? (
          <Link
            to={`/studio/${lesson.projectId}`}
            className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium text-slate-500 no-underline transition-colors hover:bg-slate-50 hover:text-slate-800"
          >
            Open
          </Link>
        ) : null}
      </div>

      {related.length > 0 ? (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {related.map((resource) => (
            <li
              key={resource.id}
              className="rounded-md bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-500"
              title={RESOURCE_KIND_LABEL[resource.kind]}
            >
              {resource.label}
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-3 border-t border-slate-100 pt-3">
        <label className="flex items-center gap-2 text-xs text-slate-500">
          <span className="shrink-0">Move to</span>
          <select
            className="min-w-0 flex-1 rounded-lg border-0 bg-slate-50 py-1.5 pl-2 pr-6 text-xs font-medium text-slate-700 ring-1 ring-slate-200/80 focus:outline-none focus:ring-2 focus:ring-slate-300"
            defaultValue=""
            onChange={(event) => {
              const toWeekId = event.target.value;
              if (!toWeekId) return;
              onMoveRequest(lesson.id, toWeekId);
              event.target.value = "";
            }}
          >
            <option value="" disabled>
              Choose week…
            </option>
            {otherWeeks.map((week) => (
              <option key={week.id} value={week.id}>
                {week.label} · {formatDateRange(week)}
              </option>
            ))}
          </select>
        </label>
      </div>
    </article>
  );
}

export default LessonCard;
