import { useCallback } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@ludicon/data-access";
import type { LessonPlan } from "@ludicon/domain";
import { z } from "zod";

import {
  CreateExperienceFlow,
  kindFromSeed,
  kindSeed,
  MaterialKind,
} from "../features/create-experience-flow";
import { teacherOnly } from "../auth/session";

/**
 * How the flow can be entered.
 *
 * `kind` deep-links straight to a material — `?kind=worksheet` is what the
 * create menu and the first step both write. `intent` is the teacher's own
 * words, carried in from the Desk. Both fall back to nothing rather than
 * refusing the page: a stale or hand-edited link should still open on the
 * first step instead of on a wall of text. Zod 4 goes straight to
 * `validateSearch` — no adapter.
 */
const CreateExperienceSearch = z.object({
  kind: MaterialKind.optional().catch(undefined),
  intent: z.string().max(2000).optional().catch(undefined),
});

export const Route = createFileRoute("/create/experience")({
  validateSearch: CreateExperienceSearch,
  // Full-bleed, so it sits outside `_studio` and outside its guard. The
  // creation chain still belongs to a signed-in teacher; see `auth/session.ts`.
  beforeLoad: teacherOnly,
  component: CreateExperiencePage,
});

/**
 * Intent capture — the teacher says what they want to teach.
 *
 * The route owns only the two things that are genuinely its own: what the URL
 * means, and where the flow lands. Everything the teacher sees and answers
 * lives in `features/create-experience-flow`.
 */
function CreateExperiencePage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // A quick action arrives carrying only its opening phrase, so the phrase
  // itself is what says which card was already chosen.
  const chosen = search.kind ?? kindFromSeed(search.intent);
  const kind = chosen ?? "lesson";

  const handleKindChange = useCallback(
    (next: MaterialKind) => {
      void navigate({
        to: "/create/experience",
        search: (previous) => ({ ...previous, kind: next }),
        // The choice is part of where the teacher is, not a place they should
        // have to walk back through one card at a time.
        replace: true,
      });
    },
    [navigate],
  );

  const handleCreated = useCallback(
    async (plan: LessonPlan) => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.projects.all(),
      });
      await navigate({
        to: "/design/$lessonPlanId",
        params: { lessonPlanId: plan.id },
      });
    },
    [navigate, queryClient],
  );

  return (
    <CreateExperienceFlow
      initialKind={kind}
      initialDescription={search.intent ?? kindSeed(kind)}
      kindWasChosen={chosen !== undefined}
      onKindChange={handleKindChange}
      onCreated={handleCreated}
    />
  );
}
