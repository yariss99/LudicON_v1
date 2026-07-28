import { useMemo } from "react";
import MemoryPanel from "./components/MemoryPanel";
import MoveSuggestionDialog from "./components/MoveSuggestionDialog";
import TimelineShell from "./components/TimelineShell";
import WeekJumpNav from "./components/WeekJumpNav";
import WeekLane from "./components/WeekLane";
import { useTimeline } from "./hooks/useTimeline";

function TimelinePage() {
  const {
    timeline,
    activeWeekId,
    currentWeekId,
    pendingMove,
    memoryWeekNumber,
    memoryEntries,
    jumpToWeek,
    requestMove,
    confirmPendingMove,
    cancelPendingMove,
    openMemory,
    closeMemory,
  } = useTimeline();

  const monthsBySemester = useMemo(() => {
    return timeline.semesters.map((semester) => ({
      semester,
      months: timeline.months.filter((m) => m.semesterId === semester.id),
    }));
  }, [timeline.months, timeline.semesters]);

  const memoryWeekNumbers = useMemo(
    () => new Set(timeline.memory.map((m) => m.weekNumber)),
    [timeline.memory],
  );

  return (
    <TimelineShell>
      <header className="mb-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
          School year
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900 sm:text-[2.15rem]">
          {timeline.label}
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-500">
          Weeks, not folders. Jump to any moment in the year — lessons, resources,
          and last year&apos;s memory stay connected.
        </p>
      </header>

      <div className="sticky top-0 z-30 -mx-1 mb-8 rounded-2xl bg-[#F4F6F8]/85 px-1 py-3 backdrop-blur-md">
        <WeekJumpNav
          weeks={timeline.weeks}
          activeWeekId={activeWeekId}
          currentWeekId={currentWeekId}
          onJump={jumpToWeek}
        />
      </div>

      <div className="space-y-2">
        {monthsBySemester.map(({ semester, months }) => (
          <div key={semester.id} className="space-y-1">
            <div className="mb-4 flex items-center gap-3 pt-2">
              <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                {semester.label}
              </h2>
              <div className="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent" />
            </div>

            {months.map((month) => {
              const weeks = timeline.weeks.filter((w) => w.monthId === month.id);
              if (weeks.length === 0) return null;

              return (
                <div key={month.id} className="mb-2">
                  <p className="mb-3 ml-[3.75rem] text-[13px] font-medium text-slate-600 sm:ml-[4.25rem]">
                    {month.label}
                  </p>
                  {weeks.map((week) => (
                    <WeekLane
                      key={week.id}
                      week={week}
                      lessons={timeline.lessons.filter(
                        (l) => l.weekId === week.id,
                      )}
                      timeline={timeline}
                      isActive={week.id === activeWeekId}
                      isCurrent={week.id === currentWeekId}
                      hasMemory={memoryWeekNumbers.has(week.number)}
                      onMoveRequest={requestMove}
                      onOpenMemory={openMemory}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {pendingMove ? (
        <MoveSuggestionDialog
          suggestion={pendingMove}
          fromWeek={timeline.weeks.find((w) => w.id === pendingMove.fromWeekId)}
          toWeek={timeline.weeks.find((w) => w.id === pendingMove.toWeekId)}
          onConfirm={confirmPendingMove}
          onCancel={cancelPendingMove}
        />
      ) : null}

      {memoryWeekNumber != null ? (
        <MemoryPanel
          weekNumber={memoryWeekNumber}
          yearLabel={timeline.previousYearLabel}
          entries={memoryEntries}
          onClose={closeMemory}
        />
      ) : null}
    </TimelineShell>
  );
}

export default TimelinePage;
