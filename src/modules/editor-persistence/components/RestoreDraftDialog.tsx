import { motion } from "framer-motion";
import { formatAbsoluteDate, formatRelativeTime } from "../../../utils/date";
import type { DraftOffer } from "../hooks/useEditorPersistence";

type Props<T> = {
  offer: DraftOffer<T>;
};

export function RestoreDraftDialog<T>({ offer }: Props<T>) {
  const { draft, continueEditing, discardDraft } = offer;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-[2px]"
      role="presentation"
    >
      <motion.div
        role="dialog"
        aria-labelledby="restore-draft-title"
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_60px_-28px_rgba(15,23,42,0.55)]"
      >
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-slate-400">
          Unfinished draft
        </p>
        <h2
          id="restore-draft-title"
          className="mt-1 text-lg font-semibold tracking-tight text-slate-900"
        >
          Continue editing?
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          We found unsaved work from{" "}
          <span className="font-medium text-slate-700">
            {formatAbsoluteDate(draft.updatedAt)}
          </span>{" "}
          ({formatRelativeTime(draft.updatedAt)}). Restore it or discard and keep
          the last saved version.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={continueEditing}
            className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Continue Editing
          </button>
          <button
            type="button"
            onClick={discardDraft}
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Discard Draft
          </button>
        </div>
      </motion.div>
    </div>
  );
}
