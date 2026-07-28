import { CONTINUE_EXPERIENCE_LABEL } from "../constants";
import type { TodaysTeachingView } from "../types";
import ActionCard from "./ActionCard";
import OutcomeList from "./OutcomeList";

type TodaysTeachingCardProps = {
  teaching: TodaysTeachingView;
  onContinue: () => void;
};

function TodaysTeachingCard({
  teaching,
  onContinue,
}: TodaysTeachingCardProps) {
  return (
    <ActionCard>
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-16">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
            Outcomes
          </p>
          <div className="mt-6">
            <OutcomeList outcomes={teaching.outcomes} />
          </div>

          <div className="mt-10">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
              Estimated completion time
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
              {teaching.estimatedCompletionLabel}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onContinue}
          className="inline-flex h-12 items-center justify-center rounded-2xl bg-slate-900 px-6 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2"
        >
          {CONTINUE_EXPERIENCE_LABEL}
        </button>
      </div>
    </ActionCard>
  );
}

export default TodaysTeachingCard;
