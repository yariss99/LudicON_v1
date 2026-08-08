import { Link } from "@tanstack/react-router";
import { ASSET_KIND_LABEL, type ProjectId } from "@ludicon/domain";
import { EmptyState } from "@ludicon/ui";

import type { AnyVersion } from "../../lib/documents";
import { isBuilderKind } from "../builder/types";
import { WORKSPACE_COPY } from "./copy";

export type HistoryTabProps = {
  versions: readonly AnyVersion[];
  projectId: ProjectId;
};

/** Every saved snapshot in the project, newest first. */
export function VersionsTab({ versions, projectId }: HistoryTabProps) {
  return (
    <section aria-labelledby="istoric">
      <h2
        id="istoric"
        className="font-display text-xl font-semibold text-strong"
      >
        {WORKSPACE_COPY.versionsHeading}
      </h2>
      <p className="mt-1 mb-6 text-muted-foreground">
        {WORKSPACE_COPY.versionsLead}
      </p>

      {versions.length === 0 ? (
        <EmptyState
          title={WORKSPACE_COPY.emptyVersionsTitle}
          explanation={WORKSPACE_COPY.emptyVersionsExplanation}
        />
      ) : (
        <ol className="flex flex-col gap-2">
          {versions.map((version) => (
            <li
              key={version.id}
              className="flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-md bg-card px-4 py-3 ring-1 ring-border"
            >
              <span className="font-mono text-sm text-subtle">
                v{version.version}
              </span>
              <span className="min-w-0 flex-1 truncate text-card-foreground">
                {isBuilderKind(version.snapshot.kind) ? (
                  <Link
                    to="/builder/$projectId/$kind/$documentId"
                    params={{
                      projectId,
                      kind: version.snapshot.kind,
                      documentId: version.documentId,
                    }}
                    className="underline-offset-4 hover:underline"
                  >
                    {version.snapshot.title}
                  </Link>
                ) : (
                  version.snapshot.title
                )}
              </span>
              <span className="text-sm text-muted-foreground">
                {ASSET_KIND_LABEL[version.snapshot.kind]}
              </span>
              <time
                dateTime={version.createdAt}
                className="text-sm text-subtle"
              >
                {formatMoment(version.createdAt)}
              </time>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

/**
 * Activity, derived rather than stored.
 *
 * The old workspace kept a separate 500-entry activity table that could drift
 * from the versions it described. The version log already knows what happened
 * and when, so this reads it instead of duplicating it.
 */
export function ActivityTab({ versions, projectId }: HistoryTabProps) {
  void projectId;

  return (
    <section aria-labelledby="activitate">
      <h2
        id="activitate"
        className="font-display text-xl font-semibold text-strong"
      >
        {WORKSPACE_COPY.activityHeading}
      </h2>
      <p className="mt-1 mb-6 text-muted-foreground">
        {WORKSPACE_COPY.activityLead}
      </p>

      {versions.length === 0 ? (
        <EmptyState
          title={WORKSPACE_COPY.emptyActivityTitle}
          explanation={WORKSPACE_COPY.emptyActivityExplanation}
        />
      ) : (
        <ol className="flex flex-col">
          {versions.map((version) => (
            <li
              key={version.id}
              className="flex gap-4 border-l-2 border-border py-3 pl-5"
            >
              <div className="min-w-0 flex-1">
                <p className="text-foreground">
                  <span className="font-medium">{version.snapshot.title}</span>{" "}
                  {describe(version)}
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {ASSET_KIND_LABEL[version.snapshot.kind]}
                  {version.note !== undefined ? ` · ${version.note}` : ""}
                </p>
              </div>
              <time
                dateTime={version.createdAt}
                className="shrink-0 text-sm text-subtle"
              >
                {formatMoment(version.createdAt)}
              </time>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function describe(version: AnyVersion): string {
  if (version.snapshot.status === "published")
    return WORKSPACE_COPY.eventPublished;
  if (version.version <= 1) return WORKSPACE_COPY.eventCreated;
  return WORKSPACE_COPY.eventUpdated;
}

function formatMoment(value: string): string {
  return new Intl.DateTimeFormat("ro-RO", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
