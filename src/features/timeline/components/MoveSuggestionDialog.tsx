import type { MoveSuggestion, TimelineWeek } from "../../../types/timeline";
import { RESOURCE_KIND_LABEL } from "../constants";

type MoveSuggestionDialogProps = {
  suggestion: MoveSuggestion;
  fromWeek?: TimelineWeek;
  toWeek?: TimelineWeek;
  onConfirm: () => void;
  onCancel: () => void;
};

function MoveSuggestionDialog({
  suggestion,
  fromWeek,
  toWeek,
  onConfirm,
  onCancel,
}: MoveSuggestionDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/30 p-4 backdrop-blur-[2px] sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="move-suggest-title"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl shadow-slate-900/10 ring-1 ring-slate-200/80"
      >
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
          You decide
        </p>
        <h2
          id="move-suggest-title"
          className="mt-2 text-lg font-semibold tracking-tight text-slate-900"
        >
          Move related resources too?
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          Moving this lesson from{" "}
          <span className="font-medium text-slate-700">
            {fromWeek?.label ?? "its week"}
          </span>{" "}
          to{" "}
          <span className="font-medium text-slate-700">
            {toWeek?.label ?? "the new week"}
          </span>
          . These stay with it — only if you want.
        </p>

        <ul className="mt-4 space-y-2">
          {suggestion.related.map((resource) => (
            <li
              key={resource.id}
              className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5 text-sm"
            >
              <span className="font-medium text-slate-800">{resource.label}</span>
              <span className="text-xs text-slate-400">
                {RESOURCE_KIND_LABEL[resource.kind] ?? resource.kind}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full px-4 py-2.5 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-800"
          >
            Keep lesson where it is
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-full bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800"
          >
            Move lesson & resources
          </button>
        </div>
      </div>
    </div>
  );
}

export default MoveSuggestionDialog;
