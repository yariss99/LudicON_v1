import { motion } from "framer-motion";
import type { CopilotBlockSuggestion } from "../types";

type Props = {
  suggestions: readonly CopilotBlockSuggestion[];
  dismissed?: boolean;
  onDismiss: () => void;
};

/**
 * Copilot placeholder — architecture for contextual block suggestions.
 * No AI API; rule/placeholder content only.
 */
export function BlockCopilotPlaceholder({
  suggestions,
  dismissed,
  onDismiss,
}: Props) {
  if (dismissed || suggestions.length === 0) return null;

  return (
    <motion.aside
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-3 mb-3 ml-10 rounded-xl border border-dashed border-slate-200 bg-slate-50/90 px-3 py-2.5 sm:ml-12"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-slate-400">
          Copilot suggestion
        </p>
        <button
          type="button"
          onClick={onDismiss}
          className="text-[0.65rem] font-medium text-slate-400 hover:text-slate-700"
        >
          Dismiss
        </button>
      </div>
      <ul className="mt-1.5 space-y-1">
        {suggestions.map((s) => (
          <li key={s.id}>
            <p className="text-xs font-semibold text-slate-700">{s.label}</p>
            <p className="text-[0.7rem] text-slate-500">{s.detail}</p>
          </li>
        ))}
      </ul>
    </motion.aside>
  );
}

/** Placeholder suggestions by block type — swap for AI later. */
export function placeholderSuggestionsFor(
  type: string,
): CopilotBlockSuggestion[] {
  const map: Record<string, CopilotBlockSuggestion[]> = {
    text: [
      {
        id: "text-clarity",
        label: "Clarify for students",
        detail: "Shorten sentences and highlight the key idea.",
      },
    ],
    exercise: [
      {
        id: "ex-scaffold",
        label: "Add a scaffold",
        detail: "Offer a worked example before independent practice.",
      },
    ],
    question: [
      {
        id: "q-depth",
        label: "Deepen the question",
        detail: "Ask for reasoning, not only the correct answer.",
      },
    ],
    reflection: [
      {
        id: "ref-prompt",
        label: "Guide reflection",
        detail: "Ask what changed in their understanding today.",
      },
    ],
  };
  return map[type] ?? [];
}
