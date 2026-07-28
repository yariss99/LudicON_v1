import type { TimelineMemoryEntry } from "../../../types/timeline";

type MemoryPanelProps = {
  weekNumber: number;
  yearLabel: string;
  entries: TimelineMemoryEntry[];
  onClose: () => void;
};

function MemoryPanel({
  weekNumber,
  yearLabel,
  entries,
  onClose,
}: MemoryPanelProps) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/20 backdrop-blur-[1px]">
      <aside
        className="flex h-full w-full max-w-md flex-col bg-white shadow-2xl shadow-slate-900/10 ring-1 ring-slate-200/60"
        aria-label="Last year memory"
      >
        <header className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
              Memory · {yearLabel}
            </p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-900">
              Week {weekNumber}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              What happened last year — so you plan with context, not guesswork.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-50 hover:text-slate-800"
          >
            Close
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {entries.length === 0 ? (
            <p className="text-sm text-slate-500">
              No notes from last year for this week yet. Teach it once — Timeline
              will remember.
            </p>
          ) : (
            <ul className="space-y-5">
              {entries.map((entry) => (
                <li
                  key={entry.id}
                  className="rounded-2xl bg-gradient-to-br from-slate-50 to-white p-4 ring-1 ring-slate-100"
                >
                  <h3 className="font-semibold text-slate-900">{entry.title}</h3>
                  <dl className="mt-3 space-y-2.5 text-sm">
                    <div>
                      <dt className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                        Notes
                      </dt>
                      <dd className="mt-0.5 text-slate-700">{entry.notes}</dd>
                    </div>
                    <div>
                      <dt className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                        Activities
                      </dt>
                      <dd className="mt-0.5 text-slate-700">{entry.activities}</dd>
                    </div>
                    <div>
                      <dt className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                        Results
                      </dt>
                      <dd className="mt-0.5 text-slate-700">{entry.results}</dd>
                    </div>
                    <div>
                      <dt className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                        Reflection
                      </dt>
                      <dd className="mt-0.5 text-slate-700">{entry.reflection}</dd>
                    </div>
                  </dl>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </div>
  );
}

export default MemoryPanel;
