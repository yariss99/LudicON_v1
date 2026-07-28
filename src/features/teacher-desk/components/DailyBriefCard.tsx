import type { DailyBriefView } from "../types";
import ActionCard from "./ActionCard";

type DailyBriefCardProps = {
  brief: DailyBriefView;
  onPrimary: () => void;
};

function DailyBriefCard({ brief, onPrimary }: DailyBriefCardProps) {
  return (
    <ActionCard className="relative overflow-hidden bg-gradient-to-br from-white via-white to-slate-50/90 transition-shadow duration-300">
      <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
        <div className="min-w-0 max-w-2xl">
          <p className="text-sm font-medium text-slate-500">{brief.dayLabel}</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            {brief.greeting}, {brief.teacherName}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-slate-500">
            {brief.introduction}
          </p>

          {brief.summary.length > 0 ? (
            <ul
              className="mt-8 space-y-3"
              aria-label="Today's priorities"
            >
              {brief.summary.map((item) => (
                <li
                  key={item.id}
                  className="flex items-start gap-3 text-base leading-snug text-slate-700"
                >
                  <span
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400"
                    aria-hidden
                  />
                  <span>{item.label}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="shrink-0">
          <button
            type="button"
            onClick={onPrimary}
            className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-slate-900 px-7 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 sm:w-auto"
          >
            {brief.primaryLabel}
          </button>
        </div>
      </div>
    </ActionCard>
  );
}

export default DailyBriefCard;
