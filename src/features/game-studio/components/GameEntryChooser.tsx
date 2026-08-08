import { useMemo, useState } from "react";
import { GAME_ENTRY_OPTIONS, GAME_TYPES } from "../constants";
import { listGameSeedSources } from "../services/seedFromResources";
import type { GameSourceKind, GameTypeId } from "../types";

type Props = {
  projectId: string;
  onCancel: () => void;
  onCreate: (input: {
    sourceKind: GameSourceKind;
    sourceId?: string;
    gameType: GameTypeId;
  }) => void;
};

export function GameEntryChooser({ projectId, onCancel, onCreate }: Props) {
  const sources = useMemo(() => listGameSeedSources(projectId), [projectId]);
  const [kind, setKind] = useState<GameSourceKind>("scratch");
  const [sourceId, setSourceId] = useState("");
  const [gameType, setGameType] = useState<GameTypeId>("quiz_challenge");
  const [step, setStep] = useState<"source" | "type">("source");

  const options =
    kind === "lesson"
      ? sources.lessons
      : kind === "worksheet"
        ? sources.worksheets
        : kind === "assessment"
          ? sources.assessments
          : [];

  const needsSource = kind !== "scratch";
  const canContinue = !needsSource || Boolean(sourceId);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
        <h2 className="text-lg font-semibold tracking-tight">New game</h2>
        <p className="mt-1 text-sm text-slate-500">
          {step === "source"
            ? "Transform an existing resource — or start from scratch."
            : "Choose a game type aligned to your learning objective."}
        </p>

        {step === "source" ? (
          <>
            <div className="mt-5 grid gap-2">
              {GAME_ENTRY_OPTIONS.map((opt) => {
                const on = kind === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setKind(opt.id);
                      setSourceId("");
                    }}
                    className={[
                      "rounded-2xl border px-4 py-3 text-left transition",
                      on
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 hover:border-slate-300",
                    ].join(" ")}
                  >
                    <span className="block text-sm font-semibold">
                      {opt.label}
                    </span>
                    <span
                      className={[
                        "mt-0.5 block text-xs",
                        on ? "text-white/70" : "text-slate-500",
                      ].join(" ")}
                    >
                      {opt.description}
                    </span>
                  </button>
                );
              })}
            </div>
            {needsSource ? (
              <div className="mt-4">
                {options.length === 0 ? (
                  <p className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-500">
                    No {kind}s in this project yet. Create one first, or choose
                    From Scratch.
                  </p>
                ) : (
                  <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-500">
                    Select {kind}
                    <select
                      value={sourceId}
                      onChange={(e) => setSourceId(e.target.value)}
                      className="h-11 rounded-xl border border-slate-200 px-3 text-sm font-normal"
                    >
                      <option value="">Choose…</option>
                      {options.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.title}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
              </div>
            ) : null}
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                onClick={onCancel}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!canContinue}
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
                onClick={() => setStep("type")}
              >
                Continue
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="mt-5 grid gap-2">
              {GAME_TYPES.map((gt) => {
                const on = gameType === gt.id;
                return (
                  <button
                    key={gt.id}
                    type="button"
                    onClick={() => setGameType(gt.id)}
                    className={[
                      "rounded-2xl border px-4 py-3 text-left transition",
                      on
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 hover:border-slate-300",
                    ].join(" ")}
                  >
                    <span className="block text-sm font-semibold">
                      {gt.label}
                    </span>
                    <span
                      className={[
                        "mt-0.5 block text-xs",
                        on ? "text-white/70" : "text-slate-500",
                      ].join(" ")}
                    >
                      {gt.description}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="mt-6 flex justify-between gap-2">
              <button
                type="button"
                className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                onClick={() => setStep("source")}
              >
                Back
              </button>
              <button
                type="button"
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                onClick={() =>
                  onCreate({
                    sourceKind: kind,
                    sourceId: sourceId || undefined,
                    gameType,
                  })
                }
              >
                Create game
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
