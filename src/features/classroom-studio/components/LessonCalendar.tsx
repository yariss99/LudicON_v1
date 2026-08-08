import { useClassroomStudio } from "../hooks/useClassroomStudio";

export function LessonCalendar() {
  const {
    session,
    addCalendarEvent,
    updateCalendarEvent,
    deleteCalendarEvent,
  } = useClassroomStudio();

  const events = [...session.calendarEvents].sort((a, b) =>
    a.date.localeCompare(b.date),
  );

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            Lesson Calendar
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Schedule teaching sessions across days.
          </p>
        </div>
        <button
          type="button"
          onClick={() => addCalendarEvent()}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
        >
          Add event
        </button>
      </div>

      <div className="space-y-2">
        {events.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-10 text-center text-sm text-slate-500">
            No calendar events yet.
          </div>
        ) : (
          events.map((event) => (
            <article
              key={event.id}
              className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm"
            >
              <div className="flex flex-wrap gap-2">
                <input
                  type="date"
                  value={event.date}
                  onChange={(e) =>
                    updateCalendarEvent(event.id, { date: e.target.value })
                  }
                  className="h-10 rounded-xl border border-slate-200 px-3 text-sm"
                />
                <input
                  value={event.title}
                  onChange={(e) =>
                    updateCalendarEvent(event.id, { title: e.target.value })
                  }
                  className="h-10 min-w-[160px] flex-1 rounded-xl border border-slate-200 px-3 text-sm font-medium"
                />
                <button
                  type="button"
                  className="rounded-xl px-3 text-xs text-red-600"
                  onClick={() => deleteCalendarEvent(event.id)}
                >
                  Delete
                </button>
              </div>
              <textarea
                value={event.notes}
                onChange={(e) =>
                  updateCalendarEvent(event.id, { notes: e.target.value })
                }
                placeholder="Notes…"
                rows={2}
                className="mt-2 w-full rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs"
              />
            </article>
          ))
        )}
      </div>
    </div>
  );
}
