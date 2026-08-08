import type { ReactElement } from "react";
import { Link } from "@tanstack/react-router";
import { FileQuestion } from "lucide-react";
import type { DocumentId, ProjectId } from "@ludicon/domain";
import { Button, EmptyState, LoadingBlock } from "@ludicon/ui";

import { createDocumentRepository } from "../../lib/documents";
import { BuilderShell } from "./components/BuilderShell";
import { COPY } from "./copy";
import type { BuilderConfig, BuilderKind, BuilderRouteParams } from "./types";
import { useBuilder } from "./useBuilder";

export type BuilderDefinition = {
  kind: BuilderKind;
  /** Fully bound to its body type — the route never sees the generic. */
  Screen: (props: BuilderRouteParams) => ReactElement;
  /** A fresh body, for the workspace's "add a material" flow. */
  createBody: () => unknown;
};

/**
 * Turns one config into one working builder.
 *
 * This is where the type parameter is discharged. `Screen` closes over
 * `TBody`, so the registry can hold five differently-typed builders behind one
 * uniform value without a single `any` or cast.
 *
 * The repository is created once per config rather than per render — the five
 * old builders each rebuilt theirs on every mount.
 */
export function createBuilder<TBody>(
  config: BuilderConfig<TBody>,
): BuilderDefinition {
  const repository = createDocumentRepository(config.bodySchema);

  function Screen({ projectId, documentId }: BuilderRouteParams): ReactElement {
    const state = useBuilder(config, repository, { projectId, documentId });

    if (state.status === "loading") {
      return (
        <div className="reading-column px-6 py-16">
          <LoadingBlock label={COPY.loadingLabel} />
        </div>
      );
    }

    if (state.status === "failed") {
      return (
        <Fallback
          projectId={projectId}
          title={COPY.failedTitle}
          explanation={COPY.failedExplanation}
        />
      );
    }

    if (state.status === "missing") {
      return (
        <Fallback
          projectId={projectId}
          title={COPY.missingTitle}
          explanation={COPY.missingExplanation}
        />
      );
    }

    return (
      <BuilderShell
        config={config}
        builder={state.builder}
        projectId={projectId}
      />
    );
  }

  return {
    kind: config.kind,
    Screen,
    createBody: config.createBody,
  };
}

function Fallback({
  projectId,
  title,
  explanation,
}: {
  projectId: ProjectId;
  title: string;
  explanation: string;
}) {
  return (
    <div className="reading-column px-6 py-16">
      <EmptyState
        icon={<FileQuestion aria-hidden strokeWidth={1.75} />}
        title={title}
        explanation={explanation}
        action={
          <Button variant="primary" asChild>
            <Link to="/projects/$projectId" params={{ projectId }}>
              {COPY.back}
            </Link>
          </Button>
        }
      />
    </div>
  );
}

export type { DocumentId };
