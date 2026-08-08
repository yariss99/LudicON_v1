import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useCopilot } from "../CopilotContext";
import { SuggestionCard } from "./SuggestionCard";

/**
 * SuggestionPanel — suggestions only. No chat. No text input.
 * Opens only when the teacher clicks the floating button.
 */
export function SuggestionPanel() {
  const { panelOpen, closePanel, suggestions, dismiss, hasSuggestions } =
    useCopilot();

  return (
    <AnimatePresence>
      {panelOpen ? (
        <motion.aside
          key="prima-copilot-panel"
          role="dialog"
          aria-label="P.R.R.I.M.A. Copilot"
          initial={{ opacity: 0, y: 18, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.97 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-[5.5rem] right-4 z-[80] flex w-[min(100vw-2rem,22.5rem)] flex-col overflow-hidden rounded-3xl border border-slate-200/90 bg-[#F7F8FA]/95 shadow-[0_24px_56px_-28px_rgba(15,23,42,0.5)] backdrop-blur-md sm:right-5"
        >
          <header className="flex items-start justify-between gap-3 border-b border-slate-200/80 bg-white/85 px-4 py-3.5">
            <div>
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-slate-400">
                Contextual assistant
              </p>
              <h2 className="mt-0.5 text-base font-semibold tracking-tight text-slate-900">
                P.R.R.I.M.A. Copilot
              </h2>
            </div>
            <button
              type="button"
              onClick={closePanel}
              className="grid h-8 w-8 place-items-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              aria-label="Close Copilot"
            >
              <X className="h-4 w-4" />
            </button>
          </header>

          <div className="max-h-[min(62vh,30rem)] space-y-2.5 overflow-y-auto p-3">
            <AnimatePresence mode="popLayout">
              {hasSuggestions ? (
                suggestions.map((s, index) => (
                  <SuggestionCard
                    key={s.id}
                    suggestion={s}
                    onDismiss={dismiss}
                    index={index}
                  />
                ))
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center"
                >
                  <p className="text-sm font-medium text-slate-800">
                    Nothing to suggest right now
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
                    Keep working — the Copilot watches quietly and only offers
                    the next useful pedagogical step.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}
