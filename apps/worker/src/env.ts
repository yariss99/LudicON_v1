/**
 * Worker environment — parsed once, validated once, at process start.
 *
 * Every value the worker needs comes from here. Nothing else in the worker is
 * allowed to read `process.env` directly, which means the set of knobs is
 * exactly the set documented in `apps/worker/.env.example`.
 *
 * The process refuses to start on an invalid environment. A worker that boots
 * with a bad Redis URL or a nonsense concurrency is worse than a worker that
 * never boots: it looks healthy while quietly dropping work.
 */
import { z } from "zod";

const NodeEnv = z.enum(["development", "test", "production"]);

/** pino levels, plus `silent`. Kept in sync with `logger.ts`. */
const LogLevel = z.enum([
  "fatal",
  "error",
  "warn",
  "info",
  "debug",
  "trace",
  "silent",
]);

/**
 * Environment variables are strings. Accept the four spellings people actually
 * type and reject everything else rather than silently treating `"no"` as true.
 */
const BooleanFlag = z
  .enum(["true", "false", "1", "0"])
  .transform((value) => value === "true" || value === "1");

const REDIS_PROTOCOLS = new Set(["redis:", "rediss:"]);

const RedisUrl = z
  .string()
  .min(1)
  .refine(
    (value) => {
      if (!URL.canParse(value)) return false;
      return REDIS_PROTOCOLS.has(new URL(value).protocol);
    },
    { message: "must be a redis:// or rediss:// URL" },
  );

const EnvSchema = z.object({
  NODE_ENV: NodeEnv.default("development"),

  /** Identifies this process in every log line and in the Redis connection name. */
  SERVICE_NAME: z.string().min(1).default("ludicon-worker"),

  LOG_LEVEL: LogLevel.default("info"),

  REDIS_URL: RedisUrl,

  /**
   * BullMQ namespaces every key it writes with this prefix. The producer (the
   * API) and this worker MUST agree on it or they will silently use different
   * queues. `bull` is BullMQ's own default, so leaving it alone is the safe
   * choice unless both sides are changed together.
   */
  QUEUE_PREFIX: z.string().min(1).default("bull"),

  /** Jobs processed in parallel per queue, per worker process. */
  WORKER_CONCURRENCY: z.coerce.number().int().min(1).max(100).default(4),

  /**
   * How long we let in-flight jobs finish after SIGTERM before giving up.
   * Should be comfortably below the orchestrator's kill timeout
   * (Compose `stop_grace_period`, Kubernetes `terminationGracePeriodSeconds`).
   */
  WORKER_SHUTDOWN_TIMEOUT_MS: z.coerce
    .number()
    .int()
    .min(1_000)
    .max(600_000)
    .default(25_000),

  /**
   * Total attempts per job, including the first. Applied by the worker as a
   * hard ceiling (`maxStartedAttempts`) and exported as the retry policy the
   * producer should enqueue with.
   */
  WORKER_JOB_ATTEMPTS: z.coerce.number().int().min(1).max(20).default(3),

  /** Base delay for exponential backoff: delay * 2^(attempt - 1). */
  WORKER_BACKOFF_DELAY_MS: z.coerce
    .number()
    .int()
    .min(100)
    .max(600_000)
    .default(2_000),

  /**
   * Backoff jitter as a fraction of the computed delay (0 = none, 1 = full).
   * Non-zero jitter stops a batch of jobs that failed together from retrying
   * in lockstep and re-crushing whatever they were waiting on.
   */
  WORKER_BACKOFF_JITTER: z.coerce.number().min(0).max(1).default(0.3),

  /**
   * How long a job's lock is held before the stalled checker may reclaim it.
   * Must exceed the longest plausible single job execution.
   */
  WORKER_LOCK_DURATION_MS: z.coerce
    .number()
    .int()
    .min(5_000)
    .max(600_000)
    .default(60_000),

  /** How many times a stalled job may be recovered before it is failed. */
  WORKER_MAX_STALLED_COUNT: z.coerce.number().int().min(0).max(10).default(2),

  /** Retention: completed jobs kept, by age (seconds) and by count. */
  KEEP_COMPLETED_AGE_S: z.coerce
    .number()
    .int()
    .min(60)
    .default(24 * 60 * 60),
  KEEP_COMPLETED_COUNT: z.coerce.number().int().min(1).default(1_000),

  /** Retention: failed jobs kept longer — they are the incident record. */
  KEEP_FAILED_AGE_S: z.coerce
    .number()
    .int()
    .min(60)
    .default(7 * 24 * 60 * 60),
  KEEP_FAILED_COUNT: z.coerce.number().int().min(1).default(5_000),

  /**
   * Whether permanently failed jobs are copied to a dead-letter queue.
   * See `lib/dead-letter.ts` for what "permanently failed" means here.
   */
  DEAD_LETTER_ENABLED: BooleanFlag.default(true),

  /** Suffix appended to a queue name to form its dead-letter queue. */
  DEAD_LETTER_SUFFIX: z.string().min(1).default("dead-letter"),

  /** Simulated duration of the not-yet-implemented handler work, in ms. */
  STUB_WORK_DURATION_MS: z.coerce
    .number()
    .int()
    .min(0)
    .max(60_000)
    .default(250),
});

export type Env = z.infer<typeof EnvSchema>;

/**
 * Formats validation issues as one `VAR: message` line each. Deliberately
 * plain: this is the last thing an operator sees before the container exits,
 * and it has to be readable in a log aggregator with no formatting.
 *
 * Typed structurally rather than against `z.ZodError` so it does not have to
 * track Zod's generic signature.
 */
interface ValidationIssue {
  readonly path: readonly PropertyKey[];
  readonly message: string;
}

const formatIssues = (issues: readonly ValidationIssue[]): string =>
  issues
    .map((issue) => {
      const path = issue.path.map(String).join(".");
      return `  ${path === "" ? "(root)" : path}: ${issue.message}`;
    })
    .join("\n");

export const parseEnv = (source: NodeJS.ProcessEnv): Env => {
  const result = EnvSchema.safeParse(source);

  if (!result.success) {
    throw new Error(
      `Invalid worker environment.\n${formatIssues(result.error.issues)}\n\n` +
        `See apps/worker/.env.example for the full list of variables.`,
    );
  }

  return result.data;
};

export const env: Env = parseEnv(process.env);
