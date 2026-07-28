import type { TimelineWeek } from "../../../types/timeline";

type WeekJumpNavProps = {
  weeks: TimelineWeek[];
  activeWeekId: string;
  currentWeekId: string;
  onJump: (weekId: string) => void;
};

function WeekJumpNav({
  weeks,
  activeWeekId,
  currentWeekId,
  onJump,
}: WeekJumpNavProps) {
  return (
    <nav
      aria-label="Jump to week"
      className="flex gap-1.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {weeks.map((week) => {
        const isActive = week.id === activeWeekId;
        const isNow = week.id === currentWeekId;
        return (
          <button
            key={week.id}
            type="button"
            onClick={() => onJump(week.id)}
            className={[
              "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-all",
              isActive
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white/80 text-slate-600 ring-1 ring-slate-200/80 hover:bg-white hover:text-slate-900",
              isNow && !isActive ? "ring-sky-300 text-sky-800" : "",
            ].join(" ")}
          >
            W{week.number}
            {isNow ? (
              <span className="ml-1 opacity-70">{isActive ? "· now" : ""}</span>
            ) : null}
          </button>
        );
      })}
    </nav>
  );
}

export default WeekJumpNav;
