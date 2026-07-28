import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import type { AISuggestion } from "../../types/dashboard";
import SurfaceCard from "../ui/SurfaceCard";
import SectionHeader from "../ui/SectionHeader";

type SuggestionCardProps = {
  suggestion: AISuggestion;
};

function SuggestionCard({ suggestion }: SuggestionCardProps) {
  return (
    <Link to={suggestion.href} className="group block h-full">
      <SurfaceCard
        hover
        padding="md"
        className="h-full border-indigo-50 bg-gradient-to-br from-white to-indigo-50/30"
      >
        <div className="flex h-full flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
              <Sparkles size={16} />
            </div>
            <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
              {suggestion.tag}
            </span>
          </div>

          <div className="flex flex-1 flex-col gap-2">
            <h3 className="text-base font-semibold text-slate-900 group-hover:text-indigo-700">
              {suggestion.title}
            </h3>
            <p className="text-sm leading-relaxed text-slate-500">
              {suggestion.description}
            </p>
          </div>

          <span className="text-sm font-medium text-indigo-600 group-hover:text-indigo-700">
            Try this suggestion →
          </span>
        </div>
      </SurfaceCard>
    </Link>
  );
}

type AISuggestionsProps = {
  suggestions: AISuggestion[];
};

function AISuggestions({ suggestions }: AISuggestionsProps) {
  return (
    <section>
      <SectionHeader
        title="AI Suggestions"
        subtitle="Personalized recommendations based on your teaching style"
      />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {suggestions.map((suggestion) => (
          <SuggestionCard key={suggestion.id} suggestion={suggestion} />
        ))}
      </div>
    </section>
  );
}

export default AISuggestions;
export { SuggestionCard };
