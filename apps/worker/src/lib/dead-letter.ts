/**
 * Dead-letter handling.
 *
 * ── The strategy ────────────────────────────────────────────────────────────
 * BullMQ has no native dead-letter queue, so this is a two-layer approach.
 *
 * Layer 1 — the `failed` set. A job that exhausts its attempts stays in its own
 * queue's `failed` set with its payload, `failedReason` and stack trace intact,
 * retained for `KEEP_FAILED_AGE_S`. It can be re-driven in place with
 * `job.retry()`. This layer costs nothing and is always on.
 *
 * Layer 2 — the parking lot (this module). When a job fails *permanently*, a
 * copy of it is published to a dedicated `<queue>:dead-letter` queue. Nothing
 * consumes that queue, so entries accumulate in `wait` and are never evicted by
 * the retention policy that eventually trims the `failed` set. That gives us a
 * durable, greppable record that outlives layer 1, and a place an operator can
 * drain from deliberately (read the entry, fix the cause, re-enqueue onto the
 * original queue).
 *
 * "Permanently failed" means either:
 *   - the handler threw `UnrecoverableError` (a payload we will never be able
 *     to process — retrying is pointless), or
 *   - the job has used up every attempt it was given.
 *
 * Transient failures that still have attempts left are *not* dead-lettered;
 * they are just logged and left to BullMQ's backoff.
 *
 * Publishing to the parking lot is strictly best-effort. If it fails we log and
 * move on: the job is already recorded in layer 1, and throwing here would only
 * destabilise the worker's event handling.
 */
import { Queue, UnrecoverableError } from "bullmq";
import type { ConnectionOptions, Job } from "bullmq";
import type { Logger } from "pino";

import type { Env } from "../env.js";
import { toError } from "../logger.js";

/** What we store for each permanently failed job. */
export interface DeadLetterRecord {
  readonly sourceQueue: string;
  readonly jobId: string;
  readonly jobName: string;
  /** The original, unmodified job payload. */
  readonly data: unknown;
  readonly failedReason: string;
  readonly attemptsMade: number;
  readonly failedAt: string;
  readonly stacktrace: readonly string[];
}

export interface DeadLetterSink {
  /** Publishes `job` to its parking lot if the failure is permanent. */
  readonly capture: (job: Job, error: Error, logger: Logger) => Promise<void>;
  readonly close: () => Promise<void>;
}

export const deadLetterQueueName = (sourceQueue: string, env: Env): string =>
  `${sourceQueue}:${env.DEAD_LETTER_SUFFIX}`;

const isPermanentFailure = (job: Job, error: Error): boolean => {
  if (error instanceof UnrecoverableError) return true;
  const allowed = job.opts.attempts ?? 1;
  return job.attemptsMade >= allowed;
};

const toRecord = (job: Job, error: Error): DeadLetterRecord => ({
  sourceQueue: job.queueName,
  jobId: job.id ?? "unknown",
  jobName: job.name,
  data: job.data,
  failedReason: error.message,
  attemptsMade: job.attemptsMade,
  failedAt: new Date().toISOString(),
  stacktrace: job.stacktrace ?? [],
});

/**
 * A sink with no parking lot. Used when `DEAD_LETTER_ENABLED=false`; layer 1
 * still applies.
 */
const disabledSink: DeadLetterSink = {
  capture: async () => {},
  close: async () => {},
};

/**
 * Builds one parking-lot `Queue` per source queue, lazily — a queue that never
 * has a permanent failure never opens one.
 */
export const createDeadLetterSink = (
  env: Env,
  connection: ConnectionOptions,
): DeadLetterSink => {
  if (!env.DEAD_LETTER_ENABLED) return disabledSink;

  // Only the data generic is pinned. `Queue` in v6 declares seven generic
  // slots (the docs still say four); the trailing ones are derived and must be
  // left to default.
  const queues = new Map<string, Queue<DeadLetterRecord>>();

  const queueFor = (sourceQueue: string): Queue<DeadLetterRecord> => {
    const existing = queues.get(sourceQueue);
    if (existing !== undefined) return existing;

    const created = new Queue<DeadLetterRecord>(
      deadLetterQueueName(sourceQueue, env),
      {
        connection,
        prefix: env.QUEUE_PREFIX,
        defaultJobOptions: {
          // Never retried and never evicted: entries are removed only when an
          // operator deliberately drains the parking lot.
          attempts: 1,
          removeOnComplete: false,
          removeOnFail: false,
        },
      },
    );
    queues.set(sourceQueue, created);
    return created;
  };

  return {
    capture: async (job, error, logger) => {
      if (!isPermanentFailure(job, error)) return;

      const record = toRecord(job, error);

      try {
        await queueFor(record.sourceQueue).add(record.jobName, record, {
          // Deterministic per (job, attempt): replaying the same permanent
          // failure will not duplicate the entry.
          jobId: `${record.jobId}:${String(record.attemptsMade)}`,
        });
        logger.warn(
          { deadLetterQueue: deadLetterQueueName(record.sourceQueue, env) },
          "job dead-lettered",
        );
      } catch (publishError) {
        logger.error(
          { err: toError(publishError) },
          "failed to publish to dead-letter queue; job remains in the failed set",
        );
      }
    },

    close: async () => {
      await Promise.allSettled([...queues.values()].map((q) => q.close()));
      queues.clear();
    },
  };
};
