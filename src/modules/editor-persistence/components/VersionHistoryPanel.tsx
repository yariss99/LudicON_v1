import { AnimatePresence, motion } from "framer-motion";
import { formatAbsoluteDate, formatRelativeTime } from "../../../utils/date";
import { HISTORY_ACTION_LABEL, type VersionEntry } from "../types";

type Props<T> = {
  open: boolean;
  onClose: () => void;
  versions: VersionEntry<T>[];
  onRestore: (versionId: string) => void;
};

export function VersionHistoryPanel<T>({
  open,
  onClose,
  versions,
  onRestore,
}: Props<T>) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[70] flex justify-end bg-slate-900/30 backdrop-blur-[1px]"
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.aside
            role="dialog"
            aria-label="Version history"
            initial={{ x: 28, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 24, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-xl"
          >
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Version history
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Timeline of saves — restore any snapshot.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {versions.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No versions yet. Edit and save to create history.
                </p>
              ) : (
                <ol className="relative space-y-0 border-l border-slate-200 pl-4">
                  {versions.map((version, index) => (
                    <motion.li
                      key={version.id}
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="relative pb-5 last:pb-0"
                    >
                      <span
                        className="absolute -left-[1.3rem] top-1.5 h-2.5 w-2.5 rounded-full bg-slate-900 ring-4 ring-white"
                        aria-hidden
                      />
                      <p className="text-sm font-semibold text-slate-900">
                        {version.label || HISTORY_ACTION_LABEL[version.action]}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {formatAbsoluteDate(version.timestamp)} ·{" "}
                        {formatRelativeTime(version.timestamp)}
                      </p>
                      <p className="mt-0.5 text-[0.65rem] uppercase tracking-wide text-slate-400">
                        {HISTORY_ACTION_LABEL[version.action]}
                      </p>
                      <button
                        type="button"
                        className="mt-2 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
                        onClick={() => {
                          onRestore(version.id);
                          onClose();
                        }}
                      >
                        Restore
                      </button>
                    </motion.li>
                  ))}
                </ol>
              )}
            </div>
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
