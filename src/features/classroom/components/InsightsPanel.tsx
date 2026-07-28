import type { ClassInsight } from "../../../types/classroom";

type InsightsPanelProps = {
  insights: ClassInsight[];
};

function InsightsPanel({ insights }: InsightsPanelProps) {
  return (
    <section>
      <header className="mb-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
          Class insights
        </p>
        <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-900">
          Patterns from your teaching
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Trends across classes and years — never about individual students.
        </p>
      </header>

      {insights.length === 0 ? (
        <p className="rounded-2xl bg-slate-50 px-4 py-6 text-sm text-slate-500">
          As you reflect after lessons, useful patterns will gather here.
        </p>
      ) : (
        <ul className="space-y-3">
          {insights.map((insight) => (
            <li
              key={insight.id}
              className="rounded-2xl bg-white px-4 py-3.5 ring-1 ring-slate-200/70 shadow-sm shadow-slate-900/[0.02]"
            >
              <p className="text-sm font-semibold text-slate-900">
                {insight.title}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                {insight.detail}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {insight.method ? (
                  <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-medium text-sky-700">
                    {insight.method}
                  </span>
                ) : null}
                {insight.schoolYear ? (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                    {insight.schoolYear}
                  </span>
                ) : null}
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                  {insight.evidenceCount} note
                  {insight.evidenceCount === 1 ? "" : "s"}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default InsightsPanel;
