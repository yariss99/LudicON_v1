import { useCallback, useEffect, useMemo, useState } from "react";
import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import { roRO } from "@clerk/localizations";
import { RouterProvider } from "@tanstack/react-router";
import { useTheme } from "@ludicon/ui";

import { env } from "../lib/env";
import type { AppRouter } from "../router";
import { RoutePending } from "../components/route-pending";
import { clerkAppearance } from "./clerk-appearance";
import {
  DESK_PATH,
  PUBLIC_PATH,
  SIGN_IN_PATH,
  SIGN_UP_PATH,
  type TeacherSession,
} from "./session";

export interface ClerkGateProps {
  router: AppRouter;
}

/**
 * The authenticated half of the application root.
 *
 * Isolated in its own module because everything below it requires a live
 * `ClerkProvider`, and `ClerkProvider` throws on a missing publishable key.
 * `main.tsx` decides once, from a module constant, whether this branch exists
 * at all — so a contributor who clones the repo without a key still gets a
 * working app rather than a blank screen.
 *
 * The redirect props are the ones this version of @clerk/clerk-react actually
 * reads. `signInUrl` / `signUpUrl` tell Clerk where its own pages are mounted,
 * which is what makes `<SignInButton>` navigate here instead of to Clerk's
 * hosted Account Portal. The `*FallbackRedirectUrl` pair is the "if nothing
 * else asked for a destination" default; the per-page `forceRedirectUrl` on
 * the sign-in route overrides it when a teacher was headed somewhere specific.
 */
export function ClerkGate({ router }: ClerkGateProps) {
  const { resolved } = useTheme();

  /**
   * Clerk is handed the new theme one commit late, on purpose.
   *
   * The `variables` are `var(--token)` references, and Clerk resolves them to
   * literal colours when it parses the appearance rather than passing them
   * through for the browser to keep live. So it matters *when* it parses:
   * `ThemeProvider` writes `data-theme` onto `<html>` from an effect, and
   * React flushes a child's effects before its parent's — meaning Clerk, which
   * sits below the provider, would otherwise re-read the token layer while it
   * still held the outgoing theme's values and bake those in.
   *
   * Bouncing `resolved` through state defers the new appearance to the next
   * commit, by which point the attribute is set and the tokens report the
   * theme the teacher actually chose. Costs one render per theme change.
   */
  const [themeForClerk, setThemeForClerk] = useState(resolved);
  useEffect(() => {
    setThemeForClerk(resolved);
  }, [resolved]);

  const appearance = useMemo(
    () => clerkAppearance(themeForClerk),
    [themeForClerk],
  );

  // Clerk navigates on its own — between sign-in steps, after a successful
  // sign-in, on sign-out. Without these it reaches for `window.location` and
  // every one of those becomes a full document reload, throwing away the
  // router, the query cache and the theme in the process.
  const routerPush = useCallback(
    (to: string) => router.navigate({ href: to }),
    [router],
  );
  const routerReplace = useCallback(
    (to: string) => router.navigate({ href: to, replace: true }),
    [router],
  );

  return (
    <ClerkProvider
      publishableKey={env.VITE_CLERK_PUBLISHABLE_KEY}
      appearance={appearance}
      // The sign-in page is almost entirely Clerk's own strings. Without this
      // the one screen every teacher meets first is in English, in a product
      // that is Romanian everywhere else.
      localization={roRO}
      routerPush={routerPush}
      routerReplace={routerReplace}
      signInUrl={SIGN_IN_PATH}
      signUpUrl={SIGN_UP_PATH}
      signInFallbackRedirectUrl={DESK_PATH}
      signUpFallbackRedirectUrl={DESK_PATH}
      afterSignOutUrl={PUBLIC_PATH}
    >
      <RouterWithSession router={router} />
    </ClerkProvider>
  );
}

/**
 * Where the async-load race is actually settled.
 *
 * Clerk resolves its session over the network, so for the first moments after
 * a reload `isSignedIn` is `undefined` — not `false`, but indistinguishable
 * from it to anything that only asks "is this truthy". A guard that runs in
 * that window throws an already-authenticated teacher out to the sign-in page
 * on every single refresh of a protected route.
 *
 * Reading `isLoaded` before `isSignedIn` is necessary but on its own is not
 * enough, because `beforeLoad` does not re-ask a component's question. So the
 * router is not mounted at all until Clerk has settled: no route match is
 * attempted, no guard runs, and there is no undecided state for one to read.
 * That is why `TeacherSession` has no "loading" member — it cannot happen.
 *
 * The cost is one skeleton frame on first paint, which is the same frame the
 * router would have shown anyway while it resolved the route.
 */
function RouterWithSession({ router }: ClerkGateProps) {
  const { isLoaded, isSignedIn } = useAuth();

  const session = useMemo<TeacherSession>(
    () => ({ status: isSignedIn ? "signed-in" : "signed-out" }),
    [isSignedIn],
  );

  if (!isLoaded) return <RoutePending />;

  return <RouterProvider router={router} context={{ session }} />;
}
