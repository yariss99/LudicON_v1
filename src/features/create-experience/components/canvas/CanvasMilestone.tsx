import type { CanvasMilestone } from "../../types/canvas";

type CanvasMilestoneProps = {
  milestone: CanvasMilestone;
};

function CanvasMilestoneCard({ milestone }: CanvasMilestoneProps) {
  return (
    <div className="rounded-2xl bg-slate-900 px-4 py-4 text-white">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
        Următorul pas
      </p>
      <p className="mt-2 text-sm font-semibold tracking-tight">
        {milestone.label}
      </p>
    </div>
  );
}

export default CanvasMilestoneCard;
