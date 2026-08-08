import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@ludicon/data-access";

import { teacherOnly } from "../auth/session";
import { CreateScreen } from "../features/evaluation/create/create-screen";
import { evaluationProjectQueries } from "../lib/evaluation-queries";

/**
 * Where a paper begins.
 *
 * Full-bleed: a direct child of `routes/`, so it sits outside `_studio` and its
 * navigation rail. Someone answering five questions about the evaluation they
 * are about to write does not need six destinations competing for the same
 * screen, and the next step — the builder — is full-bleed for the same reason.
 *
 * Being outside `_studio` means being outside its guard, so the guard is
 * repeated here. `teacherOnly` is a no-op unless the session is definitively
 * signed out, which it cannot be while Clerk is still resolving and never is
 * when no publishable key is configured.
 */
export const Route = createFileRoute("/create")({
  beforeLoad: teacherOnly,
  component: CreatePage,
});

function CreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return (
    <CreateScreen
      onCreated={(paper) => {
        /**
         * Seed the cache before navigating.
         *
         * The builder's first render then has the document it just wrote,
         * rather than a loading state over a read of the record this tab
         * created a moment ago. The lists are invalidated rather than seeded —
         * their order depends on `updatedAt` across every paper, which only the
         * repository knows.
         *
         * `lists()`, not `list()`. The projects page reads a second entry — the
         * one that includes the archive — and the narrower key is not its
         * prefix, so a paper created here did not appear there until something
         * else happened to invalidate. That is the whole path this route exists
         * to complete.
         */
        queryClient.setQueryData(
          evaluationProjectQueries.detail(paper.id).queryKey,
          paper,
        );
        void queryClient.invalidateQueries({
          queryKey: queryKeys.evaluationProjects.lists(),
        });

        void navigate({
          to: "/projects/$projectId",
          params: { projectId: paper.id },
          replace: true,
        });
      }}
    />
  );
}
