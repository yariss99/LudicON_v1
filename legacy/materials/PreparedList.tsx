import { Link } from "@tanstack/react-router";
import type { ProjectId } from "@ludicon/domain";
import { Button, StatusBadge } from "@ludicon/ui";

import type { AnyDocument } from "../../lib/documents";
import { isBuilderKind } from "../builder/types";
import { kindLabel } from "./catalog";
import { MATERIALS_COPY } from "./copy";

export type PreparedListProps = {
  projectId: ProjectId;
  documents: readonly AnyDocument[];
};

/**
 * What the teacher just asked for, with the way into it.
 *
 * This list used to name library entries and stop there — the chain announced
 * the materials and then had nowhere to send anyone. Each row now opens the
 * real document in its builder, which is the last link.
 */
export function PreparedList({ projectId, documents }: PreparedListProps) {
  if (documents.length === 0) return null;

  return (
    <section aria-labelledby="materiale-pregatite" className="mt-12">
      <h2
        id="materiale-pregatite"
        className="mb-1 text-xl font-semibold text-foreground"
      >
        {MATERIALS_COPY.preparedHeading}
      </h2>
      <p className="mb-4 text-sm text-muted-foreground">
        {MATERIALS_COPY.preparedLead}
      </p>

      <ul className="flex flex-col gap-2">
        {documents.map((document) => (
          <li
            key={document.id}
            className="flex flex-wrap items-center gap-3 rounded-lg bg-card px-4 py-3 ring-1 ring-border"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-card-foreground">{document.title}</p>
              <p className="text-sm text-muted-foreground">
                {kindLabel(document.kind)}
              </p>
            </div>
            <StatusBadge className="shrink-0" status={document.status} />
            {isBuilderKind(document.kind) ? (
              <Button variant="secondary" size="sm" asChild>
                <Link
                  to="/builder/$projectId/$kind/$documentId"
                  params={{
                    projectId,
                    kind: document.kind,
                    documentId: document.id,
                  }}
                >
                  {MATERIALS_COPY.open}
                </Link>
              </Button>
            ) : null}
          </li>
        ))}
      </ul>

      <Button variant="ghost" size="sm" className="mt-3" asChild>
        <Link to="/library">{MATERIALS_COPY.openLibrary}</Link>
      </Button>
    </section>
  );
}
