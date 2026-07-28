import type { StudioSuggestion } from "../../../types/studio";

type SuggestionCardProps = {
  suggestion: StudioSuggestion;
  onSelect: (suggestion: StudioSuggestion) => void;
};

function SuggestionCard({ suggestion, onSelect }: SuggestionCardProps) {
  const Icon = suggestion.icon;

  return (
    <button
      type="button"
      onClick={() => onSelect(suggestion)}
      className="studio-card-enter group flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white px-4 py-3.5 text-left shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_14px_32px_rgba(15,23,42,0.08)]"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-700 transition-colors group-hover:bg-slate-900 group-hover:text-white">
        <Icon size={18} strokeWidth={1.75} />
      </span>
      <span className="text-sm font-medium text-slate-800">{suggestion.label}</span>
    </button>
  );
}

export default SuggestionCard;
