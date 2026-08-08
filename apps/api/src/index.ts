/**
 * Process entry point.
 *
 * Boot order is deliberate: validate the environment before anything opens a
 * socket, so a misconfigured deploy fails in the first second with a readable
 * message rather than on the first request.
 *
 * Shutdown is the same order in reverse. On SIGTERM the server stops accepting
 * connections, in-flight requests are allowed to finish, and only then are the
 * pool and the queue closed — a teacher mid-save does not lose the save because
 * a deploy started.
 */
import { serve } from "@hono/node-server";

import { createApp } from "./app.js";
import { createDatabase } from "./db/client.js";
import { loadEnv } from "./env.js";
import { createQueueProducer } from "./queue/producer.js";

const main = (): void => {
  const env = loadEnv();
  const database = createDatabase(env);
  const queue = createQueueProducer(env);
  const { app, logger } = createApp({ env, database, queue });

  const server = serve(
    { fetch: app.fetch, port: env.PORT, hostname: env.HOST },
    (info) => {
      logger.info(
        { port: info.port, host: env.HOST, nodeEnv: env.NODE_ENV },
        "api listening",
      );
    },
  );

  let shuttingDown = false;

  /** Resolves once the listener is closed and every in-flight request is done. */
  const stopAcceptingConnections = (): Promise<void> =>
    new Promise<void>((resolve) => {
      server.close(() => {
        resolve();
      });
    });

  const shutdown = (signal: NodeJS.Signals): void => {
    // A second SIGTERM during a drain must not start a second drain.
    if (shuttingDown) {
      return;
    }
    shuttingDown = true;
    logger.info({ signal }, "shutting down");

    // The orchestrator will SIGKILL eventually; this timer makes sure the
    // process exits on its own terms first, with the reason recorded.
    const forceExit = setTimeout(() => {
      logger.error(
        { timeoutMs: env.SHUTDOWN_TIMEOUT_MS },
        "shutdown timed out, forcing exit",
      );
      process.exit(1);
    }, env.SHUTDOWN_TIMEOUT_MS);
    forceExit.unref();

    stopAcceptingConnections()
      // `allSettled`: a Redis connection that is already gone must not stop the
      // Postgres pool from being drained.
      .then(async () => Promise.allSettled([queue.close(), database.close()]))
      .then(
        () => {
          clearTimeout(forceExit);
          logger.info("shutdown complete");
          process.exit(0);
        },
        (error: unknown) => {
          clearTimeout(forceExit);
          logger.error({ err: error }, "failed to release dependencies");
          process.exit(1);
        },
      );
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);

  // An unhandled rejection has already escaped every `catch` in the codebase;
  // the process state is unknown, so it is logged and the process is retired
  // rather than left running in an undefined state.
  process.on("unhandledRejection", (reason: unknown) => {
    logger.fatal({ err: reason }, "unhandled promise rejection");
    process.exit(1);
  });

  process.on("uncaughtException", (error: Error) => {
    logger.fatal({ err: error }, "uncaught exception");
    process.exit(1);
  });
};

try {
  main();
} catch (error: unknown) {
  // The logger may not exist yet — a failed `loadEnv` is the usual cause — so
  // this last-resort report goes straight to stderr.
  process.stderr.write(
    `api failed to start: ${error instanceof Error ? error.message : String(error)}\n`,
  );
  process.exit(1);
}
