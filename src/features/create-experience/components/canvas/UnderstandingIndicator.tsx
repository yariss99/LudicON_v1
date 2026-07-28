import type { UnderstandingLevel } from "../../types/canvas";
import { UNDERSTANDING_LABEL } from "../../constants/canvas";

type UnderstandingIndicatorProps = {
  level: UnderstandingLevel;
};

const LEVEL_CLASS: Record<UnderstandingLevel, string> = {
  excellent: "text-emerald-800",
  good: "text-sky-800",
  needs_one_detail: "text-amber-800",
  needs_clarification: "text-rose-800",
};

const LEVEL_DOT: Record<UnderstandingLevel, string> = {
  excellent: "bg-emerald-500",
  good: "bg-sky-500",
  needs_one_detail: "bg-amber-500",
  needs_clarification: "bg-rose-500",
};

function UnderstandingIndicator({ level }: UnderstandingIndicatorProps) {
  return (
    <div
      className="rounded-2xl bg-slate-50/90 px-4 py-4 ring-1 ring-slate-100"
      aria-label={`Înțelegere: ${UNDERSTANDING_LABEL[level]}`}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
        Cât de clar e planul
      </p>
      <div className="mt-2 flex items-center gap-2">
        <span
          className={`h-2 w-2 rounded-full ${LEVEL_DOT[level]}`}
          aria-hidden
        />
        <p className={`text-sm font-semibold ${LEVEL_CLASS[level]}`}>
          {UNDERSTANDING_LABEL[level]}
        </p>
      </div>
    </div>
  );
}

export default UnderstandingIndicator;
