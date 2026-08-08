/**
 * Payload validation and handler dispatch.
 *
 * This is the only place that knows which handler serves which job. Adding a
 * member to `JobPayload` in `@ludicon/contracts` and forgetting to handle it
 * here is a *compile* error, not a runtime surprise — see `assertNever` below.
 */
import { UnrecoverableError } from "bullmq";
import {
  JOB_NAMES,
  JobPayload,
  QUEUE_FOR_JOB,
  type JobResult,
} from "@ludicon/contracts";

import type { HandlerContext } from "./context.js";
import { handleExportDocument } from "./export-document.js";
import { handleGenerateMaterials } from "./generate-materials.js";

/**
 * Nothing that arrives over the wire is trusted. A job's `data` was serialised
 * by a producer we do not control, possibly running a different deploy of the
 * contract.
 *
 * Two checks, both of which fail permanently rather than being retried, because
 * neither a malformed payload nor a misrouted one becomes valid on a second
 * attempt. `UnrecoverableError` moves the job straight to `failed` without
 * burning the remaining attempts, and the dead-letter sink picks it up.
 */
export const parseJobPayload = (
  data: unknown,
  queueName: string,
): JobPayload => {
  const result = JobPayload.safeParse(data);

  if (!result.success) {
    const detail = result.error.issues
      .map((issue) => `${issue.path.map(String).join(".")}: ${issue.message}`)
      .join("; ");
    throw new UnrecoverableError(`invalid job payload — ${detail}`);
  }

  const payload = result.data;
  const expectedQueue = QUEUE_FOR_JOB[payload.name];

  if (expectedQueue !== queueName) {
    throw new UnrecoverableError(
      `job "${payload.name}" arrived on queue "${queueName}" but belongs on "${expectedQueue}"`,
    );
  }

  return payload;
};

/**
 * Exhaustiveness guard. If `JobPayload` grows a member that the switch below
 * does not handle, `payload` in the `default` branch stops being `never` and
 * this call fails to typecheck.
 */
const assertNever = (payload: never): never => {
  throw new UnrecoverableError(
    `no handler registered for job payload: ${JSON.stringify(payload)}`,
  );
};

export const dispatch = async (
  payload: JobPayload,
  ctx: HandlerContext,
): Promise<JobResult> => {
  switch (payload.name) {
    case JOB_NAMES.GENERATE_MATERIALS:
      return await handleGenerateMaterials(payload.data, ctx);

    case JOB_NAMES.EXPORT_DOCUMENT:
      return await handleExportDocument(payload.data, ctx);

    default:
      return assertNever(payload);
  }
};
