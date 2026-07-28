import type { QualityReport } from "../types";

type QualityPanelProps = {
  quality: QualityReport | null;
};

function QualityPanel({ quality }: QualityPanelProps) {
  if (!quality) {
    return (
      <div className="rounded-2xl bg-slate-50 px-3 py-3 text-xs text-slate-500 ring-1 ring-slate-100">
        Indicatorii de calitate apar după ce materialul este pregătit.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
          Calitate didactică
        </p>
        <p className="text-sm font-semibold text-slate-800">
          {Math.round(quality.overall * 100)}%
        </p>
      </div>
      <ul className="space-y-2">
        {quality.metrics.map((metric) => (
          <li
            key={metric.id}
            className="rounded-2xl bg-slate-50 px-3 py-2.5 ring-1 ring-slate-100"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold text-slate-800">
                {metric.label}
              </p>
              <p className="text-xs font-semibold text-slate-600">
                {Math.round(metric.score * 100)}%
              </p>
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
              {metric.explanation}
            </p>
          </li>
        ))}
      </ul>
      {quality.warnings.length > 0 ? (
        <ul className="space-y-1 text-[11px] text-amber-800">
          {quality.warnings.map((warning) => (
            <li key={warning}>• {warning}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export default QualityPanel;
