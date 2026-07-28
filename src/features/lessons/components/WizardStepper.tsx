import { LESSON_WIZARD_STEPS } from "../constants";

type WizardStepperProps = {
  currentStep: number;
  onStepSelect?: (step: number) => void;
};

function WizardStepper({ currentStep, onStepSelect }: WizardStepperProps) {
  const progress =
    ((currentStep + 1) / LESSON_WIZARD_STEPS.length) * 100;

  return (
    <div className="mb-8">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-600">
          Pasul {currentStep + 1} din {LESSON_WIZARD_STEPS.length}
        </p>
        <p className="text-xs text-slate-400">{Math.round(progress)}%</p>
      </div>

      <div className="mb-5 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-blue-600 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <ol className="grid gap-2 sm:grid-cols-5">
        {LESSON_WIZARD_STEPS.map((step) => {
          const active = step.index === currentStep;
          const complete = step.index < currentStep;
          return (
            <li key={step.id}>
              <button
                type="button"
                disabled={!onStepSelect || step.index > currentStep}
                onClick={() => onStepSelect?.(step.index)}
                className={[
                  "w-full rounded-xl border px-3 py-3 text-left transition-colors",
                  active
                    ? "border-blue-200 bg-blue-50"
                    : complete
                      ? "border-slate-200 bg-white hover:border-slate-300"
                      : "border-transparent bg-slate-50 text-slate-400",
                ].join(" ")}
              >
                <p
                  className={[
                    "text-xs font-medium",
                    active ? "text-blue-700" : "text-slate-400",
                  ].join(" ")}
                >
                  {step.index + 1}
                </p>
                <p
                  className={[
                    "mt-1 text-sm font-semibold",
                    active ? "text-slate-900" : "text-slate-600",
                  ].join(" ")}
                >
                  {step.title}
                </p>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export default WizardStepper;
