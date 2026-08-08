import { createFileRoute, Outlet } from "@tanstack/react-router";
import { SignIn } from "@clerk/clerk-react";

import { IdentityPage } from "../auth/identity-page";
import {
  DESK_PATH,
  SIGN_IN_PATH,
  SIGN_UP_PATH,
  parseIdentitySearch,
  safeInternalPath,
} from "../auth/session";

export const Route = createFileRoute("/sign-in")({
  validateSearch: parseIdentitySearch,
  component: SignInRoute,
});

/**
 * The sign-in page — a page, not a modal.
 *
 * `routing="path"` with `path` is what lets Clerk own its own sub-paths, so a
 * second factor or a password reset gets a real URL that survives a reload.
 * Those sub-paths are matched by the sibling splat route, which renders
 * nothing: this component stays mounted across every step, and Clerk reads the
 * URL itself.
 *
 * The redirect props are the pair this version of Clerk actually reads, and
 * they do different jobs. `forceRedirectUrl` takes precedence over everything
 * else, so it carries the destination the guard preserved — the teacher asked
 * for `/projects`, was interrupted, and is returned there rather than dropped
 * at the desk. `fallbackRedirectUrl` applies only when nothing asked, which is
 * the case for someone who came here directly.
 *
 * The `signUp*` variants matter because Clerk lets a visitor switch to
 * registration without leaving the flow; without them, creating an account
 * mid-errand would forget where the errand was going.
 */
function SignInRoute() {
  const { redirect } = Route.useSearch();
  const destination = safeInternalPath(redirect);

  return (
    <IdentityPage
      title="Intră în cont"
      lead="Continuă de unde ai rămas, cu lecțiile și materialele tale."
    >
      <SignIn
        routing="path"
        path={SIGN_IN_PATH}
        signUpUrl={SIGN_UP_PATH}
        forceRedirectUrl={destination}
        fallbackRedirectUrl={DESK_PATH}
        signUpForceRedirectUrl={destination}
        signUpFallbackRedirectUrl={DESK_PATH}
      />
      <Outlet />
    </IdentityPage>
  );
}
