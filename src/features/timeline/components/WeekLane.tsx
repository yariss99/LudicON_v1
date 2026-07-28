import { History } from "lucide-react";
import type {
  SchoolYearTimeline,
  TimelineLesson,
  TimelineWeek,
} from "../../../types/timeline";
import LessonCard from "./LessonCard";

type WeekLaneProps = {
  week: TimelineWeek;
  lessons: TimelineLesson[];
  timeline: SchoolYearTimeline;
  isActive: boolean;
  isCurrent: boolean;
  hasMemory: boolean;
  onMoveRequest: (lessonId: string, toWeekId: string) => void;
  onOpenMemory: (weekNumber: number) => void;
};

function formatRange(week: TimelineWeek): string {
  const start = new Date(week.startDate);
  const end = new Date(week.endDate);
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  return `${start.toLocaleDateString("en-US", opts)} – ${end.toLocaleDateString("en-US", opts)}`;
}

function WeekLane({
  week,
  lessons,
  timeline,
  isActive,
  isCurrent,
  hasMemory,
  onMoveRequest,
  onOpenMemory,
}: WeekLaneProps) {
  return (
    <section
      id={`timeline-week-${week.id}`}
      className={[
        "scroll-mt-36 rounded-3xl px-1 py-1 transition-colors",
        isActive ? "bg-slate-900/[0.02]" : "",
      ].join(" ")}
    >
      <div className="flex items-start gap-4 sm:gap-6">
        {/* Time spine */}
        <div className="relative flex w-14 shrink-0 flex-col items-center sm:w-16">
          <div
            className={[
              "z-10 flex h-10 w-10 items-center justify-center rounded-full text-xs font-semibold",
              isCurrent
                ? "bg-sky-600 text-white shadow-md shadow-sky-600/25"
                : isActive
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-600 ring-1 ring-slate-200",
            ].join(" ")}
          >
            {week.number}
          </div>
          <div className="absolute top-10 bottom-0 w-px bg-gradient-to-b from-slate-200 to-transparent" />
        </div>

        <div className="min-w-0 flex-1 pb-10">
          <div className="flex flex-wrap items-baseline justify-between gap-2 pr-1">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-semibold tracking-tight text-slate-900">
                  {week.label}
                </h3>
                {isCurrent ? (
                  <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-medium text-sky-700 ring-1 ring-sky-100">
                    This week
                  </span>
                ) : null}
              </div>
              <p className="mt-0.5 text-xs text-slate-400">
                {formatRange(week)}
                {week.focus ? ` · ${week.focus}` : ""}
              </p>
            </div>
            {hasMemory ? (
              <button
                type="button"
                onClick={() => onOpenMemory(week.number)}
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium text-slate-500 transition-colors hover:bg-white hover:text-slate-800 hover:ring-1 hover:ring-slate-200"
              >
                <History size={12} />
                Last year
              </button>
            ) : null}
          </div>

          {lessons.length === 0 ? (
            <p className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-white/50 px-4 py-6 text-center text-sm text-slate-400">
              Open week — nothing planned yet
            </p>
          ) : (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {lessons.map((lesson) => (
                <LessonCard
                  key={lesson.id}
                  lesson={lesson}
                  related={timeline.resources.filter((r) =>
                    lesson.relatedResourceIds.includes(r.id),
                  )}
                  weeks={timeline.weeks}
                  isCurrentWeek={isCurrent}
                  onMoveRequest={onMoveRequest}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default WeekLane;
