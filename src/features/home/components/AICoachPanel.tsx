import { Sparkles } from "lucide-react";
import type { CoachSuggestion } from "../constants";

type AICoachPanelProps = {
  suggestions: CoachSuggestion[];
  onSelect: (suggestion: CoachSuggestion) => void;
};

function AICoachPanel({ suggestions, onSelect }: AICoachPanelProps) {
  return (
    <aside className="desk-enter desk-enter-delay rounded-[28px] border border-slate-200/70 bg-white/90 p-5 shadow-[0_12px_32px_rgba(15,23,42,0.04)] backdrop-blur-sm lg:sticky lg:top-6 lg:min-h-[calc(100vh-120px)]">
      <div className="mb-5 flex items-start gap-3 border-b border-slate-100 pb-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white">
          <Sparkles size={18} />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">AI Coach</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            A colleague beside you — not a chat window.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {suggestions.map((suggestion, index) => (
          <button
            key={suggestion.id}
            type="button"
            onClick={() => onSelect(suggestion)}
            style={{ animationDelay: `${100 + index * 40}ms` }}
            className="desk-card w-full rounded-2xl border border-transparent bg-slate-50 px-3.5 py-3 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-200 hover:bg-white hover:shadow-[0_10px_24px_rgba(15,23,42,0.06)]"
          >
            <p className="text-sm font-medium text-slate-800">
              {suggestion.title}
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
              {suggestion.detail}
            </p>
          </button>
        ))}
      </div>
    </aside>
  );
}

export default AICoachPanel;
