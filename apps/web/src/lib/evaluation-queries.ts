import { queryOptions } from "@tanstack/react-query";
import { queryKeys } from "@ludicon/data-access";
import type {
  EvaluationProject,
  EvaluationProjectId,
} from "@ludicon/evaluation";

import { repositories } from "./data";

/**
 * The app's `queryOptions()` layer, and the pattern the rest should move to.
 *
 * Every other query in this app is an inline `useQuery({ queryKey, queryFn })`
 * written at the component that needs it. That works until a second component
 * wants the same data: the key is retyped, the fetcher is retyped, and the two
 * drift — one passes a filter, the other does not, and they quietly occupy
 * different cache entries for what a teacher thinks is one list. Binding the
 * key to its fetcher once removes the chance to disagree.
 *
 * It also makes the route loader and the component read the same thing.
 * `queryOptions` returns a value both `queryClient.ensureQueryData` and
 * `useQuery` accept, and TanStack tags the key with the result type, so
 * `setQueryData(evaluationProjectQueries.detail(id).queryKey, x)` is checked
 * rather than trusted — which is what autosave relies on to refresh the cache
 * without a round trip.
 *
 * The fetchers are the repository, unwrapped. Nothing here knows whether the
 * paper came from localStorage or the API; that is `lib/data.ts`'s single
 * decision and this file must not learn about it.
 *
 * Two lists rather than one parameterised list. The previous shape took a
 * `filters` argument, carried it into the key, and did not pass it to the
 * repository — a parameter that changes which cache entry you land in and
 * nothing about what arrives there is worse than no parameter at all, because
 * it looks like it works. These two are the two questions the studio actually
 * asks, and each is bound to the repository call that answers it.
 */
export const evaluationProjectQueries = {
  /**
   * The papers still in play.
   *
   * What the rail, the desk and the notification feed want: putting something
   * away should remove it from all three at once, and it does, because they
   * share this one entry.
   */
  active: () =>
    queryOptions({
      queryKey: queryKeys.evaluationProjects.list(),
      queryFn: (): Promise<EvaluationProject[]> =>
        repositories.evaluationProjects.listActive(),
    }),

  /**
   * Everything, archive included.
   *
   * Only the list page asks this, and it asks it once: the archive has to be
   * reachable, and a second query keyed on the scope would refetch and flash
   * the grid every time the teacher flipped a filter that only hides rows
   * already in memory.
   */
  all: () =>
    queryOptions({
      queryKey: queryKeys.evaluationProjects.list({ scope: "all" }),
      queryFn: (): Promise<EvaluationProject[]> =>
        repositories.evaluationProjects.listAll(),
    }),

  /**
   * One paper.
   *
   * Resolves `null` for an id that is not there rather than throwing: a stale
   * link is an ordinary thing to click, and the builder answers it with "nu
   * găsim proiectul" instead of an error boundary.
   */
  detail: (evaluationProjectId: EvaluationProjectId) =>
    queryOptions({
      queryKey: queryKeys.evaluationProjects.detail(evaluationProjectId),
      queryFn: (): Promise<EvaluationProject | null> =>
        repositories.evaluationProjects.get(evaluationProjectId),
    }),
} as const;
