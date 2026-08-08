import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { Toaster } from "@ludicon/ui";

import { RouteErrorBoundary } from "../components/route-error-boundary";
import { RoutePending } from "../components/route-pending";
import { NotFound } from "../components/not-found";
import type { RouterContext } from "../lib/router-context";

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
  errorComponent: RouteErrorBoundary,
  pendingComponent: RoutePending,
  notFoundComponent: NotFound,
});

/**
 * Document-level shell only.
 *
 * Navigation chrome belongs to `_studio`, so that focused surfaces — intent
 * capture, the design studio, the editors — can render full-bleed without a
 * sidebar competing for width.
 */
function RootLayout() {
  return (
    <div className="min-h-full bg-background">
      <a href="#continut" className="skip-link">
        Sari la conținut
      </a>
      <Outlet />
      <Toaster />
    </div>
  );
}
