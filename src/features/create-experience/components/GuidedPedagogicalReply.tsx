import type { GuidedReplyParts } from "../types";

type GuidedPedagogicalReplyProps = {
  guided: GuidedReplyParts;
};

/**
 * Teacher-facing guided reply — educational language only.
 */
function GuidedPedagogicalReply({ guided }: GuidedPedagogicalReplyProps) {
  return (
    <aside
      className="rounded-3xl bg-gradient-to-br from-white via-white to-sky-50/40 px-6 py-7 shadow-[0_12px_40px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/70"
      aria-label="Conversație despre lecție"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
        Proiectăm împreună
      </p>

      <div className="mt-5 space-y-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
            Ce am înțeles
          </p>
          <p className="mt-2 text-base leading-relaxed text-slate-800">
            {guided.understanding}
          </p>
        </div>

        {guided.canvasUpdate ? (
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
              Planul lecției
            </p>
            <p className="mt-2 text-base leading-relaxed text-slate-600">
              {guided.canvasUpdate}
            </p>
          </div>
        ) : null}

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
            De ce contează
          </p>
          <p className="mt-2 text-base leading-relaxed text-slate-600">
            {guided.whyNeeded}
          </p>
        </div>

        <div className="rounded-2xl bg-slate-50/90 px-5 py-4 ring-1 ring-slate-100">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
            Următoarea întrebare
          </p>
          <p className="mt-2 text-lg font-medium leading-relaxed text-slate-900">
            {guided.question}
          </p>
        </div>
      </div>
    </aside>
  );
}

export default GuidedPedagogicalReply;
