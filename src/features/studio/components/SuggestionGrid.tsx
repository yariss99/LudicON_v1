import type { StudioSuggestion } from "../../../types/studio";
import { STUDIO_SUGGESTIONS } from "../constants";
import SuggestionCard from "./SuggestionCard";

type SuggestionGridProps = {
  onSelect: (suggestion: StudioSuggestion) => void;
};

function SuggestionGrid({ onSelect }: SuggestionGridProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {STUDIO_SUGGESTIONS.map((suggestion, index) => (
        <div
          key={suggestion.id}
          style={{ animationDelay: `${120 + index * 40}ms` }}
        >
          <SuggestionCard suggestion={suggestion} onSelect={onSelect} />
        </div>
      ))}
    </div>
  );
}

export default SuggestionGrid;
