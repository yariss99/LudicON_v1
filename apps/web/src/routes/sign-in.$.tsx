import { createFileRoute } from "@tanstack/react-router";

/**
 * Every step Clerk walks to after `/sign-in`.
 *
 * `/sign-in/factor-one`, `/sign-in/reset-password`, `/sign-in/sso-callback` —
 * Clerk invents these itself once `routing="path"` is set, and without a route
 * that matches them the second screen of a sign-in would be a 404.
 *
 * It renders nothing on purpose. The parent route holds the mounted `<SignIn>`
 * and stays mounted across all of them; a component here would either paint a
 * second copy or fight the first for the same DOM.
 */
export const Route = createFileRoute("/sign-in/$")({
  component: () => null,
});
