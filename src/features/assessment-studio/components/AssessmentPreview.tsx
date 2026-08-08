import {
  assessmentPurposeLabel,
  assessmentStatusLabel,
} from "../constants";
import { useAssessmentStudio } from "../hooks/useAssessmentStudio";

export function AssessmentPreview() {
  const { assessment } = useAssessmentStudio();
  const blocks = [...assessment.blocks].sort((a, b) => a.order - b.order);
  const p = assessment.properties;

  return (
    <div className="flex-1 overflow-auto px-4 py-8 sm:px-8">
      <article className="mx-auto max-w-2xl rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm">
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-[0.65rem] font-semibold text-slate-500">
            {assessmentStatusLabel(assessment.status)}
          </span>
          <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-[0.65rem] font-semibold text-slate-500">
            {assessmentPurposeLabel(p.purpose)}
          </span>
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
          {p.title || "Untitled assessment"}
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          {[
            p.subject,
            p.grade,
            `${assessment.summary.estimatedDurationMinutes} min`,
            `${assessment.summary.itemCount} items`,
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>
        {p.instructions ? (
          <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
            {p.instructions}
          </p>
        ) : null}

        {assessment.summary.targetedCompetencies.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {assessment.summary.targetedCompetencies.map((c) => (
              <span
                key={c}
                className="rounded-lg bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600"
              >
                {c}
              </span>
            ))}
          </div>
        ) : null}

        {blocks.map((block, i) => (
          <section
            key={block.id}
            className="mt-8 border-t border-slate-100 pt-6"
          >
            <p className="text-xs font-semibold text-slate-400">Item {i + 1}</p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-900">
              {block.title}
            </h2>
            {block.competencyIds.length > 0 ? (
              <p className="mt-1 text-xs text-slate-400">
                {block.competencyIds.join(" · ")}
              </p>
            ) : null}
            <p className="mt-2 whitespace-pre-wrap text-[0.95rem] leading-relaxed text-slate-600">
              {block.content || "—"}
            </p>
          </section>
        ))}
      </article>
    </div>
  );
}
