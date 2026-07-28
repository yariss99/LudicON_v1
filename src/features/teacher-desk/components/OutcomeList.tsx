import { Check } from "lucide-react";
import type { TeachingOutcome } from "../types";

type OutcomeListProps = {
  outcomes: TeachingOutcome[];
};

function OutcomeList({ outcomes }: OutcomeListProps) {
  return (
    <ul className="space-y-4" aria-label="Today's teaching outcomes">
      {outcomes.map((outcome) => {
        const completed = outcome.status === "completed";

        return (
          <li key={outcome.id} className="flex items-center gap-3">
            <span
              className={[
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs",
                completed
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-300 ring-1 ring-slate-200",
              ].join(" ")}
              aria-hidden
            >
              {completed ? (
                <Check size={14} strokeWidth={2.5} />
              ) : (
                <span className="h-2 w-2 rounded-full bg-slate-300" />
              )}
            </span>
            <span
              className={[
                "text-base",
                completed
                  ? "font-medium text-slate-800"
                  : "font-normal text-slate-400",
              ].join(" ")}
            >
              <span className="sr-only">
                {completed ? "Completed: " : "Upcoming: "}
              </span>
              {outcome.label}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

export default OutcomeList;
