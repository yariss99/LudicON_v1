import {
  INSIGHT_DISMISS_LABEL,
  INSIGHT_LEARN_WHY_LABEL,
  INSIGHT_REVIEW_LABEL,
} from "../constants";

type ActionBarProps = {
  whyOpen: boolean;
  reviewLabel: string;
  onReview: () => void;
  onLearnWhy: () => void;
  onDismiss: () => void;
};

function ActionBar({
  whyOpen,
  reviewLabel,
  onReview,
  onLearnWhy,
  onDismiss,
}: ActionBarProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={onReview}
          className="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2"
        >
          {reviewLabel || INSIGHT_REVIEW_LABEL}
        </button>
        <button
          type="button"
          onClick={onLearnWhy}
          aria-expanded={whyOpen}
          aria-controls="insight-explanation-drawer"
          className="inline-flex h-11 items-center justify-center rounded-2xl px-5 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2"
        >
          {INSIGHT_LEARN_WHY_LABEL}
        </button>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="self-start text-sm font-medium text-slate-400 transition-colors hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2"
      >
        {INSIGHT_DISMISS_LABEL}
      </button>
    </div>
  );
}

export default ActionBar;
