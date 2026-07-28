import type { ConfidenceLevel } from "../../../types/confidence";

type ConfidenceRingProps = {
  score: number;
  level: ConfidenceLevel;
};

const LEVEL_COLOR: Record<ConfidenceLevel, string> = {
  ready: "stroke-emerald-500",
  almost: "stroke-sky-500",
  building: "stroke-slate-400",
};

function ConfidenceRing({ score, level }: ConfidenceRingProps) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex h-24 w-24 items-center justify-center">
      <svg className="h-24 w-24 -rotate-90" viewBox="0 0 88 88" aria-hidden>
        <circle
          cx="44"
          cy="44"
          r={radius}
          fill="none"
          className="stroke-slate-100"
          strokeWidth="8"
        />
        <circle
          cx="44"
          cy="44"
          r={radius}
          fill="none"
          className={`${LEVEL_COLOR[level]} transition-[stroke-dashoffset] duration-700`}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-semibold tracking-tight text-slate-900">
          {score}
        </span>
        <span className="text-[9px] font-medium uppercase tracking-wider text-slate-400">
          ready
        </span>
      </div>
    </div>
  );
}

export default ConfidenceRing;
