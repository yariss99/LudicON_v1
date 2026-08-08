import {
  assessmentPurposeLabel,
} from "../constants";
import { useAssessmentStudio } from "../hooks/useAssessmentStudio";

export function AssessmentSummaryPanel() {
  const { assessment } = useAssessmentStudio();
  const s = assessment.summary;

  return (
    <aside className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-semibold tracking-tight text-slate-900">
        Assessment Summary
      </h2>
      <p className="mt-1 text-xs text-slate-500">
        Updated when you save — measures purpose, scope, and time.
      </p>
      <dl className="mt-4 space-y-3">
        <div>
          <dt className="text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-slate-400">
            Assessment type
          </dt>
          <dd className="mt-0.5 text-sm font-medium text-slate-800">
            {assessmentPurposeLabel(s.purpose)}
          </dd>
        </div>
        <div>
          <dt className="text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-slate-400">
            Items
          </dt>
          <dd className="mt-0.5 text-sm font-medium text-slate-800">
            {s.itemCount}
          </dd>
        </div>
        <div>
          <dt className="text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-slate-400">
            Estimated duration
          </dt>
          <dd className="mt-0.5 text-sm font-medium text-slate-800">
            {s.estimatedDurationMinutes} min
          </dd>
        </div>
        <div>
          <dt className="text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-slate-400">
            Targeted competencies
          </dt>
          <dd className="mt-1.5 flex flex-wrap gap-1.5">
            {s.targetedCompetencies.length === 0 ? (
              <span className="text-sm text-slate-400">None selected yet</span>
            ) : (
              s.targetedCompetencies.map((c) => (
                <span
                  key={c}
                  className="rounded-lg bg-slate-50 px-2 py-1 text-xs font-medium text-slate-700"
                >
                  {c}
                </span>
              ))
            )}
          </dd>
        </div>
      </dl>
    </aside>
  );
}
