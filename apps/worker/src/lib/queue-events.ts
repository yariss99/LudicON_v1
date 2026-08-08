/**
 * Queue-level observability.
 *
 * A `Worker` only emits events for jobs *it* ran. `QueueEvents` subscribes to
 * the queue's Redis stream and sees every transition from every producer and
 * every worker replica, which is what makes it useful for monitoring rather
 * than for control flow.
 *
 * It needs its own Redis connection; BullMQ duplicates the one passed in.
 */
import { QueueEvents } from "bullmq";
import type { ConnectionOptions } from "bullmq";
import type { Logger } from "pino";

import type { Env } from "../env.js";
import { toError } from "../logger.js";

export const createQueueEvents = (
  queueName: string,
  connection: ConnectionOptions,
  env: Env,
  logger: Logger,
): QueueEvents => {
  const events = new QueueEvents(queueName, {
    connection,
    prefix: env.QUEUE_PREFIX,
  });

  const log = logger.child({ queue: queueName, source: "queue-events" });

  // `returnvalue` is deliberately not logged: it is unbounded job output.
  events.on("completed", ({ jobId, prev }) => {
    log.info({ jobId, prev }, "queue event: completed");
  });

  events.on("failed", ({ jobId, failedReason, prev }) => {
    log.error({ jobId, failedReason, prev }, "queue event: failed");
  });

  events.on("stalled", ({ jobId }) => {
    log.warn({ jobId }, "queue event: stalled");
  });

  events.on("retries-exhausted", ({ jobId, attemptsMade }) => {
    log.error({ jobId, attemptsMade }, "queue event: retries exhausted");
  });

  // Without this listener a Redis-side error becomes an unhandled `error`
  // event and takes the process down.
  events.on("error", (error) => {
    log.error({ err: toError(error) }, "queue event: stream error");
  });

  return events;
};
