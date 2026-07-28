import type { CanvasCurrentQuestion } from "../../types/canvas";

type CurrentQuestionCardProps = {
  current: CanvasCurrentQuestion;
};

function CurrentQuestionCard({ current }: CurrentQuestionCardProps) {
  return (
    <div className="rounded-2xl bg-white px-4 py-4 ring-1 ring-slate-200/80">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
        Următoarea întrebare
      </p>
      <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-900">
        {current.question}
      </p>
      <p className="mt-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
        De ce contează
      </p>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
        {current.why}
      </p>
    </div>
  );
}

export default CurrentQuestionCard;
