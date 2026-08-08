import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { wizardPath } from "../../universal-creation-wizard/constants";
import type { ResourceKindSummary } from "../services/workspaceInventory";

type Props = {
  projectId: string;
  summary: ResourceKindSummary;
  expanded: boolean;
  onToggle: () => void;
  index: number;
};

export function ResourceSummaryCard({
  projectId,
  summary,
  expanded,
  onToggle,
  index,
}: Props) {
  const createHref = wizardPath({
    type: summary.kind,
    projectId,
    source: "blank",
  });

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_12px_32px_-24px_rgba(15,23,42,0.35)]"
    >
      <div className="flex items-start gap-3 p-4 sm:p-5">
        <button
          type="button"
          onClick={onToggle}
          className="flex min-w-0 flex-1 items-start gap-3 text-left"
          aria-expanded={expanded}
        >
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-slate-50 text-xl">
            {summary.emoji}
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-2">
              <span className="text-base font-semibold tracking-tight text-slate-900">
                {summary.label}
              </span>
              <motion.span
                key={summary.count}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold tabular-nums text-slate-700"
              >
                {summary.count}
              </motion.span>
            </span>
            <span className="mt-0.5 block text-xs text-slate-500">
              {summary.description}
            </span>
          </span>
        </button>
        <Link
          to={createHref}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-900 text-lg font-semibold text-white no-underline hover:bg-slate-800"
          aria-label={`Create ${summary.label}`}
          title="Create"
          onClick={(e) => e.stopPropagation()}
        >
          +
        </Link>
      </div>

      <AnimatePresence initial={false}>
        {expanded ? (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="border-t border-slate-100"
          >
            <div className="space-y-1.5 p-3 sm:p-4">
              {summary.items.length === 0 ? (
                <p className="px-1 py-3 text-sm text-slate-500">
                  None yet.{" "}
                  <Link
                    to={createHref}
                    className="font-semibold text-slate-800 underline-offset-2 hover:underline"
                  >
                    Create one
                  </Link>
                </p>
              ) : (
                summary.items.slice(0, 8).map((item) => (
                  <Link
                    key={item.id}
                    to={item.href}
                    className="flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm no-underline transition hover:bg-slate-50"
                  >
                    <span className="min-w-0 truncate font-medium text-slate-800">
                      {item.title}
                    </span>
                    <span className="shrink-0 text-[0.65rem] uppercase tracking-[0.06em] text-slate-400">
                      Open
                    </span>
                  </Link>
                ))
              )}
              <Link
                to={summary.tabHref}
                className="mt-1 block px-3 py-1.5 text-xs font-semibold text-slate-500 no-underline hover:text-slate-800"
              >
                View all in library →
              </Link>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.article>
  );
}
