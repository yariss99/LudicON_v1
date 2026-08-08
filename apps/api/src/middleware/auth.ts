/**
 * Clerk session verification.
 *
 * Routes are authenticated by default: `requireAuth` is mounted on the whole
 * `/api` subtree in `app.ts`, and the operational endpoints are deliberately
 * mounted outside it. Adding a route cannot accidentally add an open route.
 */
import { verifyToken } from "@clerk/backend";
import { OrganizationId, TeacherId } from "@ludicon/domain";
import { createMiddleware } from "hono/factory";
import { z } from "zod";

import type { AppEnv, AuthContext } from "../context.js";
import type { Env } from "../env.js";
import { ForbiddenError, UnauthenticatedError } from "../lib/errors.js";

/** Exactly what `verifyToken` resolves with, without naming Clerk's internals. */
type SessionClaims = Awaited<ReturnType<typeof verifyToken>>;

export type ClerkAuthConfig = {
  secretKey: string;
  jwtKey: string | undefined;
  authorizedParties: string[];
};

export const clerkAuthConfigFromEnv = (env: Env): ClerkAuthConfig => ({
  secretKey: env.CLERK_SECRET_KEY,
  jwtKey: env.CLERK_JWT_KEY,
  authorizedParties: env.CLERK_AUTHORIZED_PARTIES,
});

const BEARER_PATTERN = /^Bearer\s+(.+)$/iu;

const extractBearerToken = (header: string | undefined): string | null => {
  if (header === undefined) {
    return null;
  }
  const match = BEARER_PATTERN.exec(header.trim());
  const token = match?.[1]?.trim();
  return token === undefined || token.length === 0 ? null : token;
};

/**
 * Clerk ships two session-token layouts: v1 exposes `org_id` at the top level,
 * v2 nests it under `o.id`. Reading both through a schema — rather than
 * narrowing Clerk's versioned union — means a third layout degrades to "no
 * active organization" instead of failing to compile or throwing.
 */
const OrganizationClaim = z.object({
  o: z.object({ id: z.string().min(1) }).optional(),
  org_id: z.string().min(1).optional(),
});

const readOrganizationId = (claims: SessionClaims): OrganizationId | null => {
  const parsed = OrganizationClaim.safeParse(claims);
  if (!parsed.success) {
    return null;
  }
  const raw = parsed.data.o?.id ?? parsed.data.org_id;
  if (raw === undefined) {
    return null;
  }
  const organizationId = OrganizationId.safeParse(raw);
  return organizationId.success ? organizationId.data : null;
};

/**
 * Verifies the bearer token and puts `{ userId, orgId }` on the context.
 *
 * `verifyToken` **rejects** on an unusable token — it does not resolve with an
 * error field to inspect. The try/catch below is therefore the entire guard: if
 * it were written as a returned-error check, every request would authenticate.
 */
export const createRequireAuth = (config: ClerkAuthConfig) =>
  createMiddleware<AppEnv>(async (c, next) => {
    const token = extractBearerToken(c.req.header("Authorization"));
    if (token === null) {
      throw new UnauthenticatedError("request carried no bearer token");
    }

    let claims: SessionClaims;
    try {
      claims = await verifyToken(token, {
        secretKey: config.secretKey,
        ...(config.jwtKey === undefined ? {} : { jwtKey: config.jwtKey }),
        // An empty list disables the check; Clerk treats `[]` as "no party is
        // authorized", which would reject every token.
        ...(config.authorizedParties.length === 0
          ? {}
          : { authorizedParties: config.authorizedParties }),
      });
    } catch (cause) {
      throw new UnauthenticatedError(
        "session token failed verification",
        cause,
      );
    }

    const userId = TeacherId.safeParse(claims.sub);
    if (!userId.success) {
      throw new UnauthenticatedError("session token carried no usable subject");
    }

    const auth: AuthContext = {
      userId: userId.data,
      orgId: readOrganizationId(claims),
      sessionId: typeof claims.sid === "string" ? claims.sid : "",
    };
    c.set("auth", auth);

    await next();
  });

/**
 * Ownership guard used by the service layer.
 *
 * Authorization is checked next to the row it protects, after the row has been
 * loaded — a route-level check cannot know who owns a record it has not read,
 * and a repository-level check would have to re-derive the rule per query.
 */
export const requireOwnership = (
  auth: AuthContext,
  resource: { kind: string; id: string; ownerId: string },
): void => {
  if (resource.ownerId !== auth.userId) {
    throw new ForbiddenError(resource.kind, resource.id, auth.userId);
  }
};
