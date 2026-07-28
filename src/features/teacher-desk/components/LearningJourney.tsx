import { Check } from "lucide-react";
import type { JourneyStage } from "../types";

type LearningJourneyProps = {
  stages: JourneyStage[];
};

function LearningJourney({ stages }: LearningJourneyProps) {
  return (
    <ol
      className="relative space-y-0"
      aria-label="Learning journey stages"
    >
      {stages.map((stage, index) => {
        const isLast = index === stages.length - 1;
        const isCompleted = stage.status === "completed";
        const isCurrent = stage.status === "current";

        return (
          <li key={stage.id} className="relative flex gap-4">
            <div className="flex w-8 flex-col items-center">
              <span
                className={[
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                  isCompleted
                    ? "bg-slate-900 text-white"
                    : isCurrent
                      ? "bg-sky-600 text-white ring-4 ring-sky-100"
                      : "bg-slate-100 text-slate-400 ring-1 ring-slate-200/80",
                ].join(" ")}
                aria-hidden
              >
                {isCompleted ? <Check size={14} strokeWidth={2.5} /> : index + 1}
              </span>
              {!isLast ? (
                <span
                  className={[
                    "mt-1 w-px flex-1 min-h-[1.25rem]",
                    isCompleted ? "bg-slate-900" : "bg-slate-200",
                  ].join(" ")}
                  aria-hidden
                />
              ) : null}
            </div>

            <div className={isLast ? "pb-0 pt-1" : "pb-5 pt-1"}>
              <p
                className={[
                  "text-sm font-semibold",
                  isCurrent
                    ? "text-slate-900"
                    : isCompleted
                      ? "text-slate-700"
                      : "text-slate-400",
                ].join(" ")}
              >
                {stage.label}
              </p>
              <p className="mt-0.5 text-xs font-medium capitalize text-slate-400">
                <span className="sr-only">Status: </span>
                {stage.status}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export default LearningJourney;
