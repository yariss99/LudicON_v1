import { Link } from "@tanstack/react-router";
import {
  ASSET_KIND_LABEL,
  type Project,
  type ProjectId,
} from "@ludicon/domain";
import { Button, EmptyState, Progress, StatusBadge } from "@ludicon/ui";

import type { AnyDocument } from "../../lib/documents";
import { isBuilderKind } from "../builder/types";
import { WORKSPACE_COPY, PROJECT_STATE_LABEL } from "./copy";
import { formatDate } from "./MaterialsTab";

export type OverviewTabProps = {
  project: Project;
  documents: readonly AnyDocument[];
  projectId: ProjectId;
};

/**
 * Where the teacher left off.
 *
 * Deliberately not a dashboard. CH12 lists KPI strips on creative surfaces as
 * an anti-pattern, so there is one quiet progress bar and a continue strip —
 * no stat cards, no charts, no counts of things nobody asked about.
 */
export function OverviewTab({
  project,
  documents,
  projectId,
}: OverviewTabProps) {
  const published = documents.filter(
    (document) => document.status === "published",
  ).length;
  const percent =
    documents.length === 0
      ? 0
      : Math.round((published / documents.length) * 100);

  const recent = documents
    .filter((document) => isBuilderKind(document.kind))
    .slice(0, 3);

  return (
    <div className="flex flex-col gap-10">
      <section aria-labelledby="ansamblu">
        <h2
          id="ansamblu"
          className="font-display text-xl font-semibold text-strong"
        >
          {WORKSPACE_COPY.overviewHeading}
        </h2>
        {project.description.trim().length > 0 ? (
          <p className="mt-2 max-w-[65ch] text-muted-foreground">
            {project.description}
          </p>
        ) : null}

        <div className="mt-5 max-w-md">
          <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
            <span className="text-muted-foreground">
              {WORKSPACE_COPY.progressLabel}
            </span>
            <span className="font-mono text-foreground">
              {published} din {documents.length}
            </span>
          </div>
          <Progress value={percent} />
          <p className="mt-2 text-sm text-subtle">
            {PROJECT_STATE_LABEL[project.state]}
          </p>
        </div>
      </section>

      <section aria-labelledby="continua">
        <h2
          id="continua"
          className="mb-4 font-display text-xl font-semibold text-strong"
        >
          {WORKSPACE_COPY.continueHeading}
        </h2>

        {recent.length === 0 ? (
          <EmptyState
            title={WORKSPACE_COPY.emptyOverviewTitle}
            explanation={WORKSPACE_COPY.emptyOverviewExplanation}
          />
        ) : (
          <ul className="grid gap-4 tablet:grid-cols-3">
            {recent.map((document) => (
              <li key={document.id}>
                <article className="flex h-full flex-col gap-3 rounded-md bg-card p-5 ring-1 ring-border transition-shadow duration-[--motion-fast] hover:shadow-soft">
                  <div>
                    <h3 className="font-medium text-card-foreground">
                      {document.title}
                    </h3>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {ASSET_KIND_LABEL[document.kind]} ·{" "}
                      {formatDate(document.updatedAt)}
                    </p>
                  </div>
                  <StatusBadge
                    status={document.status}
                    className="self-start"
                  />
                  <div className="mt-auto pt-2">
                    {isBuilderKind(document.kind) ? (
                      <Button variant="primary" size="sm" asChild>
                        <Link
                          to="/builder/$projectId/$kind/$documentId"
                          params={{
                            projectId,
                            kind: document.kind,
                            documentId: document.id,
                          }}
                        >
                          {WORKSPACE_COPY.continueAction}
                        </Link>
                      </Button>
                    ) : null}
                  </div>
                </article>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
