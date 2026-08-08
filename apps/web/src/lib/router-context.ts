import type { QueryClient } from "@tanstack/react-query";
import type { TeacherSession } from "../auth/session";

/**
 * Everything a route may read in `beforeLoad` and `loader`.
 *
 * Declared here rather than in `router.tsx` so that `__root.tsx` can import
 * the same type without a cycle — `router.tsx` imports the generated route
 * tree, which imports `__root.tsx`.
 */
export type RouterContext = {
  queryClient: QueryClient;
  /**
   * Resolved before the router mounts, then kept current by the auth gate.
   * Never undecided: see `auth/session.ts`.
   */
  session: TeacherSession;
};
