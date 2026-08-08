import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { PedagogicalSuggestion } from "../suggestionTypes";
import { SuggestionCard } from "./SuggestionCard";

type Props = {
  open: boolean;
  suggestions: readonly PedagogicalSuggestion[];
  onClose: () => void;
  onDismiss: (id: string) => void;
  onOpenAdvanced?: () => void;
};

/**
 * Suggestion Panel — appears only when the teacher opens it.
 * Cards render only when contextual opportunities exist.
 */
export function SuggestionPanel({
  open,
  suggestions,
  onClose,
  onDismiss,
  onOpenAdvanced,
}: Props) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.aside
          key="suggestion-panel"
          role="dialog"
          aria-label="Pedagogical suggestions"
          initial={{ opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.96 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-[5.25rem] right-4 z-[68] flex w-[min(100vw-2rem,22rem)] flex-col overflow-hidden rounded-3xl border border-slate-200/90 bg-[#F7F8FA]/95 shadow-[0_20px_50px_-24px_rgba(15,23,42,0.45)] backdrop-blur-md sm:right-5"
        >
          <header className="flex items-start justify-between gap-3 border-b border-slate-200/80 bg-white/80 px-4 py-3">
            <div>
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-slate-400">
                P.R.R.I.M.A. Copilot
              </p>
              <h2 className="mt-0.5 text-sm font-semibold tracking-tight text-slate-900">
                Contextual suggestions
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="grid h-8 w-8 place-items-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
              aria-label="Close suggestions"
            >
              <X className="h-4 w-4" />
            </button>
          </header>

          <div className="max-h-[min(60vh,28rem)] space-y-2.5 overflow-y-auto p-3">
            <AnimatePresence mode="popLayout">
              {suggestions.length > 0 ? (
                suggestions.map((s, index) => (
                  <SuggestionCard
                    key={s.id}
                    suggestion={s}
                    onDismiss={onDismiss}
                    index={index}
                  />
                ))
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-8 text-center"
                >
                  <p className="text-sm font-medium text-slate-700">
                    No suggestions right now
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">
                    Keep teaching — the Copilot watches your workflow and will
                    offer the next useful step when an opportunity appears.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {onOpenAdvanced ? (
            <footer className="border-t border-slate-200/80 bg-white/70 px-4 py-2.5">
              <button
                type="button"
                onClick={onOpenAdvanced}
                className="text-xs font-medium text-slate-500 underline-offset-2 transition hover:text-slate-800 hover:underline"
              >
                Open advanced assist
              </button>
            </footer>
          ) : null}
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}
