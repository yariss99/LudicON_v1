import { createFileRoute, Outlet } from "@tanstack/react-router";
import { SignUp } from "@clerk/clerk-react";

import { IdentityPage } from "../auth/identity-page";
import {
  DESK_PATH,
  SIGN_IN_PATH,
  SIGN_UP_PATH,
  parseIdentitySearch,
  safeInternalPath,
} from "../auth/session";

export const Route = createFileRoute("/sign-up")({
  validateSearch: parseIdentitySearch,
  component: SignUpRoute,
});

/**
 * Registration — the mirror of `/sign-in`, down to the splat sibling that
 * catches `/sign-up/verify-email-address` and the steps beside it.
 *
 * It honours the same preserved destination. Someone who followed a shared
 * link to a lesson, found they had no account, and registered on the spot
 * should arrive at that lesson — not at an empty desk with no idea what became
 * of the thing they clicked.
 */
function SignUpRoute() {
  const { redirect } = Route.useSearch();
  const destination = safeInternalPath(redirect);

  return (
    <IdentityPage
      title="Creează-ți contul"
      lead="Îți pregătim biroul de proiectare. Durează mai puțin de un minut."
    >
      <SignUp
        routing="path"
        path={SIGN_UP_PATH}
        signInUrl={SIGN_IN_PATH}
        forceRedirectUrl={destination}
        fallbackRedirectUrl={DESK_PATH}
      />
      <Outlet />
    </IdentityPage>
  );
}
