/**
 * The typed Hono environment shared by every route and middleware.
 *
 * Both variables are declared optional on purpose. Hono's `c.get` cannot know
 * whether the middleware that sets a variable actually ran on a given path, and
 * a non-optional declaration would let a route mounted outside `requireAuth`
 * read `undefined` while the compiler insisted it had an `AuthContext`. Optional
 * types force the question to be answered — `requireAuthContext` answers it by
 * failing closed.
 */
import type { OrganizationId, TeacherId } from "@ludicon/domain";
import type { Logger } from "pino";

import { UnauthenticatedError } from "./lib/errors.js";

export type AuthContext = {
  /** Clerk user id, which is also the `teachers.id` primary key. */
  userId: TeacherId;
  /** Active Clerk organization, when the teacher is acting inside a school. */
  orgId: OrganizationId | null;
  sessionId: string;
};

export type AppVariables = {
  auth?: AuthContext;
  logger?: Logger;
  /** Correlation id, minted by `createRequestLogger` and echoed to the client. */
  requestId?: string;
};

export type AppEnv = { Variables: AppVariables };

/**
 * Unwraps the authenticated context, or refuses the request.
 *
 * A route that reaches this without an `AuthContext` was mounted outside the
 * authentication middleware. Answering with `UNAUTHENTICATED` rather than
 * dereferencing `undefined` means that mistake fails closed.
 */
export const requireAuthContext = (
  auth: AuthContext | undefined,
): AuthContext => {
  if (auth === undefined) {
    throw new UnauthenticatedError(
      "route reached without an authenticated session",
    );
  }
  return auth;
};
