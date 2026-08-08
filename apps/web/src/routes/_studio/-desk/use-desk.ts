import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Discipline } from "@ludicon/domain";
import type { EvaluationProject } from "@ludicon/evaluation";

import { evaluationProjectQueries } from "../../../lib/evaluation-queries";

/** Enough to fill a row without turning the desk into a list page. */
const CONTINUE_LIMIT = 3;
const SHELF_LIMIT = 6;

export type Shelf = {
  discipline: Discipline;
  papers: number;
};

export interface Desk {
  isPending: boolean;
  isError: boolean;
  isEmpty: boolean;
  continueWith: readonly EvaluationProject[];
  shelves: readonly Shelf[];
}

/**
 * Everything the desk knows, read once.
 *
 * One query, sharing the exact `queryOptions` the rail and the notification feed
 * use, so a count here and a count there are literally the same array rather
 * than two reads racing each other.
 *
 * The desk lost three of its five sections in the rewrite, and the reason is the
 * same for all three: they were reading collections nothing writes.
 *
 *  - "Ce îți propun" derived every suggestion from `Project.state` — the
 *    lesson-planning loop's phases. A paper has no phases, so every rule would
 *    have had to invent a condition, and a suggestion the product made up is
 *    worse than no suggestion at all.
 *  - "Cum a mers la clasă?" rendered for the most recently PUBLISHED project.
 *    Nothing can be published any more; the strip could only ever render
 *    nothing.
 *  - "Lecții proiectate recent" and the knowledge strip both read `resources`,
 *    which no code path in this app has ever written. They were two empty states
 *    apologising for a collection that has no producer.
 *
 * What survives is what the data can actually answer: what you were working on,
 * and which subjects you have been working in.
 */
export function useDesk(): Desk {
  const query = useQuery(evaluationProjectQueries.active());

  const papers = useMemo(() => query.data ?? [], [query.data]);
  const shelves = useMemo(() => buildShelves(papers), [papers]);

  return {
    isPending: query.isPending,
    isError: query.isError,
    isEmpty: !query.isPending && papers.length === 0,
    continueWith: papers.slice(0, CONTINUE_LIMIT),
    shelves,
  };
}

/**
 * Disciplines the teacher actually writes for, busiest first.
 *
 * Keyed on the `Discipline` enum rather than on a typed-in subject string. The
 * previous version grouped by `project.subject`, free text on both sides, so
 * "Matematica" and "Matematică" were two shelves for one subject and the link
 * into the filtered list matched neither reliably.
 *
 * Papers with no discipline chosen yet are not a shelf. They are the normal
 * state of a paper five minutes old, and a shelf called "Fără disciplină" is a
 * filing cabinet drawer for things that have not been filed.
 */
function buildShelves(papers: readonly EvaluationProject[]): Shelf[] {
  const counts = new Map<Discipline, number>();

  for (const paper of papers) {
    const { discipline } = paper.meta;
    if (discipline === null) continue;
    counts.set(discipline, (counts.get(discipline) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([discipline, papersCount]) => ({
      discipline,
      papers: papersCount,
    }))
    .sort((a, b) => b.papers - a.papers)
    .slice(0, SHELF_LIMIT);
}
