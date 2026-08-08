import { useCallback, useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@ludicon/data-access";
import { nowTimestamp, type LessonPlan } from "@ludicon/domain";
import { toast } from "@ludicon/ui";

import { repositories } from "../../lib/data";
import { completionMap, designScore } from "./lesson-analysis";

/** CH12 fixes the autosave debounce at 600–800ms. */
const AUTOSAVE_DELAY_MS = 700;

export type SaveStatus = "rest" | "saving" | "saved";

export const SAVE_STATUS_LABEL: Readonly<Record<SaveStatus, string>> =
  Object.freeze({
    rest: "Salvat automat",
    saving: "Se salvează…",
    saved: "Salvat",
  });

export type LessonDesign = {
  /** The plan as it currently reads on screen. */
  plan: LessonPlan | null;
  isPending: boolean;
  isError: boolean;
  /** True once loading finished and there is genuinely nothing under this id. */
  isMissing: boolean;
  status: SaveStatus;
  /** Apply an immutable edit. Autosave follows on its own. */
  update: (edit: (current: LessonPlan) => LessonPlan) => void;
  /** Write immediately, bypassing the debounce. Rejects on failure. */
  saveNow: (plan: LessonPlan) => Promise<LessonPlan>;
};

/**
 * The lesson the teacher is editing, and the promise that it is safe.
 *
 * The plan is held locally while typing and written on a debounce, so no
 * keystroke waits on storage. CH07 is explicit that "work cannot be silently
 * lost", so the only failure path here is loud: a save that does not land
 * leaves the edit in place on screen and says so in words.
 */
export function useLessonDesign(lessonPlanId: string): LessonDesign {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.lessonPlans.detail(lessonPlanId),
    queryFn: () => repositories.lessonPlans.get(lessonPlanId),
  });

  const [plan, setPlan] = useState<LessonPlan | null>(null);
  const [loadedId, setLoadedId] = useState<string | null>(null);
  const [status, setStatus] = useState<SaveStatus>("rest");

  // Adopt the stored plan once per id, during render rather than in an effect —
  // an effect would paint one frame of an empty studio first.
  const loaded = query.data ?? null;
  if (loaded !== null && loadedId !== loaded.id) {
    setLoadedId(loaded.id);
    setPlan(loaded);
    setStatus("rest");
  }

  const persist = useCallback(
    async (next: LessonPlan): Promise<LessonPlan> => {
      // Completion and balance are derived, never typed by hand. Recomputing
      // them at the write boundary is what keeps every other surface honest.
      const enriched: LessonPlan = {
        ...next,
        completion: completionMap(next),
        score: designScore(next),
      };
      const saved = await repositories.lessonPlans.save(enriched);
      queryClient.setQueryData(
        queryKeys.lessonPlans.detail(lessonPlanId),
        saved,
      );
      return saved;
    },
    [lessonPlanId, queryClient],
  );

  useEffect(() => {
    if (status !== "saving" || plan === null) return;

    const timer = setTimeout(() => {
      persist(plan)
        .then(() => setStatus("saved"))
        .catch(() => {
          setStatus("rest");
          toast.error(
            "Nu am putut salva acum. Proiectul e păstrat — încearcă din nou.",
          );
        });
    }, AUTOSAVE_DELAY_MS);

    return () => clearTimeout(timer);
  }, [plan, status, persist]);

  const update = useCallback((edit: (current: LessonPlan) => LessonPlan) => {
    setPlan((current) =>
      current === null
        ? current
        : { ...edit(current), updatedAt: nowTimestamp() },
    );
    setStatus("saving");
  }, []);

  const saveNow = useCallback(
    async (next: LessonPlan) => {
      setStatus("saving");
      const saved = await persist(next);
      setPlan(saved);
      setStatus("saved");
      return saved;
    },
    [persist],
  );

  return {
    plan,
    isPending: query.isPending,
    isError: query.isError,
    isMissing: query.isSuccess && query.data === null,
    status,
    update,
    saveNow,
  };
}
