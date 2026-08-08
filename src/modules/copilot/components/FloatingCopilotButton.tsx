import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useCopilot } from "../CopilotContext";

/**
 * Floating circular Copilot button — bottom-right, brand primary, soft shadow.
 * Pulses only when new suggestions exist.
 */
export function FloatingCopilotButton() {
  const {
    panelOpen,
    togglePanel,
    hasSuggestions,
    hasNewSuggestions,
    suggestions,
  } = useCopilot();

  return (
    <motion.button
      type="button"
      onClick={togglePanel}
      aria-label={
        hasSuggestions
          ? `Open P.R.R.I.M.A. Copilot, ${suggestions.length} suggestions`
          : "Open P.R.R.I.M.A. Copilot"
      }
      aria-expanded={panelOpen}
      initial={false}
      animate={
        hasNewSuggestions && !panelOpen
          ? {
              scale: [1, 1.08, 1],
              boxShadow: [
                "0 12px 32px -12px rgba(15,23,42,0.45)",
                "0 16px 40px -10px rgba(15,23,42,0.55)",
                "0 12px 32px -12px rgba(15,23,42,0.45)",
              ],
            }
          : {
              scale: panelOpen ? 0.96 : 1,
              boxShadow: "0 12px 32px -12px rgba(15,23,42,0.45)",
            }
      }
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.94 }}
      transition={
        hasNewSuggestions && !panelOpen
          ? { duration: 1.6, repeat: Infinity, ease: "easeInOut" }
          : { type: "spring", stiffness: 420, damping: 28 }
      }
      className="fixed bottom-4 right-4 z-[81] flex h-14 w-14 items-center justify-center rounded-full border border-slate-800/10 bg-slate-900 text-white sm:bottom-5 sm:right-5"
    >
      <Sparkles className="h-5 w-5" strokeWidth={1.8} aria-hidden />
      {hasSuggestions ? (
        <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-amber-400 px-1 text-[0.65rem] font-bold text-slate-900">
          {suggestions.length > 9 ? "9+" : suggestions.length}
        </span>
      ) : null}
    </motion.button>
  );
}
