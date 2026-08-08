import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DISCIPLINE_LABEL, type Discipline } from "@ludicon/domain";
import type { EvaluationProject } from "@ludicon/evaluation";

import { evaluationProjectQueries } from "../../../lib/evaluation-queries";
import { paperTitle } from "../-shared/paper-presentation";

export const SCOPES = ["active", "arhivate", "toate"] as const;
export type Scope = (typeof SCOPES)[number];

export const SCOPE_LABEL: Readonly<Record<Scope, string>> = Object.freeze({
  active: "Active",
  arhivate: "Arhivate",
  toate: "Toate",
});

/**
 * Two orderings, where there were three.
 *
 * "După etapă" is gone with the entity it sorted. It ranked projects by the
 * lesson-planning phase — discovery, design, approved, published — and a paper
 * has no phases: it is written, and then it is printed. A sort whose comparator
 * would have to invent a rank is not a sort a teacher can predict.
 */
export const SORTS = ["recente", "alfabetic"] as const;
export type Sort = (typeof SORTS)[number];

export const SORT_LABEL: Readonly<Record<Sort, string>> = Object.freeze({
  recente: "Modificate recent",
  alfabetic: "După titlu",
});

export interface ProjectsView {
  isPending: boolean;
  isError: boolean;
  /** True when the teacher has no papers at all, archived ones included. */
  isEmpty: boolean;
  /** Rows after scope, discipline and sort have been applied. */
  visible: readonly EvaluationProject[];
  /** Every discipline present in the collection, for the filter. */
  disciplines: readonly Discipline[];
  scope: Scope;
  setScope: (scope: Scope) => void;
  sort: Sort;
  setSort: (sort: Sort) => void;
  archivedCount: number;
}

/**
 * The papers list, and the three questions asked of it.
 *
 * The query deliberately reads the whole collection rather than the active one:
 * the archive has to be reachable, and a second query keyed on the scope would
 * refetch and flash the grid every time the teacher flipped a filter that only
 * ever hides rows already in memory.
 *
 * Its key is `list({ scope: "all" })` so it does not collide with the active
 * entry the rail, the desk and the notification feed share — same collection,
 * different question. Both sit under `evaluationProjects.lists()`, which is what
 * every write invalidates, so the two cannot disagree about what exists.
 *
 * Filtering by discipline happens HERE rather than in the query. `meta.discipline`
 * is nested, and `ListQuery.where` matches top-level fields only; pushing it down
 * would mean either flattening the model to suit a query language or a `where`
 * that silently matches nothing. Filtering rows already in memory is also what
 * keeps the archive count honest while a filter is applied.
 */
export function useProjectsView(discipline: Discipline | undefined) {
  const [scope, setScope] = useState<Scope>("active");
  const [sort, setSort] = useState<Sort>("recente");

  const query = useQuery(evaluationProjectQueries.all());

  const papers = useMemo(() => query.data ?? [], [query.data]);

  const disciplines = useMemo(
    () =>
      [
        ...new Set(
          papers
            .map((paper) => paper.meta.discipline)
            .filter((one): one is Discipline => one !== null),
        ),
      ].sort((a, b) =>
        DISCIPLINE_LABEL[a].localeCompare(DISCIPLINE_LABEL[b], "ro-RO"),
      ),
    [papers],
  );

  const visible = useMemo(() => {
    const rows = papers.filter((paper) => {
      if (scope === "active" && paper.archived) return false;
      if (scope === "arhivate" && !paper.archived) return false;
      if (discipline !== undefined && paper.meta.discipline !== discipline) {
        return false;
      }
      return true;
    });

    return [...rows].sort(comparator(sort));
  }, [papers, scope, sort, discipline]);

  return {
    isPending: query.isPending,
    isError: query.isError,
    isEmpty: !query.isPending && papers.length === 0,
    visible,
    disciplines,
    scope,
    setScope,
    sort,
    setSort,
    archivedCount: papers.filter((paper) => paper.archived).length,
  } satisfies ProjectsView;
}

/**
 * Alphabetic sorts by what is ON SCREEN, not by `meta.title`.
 *
 * An untitled paper stores an empty string and renders as "Proiect fără nume".
 * Sorting the raw field would file every untitled paper first, under a name the
 * teacher never sees — a list whose order contradicts its own labels.
 */
function comparator(
  sort: Sort,
): (a: EvaluationProject, b: EvaluationProject) => number {
  if (sort === "alfabetic") {
    return (a, b) => paperTitle(a).localeCompare(paperTitle(b), "ro-RO");
  }
  return (a, b) => b.updatedAt.localeCompare(a.updatedAt);
}
