/**
 * @ludicon/worker — background job processor.
 *
 * One BullMQ `Worker` per queue in `QUEUE_NAMES`, all sharing a single Redis
 * connection, all running the same processor: validate the payload against the
 * contract, dispatch to the handler for its job type, log the outcome.
 *
 * Startup does not block on Redis. If Redis is down the connection retries in
 * the background and the workers log `ready` when it comes up — a worker that
 * refuses to boot during a brief Redis blip is worse than one that waits.
 */
import { Worker, type Job, type WorkerOptions } from "bullmq";
import { QUEUE_NAMES, type JobResult } from "@ludicon/contracts";

import { env } from "./env.js";
import { dispatch, parseJobPayload } from "./handlers/index.js";
import { createJobLogger, logger, toError } from "./logger.js";
import { createRedisConnection } from "./lib/connection.js";
import {
  createDeadLetterSink,
  type DeadLetterSink,
} from "./lib/dead-letter.js";
import { buildWorkerOptions } from "./lib/job-policy.js";
import { createQueueEvents } from "./lib/queue-events.js";
import { createShutdown, installSignalHandlers } from "./lib/shutdown.js";

/** Deduplicated in case two contract keys ever point at the same queue. */
const queueNames: readonly string[] = [
  ...new Set<string>(Object.values(QUEUE_NAMES)),
];

/**
 * The processor. Declares three parameters on purpose: BullMQ inspects
 * `processor.length` and only passes the `AbortSignal` to processors that
 * accept a third argument.
 */
const processJob = async (
  job: Job<unknown, JobResult, string>,
  _token?: string,
  signal?: AbortSignal,
): Promise<JobResult> => {
  const jobLogger = createJobLogger(logger, {
    queue: job.queueName,
    jobId: job.id ?? "unknown",
    jobName: job.name,
    // `attemptsMade` counts attempts that already finished, so the one about
    // to run is the next one.
    attempt: job.attemptsMade + 1,
  });

  const startedAt = Date.now();
  jobLogger.info("job started");

  try {
    const payload = parseJobPayload(job.data, job.queueName);

    const result = await dispatch(payload, {
      logger: jobLogger,
      env,
      signal,
      reportProgress: async (percent: number): Promise<void> => {
        await job.updateProgress(percent);
      },
    });

    jobLogger.info({ durationMs: Date.now() - startedAt }, "job succeeded");
    return result;
  } catch (error) {
    const err = toError(error);
    jobLogger.error({ err, durationMs: Date.now() - startedAt }, "job failed");
    // Rethrow: BullMQ owns the retry/backoff decision, not this function.
    throw err;
  }
};

const startWorker = (
  queueName: string,
  options: WorkerOptions,
  deadLetter: DeadLetterSink,
): Worker<unknown, JobResult, string> => {
  const worker = new Worker<unknown, JobResult, string>(
    queueName,
    processJob,
    options,
  );
  const log = logger.child({ queue: queueName });

  worker.on("ready", () => {
    log.info("worker ready");
  });

  // Required: an unhandled `error` event on an EventEmitter throws.
  worker.on("error", (error) => {
    log.error({ err: error }, "worker error");
  });

  worker.on("stalled", (jobId, prev) => {
    log.warn({ jobId, prev }, "job stalled and was returned to wait");
  });

  worker.on("failed", (job, error) => {
    if (job === undefined) {
      // Happens when a stalled job exceeds `maxStalledCount` and has already
      // been evicted by the retention policy.
      log.error({ err: error }, "job failed with no job instance available");
      return;
    }

    // Best-effort and self-contained: `capture` never rejects.
    void deadLetter.capture(
      job,
      error,
      log.child({ jobId: job.id ?? "unknown", jobName: job.name }),
    );
  });

  worker.on("closing", () => {
    log.info("worker closing");
  });

  worker.on("closed", () => {
    log.info("worker closed");
  });

  return worker;
};

const main = (): void => {
  if (queueNames.length === 0) {
    throw new Error(
      "QUEUE_NAMES from @ludicon/contracts is empty — there is nothing to process.",
    );
  }

  logger.info(
    {
      queues: queueNames,
      concurrency: env.WORKER_CONCURRENCY,
      prefix: env.QUEUE_PREFIX,
      attempts: env.WORKER_JOB_ATTEMPTS,
      deadLetter: env.DEAD_LETTER_ENABLED,
    },
    "worker starting",
  );

  const connection = createRedisConnection(env, logger);
  const deadLetter = createDeadLetterSink(env, connection);
  const workerOptions = buildWorkerOptions(env, connection);

  const workers = queueNames.map((queueName) =>
    startWorker(queueName, workerOptions, deadLetter),
  );

  const queueEvents = queueNames.map((queueName) =>
    createQueueEvents(queueName, connection, env, logger),
  );

  installSignalHandlers(
    createShutdown({
      workers,
      queueEvents,
      deadLetter,
      connection,
      logger,
      env,
    }),
    logger,
  );

  logger.info({ workers: workers.length }, "worker started");
};

main();
