import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@ludicon/data-access";
import type { EvaluationProject } from "@ludicon/evaluation";
import { toast } from "@ludicon/ui";

import { repositories } from "../../../lib/data";
import { paperTitle } from "../-shared/paper-presentation";

export interface ProjectActions {
  archive: (paper: EvaluationProject) => Promise<void>;
  restore: (paper: EvaluationProject) => Promise<void>;
  remove: (paper: EvaluationProject) => Promise<void>;
}

/**
 * Archiving and deleting a paper.
 *
 * All three go through the repository rather than assembling the next record
 * here. That is the correction of two real faults in the version this replaces:
 *
 *  - archiving spread `{ ...current, archived: true }` instead of calling the
 *    model's transition, so `archivedAt` stayed `null` while `archived` was
 *    `true` — exactly the disagreement the transition exists to prevent, and
 *    invisible until something asks when a paper was put away;
 *  - deleting called the repository's shallow `remove` while a cascading
 *    delete sat unused beside it. There is now one delete per repository and it
 *    is the correct one, so the choice cannot be got wrong again.
 *
 * Invalidation is on `evaluationProjects.lists()` rather than this page's own
 * key: the rail's count, the notification feed, the desk and this list are four
 * readers of the same collection, and archiving something must not leave three
 * of them insisting it is still there. Details are deliberately outside that
 * prefix — the open paper's cache entry is autosave's business.
 */
export function useProjectActions(): ProjectActions {
  const queryClient = useQueryClient();

  const refresh = useCallback(
    () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.evaluationProjects.lists(),
      }),
    [queryClient],
  );

  const restore = useCallback(
    async (paper: EvaluationProject) => {
      try {
        await repositories.evaluationProjects.restore(paper.id);
        await refresh();
      } catch {
        toast.warning(
          "Nu am putut scoate proiectul din arhivă. Încearcă din nou.",
        );
      }
    },
    [refresh],
  );

  const archive = useCallback(
    async (paper: EvaluationProject) => {
      try {
        await repositories.evaluationProjects.archive(paper.id);
        await refresh();

        toast.success(`„${paperTitle(paper)}” a fost mutat în arhivă.`, {
          action: {
            label: "Anulează",
            onClick: () => {
              void restore(paper);
            },
          },
        });
      } catch {
        toast.warning("Nu am putut arhiva proiectul. Încearcă din nou.");
      }
    },
    [refresh, restore],
  );

  const remove = useCallback(
    async (paper: EvaluationProject) => {
      try {
        await repositories.evaluationProjects.remove(paper.id);
        await refresh();
        // The detail entry is dropped by hand. Nothing else would: it lives
        // outside `lists()`, and a teacher who reopens the old address would
        // otherwise be handed the deleted paper out of the cache.
        queryClient.removeQueries({
          queryKey: queryKeys.evaluationProjects.detail(paper.id),
        });
        toast.success(`„${paperTitle(paper)}” a fost șters definitiv.`);
      } catch {
        toast.warning("Nu am putut șterge proiectul. Încearcă din nou.");
      }
    },
    [queryClient, refresh],
  );

  return { archive, restore, remove };
}
