/**
 * drizzle-kit configuration.
 *
 * Reads `DATABASE_URL` from the environment rather than embedding a connection
 * string: the same config generates migrations locally and applies them in CI
 * against a different database.
 */
import { defineConfig } from "drizzle-kit";

const databaseUrl = process.env["DATABASE_URL"];

if (databaseUrl === undefined || databaseUrl.length === 0) {
  throw new Error(
    "DATABASE_URL must be set to run drizzle-kit. See apps/api/.env.example.",
  );
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: { url: databaseUrl },
  // Snake case in the database, camel case in TypeScript. Column names are
  // already written out explicitly in the schema; this keeps anything added
  // without an explicit name consistent with them.
  casing: "snake_case",
  strict: true,
  verbose: true,
});
