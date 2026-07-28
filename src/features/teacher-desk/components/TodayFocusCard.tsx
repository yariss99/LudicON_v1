import {
  CONTINUE_EXPERIENCE_LABEL,
} from "../constants";
import type { TodayFocusView } from "../types";
import ActionCard from "./ActionCard";
import LearningJourney from "./LearningJourney";

type TodayFocusCardProps = {
  focus: TodayFocusView;
  onContinue: () => void;
};

function TodayFocusCard({ focus, onContinue }: TodayFocusCardProps) {
  const { experience } = focus;

  return (
    <ActionCard className="h-full">
      <div className="text-center sm:text-left">
        <h3 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          {experience.title}
        </h3>
        <p className="mt-3 text-base text-slate-500">
          {experience.subject} · {experience.grade}
        </p>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,13rem)_minmax(0,1fr)] lg:gap-14">
        <div>
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
            Learning Journey
          </p>
          <LearningJourney stages={focus.stages} />
        </div>

        <div className="flex min-w-0 flex-col justify-between gap-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
              Next Step
            </p>
            <p className="mt-3 text-lg leading-relaxed text-slate-800 sm:text-xl">
              {focus.nextStep}
            </p>

            <div className="mt-8">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                Estimated Time
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                {focus.estimatedTimeLabel}
              </p>
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={onContinue}
              className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-slate-900 px-6 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 sm:w-auto"
            >
              {CONTINUE_EXPERIENCE_LABEL}
            </button>
          </div>
        </div>
      </div>
    </ActionCard>
  );
}

export default TodayFocusCard;
