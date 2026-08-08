import { motion, AnimatePresence } from "framer-motion";
import { formatRelativeTime } from "../../../utils/date";
import type { SaveStatus } from "../types";
import { formatSaveStatus } from "../utils/formatSaveStatus";

type Props = {
  status: SaveStatus;
  lastSavedAt: string | null;
  className?: string;
};

export function SaveStatusBadge({ status, lastSavedAt, className }: Props) {
  const label = formatSaveStatus(status, lastSavedAt, formatRelativeTime);
  const tone =
    status === "failed"
      ? "text-rose-600"
      : status === "saving" || status === "dirty"
        ? "text-amber-600"
        : "text-slate-400";

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={label}
        initial={{ opacity: 0, y: 2 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -2 }}
        transition={{ duration: 0.18 }}
        className={["text-xs font-medium tabular-nums", tone, className]
          .filter(Boolean)
          .join(" ")}
        role="status"
        aria-live="polite"
      >
        {label}
      </motion.span>
    </AnimatePresence>
  );
}
