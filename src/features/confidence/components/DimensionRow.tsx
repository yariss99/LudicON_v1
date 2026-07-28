import type { ConfidenceDimension } from "../../../types/confidence";

type DimensionRowProps = {
  dimension: ConfidenceDimension;
};

const BAR: Record<string, string> = {
  ready: "bg-emerald-500",
  almost: "bg-sky-500",
  building: "bg-slate-400",
};

function DimensionRow({ dimension }: DimensionRowProps) {
  return (
    <li className="rounded-xl bg-slate-50/90 px-3 py-2.5 ring-1 ring-slate-100">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-slate-800">{dimension.label}</p>
        <p className="text-xs font-semibold tabular-nums text-slate-600">
          {dimension.score}
        </p>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white ring-1 ring-slate-100">
        <div
          className={`h-full rounded-full transition-all duration-500 ${BAR[dimension.level]}`}
          style={{ width: `${dimension.score}%` }}
        />
      </div>
      <p className="mt-1.5 text-[11px] leading-relaxed text-slate-500">
        {dimension.explanation}
      </p>
    </li>
  );
}

export default DimensionRow;
