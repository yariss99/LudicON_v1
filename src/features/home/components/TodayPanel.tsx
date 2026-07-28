import { TODAY_SCHEDULE } from "../constants";

type TodayPanelProps = {
  onSuggestion: (prompt: string) => void;
};

function TodayPanel({ onSuggestion }: TodayPanelProps) {
  return (
    <section className="desk-enter desk-enter-delay-3 rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-[0_12px_32px_rgba(15,23,42,0.04)]">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
        Today&apos;s focus
      </p>
      <h2 className="mt-2 text-lg font-semibold tracking-tight text-slate-900">
        What do you need today?
      </h2>

      <ol className="mt-5 space-y-0">
        {TODAY_SCHEDULE.map((item, index) => (
          <li key={item.id} className="relative flex gap-4 pb-5 last:pb-0">
            {index < TODAY_SCHEDULE.length - 1 ? (
              <span className="absolute left-[5px] top-3 h-[calc(100%-8px)] w-px bg-slate-100" />
            ) : null}
            <span className="relative mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-slate-900 ring-4 ring-slate-100" />
            <div>
              <p className="text-xs font-medium text-slate-400">{item.time}</p>
              <p className="text-sm font-semibold text-slate-900">
                {item.subject}
              </p>
              {item.note ? (
                <p className="text-xs text-slate-500">{item.note}</p>
              ) : null}
            </div>
          </li>
        ))}
      </ol>

      <button
        type="button"
        onClick={() =>
          onSuggestion(
            "Create a differentiated worksheet for Mathematics Grade 3 about fractions.",
          )
        }
        className="mt-2 w-full rounded-2xl bg-[#FFF6E8] px-4 py-3.5 text-left transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(180,130,40,0.12)]"
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-800/80">
          Reminder
        </p>
        <p className="mt-1 text-sm leading-relaxed text-amber-950">
          You still need a worksheet for Mathematics.
        </p>
      </button>
    </section>
  );
}

export default TodayPanel;
