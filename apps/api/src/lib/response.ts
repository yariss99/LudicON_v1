/**
 * Outbound contract checking.
 *
 * Requests are validated because clients are untrusted; responses are validated
 * because handlers drift. A field renamed in a repository and forgotten in a
 * mapper is invisible until the browser renders `undefined` — parsing the body
 * against its own contract turns that into a loud failure at the point of the
 * mistake, with the request id attached.
 *
 * On by default outside production, where the cost per response is not worth
 * paying for a class of bug that should have been caught before deploy.
 */
import type { z } from "zod";

import { InternalError } from "./errors.js";

export type ResponseValidator = <TSchema extends z.ZodType>(
  schema: TSchema,
  value: z.infer<TSchema>,
) => z.infer<TSchema>;

const passthrough: ResponseValidator = (_schema, value) => value;

const checking: ResponseValidator = (schema, value) => {
  const parsed = schema.safeParse(value);
  if (!parsed.success) {
    // Deliberately an InternalError: a response that fails its own contract is
    // a bug in this service, not something the caller did wrong.
    throw new InternalError("response body did not match its contract", {
      context: { issues: parsed.error.issues },
    });
  }
  return parsed.data;
};

export const createResponseValidator = (enabled: boolean): ResponseValidator =>
  enabled ? checking : passthrough;
