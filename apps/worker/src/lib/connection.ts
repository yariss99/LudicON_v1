/**
 * The process-wide Redis connection.
 *
 * One ioredis instance is created here and handed to every BullMQ class. BullMQ
 * duplicates it internally for the clients that issue blocking commands
 * (`Worker`, `QueueEvents`), so this single instance backs everything without
 * each queue opening its own socket.
 *
 * Note on dependencies: as of BullMQ v6, `ioredis` is an *optional peer*
 * dependency — BullMQ also supports node-redis and Postgres backends. That is
 * why `ioredis` is a direct dependency of this app rather than something we
 * inherit from `bullmq`.
 */
import { Redis } from "ioredis";
import type { Logger } from "pino";
import type { RedisOptions } from "ioredis";

import type { Env } from "../env.js";
import { toError } from "../logger.js";

/** Give up on a single reconnect attempt after this long, then retry. */
const MAX_RECONNECT_DELAY_MS = 5_000;
const RECONNECT_STEP_MS = 200;

export const buildRedisOptions = (env: Env): RedisOptions => ({
  /**
   * REQUIRED. BullMQ throws if a connection handed to a `Worker` or
   * `QueueEvents` has a finite `maxRetriesPerRequest`: those classes park a
   * blocking command on the socket for up to 10s at a time, and ioredis would
   * otherwise fail the command mid-block during a reconnect.
   */
  maxRetriesPerRequest: null,

  enableReadyCheck: true,

  /** Shows up in `CLIENT LIST`, which makes triage on a shared Redis bearable. */
  connectionName: env.SERVICE_NAME,

  /** Linear backoff, capped. Redis coming back should not take minutes to notice. */
  retryStrategy: (times: number): number =>
    Math.min(times * RECONNECT_STEP_MS, MAX_RECONNECT_DELAY_MS),
});

/**
 * Creates the shared connection and wires its lifecycle to the logger. ioredis
 * emits `error` on every failed reconnect attempt; without a listener those
 * become unhandled `error` events and take the process down.
 */
export const createRedisConnection = (env: Env, logger: Logger): Redis => {
  const connection = new Redis(env.REDIS_URL, buildRedisOptions(env));

  connection.on("error", (error: unknown) => {
    logger.error({ err: toError(error) }, "redis connection error");
  });
  connection.on("connect", () => {
    logger.debug("redis connecting");
  });
  connection.on("ready", () => {
    logger.info("redis ready");
  });
  connection.on("reconnecting", () => {
    logger.warn("redis reconnecting");
  });
  connection.on("end", () => {
    logger.info("redis connection closed");
  });

  return connection;
};

/**
 * Closes the connection politely, then rudely.
 *
 * `quit()` drains pending commands and sends `QUIT`. If Redis is already gone
 * that rejects, and there is nothing left to be polite about — `disconnect()`
 * tears the socket down so the event loop can empty and the process can exit.
 */
export const closeRedisConnection = async (
  connection: Redis,
  logger: Logger,
): Promise<void> => {
  try {
    await connection.quit();
  } catch (error) {
    logger.warn(
      { err: toError(error) },
      "redis quit failed, forcing disconnect",
    );
    connection.disconnect();
  }
};
