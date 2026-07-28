import type { ExperienceVersion } from "../../../types/classroom";

type VersionRestoreDialogProps = {
  version: ExperienceVersion;
  onConfirm: () => void;
  onCancel: () => void;
};

function VersionRestoreDialog({
  version,
  onConfirm,
  onCancel,
}: VersionRestoreDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/30 p-4 backdrop-blur-[2px] sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="restore-title"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl shadow-slate-900/10 ring-1 ring-slate-200/80"
      >
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
          You decide
        </p>
        <h2
          id="restore-title"
          className="mt-2 text-lg font-semibold tracking-tight text-slate-900"
        >
          Reopen “{version.label}”?
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          This restores the Living Workspace to how it looked on{" "}
          {new Date(version.savedAt).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
          . Your newer work stays in Classroom Intelligence history.
        </p>
        {version.note ? (
          <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600">
            {version.note}
          </p>
        ) : null}
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full px-4 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-800"
          >
            Keep current
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-full bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
          >
            Reopen this version
          </button>
        </div>
      </div>
    </div>
  );
}

export default VersionRestoreDialog;
