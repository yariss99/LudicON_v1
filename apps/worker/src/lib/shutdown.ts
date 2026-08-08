/**
 * Graceful shutdown.
 *
 * This is the difference between losing work and not. The order matters:
 *
 *   1. `Worker.close()` — stops fetching new jobs and waits for in-flight ones
 *      to finish. This is the only step that can save work.
 *   2. `QueueEvents` and dead-letter `Queue`s — pure observers/producers, safe
 *      to drop once no job is running.
 *   3. The shared Redis connection — last, because everything above needs it.
 *   4. Flush logs, exit.
 *
 * ── On the grace period ──────────────────────────────────────────────────
 * `Worker.close()` in BullMQ v6 memoises its own promise:
 *
 *     async close(force = false) { if (this.closing) return this.closing; ... }
 *
 * so calling `close(true)` *after* a graceful `close()` has started does not
 * escalate — it just awaits the original call. There is therefore no way to
 * force-close a worker that is already closing gracefully.
 *
 * That is fine, because abandoning a job is not the same as losing it. If the
 * grace period elapses we stop waiting and exit non-zero. The jobs still held
 * by this process lose their locks, and after `lockDuration` the stalled
 * checker on another replica returns them to `wait` and they are retried (up to
 * `maxStalledCount`). Set `WORKER_SHUTDOWN_TIMEOUT_MS` below the orchestrator's
 * kill timeout so we control the exit rather than being SIGKILLed mid-write.
 */
import type { QueueEvents, Worker } from "bullmq";
import type { Redis } from "ioredis";
import type { Logger } from "pino";

import type { Env } from "../env.js";
import { toError } from "../logger.js";
import { withTimeout } from "./async.js";
import { closeRedisConnection } from "./connection.js";
import type { DeadLetterSink } from "./dead-letter.js";

export interface ShutdownDeps {
  readonly workers: readonly Worker[];
  readonly queueEvents: readonly QueueEvents[];
  readonly deadLetter: DeadLetterSink;
  readonly connection: Redis;
  readonly logger: Logger;
  readonly env: Env;
}

const EXIT_OK = 0;
const EXIT_UNCLEAN = 1;

export const createShutdown = (
  deps: ShutdownDeps,
): ((reason: string) => Promise<void>) => {
  const { workers, queueEvents, deadLetter, connection, logger, env } = deps;

  let running: Promise<void> | undefined;

  const run = async (reason: string): Promise<void> => {
    logger.info(
      { reason, gracePeriodMs: env.WORKER_SHUTDOWN_TIMEOUT_MS },
      "shutdown: draining workers",
    );

    // Step 1 — the only step that can save in-flight work.
    const drained = await withTimeout(
      Promise.allSettled(workers.map((worker) => worker.close())),
      env.WORKER_SHUTDOWN_TIMEOUT_MS,
    );

    if (drained === "settled") {
      logger.info("shutdown: workers drained");
    } else {
      logger.error(
        { gracePeriodMs: env.WORKER_SHUTDOWN_TIMEOUT_MS },
        "shutdown: grace period elapsed with jobs still running; " +
          "abandoning them to the stalled checker",
      );
    }

    // Steps 2 and 3 — best-effort teardown. A failure here cannot lose work,
    // and must not prevent the process from exiting.
    await Promise.allSettled([
      ...queueEvents.map((events) => events.close()),
      deadLetter.close(),
    ]);
    await closeRedisConnection(connection, logger);

    const code = drained === "settled" ? EXIT_OK : EXIT_UNCLEAN;
    logger.info({ code }, "shutdown: complete");

    // pino writes to stdout synchronously by default, but flush anyway: a
    // transport or a piped stdout can still hold buffered lines.
    logger.flush();
    process.exit(code);
  };

  /** Re-entrant safe: a second signal joins the shutdown already in progress. */
  return (reason: string): Promise<void> => {
    running ??= run(reason).catch((error: unknown) => {
      logger.fatal({ err: toError(error) }, "shutdown: failed");
      process.exit(EXIT_UNCLEAN);
    });
    return running;
  };
};

export const installSignalHandlers = (
  shutdown: (reason: string) => Promise<void>,
  logger: Logger,
): void => {
  for (const signal of ["SIGTERM", "SIGINT"] as const) {
    process.once(signal, () => {
      void shutdown(signal);
    });
  }

  // A worker that has lost its footing must not keep pulling jobs it may drop.
  process.on("uncaughtException", (error: Error) => {
    logger.fatal({ err: error }, "uncaught exception");
    void shutdown("uncaughtException");
  });

  process.on("unhandledRejection", (reason: unknown) => {
    logger.fatal({ err: toError(reason) }, "unhandled rejection");
    void shutdown("unhandledRejection");
  });
};
