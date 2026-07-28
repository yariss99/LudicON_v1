import type { CanvasSectionState } from "../../types/canvas";
import { CANVAS_STATE_LABEL } from "../../constants/canvas";

type CanvasStatusProps = {
  state: CanvasSectionState;
};

const STATE_CLASS: Record<CanvasSectionState, string> = {
  unknown: "bg-slate-50 text-slate-400 ring-slate-100",
  detected: "bg-sky-50 text-sky-700 ring-sky-100",
  in_progress: "bg-amber-50 text-amber-800 ring-amber-100",
  completed: "bg-emerald-50 text-emerald-800 ring-emerald-100",
  needs_review: "bg-rose-50 text-rose-700 ring-rose-100",
};

function CanvasStatus({ state }: CanvasStatusProps) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ring-1",
        STATE_CLASS[state],
      ].join(" ")}
    >
      {CANVAS_STATE_LABEL[state]}
    </span>
  );
}

export default CanvasStatus;
