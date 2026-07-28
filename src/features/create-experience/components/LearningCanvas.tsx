import { X } from "lucide-react";
import {
  LEARNING_CANVAS_EMPTY_HINT,
  LEARNING_CANVAS_TITLE,
} from "../constants/canvas";
import type { IntelligentCanvasView } from "../types/canvas";
import CanvasMilestoneCard from "./canvas/CanvasMilestone";
import CanvasSection from "./canvas/CanvasSection";
import CurrentQuestionCard from "./canvas/CurrentQuestionCard";
import UnderstandingIndicator from "./canvas/UnderstandingIndicator";

type LearningCanvasProps = {
  canvas: IntelligentCanvasView;
  layout: "sticky" | "collapsible" | "drawer";
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function CanvasBody({ canvas }: { canvas: IntelligentCanvasView }) {
  return (
    <div className="space-y-6">
      <header className="border-b border-slate-100 pb-5">
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">
          {LEARNING_CANVAS_TITLE}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          {canvas.hasContent
            ? "Conversația crește. Planul reflectă ceea ce se conturează."
            : LEARNING_CANVAS_EMPTY_HINT}
        </p>
      </header>

      <UnderstandingIndicator level={canvas.understanding} />

      {canvas.currentQuestion ? (
        <CurrentQuestionCard current={canvas.currentQuestion} />
      ) : null}

      <CanvasMilestoneCard milestone={canvas.nextMilestone} />

      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
          Planul în formare
        </p>
        <ul className="space-y-2">
          {canvas.sections.map((section) => (
            <li key={section.id}>
              <CanvasSection section={section} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/**
 * CE-003 — Intelligent Learning Canvas
 * Living representation of the Learning Experience — not a form.
 */
function LearningCanvas({
  canvas,
  layout,
  open,
  onOpenChange,
}: LearningCanvasProps) {
  const body = <CanvasBody canvas={canvas} />;

  if (layout === "drawer") {
    return (
      <>
        <button
          type="button"
          onClick={() => onOpenChange(true)}
          className="fixed bottom-5 right-4 z-30 inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2"
        >
          {LEARNING_CANVAS_TITLE}
        </button>

        {open ? (
          <div
            className="fixed inset-0 z-40 lg:hidden"
            role="dialog"
            aria-modal
            aria-label={LEARNING_CANVAS_TITLE}
          >
            <button
              type="button"
              className="absolute inset-0 bg-slate-900/35"
              aria-label="Închide planul lecției"
              onClick={() => onOpenChange(false)}
            />
            <aside className="absolute inset-y-0 right-0 flex w-[min(100%,400px)] flex-col bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <p className="text-sm font-semibold text-slate-900">
                  {LEARNING_CANVAS_TITLE}
                </p>
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                >
                  <X size={16} aria-hidden />
                  <span className="sr-only">Close</span>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-5">{body}</div>
            </aside>
          </div>
        ) : null}
      </>
    );
  }

  if (layout === "collapsible") {
    return (
      <aside
        className="rounded-3xl bg-white shadow-[0_12px_40px_rgba(15,23,42,0.05)] ring-1 ring-slate-200/70"
        aria-label={LEARNING_CANVAS_TITLE}
      >
        <button
          type="button"
          onClick={() => onOpenChange(!open)}
          className="flex w-full items-center justify-between px-6 py-5 text-left"
          aria-expanded={open}
        >
          <div>
            <p className="text-sm font-semibold text-slate-900">
              {LEARNING_CANVAS_TITLE}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              {open ? "Hide canvas" : "See the lesson taking shape"}
            </p>
          </div>
        </button>
        <div
          className={[
            "grid transition-[grid-template-rows,opacity] duration-300 ease-out",
            open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
          ].join(" ")}
        >
          <div className="overflow-hidden">
            <div className="border-t border-slate-100 px-5 pb-6 pt-2">{body}</div>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside
      className="flex h-fit flex-col rounded-3xl bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.05)] ring-1 ring-slate-200/70 lg:sticky lg:top-6 lg:max-h-[calc(100vh-48px)] lg:overflow-y-auto"
      aria-label={LEARNING_CANVAS_TITLE}
    >
      {body}
    </aside>
  );
}

export default LearningCanvas;
