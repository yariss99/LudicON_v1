import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useTeachingWorkflow } from "../hooks/useTeachingWorkflow";
import type { FlowStepKind } from "../constants";

type Props = {
  projectId: string;
  kind: FlowStepKind;
  resourceId: string;
  title?: string;
  subject?: string;
  grade?: string;
  /** Show What's next cards below the strip. Default true. */
  showWhatsNext?: boolean;
};

export function WorkflowNavigator({
  projectId,
  kind,
  resourceId,
  title,
  subject,
  grade,
  showWhatsNext = true,
}: Props) {
  const {
    steps,
    completedCount,
    remainingCount,
    progressPercent,
    whatsNext,
    dismissNext,
  } = useTeachingWorkflow({
    projectId,
    kind,
    resourceId,
    title,
    subject,
    grade,
  });

  return (
    <div className="border-b border-slate-200/80 bg-[#F7F8FA]/95 px-3 py-3 backdrop-blur sm:px-5">
      <div className="mx-auto max-w-5xl">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-slate-400">
              Teaching flow
            </p>
            <p className="text-xs text-slate-500">
              <span className="font-semibold text-slate-700">
                {completedCount} completed
              </span>
              {" · "}
              <span className="font-semibold text-slate-900">current step</span>
              {" · "}
              <span>{remainingCount} remaining</span>
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold tabular-nums text-slate-600">
            <span>{progressPercent}%</span>
            <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-200">
              <motion.div
                className="h-full rounded-full bg-slate-900"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </div>
        </div>

        <ol className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {steps.map((step, index) => {
            const isCurrent = step.status === "current";
            const isDone = step.status === "completed";
            return (
              <li key={step.kind} className="flex items-center gap-1.5 sm:gap-2">
                {index > 0 ? (
                  <span
                    className={[
                      "hidden text-slate-300 sm:inline",
                      isDone || isCurrent ? "text-slate-400" : "",
                    ].join(" ")}
                    aria-hidden
                  >
                    →
                  </span>
                ) : null}
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className={[
                    "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
                    isCurrent
                      ? "bg-slate-900 text-white shadow-sm"
                      : isDone
                        ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200/80"
                        : "bg-white text-slate-400 ring-1 ring-slate-200",
                  ].join(" ")}
                  title={step.label}
                >
                  <span aria-hidden>{isDone && !isCurrent ? "✔" : step.emoji}</span>
                  <span className="hidden sm:inline">{step.short}</span>
                  {step.count > 0 ? (
                    <span
                      className={[
                        "tabular-nums",
                        isCurrent ? "text-slate-300" : "text-slate-500",
                      ].join(" ")}
                    >
                      {step.count}
                    </span>
                  ) : null}
                </motion.div>
              </li>
            );
          })}
        </ol>
      </div>

      {showWhatsNext && whatsNext.length > 0 ? (
        <WhatsNextPanel cards={whatsNext} onDismiss={dismissNext} />
      ) : null}
    </div>
  );
}

function WhatsNextPanel({
  cards,
  onDismiss,
}: {
  cards: ReturnType<typeof useTeachingWorkflow>["whatsNext"];
  onDismiss: (id: string) => void;
}) {
  return (
    <div className="mx-auto mt-3 max-w-5xl">
      <p className="mb-2 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-slate-400">
        What&apos;s next?
      </p>
      <div className="grid gap-2 sm:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {cards.map((card, index) => (
            <motion.article
              key={card.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ delay: index * 0.04 }}
              className="flex flex-col rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-lg" aria-hidden>
                  {card.emoji}
                </span>
                <button
                  type="button"
                  onClick={() => onDismiss(card.id)}
                  className="text-[0.65rem] font-medium text-slate-400 hover:text-slate-700"
                >
                  Dismiss
                </button>
              </div>
              <h4 className="mt-1 text-sm font-semibold text-slate-900">
                {card.title}
              </h4>
              <p className="mt-0.5 flex-1 text-[0.7rem] leading-relaxed text-slate-500">
                {card.detail}
              </p>
              <Link
                to={card.href}
                className="mt-2.5 inline-flex items-center justify-center rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white no-underline hover:bg-slate-800"
              >
                Continue
              </Link>
            </motion.article>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
