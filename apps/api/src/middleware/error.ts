/**
 * The single place a failure becomes a response.
 *
 * Two rules govern this file:
 *
 *   1. The client learns a code, a calm Romanian sentence and a request id.
 *      Never a stack trace, never a SQL string, never a driver message.
 *   2. The server learns everything, keyed by that same request id.
 *
 * Anything that is not an `AppError` is treated as a bug: logged at `error`
 * with its full cause chain, reported as `INTERNAL`.
 */
import type {
  ApiError,
  ApiErrorStatus,
  ApiFailure,
  ErrorCode,
} from "@ludicon/contracts";
import { apiError } from "@ludicon/contracts";
import type { ErrorHandler, NotFoundHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import type { Logger } from "pino";
import { z } from "zod";

import type { AppEnv } from "../context.js";
import { isAppError } from "../lib/errors.js";
import { zodFieldPaths } from "../lib/validate.js";

/** The only statuses this API emits for failures. */
const API_ERROR_STATUSES = [400, 401, 403, 404, 409, 422, 429, 500] as const;

/**
 * Narrows an arbitrary status onto the contract's vocabulary without a cast.
 * A status the contract does not know collapses to the nearest honest one.
 */
const toApiErrorStatus = (status: number): ApiErrorStatus =>
  API_ERROR_STATUSES.find((candidate) => candidate === status) ??
  (status >= 500 ? 500 : 400);

/** Hono's own statuses, mapped onto the contract's codes. */
const codeForHttpStatus = (status: number): ErrorCode => {
  switch (status) {
    case 400:
    case 422:
      return "VALIDATION_FAILED";
    case 401:
      return "UNAUTHENTICATED";
    case 403:
      return "FORBIDDEN";
    case 404:
      return "NOT_FOUND";
    case 409:
      return "CONFLICT";
    case 429:
      return "RATE_LIMITED";
    default:
      return status < 500 ? "VALIDATION_FAILED" : "INTERNAL";
  }
};

type Reported = {
  status: ApiErrorStatus;
  body: ApiError;
  /** Server-side only. Never serialised. */
  logContext: Record<string, unknown>;
  severe: boolean;
};

const describe = (error: unknown, requestId: string): Reported => {
  if (isAppError(error)) {
    return {
      status: error.status,
      body: apiError(error.code, {
        ...(error.details === undefined ? {} : { details: error.details }),
        requestId,
      }),
      logContext: {
        ...error.context,
        technicalMessage: error.message,
        name: error.name,
      },
      // A refused request is not an incident; only INTERNAL is.
      severe: error.code === "INTERNAL",
    };
  }

  if (error instanceof HTTPException) {
    return {
      status: toApiErrorStatus(error.status),
      body: apiError(codeForHttpStatus(error.status), { requestId }),
      logContext: { technicalMessage: error.message, httpStatus: error.status },
      severe: error.status >= 500,
    };
  }

  if (error instanceof z.core.$ZodError) {
    return {
      status: 422,
      // Only the field paths cross the wire; Zod's English text stays in the log.
      body: apiError("VALIDATION_FAILED", {
        details: { fields: zodFieldPaths(error) },
        requestId,
      }),
      logContext: { issues: error.issues },
      severe: false,
    };
  }

  return {
    status: 500,
    body: apiError("INTERNAL", { requestId }),
    logContext: {
      technicalMessage: error instanceof Error ? error.message : String(error),
      name: error instanceof Error ? error.name : typeof error,
    },
    severe: true,
  };
};

export const createErrorHandler =
  (root: Logger): ErrorHandler<AppEnv> =>
  (error, c) => {
    const requestId = c.get("requestId") ?? "unknown";
    const log = c.get("logger") ?? root;
    const reported = describe(error, requestId);

    // `err` gets pino's error serializer, which keeps the stack and the cause
    // chain server-side. None of that appears in `reported.body`.
    if (reported.severe) {
      log.error(
        { err: error, ...reported.logContext, code: reported.body.code },
        "unhandled failure",
      );
    } else {
      log.warn(
        { ...reported.logContext, code: reported.body.code },
        "request refused",
      );
    }

    const body: ApiFailure = { ok: false, error: reported.body };
    return c.json(body, reported.status);
  };

export const notFoundHandler: NotFoundHandler<AppEnv> = (c) => {
  const body: ApiFailure = {
    ok: false,
    error: apiError("NOT_FOUND", {
      requestId: c.get("requestId") ?? "unknown",
    }),
  };
  return c.json(body, 404);
};
