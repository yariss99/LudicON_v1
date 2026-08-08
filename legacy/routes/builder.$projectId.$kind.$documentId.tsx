import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { DocumentId, ProjectId } from "@ludicon/domain";
import { EmptyState } from "@ludicon/ui";

import { BUILDERS } from "../features/builder/registry";
import { COPY } from "../features/builder/copy";
import { BUILDER_KINDS } from "../features/builder/types";
import { teacherOnly } from "../auth/session";

/**
 * Params are validated, not trusted.
 *
 * Zod v4 needs no adapter — the schema goes straight to `params.parse`. An
 * unknown `kind` fails here rather than three components deep, which is the
 * whole point of branding the ids in the domain package.
 */
const builderParams = z.object({
  projectId: ProjectId,
  kind: z.enum(BUILDER_KINDS),
  documentId: DocumentId,
});

export const Route = createFileRoute("/builder/$projectId/$kind/$documentId")({
  params: { parse: builderParams.parse },
  beforeLoad: teacherOnly,
  component: BuilderRoute,
});

/**
 * ONE route for five asset kinds.
 *
 * The five pre-refactor builders had ten routes between them (an entry route
 * and a document route each) pointing at five near-identical page shells.
 */
function BuilderRoute() {
  const { projectId, kind, documentId } = Route.useParams();
  const definition = BUILDERS[kind];

  if (definition === undefined) {
    return (
      <div className="reading-column px-6 py-16">
        <EmptyState
          title={COPY.unknownKindTitle}
          explanation={COPY.unknownKindExplanation}
        />
      </div>
    );
  }

  return <definition.Screen projectId={projectId} documentId={documentId} />;
}
