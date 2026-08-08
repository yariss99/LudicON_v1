import { createFileRoute } from "@tanstack/react-router";

/**
 * Every step Clerk walks to after `/sign-up` — `verify-email-address`,
 * `continue`, `sso-callback`. Renders nothing; see `sign-in.$.tsx` for why.
 */
export const Route = createFileRoute("/sign-up/$")({
  component: () => null,
});
