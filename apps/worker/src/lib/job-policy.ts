/**
 * Retry, backoff and retention policy — the single place where "how hard do we
 * try, and what do we keep afterwards" is decided.
 *
 * BullMQ splits these settings across two sides:
 *
 *   - `attempts` and `backoff` are **job** options. They are stamped onto a job
 *     when it is *enqueued*, so the producer (the API) owns them. `jobPolicy`
 *     below is exported for that purpose — the API should spread it into its
 *     `Queue`'s `defaultJobOptions` so both sides agree.
 *   - `removeOnComplete` / `removeOnFail` and the stall settings are **worker**
 *     options, enforced here.
 *
 * Because a producer can always override the job options, the worker also sets
 * `maxStartedAttempts` as an independent ceiling: no matter what a producer
 * asks for, a job cannot be started more than N times by this worker before
 * BullMQ fails it with an `UnrecoverableError`.
 */
import type {
  ConnectionOptions,
  JobsOptions,
  KeepJobs,
  WorkerOptions,
} from "bullmq";

import type { Env } from "../env.js";

const completedRetention = (env: Env): KeepJobs => ({
  age: env.KEEP_COMPLETED_AGE_S,
  count: env.KEEP_COMPLETED_COUNT,
});

/**
 * Failures are kept far longer than successes. The `failed` set is the primary
 * incident record: it holds the payload, the stack trace and the attempt count,
 * and jobs can be re-driven from it with `job.retry()`.
 */
const failedRetention = (env: Env): KeepJobs => ({
  age: env.KEEP_FAILED_AGE_S,
  count: env.KEEP_FAILED_COUNT,
});

/**
 * Job options the *producer* should enqueue with. Exported so the API can use
 * one policy rather than inventing its own.
 */
export const buildJobOptions = (env: Env): JobsOptions => ({
  attempts: env.WORKER_JOB_ATTEMPTS,
  backoff: {
    type: "exponential",
    delay: env.WORKER_BACKOFF_DELAY_MS,
    jitter: env.WORKER_BACKOFF_JITTER,
  },
  removeOnComplete: completedRetention(env),
  removeOnFail: failedRetention(env),
});

export const buildWorkerOptions = (
  env: Env,
  connection: ConnectionOptions,
): WorkerOptions => ({
  connection,
  prefix: env.QUEUE_PREFIX,
  name: env.SERVICE_NAME,

  concurrency: env.WORKER_CONCURRENCY,

  /**
   * Ceiling on how many times a job may *start*, regardless of the `attempts`
   * the producer stamped on it. Reaching it fails the job with an
   * `UnrecoverableError` instead of letting a poison message loop forever.
   */
  maxStartedAttempts: env.WORKER_JOB_ATTEMPTS,

  /**
   * A job whose lock expires (process killed, event loop blocked) is picked up
   * by the stalled checker and returned to `wait` so another worker can run it.
   * This is what makes an ungraceful shutdown lossless — see `shutdown.ts`.
   */
  lockDuration: env.WORKER_LOCK_DURATION_MS,
  maxStalledCount: env.WORKER_MAX_STALLED_COUNT,

  removeOnComplete: completedRetention(env),
  removeOnFail: failedRetention(env),
});
