import { Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import type { ConfidenceActionId } from "../../../types/confidence";
import type { Project, ProjectResource } from "../../../types/project";
import { useConfidence } from "../hooks/useConfidence";
import ConfidenceRing from "./ConfidenceRing";
import DimensionRow from "./DimensionRow";

type ConfidencePanelProps = {
  project: Project;
  resources: ProjectResource[];
  intention?: string;
  onApplyImprovement: (actionId: ConfidenceActionId) => void;
};

function ConfidencePanel({
  project,
  resources,
  intention,
  onApplyImprovement,
}: ConfidencePanelProps) {
  const { report, availableMinutes, setAvailableMinutes } = useConfidence({
    project,
    resources,
    intention,
  });

  return (
    <aside className="flex h-full flex-col rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)] lg:sticky lg:top-6 lg:max-h-[calc(100vh-48px)]">
      <div className="mb-4 flex items-start gap-3 border-b border-slate-100 pb-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white">
          <ShieldCheck size={18} />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">
            Confidence Panel
          </p>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            Lesson readiness for “{project.title}” — never a score of you.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <ConfidenceRing score={report.score} level={report.level} />
        <div className="min-w-0">
          <p className="text-sm font-semibold leading-snug text-slate-900">
            {report.headline}
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
            {report.reassurance}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2.5 ring-1 ring-slate-100">
        <div>
          <p className="text-[11px] font-medium text-slate-500">Timing</p>
          <p className="text-sm font-semibold text-slate-900">
            ~{report.estimatedMinutes} / {availableMinutes} min
          </p>
        </div>
        <label className="text-[11px] text-slate-500">
          Available
          <select
            value={availableMinutes}
            onChange={(event) =>
              setAvailableMinutes(Number(event.target.value))
            }
            className="ml-1.5 rounded-lg border-0 bg-white py-1 pl-2 pr-6 text-[11px] font-medium text-slate-700 ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300"
          >
            {[30, 40, 45, 50, 60, 90].map((mins) => (
              <option key={mins} value={mins}>
                {mins}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-5 flex-1 space-y-4 overflow-y-auto pr-1">
        <section>
          <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            Why this score
          </h3>
          <ul className="space-y-2">
            {report.dimensions.map((dimension) => (
              <DimensionRow key={dimension.id} dimension={dimension} />
            ))}
          </ul>
        </section>

        <section>
          <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            One-click improvements
          </h3>
          {report.improvements.length === 0 ? (
            <p className="rounded-xl bg-emerald-50 px-3 py-3 text-xs leading-relaxed text-emerald-800 ring-1 ring-emerald-100">
              Nothing urgent. Close the laptop when you feel ready — you likely
              are.
            </p>
          ) : (
            <ul className="space-y-2">
              {report.improvements.map((item) => (
                <li
                  key={item.id}
                  className="rounded-xl bg-slate-50 px-3 py-2.5 ring-1 ring-slate-100"
                >
                  <p className="text-sm font-medium text-slate-800">
                    {item.label}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">
                    {item.detail}
                  </p>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="text-[10px] font-medium text-slate-400">
                      {item.impactHint}
                    </span>
                    <button
                      type="button"
                      onClick={() => onApplyImprovement(item.actionId)}
                      className="rounded-full bg-slate-900 px-3 py-1.5 text-[11px] font-medium text-white transition-colors hover:bg-slate-800"
                    >
                      Apply
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <Link
        to="/dna"
        className="mt-4 block text-center text-[11px] font-medium text-slate-400 no-underline hover:text-slate-700"
      >
        Pedagogical DNA →
      </Link>
    </aside>
  );
}

export default ConfidencePanel;
