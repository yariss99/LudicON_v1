import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { EvaluationProjectId } from "@ludicon/evaluation";
import { Button, EmptyState, LoadingBlock } from "@ludicon/ui";

import { teacherOnly } from "../auth/session";
import { BuilderScreen } from "../features/evaluation/builder/builder-screen";
import { EVALUATION_COPY } from "../features/evaluation/copy";
import { evaluationProjectQueries } from "../lib/evaluation-queries";

/**
 * The builder.
 *
 * `projects_` — the trailing underscore opts this route out of nesting under
 * `/projects`. Without it the builder would render inside the projects list's
 * layout, and the list lives under `_studio`, which would put a navigation rail
 * down the side of a full-bleed authoring surface.
 *
 * Params are validated rather than trusted. Zod 4 goes straight to
 * `params.parse` with no adapter, so a hand-edited address fails here instead
 * of three components deep.
 *
 * `projectId` is parsed into an `EvaluationProjectId` — a BRAND, not a shape
 * check. It was `z.string().min(1).max(128)` while the studio still handed out
 * `@ludicon/domain`'s `ProjectId` from the desk, the library and the rail:
 * branding would have made every one of those links a type error, and they were
 * the majority. That compromise is now unnecessary and would be actively
 * harmful. The studio lists papers, so every link into this route carries an
 * `EvaluationProjectId`, and the one place that still holds a domain `ProjectId`
 * — a library row's `projectId` — is a link that could never have resolved. The
 * brand is what makes that a compiler error rather than a page reading "nu găsim
 * proiectul" for reasons nobody can see from the code.
 *
 * `stringify` is the identity a brand always is at runtime. It has to be written
 * because the router needs a way back to the URL, and its absence would make the
 * parsed type unusable in `Link`.
 */
export const Route = createFileRoute("/projects_/$projectId")({
  params: {
    parse: (raw: Record<string, string>) => ({
      projectId: EvaluationProjectId.parse(raw["projectId"]),
    }),
    stringify: ({ projectId }: { projectId: EvaluationProjectId }) => ({
      projectId: String(projectId),
    }),
  },
  beforeLoad: teacherOnly,
  component: BuilderRoute,
});

function BuilderRoute() {
  const { projectId } = Route.useParams();
  const paper = useQuery(evaluationProjectQueries.detail(projectId));

  if (paper.isPending) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <LoadingBlock label={EVALUATION_COPY.loading} />
      </div>
    );
  }

  if (!paper.data) {
    return (
      <div className="flex min-h-svh items-center justify-center px-6">
        <EmptyState
          title={EVALUATION_COPY.notFoundTitle}
          explanation={EVALUATION_COPY.notFoundExplanation}
          action={
            <Button variant="primary" asChild>
              <Link to="/projects">{EVALUATION_COPY.exit}</Link>
            </Button>
          }
        />
      </div>
    );
  }

  /**
   * Keyed on the id so that opening a second paper is a fresh mount.
   *
   * The builder seeds its store once and never reseeds — otherwise a refetch
   * would overwrite unsaved typing — which means the only correct way to load a
   * different document is to build a new store. React's key is that instruction.
   */
  return <BuilderScreen key={paper.data.id} document={paper.data} />;
}
