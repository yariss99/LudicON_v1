import { Link } from "react-router-dom";
import type { HistorySuggestion } from "../../../types/classroom";

type HistorySuggestionsProps = {
  suggestions: HistorySuggestion[];
};

function HistorySuggestions({ suggestions }: HistorySuggestionsProps) {
  return (
    <section>
      <header className="mb-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
          Suggestions
        </p>
        <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-900">
          From your history
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Based on what you learned teaching — never student profiling. You
          decide.
        </p>
      </header>

      <ul className="space-y-3">
        {suggestions.map((suggestion) => (
          <li
            key={suggestion.id}
            className="rounded-2xl bg-gradient-to-br from-slate-50 to-white px-4 py-3.5 ring-1 ring-slate-100"
          >
            <p className="text-sm font-semibold text-slate-900">
              {suggestion.title}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              {suggestion.detail}
            </p>
            <div className="mt-2 flex items-center justify-between gap-2">
              <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                {suggestion.basedOn}
              </p>
              {suggestion.projectId ? (
                <Link
                  to={`/studio/${suggestion.projectId}`}
                  className="text-[11px] font-medium text-slate-600 no-underline hover:text-slate-900"
                >
                  Open experience →
                </Link>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default HistorySuggestions;
