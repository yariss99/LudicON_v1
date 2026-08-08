/**
 * Environment validation.
 *
 * The process refuses to start with a half-configured environment. A missing
 * `DATABASE_URL` should be a loud failure at boot with a readable explanation,
 * not a `TypeError: undefined` on the first request an hour later.
 */
import { z } from "zod";

const POSTGRES_URL = /^postgres(ql)?:\/\/.+/;
const REDIS_URL = /^rediss?:\/\/.+/;

/**
 * Comma-separated list, trimmed, empties dropped. Used for origins and for
 * Clerk's authorized parties, both of which are naturally lists but arrive from
 * the environment as one string.
 */
const commaSeparated = z
  .string()
  .optional()
  .transform((raw): string[] =>
    raw === undefined
      ? []
      : raw
          .split(",")
          .map((entry) => entry.trim())
          .filter((entry) => entry.length > 0),
  );

export const EnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  /* --- HTTP ------------------------------------------------------------- */
  PORT: z.coerce.number().int().min(1).max(65535).default(8787),
  HOST: z.string().min(1).default("0.0.0.0"),
  /** Allowed browser origins. Empty means "same-origin only" — never `*`. */
  CORS_ORIGINS: commaSeparated,
  CORS_MAX_AGE_SECONDS: z.coerce.number().int().min(0).max(86400).default(600),

  /* --- Database --------------------------------------------------------- */
  DATABASE_URL: z.string().regex(POSTGRES_URL, {
    error:
      "DATABASE_URL must be a postgres:// or postgresql:// connection string",
  }),
  DATABASE_POOL_MAX: z.coerce.number().int().min(1).max(100).default(10),
  DATABASE_SSL: z.stringbool().default(false),
  /** How long a client may wait for a free connection before giving up. */
  DATABASE_CONNECTION_TIMEOUT_MS: z.coerce
    .number()
    .int()
    .min(100)
    .max(60000)
    .default(10000),
  DATABASE_MIGRATIONS_DIR: z.string().min(1).default("./drizzle"),

  /* --- Queue ------------------------------------------------------------ */
  REDIS_URL: z.string().regex(REDIS_URL, {
    error: "REDIS_URL must be a redis:// or rediss:// connection string",
  }),
  QUEUE_JOB_ATTEMPTS: z.coerce.number().int().min(1).max(20).default(3),
  QUEUE_JOB_BACKOFF_MS: z.coerce
    .number()
    .int()
    .min(100)
    .max(600000)
    .default(5000),

  /* --- Auth (Clerk) ----------------------------------------------------- */
  CLERK_SECRET_KEY: z.string().min(1),
  CLERK_PUBLISHABLE_KEY: z.string().min(1),
  /**
   * PEM public key for networkless verification. Optional: without it, Clerk's
   * JWKS endpoint is used instead, which costs a (cached) network round trip.
   */
  CLERK_JWT_KEY: z.string().min(1).optional(),
  /**
   * Origins permitted in the token's `azp` claim. Leaving this empty disables
   * the check, so it should always be set in production.
   */
  CLERK_AUTHORIZED_PARTIES: commaSeparated,

  /* --- Observability ---------------------------------------------------- */
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
    .default("info"),
  /** Pretty single-line logs are for a terminal; production emits NDJSON. */
  LOG_PRETTY: z.stringbool().default(false),

  /* --- Behaviour -------------------------------------------------------- */
  /**
   * Parse every outgoing body against its contract before sending. Catches
   * drift between a handler and `@ludicon/contracts` at the point of failure
   * rather than in the browser. Defaults on outside production.
   */
  VALIDATE_RESPONSES: z.stringbool().optional(),
  SHUTDOWN_TIMEOUT_MS: z.coerce
    .number()
    .int()
    .min(1000)
    .max(120000)
    .default(15000),
});

export type Env = z.infer<typeof EnvSchema>;

/**
 * Parses `source` (defaults to `process.env`) or throws with a readable report
 * of every problem at once — not just the first.
 */
export const loadEnv = (source: unknown = process.env): Env => {
  const parsed = EnvSchema.safeParse(source);
  if (!parsed.success) {
    throw new Error(
      `Environment configuration is not usable:\n${z.prettifyError(parsed.error)}\n` +
        "See apps/api/.env.example for every variable and its meaning.",
    );
  }
  return parsed.data;
};

/** Response validation is on everywhere except production, unless forced. */
export const shouldValidateResponses = (env: Env): boolean =>
  env.VALIDATE_RESPONSES ?? env.NODE_ENV !== "production";
