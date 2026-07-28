import { REVIEW_SECTIONS } from "../constants";
import type { ComparisonResult } from "../types";

type ComparisonViewProps = {
  comparison: ComparisonResult | null;
  onClose: () => void;
};

const KIND_LABEL = {
  added: "Adăugat",
  removed: "Eliminat",
  modified: "Modificat",
  unchanged: "Neschimbat",
} as const;

function ComparisonView({ comparison, onClose }: ComparisonViewProps) {
  if (!comparison) return null;

  const changed = comparison.diffs.filter((d) => d.kind !== "unchanged");

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/35 p-4 sm:items-center"
      role="dialog"
      aria-modal
      aria-label="Compararea versiunilor"
    >
      <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Compară versiunile
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Diferențele dintre proiectul anterior și cel actual.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-3 py-1.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200"
          >
            Close
          </button>
        </div>

        <ul className="mt-4 space-y-3">
          {(changed.length ? changed : comparison.diffs).map((diff) => {
            const title =
              REVIEW_SECTIONS.find((s) => s.id === diff.sectionId)?.title ??
              diff.sectionId;
            const tone =
              diff.kind === "added"
                ? "bg-emerald-50 ring-emerald-100"
                : diff.kind === "removed"
                  ? "bg-rose-50 ring-rose-100"
                  : diff.kind === "modified"
                    ? "bg-amber-50 ring-amber-100"
                    : "bg-slate-50 ring-slate-100";

            return (
              <li
                key={diff.sectionId}
                className={`rounded-2xl px-3 py-3 text-xs ring-1 ${tone}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-slate-800">{title}</p>
                  <span className="font-medium text-slate-600">
                    {KIND_LABEL[diff.kind]}
                  </span>
                </div>
                {diff.kind !== "unchanged" ? (
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-slate-400">
                        Previous
                      </p>
                      <p className="mt-1 text-slate-600">
                        {diff.before.join(" · ") || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-slate-400">
                        Current
                      </p>
                      <p className="mt-1 text-slate-600">
                        {diff.after.join(" · ") || "—"}
                      </p>
                    </div>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export default ComparisonView;
