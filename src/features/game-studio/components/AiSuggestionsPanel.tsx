import { useGameStudio } from "../hooks/useGameStudio";

/**
 * Reserved AI Suggestions panel for future game design assistance.
 */
export function AiSuggestionsPanel() {
  const { game, applySuggestedMechanics } = useGameStudio();

  return (
    <aside className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-4">
      <h2 className="text-sm font-semibold tracking-tight text-slate-900">
        AI Suggestions
      </h2>
      <p className="mt-1 text-xs leading-relaxed text-slate-500">
        Coming soon — smarter recommendations for mechanics, difficulty, and
        transforming resources into games.
      </p>
      <ul className="mt-4 space-y-2">
        <li>
          <button
            type="button"
            onClick={applySuggestedMechanics}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-xs text-slate-600 hover:bg-slate-50"
          >
            Recommend better game mechanics for{" "}
            <span className="font-semibold">
              {game.properties.gameType.replace(/_/g, " ")}
            </span>
          </button>
        </li>
        <li>
          <button
            type="button"
            disabled
            className="w-full rounded-xl border border-slate-100 bg-white/60 px-3 py-2 text-left text-xs text-slate-400"
          >
            Balance difficulty across challenges
          </button>
        </li>
        <li>
          <button
            type="button"
            disabled
            className="w-full rounded-xl border border-slate-100 bg-white/60 px-3 py-2 text-left text-xs text-slate-400"
          >
            Suggest cooperative mode
          </button>
        </li>
        <li>
          <button
            type="button"
            disabled
            className="w-full rounded-xl border border-slate-100 bg-white/60 px-3 py-2 text-left text-xs text-slate-400"
          >
            Transform worksheet into game
          </button>
        </li>
      </ul>
    </aside>
  );
}
