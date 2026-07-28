import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import type { Project, ProjectResource } from "../../../types/project";
import { usePedagogicalReview } from "../hooks/usePedagogicalReview";
import FindingList from "./FindingList";
import StageStrip from "./StageStrip";

type PedagogicalReviewPanelProps = {
  project: Project;
  resources: ProjectResource[];
  intention?: string;
};

function PedagogicalReviewPanel({
  project,
  resources,
  intention,
}: PedagogicalReviewPanelProps) {
  const { review, dna, availableMinutes, setAvailableMinutes } =
    usePedagogicalReview({
      project,
      resources,
      intention,
    });

  return (
    <aside className="flex h-full flex-col rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)] lg:sticky lg:top-6 lg:max-h-[calc(100vh-48px)]">
      <div className="mb-4 flex items-start gap-3 border-b border-slate-100 pb-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white">
          <Compass size={18} />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">
            Pedagogical Review
          </p>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            Educational intelligence for “{project.title}”. Supports you —
            never grades you.
          </p>
        </div>
      </div>

      <p className="text-xs leading-relaxed text-slate-600">{review.summary}</p>

      <div className="mt-4">
        <StageStrip stages={review.stages} />
      </div>

      <div
        className={[
          "mt-4 rounded-2xl px-3.5 py-3 ring-1",
          review.time.exceedsAvailable
            ? "bg-amber-50/80 ring-amber-100"
            : "bg-slate-50 ring-slate-100",
        ].join(" ")}
      >
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-medium text-slate-700">Time check</p>
          <label className="flex items-center gap-1.5 text-[11px] text-slate-500">
            Available
            <select
              value={availableMinutes}
              onChange={(event) =>
                setAvailableMinutes(Number(event.target.value))
              }
              className="rounded-lg border-0 bg-white py-1 pl-2 pr-6 text-[11px] font-medium text-slate-700 ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300"
            >
              {[30, 40, 45, 50, 60, 90].map((mins) => (
                <option key={mins} value={mins}>
                  {mins} min
                </option>
              ))}
            </select>
          </label>
        </div>
        <p className="mt-1.5 text-sm font-semibold tracking-tight text-slate-900">
          ~{review.time.estimatedMinutes} min estimated
        </p>
        <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">
          {review.time.exceedsAvailable
            ? `A little over your ${review.time.availableMinutes}-minute window — trim only if you want.`
            : `Fits within your ${review.time.availableMinutes}-minute window.`}
        </p>
      </div>

      <div className="mt-5 flex-1 space-y-5 overflow-y-auto pr-1">
        <FindingList
          title="Strengths"
          empty="As you add pieces, strengths will appear here."
          findings={review.strengths}
          tone="strength"
        />
        <FindingList
          title="Suggestions"
          empty="Nothing urgent — you’re in a good place."
          findings={review.suggestions}
          tone="suggestion"
        />
        <FindingList
          title="Potential improvements"
          empty="No extras needed right now."
          findings={review.improvements}
          tone="improvement"
        />
      </div>

      <p className="mt-4 text-center text-[11px] leading-relaxed text-slate-400">
        Suggestions lean toward your style
        {dna.signatureStyles[0] ? ` (${dna.signatureStyles[0]})` : ""}. You
        decide.
      </p>
      <Link
        to="/dna"
        className="mt-2 block text-center text-[11px] font-medium text-slate-500 no-underline hover:text-slate-800"
      >
        View Pedagogical DNA →
      </Link>
    </aside>
  );
}

export default PedagogicalReviewPanel;
