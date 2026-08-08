import { redirect } from "@tanstack/react-router";
import { z } from "zod";

/**
 * Where the identity surfaces live.
 *
 * These are both what Clerk is told — `signInUrl`, `signUpUrl` — and what the
 * router navigates to, so anything linking here writes one plain path.
 *
 * Each is a pair of routes rather than one. Clerk's path routing walks into
 * sub-paths of its own making — `/sign-in/factor-one`, `/sign-in/sso-callback`,
 * `/sign-up/verify-email-address` — and a lone flat route 404s on every step
 * after the first. The flat route holds the page; a sibling splat route exists
 * only to keep those sub-paths matching, and renders nothing itself.
 */
export const SIGN_IN_PATH = "/sign-in";
export const SIGN_UP_PATH = "/sign-up";

/** The teacher's desk. `/` today, and the guard's default destination. */
export const DESK_PATH = "/";

/**
 * The public page: what someone sees before there is an account.
 *
 * It is `/landing` rather than `/` because the desk already claims the root.
 * Signing out lands here, and so does an unauthenticated visitor who simply
 * arrived at the front door rather than at a particular protected page.
 */
export const PUBLIC_PATH = "/landing";

/**
 * What the router is allowed to know about the teacher at guard time.
 *
 * Three states, not two. `disabled` is the cloned-repo-without-a-key case and
 * is genuinely different from "signed out": it means the question was never
 * asked, so no guard may act on it. Collapsing the two into a boolean is how
 * an app that should degrade gracefully instead bounces every visitor to a
 * sign-in page that cannot possibly work.
 *
 * There is deliberately no "loading" member. The router is not mounted until
 * Clerk has settled (see `auth/clerk-gate.tsx`), so a guard can never read an
 * undecided session and can never eject a teacher who is in fact signed in.
 * Making that state unrepresentable here is what keeps the race fixed rather
 * than merely papered over.
 */
export type TeacherSession =
  | { readonly status: "disabled" }
  | { readonly status: "signed-in" }
  | { readonly status: "signed-out" };

/** The session used when no publishable key is configured. */
export const UNGUARDED_SESSION: TeacherSession = { status: "disabled" };

const identitySearchSchema = z.object({
  redirect: z.string().optional(),
});

export type IdentitySearch = z.infer<typeof identitySearchSchema>;

/**
 * Search parsing for both identity routes.
 *
 * Falls back to an empty object instead of throwing: a malformed `?redirect=`
 * is a reason to ignore the parameter, never a reason to show a teacher a
 * broken page where a sign-in form should be.
 */
export function parseIdentitySearch(
  search: Record<string, unknown>,
): IdentitySearch {
  const parsed = identitySearchSchema.safeParse(search);
  return parsed.success ? parsed.data : {};
}

/**
 * Rejects anything that is not a plain, same-origin path.
 *
 * The intended destination arrives as a search parameter, which makes it
 * attacker-supplied. Handing it to Clerk as `forceRedirectUrl` unchecked would
 * turn the sign-in page into an open redirect: `?redirect=//evil.example` is a
 * protocol-relative URL that every browser resolves off-site.
 *
 * Pointing back at the identity pages themselves is refused too — that is the
 * loop where signing in successfully returns you to the sign-in form.
 */
export function safeInternalPath(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  if (!raw.startsWith("/")) return undefined;
  // Browsers read both `//host` and `/\host` as protocol-relative.
  if (raw.startsWith("//") || raw.startsWith("/\\")) return undefined;
  if (raw.startsWith(SIGN_IN_PATH) || raw.startsWith(SIGN_UP_PATH)) {
    return undefined;
  }
  return raw;
}

/**
 * The guard, as a plain function the protected routes call from `beforeLoad`.
 *
 * It lives in the router rather than behind a `<SignedOut>` wrapper on
 * purpose: `beforeLoad` runs before the route's component is ever created, so
 * a signed-out visitor never gets one frame of the studio painted before being
 * moved on. A component-level guard renders the protected page first and
 * corrects itself afterwards, which is both a flash and a leak.
 *
 * Two destinations, because two different things have happened. Someone who
 * asked for `/projects` was interrupted mid-errand and should be returned to
 * it once they are known — so they get the sign-in page carrying that
 * destination. Someone who merely arrived at the front door has not been
 * interrupted at all and should meet the public page, not a login form.
 *
 * Throwing is TanStack Router's contract for redirects, not an error path.
 */
export function requireTeacher(session: TeacherSession, href: string): void {
  if (session.status !== "signed-out") return;

  const destination = safeInternalPath(href);

  if (!destination || destination === DESK_PATH) {
    throw redirect({ to: PUBLIC_PATH, replace: true });
  }

  throw redirect({
    to: SIGN_IN_PATH,
    search: { redirect: destination },
    replace: true,
  });
}

/**
 * The guard as a route option: `beforeLoad: teacherOnly`.
 *
 * Typed against only the two fields it reads rather than the full option bag,
 * so one function serves every protected route regardless of that route's
 * params, search or loader types — TanStack passes something wider, which is
 * assignable, and no route has to restate the shape.
 */
export function teacherOnly({
  context,
  location,
}: {
  context: { session: TeacherSession };
  location: { href: string };
}): void {
  requireTeacher(context.session, location.href);
}
