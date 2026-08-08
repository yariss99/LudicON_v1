import { z } from "zod";

/**
 * Client environment, validated at module load.
 *
 * Failing here with a readable message beats a mystery `undefined` surfacing
 * three layers deep at runtime. Only `VITE_`-prefixed variables reach the
 * browser bundle — nothing secret can be referenced from this file.
 */
const EnvSchema = z.object({
  VITE_DATA_PROVIDER: z.enum(["local", "http"]).default("local"),
  /**
   * ORIGIN only. `HttpProvider` owns the `/api/v1` prefix, because the prefix is
   * a fact about the server's routing rather than about where it is deployed —
   * and when it was the operator's job to remember, the default here said `/v1`
   * while the server mounts `/api/v1`.
   */
  VITE_API_URL: z.string().default("http://localhost:3000"),
  VITE_CLERK_PUBLISHABLE_KEY: z.string().default(""),
  VITE_ENABLE_DEVTOOLS: z
    .enum(["true", "false"])
    .default("true")
    .transform((value) => value === "true"),
});

const parsed = EnvSchema.safeParse(import.meta.env);

if (!parsed.success) {
  const detail = parsed.error.issues
    .map((issue) => `  ${issue.path.join(".")}: ${issue.message}`)
    .join("\n");
  throw new Error(`Invalid client environment:\n${detail}`);
}

export const env = parsed.data;

/** Auth is only enforced once a publishable key is configured. */
export const isAuthConfigured = env.VITE_CLERK_PUBLISHABLE_KEY.length > 0;
