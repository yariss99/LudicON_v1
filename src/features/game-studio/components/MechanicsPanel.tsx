import { GAME_MECHANICS, gameTypeMeta } from "../constants";
import { useGameStudio } from "../hooks/useGameStudio";

export function MechanicsPanel() {
  const { game, toggleMechanic, applySuggestedMechanics } = useGameStudio();
  const suggested = gameTypeMeta(game.properties.gameType)?.suggestedMechanics ?? [];

  return (
    <aside className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-slate-900">
            Mechanics library
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Toggle mechanics that support your learning objective.
          </p>
        </div>
        <button
          type="button"
          onClick={applySuggestedMechanics}
          className="shrink-0 rounded-lg px-2 py-1 text-[0.7rem] font-semibold text-slate-600 hover:bg-slate-50"
        >
          Apply suggested
        </button>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {GAME_MECHANICS.map((m) => {
          const on = game.mechanics.includes(m.id);
          const rec = suggested.includes(m.id);
          return (
            <button
              key={m.id}
              type="button"
              title={m.description}
              onClick={() => toggleMechanic(m.id)}
              className={[
                "rounded-lg px-2.5 py-1.5 text-xs font-medium transition",
                on
                  ? "bg-slate-900 text-white"
                  : rec
                    ? "bg-slate-100 text-slate-700 ring-1 ring-slate-300"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100",
              ].join(" ")}
            >
              {m.label}
            </button>
          );
        })}
      </div>
    </aside>
  );
}
