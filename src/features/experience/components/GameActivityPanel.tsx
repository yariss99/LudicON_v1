import { X } from "lucide-react";
import {
  GAME_ACTIVITY_SUGGESTIONS,
  type GameActivitySuggestion,
} from "../constants";

type GameActivityPanelProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (activity: GameActivitySuggestion) => void;
};

function GameActivityPanel({
  open,
  onClose,
  onSelect,
}: GameActivityPanelProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/20 backdrop-blur-[2px]">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close activity panel"
        onClick={onClose}
      />
      <aside className="desk-enter relative z-10 flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white p-6 shadow-[-20px_0_60px_rgba(15,23,42,0.12)]">
        <div className="mb-6 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
              Game
            </p>
            <h2 className="mt-1 text-xl font-semibold text-slate-900">
              Suggested activities
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Choose one — your workspace updates instantly.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-700"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3">
          {GAME_ACTIVITY_SUGGESTIONS.map((activity, index) => (
            <button
              key={activity.id}
              type="button"
              onClick={() => onSelect(activity)}
              style={{ animationDelay: `${80 + index * 60}ms` }}
              className="desk-card w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-left transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:shadow-[0_12px_28px_rgba(15,23,42,0.08)]"
            >
              <p className="text-sm font-semibold text-slate-900">
                {activity.title}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-slate-500">
                {activity.description}
              </p>
            </button>
          ))}
        </div>
      </aside>
    </div>
  );
}

export default GameActivityPanel;
