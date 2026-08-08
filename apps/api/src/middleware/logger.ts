/**
 * Request correlation and structured logging.
 *
 * One line per request, keyed by a request id that is also returned to the
 * client on failures — a teacher's screenshot is then enough to find the exact
 * log entry. Authorization material is redacted by pino itself rather than by
 * remembering not to log it.
 *
 * The id is minted here rather than by `hono/request-id` so that `requestId`
 * lives in this app's own `Variables` type. That keeps every consumer — the
 * error handler in particular — honest about the id possibly being absent,
 * instead of depending on a global module augmentation having been loaded.
 */
import { createMiddleware } from "hono/factory";
import pino, { type Logger } from "pino";

import type { AppEnv } from "../context.js";
import type { Env } from "../env.js";

export const REQUEST_ID_HEADER = "X-Request-Id";

/** Guards against an upstream proxy injecting an unbounded header value. */
const MAX_INBOUND_REQUEST_ID = 128;

/**
 * Paths whose values never reach a log sink. Wildcards cover nested request and
 * response objects that a future handler might log wholesale.
 */
const REDACTED_PATHS = [
  "req.headers.authorization",
  "req.headers.cookie",
  "request.headers.authorization",
  "request.headers.cookie",
  "headers.authorization",
  "headers.cookie",
  "*.authorization",
  "*.cookie",
  "token",
  "accessToken",
  "sessionToken",
  "password",
  "secret",
  "apiKey",
] as const;

export const createRootLogger = (env: Env): Logger =>
  pino({
    level: env.LOG_LEVEL,
    redact: { paths: [...REDACTED_PATHS], censor: "[redacted]" },
    base: { service: "ludicon-api", env: env.NODE_ENV },
    // Pretty printing is a terminal affordance. Production emits NDJSON so a
    // log pipeline can index it.
    ...(env.LOG_PRETTY
      ? {
          transport: {
            target: "pino-pretty",
            options: { colorize: true, singleLine: true },
          },
        }
      : {}),
  });

const inboundRequestId = (header: string | undefined): string | null => {
  if (header === undefined) {
    return null;
  }
  const trimmed = header.trim();
  return trimmed.length > 0 && trimmed.length <= MAX_INBOUND_REQUEST_ID
    ? trimmed
    : null;
};

/**
 * Attaches a request id and a request-scoped child logger, then records the
 * outcome. Mounted first, so everything downstream — including `onError` — can
 * correlate.
 */
export const createRequestLogger = (root: Logger) =>
  createMiddleware<AppEnv>(async (c, next) => {
    const requestId =
      inboundRequestId(c.req.header(REQUEST_ID_HEADER)) ?? crypto.randomUUID();
    c.set("requestId", requestId);
    c.header(REQUEST_ID_HEADER, requestId);

    const log = root.child({
      requestId,
      method: c.req.method,
      path: c.req.path,
    });
    c.set("logger", log);

    const startedAt = performance.now();
    await next();
    const durationMs = Math.round(performance.now() - startedAt);
    const status = c.res.status;

    // 4xx is the API working correctly — a refused request, not an incident.
    if (status >= 500) {
      log.error({ status, durationMs }, "request failed");
    } else if (status >= 400) {
      log.warn({ status, durationMs }, "request refused");
    } else {
      log.info({ status, durationMs }, "request completed");
    }
  });
