import type { BlueprintVersion } from "../types";

type VersionHistoryProps = {
  versions: BlueprintVersion[];
  currentVersionId: string;
  previousVersionId: string | null;
  onRestore: (versionId: string) => void;
  onCompare: (leftId: string, rightId: string) => void;
  frozen: boolean;
};

function VersionHistory({
  versions,
  currentVersionId,
  previousVersionId,
  onRestore,
  onCompare,
  frozen,
}: VersionHistoryProps) {
  const current = versions.find((v) => v.id === currentVersionId);
  const previous = previousVersionId
    ? versions.find((v) => v.id === previousVersionId)
    : versions[1];

  return (
    <div className="rounded-3xl bg-white p-5 ring-1 ring-slate-200/70">
      <p className="text-sm font-semibold text-slate-900">Version history</p>
      <p className="mt-1 text-xs text-slate-500">
        Every approval freezes a version. Restores create a new revision.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <VersionCard label="Current version" version={current} />
        <VersionCard label="Previous version" version={previous} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {previous && current ? (
          <button
            type="button"
            onClick={() => onCompare(previous.id, current.id)}
            className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200"
          >
            Compare current vs previous
          </button>
        ) : null}
      </div>

      <ul className="mt-4 divide-y divide-slate-100">
        {versions.map((version) => (
          <li
            key={version.id}
            className="flex flex-wrap items-center justify-between gap-2 py-3"
          >
            <div>
              <p className="text-sm font-medium text-slate-800">
                {version.versionLabel}
                {version.id === currentVersionId ? (
                  <span className="ml-2 text-[11px] font-semibold text-sky-700">
                    current
                  </span>
                ) : null}
                {version.frozen ? (
                  <span className="ml-2 text-[11px] font-semibold text-emerald-700">
                    frozen
                  </span>
                ) : null}
              </p>
              <p className="text-xs text-slate-500">
                {new Date(version.createdAt).toLocaleString()} · {version.author}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                {version.changesSummary}
              </p>
            </div>
            {version.id !== currentVersionId ? (
              <button
                type="button"
                disabled={frozen && version.frozen && version.lifecycleState === "approved"}
                onClick={() => onRestore(version.id)}
                className="rounded-full px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 disabled:opacity-40"
              >
                Restore
              </button>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

function VersionCard({
  label,
  version,
}: {
  label: string;
  version?: BlueprintVersion;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 px-3 py-3 ring-1 ring-slate-100">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      {version ? (
        <>
          <p className="mt-1 text-sm font-semibold text-slate-800">
            {version.versionLabel}
          </p>
          <p className="text-xs text-slate-500">
            {new Date(version.createdAt).toLocaleDateString()} · {version.author}
          </p>
        </>
      ) : (
        <p className="mt-1 text-xs text-slate-500">None yet</p>
      )}
    </div>
  );
}

export default VersionHistory;
