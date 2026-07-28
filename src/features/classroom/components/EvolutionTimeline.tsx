import type { ExperienceEvolutionPoint } from "../../../types/classroom";

type EvolutionTimelineProps = {
  title: string;
  points: ExperienceEvolutionPoint[];
  onOpenVersion: (versionId: string) => void;
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function EvolutionTimeline({
  title,
  points,
  onOpenVersion,
}: EvolutionTimelineProps) {
  return (
    <section>
      <header className="mb-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
          Experience evolution
        </p>
        <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-900">
          How “{title}” improved
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          A visual memory of your redesigns. Reopen any version anytime.
        </p>
      </header>

      {points.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-400">
          Versions appear as this experience grows.
        </p>
      ) : (
        <ol className="relative space-y-0 pl-2">
          <div
            className="absolute left-[18px] top-3 bottom-3 w-px bg-gradient-to-b from-slate-300 via-slate-200 to-transparent"
            aria-hidden
          />
          {points.map((point, index) => (
            <li key={point.versionId} className="relative flex gap-4 pb-8 last:pb-0">
              <div className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-xs font-semibold text-slate-700 ring-2 ring-slate-200">
                v{point.version}
              </div>
              <div className="min-w-0 flex-1 rounded-2xl bg-white p-4 ring-1 ring-slate-200/70 shadow-sm shadow-slate-900/[0.02]">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-sm font-semibold text-slate-900">
                    {point.label}
                  </h3>
                  <time className="text-[11px] text-slate-400">
                    {formatDate(point.savedAt)}
                  </time>
                </div>
                {point.note ? (
                  <p className="mt-2 text-xs leading-relaxed text-slate-500">
                    {point.note}
                  </p>
                ) : null}

                <div className="mt-3">
                  <div className="mb-1 flex justify-between text-[10px] text-slate-400">
                    <span>Maturity</span>
                    <span>{point.maturity}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-slate-800 transition-all duration-700"
                      style={{
                        width: `${point.maturity}%`,
                        transitionDelay: `${index * 80}ms`,
                      }}
                    />
                  </div>
                  <p className="mt-1.5 text-[11px] text-slate-400">
                    {point.readyCount}/{point.resourceCount} resources ready
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenVersion(point.versionId)}
                  className="mt-3 rounded-full px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                >
                  Reopen this version
                </button>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

export default EvolutionTimeline;
