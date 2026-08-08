/**
 * Migration runner.
 *
 * Runs as its own process rather than on API boot: a rolling deploy starts
 * several API instances at once, and schema changes must not race each other.
 * Drizzle takes an advisory lock, but sequencing the step explicitly keeps the
 * deploy pipeline honest about when schema changes happen.
 *
 * Two entry points, deliberately:
 *   - `npm run db:migrate`        — drizzle-kit, for a developer's machine.
 *   - `npm run db:migrate:deploy` — this file. It depends only on `drizzle-orm`,
 *     which is a runtime dependency, so it still works in an image installed
 *     with `npm ci --omit=dev` where the drizzle-kit CLI is absent.
 */
import { migrate } from "drizzle-orm/node-postgres/migrator";

import { loadEnv } from "../env.js";
import { createDatabase } from "./client.js";

export const runMigrations = async (): Promise<void> => {
  const env = loadEnv();
  const handle = createDatabase(env);
  try {
    await migrate(handle.db, { migrationsFolder: env.DATABASE_MIGRATIONS_DIR });
  } finally {
    await handle.close();
  }
};

// Comparing against `argv[1]` keeps this module importable from a test without
// the import itself mutating the database.
const entryPoint = process.argv[1];
const invokedDirectly =
  entryPoint !== undefined &&
  import.meta.url.endsWith(entryPoint.replace(/\\/gu, "/"));

if (invokedDirectly) {
  runMigrations().then(
    () => {
      process.stdout.write("migrations applied\n");
      process.exit(0);
    },
    (error: unknown) => {
      process.stderr.write(
        `migrations failed: ${error instanceof Error ? error.message : String(error)}\n`,
      );
      process.exit(1);
    },
  );
}
