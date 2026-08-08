import { useMemo, useState } from "react";
import { PRESENTATION_ENTRY_OPTIONS } from "../constants";
import { listSeedSources } from "../services/seedFromResources";
import type { PresentationSourceKind } from "../types";

type Props = {
  projectId: string;
  onCancel: () => void;
  onCreate: (input: {
    sourceKind: PresentationSourceKind;
    sourceId?: string;
  }) => void;
};

export function PresentationEntryChooser({
  projectId,
  onCancel,
  onCreate,
}: Props) {
  const sources = useMemo(() => listSeedSources(projectId), [projectId]);
  const [kind, setKind] = useState<PresentationSourceKind>("blank");
  const [sourceId, setSourceId] = useState("");

  const options =
    kind === "lesson"
      ? sources.lessons
      : kind === "worksheet"
        ? sources.worksheets
        : kind === "assessment"
          ? sources.assessments
          : kind === "story"
            ? sources.stories
            : [];

  const needsSource = kind !== "blank";
  const canCreate = !needsSource || Boolean(sourceId);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
        <h2 className="text-lg font-semibold tracking-tight">
          New presentation
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Generate from an existing resource — or start blank.
        </p>

        <div className="mt-5 grid gap-2">
          {PRESENTATION_ENTRY_OPTIONS.map((opt) => {
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
                <span className="block text-sm font-semibold">{opt.label}</span>
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
                No {kind}s in this project yet. Create one first, or choose Blank
                Presentation.
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
            disabled={!canCreate}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-40"
            onClick={() =>
              onCreate({
                sourceKind: kind,
                sourceId: sourceId || undefined,
              })
            }
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
