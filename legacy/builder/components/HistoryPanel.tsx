import type { Version } from "@ludicon/domain";
import { Button } from "@ludicon/ui";

import { COPY } from "../copy";
import type { BuilderDocument } from "../types";

export type HistoryPanelProps<TBody> = {
  versions: readonly Version<BuilderDocument<TBody>>[];
  onRestore: (versionId: string) => void;
};

/**
 * Version history.
 *
 * The five builders each kept their own snapshot table capped at 3,000 entries
 * with no pruning; `createVersionedRepository` prunes to a uniform 50. This
 * panel just reads them — the mechanism is entirely in the data layer now.
 */
export function HistoryPanel<TBody>({
  versions,
  onRestore,
}: HistoryPanelProps<TBody>) {
  return (
    <div className="flex flex-col gap-4 p-5">
      <div>
        <h2 className="text-sm font-medium text-strong">{COPY.history}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {COPY.historyIntro}
        </p>
      </div>

      {versions.length === 0 ? (
        <p className="text-sm text-subtle">{COPY.noHistory}</p>
      ) : (
        <ol className="flex flex-col gap-3">
          {versions.map((version) => (
            <li
              key={version.id}
              className="rounded-md bg-surface p-4 ring-1 ring-border"
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-mono text-sm text-foreground">
                  {COPY.versionLabel} {version.version}
                </span>
                <time
                  dateTime={version.createdAt}
                  className="text-xs text-subtle"
                >
                  {formatMoment(version.createdAt)}
                </time>
              </div>
              {version.note !== undefined ? (
                <p className="mt-1 text-sm text-muted-foreground">
                  {version.note}
                </p>
              ) : null}
              <Button
                variant="secondary"
                size="sm"
                className="mt-2"
                onClick={() => onRestore(version.id)}
              >
                {COPY.restore}
              </Button>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function formatMoment(value: string): string {
  return new Intl.DateTimeFormat("ro-RO", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
