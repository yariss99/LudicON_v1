import { createRouter } from "@tanstack/react-router";
import type { QueryClient } from "@tanstack/react-query";
import { routeTree } from "./routeTree.gen";
import { RouteErrorBoundary } from "./components/route-error-boundary";
import { RoutePending } from "./components/route-pending";
import { NotFound } from "./components/not-found";
import { UNGUARDED_SESSION } from "./auth/session";
import type { RouterContext } from "./lib/router-context";

export type { RouterContext };

export function createAppRouter(queryClient: QueryClient) {
  return createRouter({
    routeTree,
    /**
     * `session` starts unguarded and is replaced by the auth gate before the
     * router is ever mounted (see `auth/clerk-gate.tsx`). When no publishable
     * key is configured there is no gate, this value stands, and every guard
     * becomes a no-op — which is exactly how the app stays usable for someone
     * who cloned the repo without one.
     */
    context: { queryClient, session: UNGUARDED_SESSION },
    // Prefetch on hover/focus. For an authoring tool where navigation is
    // deliberate, this makes transitions feel instant at negligible cost.
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
    scrollRestoration: true,
    defaultErrorComponent: RouteErrorBoundary,
    defaultPendingComponent: RoutePending,
    defaultNotFoundComponent: NotFound,
  });
}

export type AppRouter = ReturnType<typeof createAppRouter>;

declare module "@tanstack/react-router" {
  interface Register {
    router: AppRouter;
  }
}
