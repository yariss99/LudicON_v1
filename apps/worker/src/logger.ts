/**
 * Structured logging.
 *
 * One JSON object per line, no exceptions. Every line emitted from inside a job
 * carries `queue`, `jobId`, `jobName` and `attempt`, so a single failing job can
 * be reconstructed from a log aggregator without correlating by timestamp.
 */
import { pino } from "pino";
import type { Logger } from "pino";

import { env } from "./env.js";

/**
 * Fields that must never reach the log, wherever they appear in the object.
 * Job payloads are teacher-authored content and may carry anything.
 */
const REDACT_PATHS = [
  "*.password",
  "*.token",
  "*.apiKey",
  "*.secret",
  "*.authorization",
];

export const logger: Logger = pino({
  level: env.LOG_LEVEL,
  base: { service: env.SERVICE_NAME, env: env.NODE_ENV },
  timestamp: pino.stdTimeFunctions.isoTime,
  // Emit the level as its name ("info") rather than pino's numeric code, so
  // logs are readable without a decoder ring.
  formatters: {
    level: (label: string) => ({ level: label }),
  },
  redact: { paths: REDACT_PATHS, remove: true },
});

/** Identifying context attached to every log line produced while running a job. */
export interface JobLogContext {
  readonly queue: string;
  readonly jobId: string;
  readonly jobName: string;
  /** 1-based: the first execution is attempt 1, not attempt 0. */
  readonly attempt: number;
}

export const createJobLogger = (
  parent: Logger,
  context: JobLogContext,
): Logger => parent.child({ ...context });

/**
 * Normalises a thrown value into something loggable. Handlers can throw
 * anything; `err` must still be an Error for pino's serializer to produce a
 * stack trace.
 */
export const toError = (thrown: unknown): Error =>
  thrown instanceof Error ? thrown : new Error(String(thrown));
