import { useMemo, useState } from "react";
import { STORY_ENTRY_OPTIONS, STORY_THEMES } from "../constants";
import { listStorySeedSources } from "../services/seedFromResources";
import type { StorySourceKind, StoryThemeId } from "../types";

type Props = {
  projectId: string;
  onCancel: () => void;
  onCreate: (input: {
    sourceKind: StorySourceKind;
    sourceId?: string;
    theme: StoryThemeId;
  }) => void;
};

export function StoryEntryChooser({ projectId, onCancel, onCreate }: Props) {
  const sources = useMemo(() => listStorySeedSources(projectId), [projectId]);
  const [kind, setKind] = useState<StorySourceKind>("blank");
  const [sourceId, setSourceId] = useState("");
  const [theme, setTheme] = useState<StoryThemeId>("adventure");
  const [step, setStep] = useState<"source" | "theme">("source");

  const options =
    kind === "lesson"
      ? sources.lessons
      : kind === "worksheet"
        ? sources.worksheets
        : kind === "assessment"
          ? sources.assessments
          : kind === "game"
            ? sources.games
            : [];

  const needsSource = kind !== "blank";
  const canContinue = !needsSource || Boolean(sourceId);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
        <h2 className="text-lg font-semibold tracking-tight">New story</h2>
        <p className="mt-1 text-sm text-slate-500">
          {step === "source"
            ? "Transform an existing resource — or start blank."
            : "Choose a theme for the narrative world."}
        </p>

        {step === "source" ? (
          <>
            <div className="mt-5 grid gap-2">
              {STORY_ENTRY_OPTIONS.map((opt) => {
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
                    Blank Story.
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
                onClick={() => setStep("theme")}
              >
                Continue
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              {STORY_THEMES.map((t) => {
                const on = theme === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTheme(t.id)}
                    className={[
                      "rounded-2xl border px-4 py-3 text-left transition",
                      on
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 hover:border-slate-300",
                    ].join(" ")}
                  >
                    <span className="block text-sm font-semibold">
                      {t.label}
                    </span>
                    <span
                      className={[
                        "mt-0.5 block text-xs",
                        on ? "text-white/70" : "text-slate-500",
                      ].join(" ")}
                    >
                      {t.description}
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
                    theme,
                  })
                }
              >
                Create story
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
