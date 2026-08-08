import { Check } from "lucide-react";
import { cn } from "@ludicon/ui";

import { STEPS, STEP_COUNT, type FlowStep } from "./flow-form";

export interface StepIndicatorProps {
  current: number;
  /** Only backward moves are offered — forward ones still have to be earned. */
  onGoBack: (step: number) => void;
}

const MARKER_BASE =
  "flex size-7 shrink-0 items-center justify-center rounded-full text-[0.8125rem] font-semibold transition-colors duration-[var(--motion-standard)] ease-standard";

function markerClass(state: "done" | "current" | "upcoming"): string {
  if (state === "done") {
    return cn(
      MARKER_BASE,
      "bg-secondary-soft text-secondary ring-1 ring-secondary/30",
    );
  }
  if (state === "current") {
    return cn(MARKER_BASE, "bg-primary text-primary-foreground shadow-soft");
  }
  return cn(MARKER_BASE, "bg-muted text-muted-foreground ring-1 ring-border");
}

function labelClass(state: "done" | "current" | "upcoming"): string {
  return cn(
    "truncate text-[0.9375rem] leading-[1.4] transition-colors duration-[var(--motion-standard)] ease-standard",
    state === "current"
      ? "font-semibold text-strong"
      : "font-medium text-muted-foreground",
    // Below 640px only the step you are on keeps its name; the markers alone
    // carry the shape of the flow, and the line underneath says where you are.
    state === "current" ? "inline" : "hidden sm:inline",
  );
}

interface StepMarkProps {
  step: FlowStep;
  state: "done" | "current" | "upcoming";
}

function StepMark({ step, state }: StepMarkProps) {
  return (
    <>
      <span className={markerClass(state)}>
        {state === "done" ? (
          <Check aria-hidden strokeWidth={1.75} className="size-4" />
        ) : (
          step.index
        )}
      </span>
      <span className={labelClass(state)}>{step.label}</span>
    </>
  );
}

/**
 * Where the teacher is, and what is left.
 *
 * Three markers and two hairlines — enough to orient, not enough to feel like
 * a form to be completed. Completed steps stay pressable so the flow is
 * always reversible; the steps ahead are inert rather than disabled-looking,
 * because nothing here has been refused.
 *
 * State never rests on colour alone: a finished step carries a check, the
 * current one carries `aria-current`, and the line below names both.
 */
export function StepIndicator({ current, onGoBack }: StepIndicatorProps) {
  const currentStep = STEPS.find((step) => step.index === current);

  return (
    <nav aria-label="Pașii pregătirii">
      <ol className="flex items-center">
        {STEPS.map((step, index) => {
          const state =
            step.index < current
              ? "done"
              : step.index === current
                ? "current"
                : "upcoming";
          const isLast = index === STEPS.length - 1;

          return (
            <li
              key={step.index}
              className={cn("flex items-center", !isLast && "min-w-0 flex-1")}
            >
              {state === "done" ? (
                <button
                  type="button"
                  onClick={() => onGoBack(step.index)}
                  aria-label={`Pasul ${step.index}, ${step.label} — gata. Întoarce-te aici.`}
                  className={cn(
                    "-mx-2 flex min-h-11 min-w-0 cursor-pointer items-center gap-2.5 rounded-full px-2",
                    "transition-colors duration-[var(--motion-fast)] ease-standard hover:bg-muted",
                  )}
                >
                  <StepMark step={step} state={state} />
                </button>
              ) : (
                <span
                  aria-current={state === "current" ? "step" : undefined}
                  className="-mx-2 flex min-h-11 min-w-0 items-center gap-2.5 px-2"
                >
                  <StepMark step={step} state={state} />
                </span>
              )}

              {!isLast ? (
                <span
                  aria-hidden
                  className={cn(
                    "mx-2 h-px min-w-3 flex-1 rounded-full sm:mx-3",
                    "transition-colors duration-[var(--motion-standard)] ease-standard",
                    step.index < current ? "bg-secondary/40" : "bg-border",
                  )}
                />
              ) : null}
            </li>
          );
        })}
      </ol>

      <p className="mt-3 text-[0.9375rem] leading-[1.5] text-muted-foreground">
        Pasul {current} din {STEP_COUNT}
        {currentStep ? ` · ${currentStep.summary}` : ""}
      </p>
    </nav>
  );
}
