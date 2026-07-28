import type { DnaAdaptedSuggestion } from "../../../types/pedagogicalDna";

type AdaptedSuggestionsProps = {
  suggestions: DnaAdaptedSuggestion[];
};

function AdaptedSuggestions({ suggestions }: AdaptedSuggestionsProps) {
  return (
    <section>
      <header className="mb-5">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
          Adapted for you
        </p>
        <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-900">
          Suggestions in your style
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Optional ideas shaped by your Pedagogical DNA. You always control.
        </p>
      </header>

      <ul className="space-y-3">
        {suggestions.map((suggestion) => (
          <li
            key={suggestion.id}
            className="rounded-2xl bg-gradient-to-br from-white to-slate-50 px-4 py-3.5 ring-1 ring-slate-200/70"
          >
            <p className="text-sm font-semibold text-slate-900">
              {suggestion.title}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              {suggestion.detail}
            </p>
            <p className="mt-2 text-[10px] font-medium uppercase tracking-wider text-slate-400">
              {suggestion.whyItFits}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default AdaptedSuggestions;
