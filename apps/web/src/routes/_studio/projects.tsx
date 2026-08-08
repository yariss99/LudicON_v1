import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Discipline } from "@ludicon/domain";
import type { EvaluationProject } from "@ludicon/evaluation";
import { Button, EmptyState, Skeleton } from "@ludicon/ui";

import { DeleteDialog } from "./-projects/delete-dialog";
import { ProjectMenu } from "./-projects/project-menu";
import { ProjectsToolbar } from "./-projects/projects-toolbar";
import { useProjectActions } from "./-projects/use-project-actions";
import { useProjectsView } from "./-projects/use-projects-view";
import { PaperCard } from "./-shared/paper-card";

type ProjectsSearch = { disciplina?: Discipline };

export const Route = createFileRoute("/_studio/projects")({
  component: ProjectsPage,
  /**
   * Only the discipline lives in the URL. It is the one filter another surface
   * links into — the desk's shelves — and the one worth surviving a reload or
   * a shared link. Scope and ordering are a reading preference, not a location.
   *
   * The value is PARSED against the enum, not accepted as a string. `?disciplina`
   * is the one part of this page a person can type, and an id that is not a
   * discipline should filter nothing rather than silently hide every row — which
   * is what a free-text compare against `meta.discipline` would have done.
   */
  validateSearch: (search: Record<string, unknown>): ProjectsSearch => {
    const parsed = Discipline.safeParse(search["disciplina"]);
    return parsed.success ? { disciplina: parsed.data } : {};
  },
});

function ProjectsPage() {
  const { disciplina } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const view = useProjectsView(disciplina);
  const actions = useProjectActions();
  const [pendingDelete, setPendingDelete] = useState<EvaluationProject | null>(
    null,
  );

  return (
    <div className="shell-column px-6 pt-10 pb-20">
      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl leading-tight font-semibold text-foreground">
            Proiecte
          </h1>
          <p className="mt-1 text-muted-foreground">
            Fiecare evaluare pe care ai scris-o, la un loc.
          </p>
        </div>

        {/* Filled, like the desk's. It is the only action in this header and
            the page is a list of the things it makes; an outlined pill beside a
            heading reads as a filter, which is exactly what the toolbar below
            it is full of. */}
        <Button variant="primary" asChild>
          <Link to="/create">Proiect nou</Link>
        </Button>
      </header>

      {view.isPending ? (
        <div className="grid gap-4 tablet:grid-cols-2" aria-hidden>
          <Skeleton className="h-44 rounded-lg" />
          <Skeleton className="h-44 rounded-lg" />
          <Skeleton className="h-44 rounded-lg" />
          <Skeleton className="h-44 rounded-lg" />
        </div>
      ) : view.isError ? (
        <p role="alert" className="text-muted-foreground">
          Nu am putut încărca proiectele acum. Ce ai lucrat este în siguranță —
          încearcă din nou peste câteva momente.
        </p>
      ) : view.isEmpty ? (
        <EmptyState
          title="Niciun proiect încă"
          explanation="Aici ajung evaluările pe care le scrii — fiecare cu paginile și baremul ei. Creează primul proiect ca să începi."
        />
      ) : (
        <>
          <ProjectsToolbar
            scope={view.scope}
            onScopeChange={view.setScope}
            sort={view.sort}
            onSortChange={view.setSort}
            disciplines={view.disciplines}
            discipline={disciplina}
            onDisciplineChange={(next) => {
              void navigate({
                search: next === undefined ? {} : { disciplina: next },
              });
            }}
            archivedCount={view.archivedCount}
          />

          {view.visible.length === 0 ? (
            <EmptyState
              title="Niciun proiect aici"
              explanation="Filtrele de mai sus nu lasă nimic să treacă. Alege altă disciplină sau treci pe „Toate” — proiectele tale sunt toate încă acolo."
            />
          ) : (
            <ul className="grid gap-4 tablet:grid-cols-2">
              {view.visible.map((paper) => (
                <li key={paper.id}>
                  <PaperCard
                    paper={paper}
                    actions={
                      <ProjectMenu
                        paper={paper}
                        onArchive={(target) => void actions.archive(target)}
                        onRestore={(target) => void actions.restore(target)}
                        onDelete={setPendingDelete}
                      />
                    }
                  />
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      <DeleteDialog
        paper={pendingDelete}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
        onConfirm={(target) => {
          setPendingDelete(null);
          void actions.remove(target);
        }}
      />
    </div>
  );
}
