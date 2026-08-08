/**
 * Request validation.
 *
 * `@hono/zod-validator` answers a failed body with Zod's own English report
 * ("Invalid input: expected string"), which is exactly the vocabulary UX-001
 * forbids. Every validator here therefore installs a hook that throws an
 * `AppError` instead, so a malformed request takes the same path as any other
 * refusal: catalogued Romanian message out, full detail into the log.
 */
import { zValidator } from "@hono/zod-validator";
import type { ValidationTargets } from "hono";
import { z } from "zod";

import { ValidationFailedError } from "./errors.js";

/**
 * Dotted field paths from a schema failure.
 *
 * Only paths cross the wire. They are field names the client already sent, so
 * they leak nothing, and they are what a form needs in order to mark the right
 * inputs.
 */
export const zodFieldPaths = (error: z.core.$ZodError): string[] =>
  error.issues
    .map((issue) => issue.path.map((segment) => String(segment)).join("."))
    .filter((path) => path.length > 0);

/**
 * `zValidator` with the teacher-safe failure hook attached.
 *
 * `result.error` is read through `unknown` deliberately: inside a generic
 * wrapper its type is a deferred conditional (v3 vs v4 error shapes) that
 * cannot be dereferenced directly. The `instanceof` narrowing recovers the real
 * type without a cast.
 */
export const validate = <
  TSchema extends z.ZodType,
  TTarget extends keyof ValidationTargets,
>(
  target: TTarget,
  schema: TSchema,
) =>
  zValidator(target, schema, (result) => {
    if (result.success) {
      return;
    }
    const error: unknown = result.error;
    const fields =
      error instanceof z.core.$ZodError ? zodFieldPaths(error) : [];
    throw new ValidationFailedError(
      `request ${target} did not match its contract`,
      {
        details: { target, fields },
        context: {
          issues: error instanceof z.core.$ZodError ? error.issues : undefined,
        },
      },
    );
  });
