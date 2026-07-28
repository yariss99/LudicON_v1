import type { LessonStyleId } from "../../../types/lesson";
import { LESSON_STYLES } from "../constants";
import SurfaceCard from "../../../components/ui/SurfaceCard";

type StepLessonStyleProps = {
  value: LessonStyleId | null;
  error?: string;
  onChange: (value: LessonStyleId) => void;
};

function StepLessonStyle({ value, error, onChange }: StepLessonStyleProps) {
  return (
    <div>
      <p className="mb-4 text-sm text-slate-500">
        Alege un singur stil pentru această lecție.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {LESSON_STYLES.map((style) => {
          const selected = value === style.id;
          return (
            <button
              key={style.id}
              type="button"
              onClick={() => onChange(style.id)}
              className="border-0 bg-transparent p-0 text-left"
            >
              <SurfaceCard
                hover
                padding="md"
                bordered
                className={[
                  "h-full transition-colors",
                  selected
                    ? "border-blue-300 ring-4 ring-blue-100"
                    : "hover:border-blue-100",
                ].join(" ")}
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h3 className="text-base font-semibold text-slate-900">
                    {style.title}
                  </h3>
                  <span
                    className={[
                      "flex h-5 w-5 items-center justify-center rounded-full border",
                      selected
                        ? "border-blue-600 bg-blue-600"
                        : "border-slate-300 bg-white",
                    ].join(" ")}
                    aria-hidden
                  >
                    {selected ? (
                      <span className="h-2 w-2 rounded-full bg-white" />
                    ) : null}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-slate-500">
                  {style.description}
                </p>
              </SurfaceCard>
            </button>
          );
        })}
      </div>
      {error ? (
        <p className="mt-3 text-xs font-medium text-rose-600">{error}</p>
      ) : null}
    </div>
  );
}

export default StepLessonStyle;
