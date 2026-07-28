import type { LessonEditVersion } from "../../blueprint-review/types";
import { formatClock } from "../services/studioState";

type VersionHistoryPanelProps = {
  versions: LessonEditVersion[];
  onRestore: (versionId: string) => void;
  readOnly?: boolean;
};

function VersionHistoryPanel({
  versions,
  onRestore,
  readOnly,
}: VersionHistoryPanelProps) {
  if (versions.length === 0) {
    return (
      <section className="rounded-3xl bg-white p-5 ring-1 ring-slate-200/70">
        <h2 className="text-sm font-semibold text-slate-900">Istoric versiuni</h2>
        <p className="mt-2 text-sm text-slate-500">
          Modificările importante vor apărea aici. Poți restaura oricând o
          variantă anterioară.
        </p>
      </section>
    );
  }

  const recent = [...versions].reverse().slice(0, 12);

  return (
    <section className="rounded-3xl bg-white p-5 ring-1 ring-slate-200/70">
      <h2 className="text-sm font-semibold text-slate-900">Istoric versiuni</h2>
      <ol className="mt-4 space-y-3 border-l border-slate-200 pl-4">
        {recent.map((version) => (
          <li key={version.id} className="relative">
            <span
              className="absolute -left-[1.3rem] top-1.5 h-2 w-2 rounded-full bg-slate-400"
              aria-hidden
            />
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-xs font-semibold text-slate-500">
                {formatClock(version.at)}
              </p>
              {!readOnly ? (
                <button
                  type="button"
                  onClick={() => onRestore(version.id)}
                  className="text-xs font-semibold text-blue-700 hover:underline"
                >
                  Restaurează
                </button>
              ) : null}
            </div>
            <p className="mt-0.5 text-sm text-slate-800">{version.summary}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

export default VersionHistoryPanel;
