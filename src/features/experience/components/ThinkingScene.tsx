import { useEffect, useState } from "react";
import {
  EXPERIENCE_STEP_MS,
  EXPERIENCE_THINKING_STEPS,
} from "../constants";

type ThinkingSceneProps = {
  active: boolean;
  onComplete: () => void;
};

function ThinkingScene({ active, onComplete }: ThinkingSceneProps) {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (!active) {
      setStepIndex(0);
      return;
    }

    setStepIndex(0);
    let index = 0;

    const timer = window.setInterval(() => {
      index += 1;
      if (index >= EXPERIENCE_THINKING_STEPS.length) {
        window.clearInterval(timer);
        onComplete();
        return;
      }
      setStepIndex(index);
    }, EXPERIENCE_STEP_MS);

    return () => window.clearInterval(timer);
  }, [active, onComplete]);

  if (!active) return null;

  return (
    <div className="studio-prompt-enter mx-auto flex w-full max-w-lg flex-col items-center py-20 text-center">
      <div className="studio-pulse mb-8 flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-3xl shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
        <span aria-hidden>
          {EXPERIENCE_THINKING_STEPS[stepIndex]?.emoji}
        </span>
      </div>

      <p className="mb-10 text-sm font-medium tracking-wide text-slate-400">
        Thinking about your lesson...
      </p>

      <ul className="w-full space-y-3 text-left">
        {EXPERIENCE_THINKING_STEPS.map((step, index) => {
          const done = index < stepIndex;
          const current = index === stepIndex;
          return (
            <li
              key={step.id}
              className={[
                "flex items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-500",
                current
                  ? "bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)]"
                  : done
                    ? "opacity-55"
                    : "opacity-25",
              ].join(" ")}
            >
              <span className="text-xl" aria-hidden>
                {step.emoji}
              </span>
              <span
                className={[
                  "text-[15px]",
                  current ? "font-medium text-slate-900" : "text-slate-600",
                ].join(" ")}
              >
                {step.label}
              </span>
              {current ? (
                <span className="ml-auto flex gap-1">
                  <span className="studio-dot h-1.5 w-1.5 rounded-full bg-slate-400" />
                  <span className="studio-dot studio-dot-delay h-1.5 w-1.5 rounded-full bg-slate-400" />
                  <span className="studio-dot studio-dot-delay-2 h-1.5 w-1.5 rounded-full bg-slate-400" />
                </span>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default ThinkingScene;
