import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useCopilot, SuggestionCard } from "../../../modules/copilot";
import type { WorkspaceRecommendation } from "../services/workspaceRecommendations";

type Props = {
  recommendations: WorkspaceRecommendation[];
};

export function WorkspaceCopilotPanel({ recommendations }: Props) {
  const { suggestions, dismiss, openPanel, hasSuggestions } = useCopilot();

  return (
    <section
      aria-labelledby="workspace-copilot"
      className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5"
    >
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-slate-400">
            Contextual assistant
          </p>
          <h3
            id="workspace-copilot"
            className="text-lg font-semibold tracking-tight text-slate-900"
          >
            Copilot panel
          </h3>
        </div>
        <button
          type="button"
          onClick={openPanel}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800"
        >
          Open Copilot
        </button>
      </div>

      <div className="space-y-2.5">
        {recommendations.map((rec, index) => (
          <motion.article
            key={rec.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
            className="rounded-2xl border border-slate-100 bg-slate-50/80 px-3.5 py-3"
          >
            <h4 className="text-sm font-semibold text-slate-900">{rec.title}</h4>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              {rec.detail}
            </p>
            <Link
              to={rec.href}
              className="mt-2.5 inline-flex rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white no-underline hover:bg-slate-800"
            >
              {rec.actionLabel}
            </Link>
          </motion.article>
        ))}

        {hasSuggestions
          ? suggestions.slice(0, 2).map((s, index) => (
              <SuggestionCard
                key={s.id}
                suggestion={s}
                onDismiss={dismiss}
                index={index}
              />
            ))
          : null}

        {recommendations.length === 0 && !hasSuggestions ? (
          <p className="py-6 text-center text-sm text-slate-500">
            Looking good — no urgent recommendations right now.
          </p>
        ) : null}
      </div>
    </section>
  );
}
