import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import type { AISuggestion } from "../../types/dashboard";
import { dashboardRo } from "../../i18n";
import SectionHeader from "../ui/SectionHeader";

const { sections } = dashboardRo;

type RecommendationRowProps = {
  suggestion: AISuggestion;
};

function RecommendationRow({ suggestion }: RecommendationRowProps) {
  return (
    <Link
      to={suggestion.href}
      className="group flex items-start gap-4 rounded-[24px] bg-white px-6 py-5 ring-1 ring-slate-100/70 transition-all duration-300 hover:shadow-[0_8px_28px_rgba(79,70,229,0.07)] hover:ring-indigo-100/80"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
        <Sparkles size={18} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-semibold text-slate-900 group-hover:text-indigo-700">
            {suggestion.title}
          </h3>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
            {suggestion.tag}
          </span>
        </div>
        <p className="mt-1 text-sm leading-relaxed text-slate-500">
          {suggestion.description}
        </p>
      </div>

      <ArrowRight
        size={16}
        className="mt-1 shrink-0 text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:text-indigo-500"
      />
    </Link>
  );
}

type PrimaRecommendationsProps = {
  suggestions: AISuggestion[];
};

function PrimaRecommendations({ suggestions }: PrimaRecommendationsProps) {
  return (
    <section>
      <SectionHeader title={sections.primaRecommendations} size="subtle" />
      <div className="space-y-3">
        {suggestions.map((suggestion) => (
          <RecommendationRow key={suggestion.id} suggestion={suggestion} />
        ))}
      </div>
    </section>
  );
}

export default PrimaRecommendations;
export { RecommendationRow };
