import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

type Props = {
  open: boolean;
  opportunityCount: number;
  onClick: () => void;
};

/**
 * Floating assistant button — bottom-right, always visible, never auto-opens.
 */
export function FloatingCopilotButton({
  open,
  opportunityCount,
  onClick,
}: Props) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={
        opportunityCount > 0
          ? `Open Copilot, ${opportunityCount} suggestions`
          : "Open P.R.R.I.M.A. Copilot"
      }
      aria-expanded={open}
      initial={false}
      animate={{
        scale: open ? 0.96 : 1,
      }}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.94 }}
      transition={{ type: "spring", stiffness: 420, damping: 28 }}
      className="fixed bottom-4 right-4 z-[69] flex h-12 w-12 items-center justify-center rounded-full border border-slate-800/10 bg-slate-900 text-white shadow-[0_12px_32px_-12px_rgba(15,23,42,0.55)] sm:bottom-5 sm:right-5"
    >
      <Sparkles className="h-5 w-5" strokeWidth={1.75} aria-hidden />
      {opportunityCount > 0 ? (
        <motion.span
          key={opportunityCount}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-amber-400 px-1 text-[0.65rem] font-bold text-slate-900"
        >
          {opportunityCount > 9 ? "9+" : opportunityCount}
        </motion.span>
      ) : null}
    </motion.button>
  );
}
