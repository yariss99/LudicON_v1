/**
 * Connection pool and Drizzle instance.
 *
 * Created once at boot and passed down explicitly rather than imported as a
 * module singleton: the service layer takes its executor as an argument, which
 * is what lets the same repository function run inside or outside a transaction
 * and makes tests able to hand it a different database.
 */
import {
  drizzle,
  type NodePgDatabase,
  type NodePgQueryResultHKT,
} from "drizzle-orm/node-postgres";
import type { PgDatabase } from "drizzle-orm/pg-core";
import { Pool } from "pg";

import type { Env } from "../env.js";
import * as tableRelations from "./relations.js";
import * as tables from "./schema.js";

/**
 * Tables and relations as one object, which is the shape `drizzle()` expects.
 * They live in separate modules so neither file grows past the point of being
 * readable; merging them here keeps that split invisible to every consumer.
 */
const schema = { ...tables, ...tableRelations };

export type Schema = typeof schema;

export type Database = NodePgDatabase<Schema>;

/**
 * The transaction handle Drizzle hands to a `db.transaction` callback, derived
 * from `Database` so it cannot drift from the driver's own type.
 */
export type Transaction = Parameters<Parameters<Database["transaction"]>[0]>[0];

/**
 * Anything a repository can run a query against.
 *
 * This is the common base of `Database` and `Transaction` rather than a union
 * of the two: a union would force every `exec.select()` call to reconcile two
 * sets of overloads, while the shared supertype accepts both and keeps the
 * query builders unambiguous. Repositories taking this is what lets a service
 * compose several of them into one atomic unit of work.
 */
export type Executor = PgDatabase<NodePgQueryResultHKT, Schema>;

export type DatabaseHandle = {
  db: Database;
  pool: Pool;
  /** Cheap liveness probe used by `GET /ready`. */
  ping: () => Promise<boolean>;
  close: () => Promise<void>;
};

export const createDatabase = (env: Env): DatabaseHandle => {
  const pool = new Pool({
    connectionString: env.DATABASE_URL,
    max: env.DATABASE_POOL_MAX,
    connectionTimeoutMillis: env.DATABASE_CONNECTION_TIMEOUT_MS,
    // Managed Postgres almost always terminates TLS with its own CA, so the
    // flag is explicit rather than inferred from the connection string.
    ...(env.DATABASE_SSL ? { ssl: { rejectUnauthorized: true } } : {}),
  });

  // A pool-level error (a server-side disconnect on an idle client) is emitted
  // on the pool, not on a query. Without a listener Node treats it as an
  // unhandled 'error' event and takes the process down.
  pool.on("error", () => {
    // Deliberately silent here: the logger is not available this deep, and the
    // pool recovers by discarding the client. Failures that matter surface on
    // the next query, and `/ready` reports the pool as down.
  });

  const db = drizzle(pool, { schema });

  return {
    db,
    pool,
    ping: async (): Promise<boolean> => {
      try {
        await pool.query("select 1");
        return true;
      } catch {
        return false;
      }
    },
    close: async (): Promise<void> => {
      await pool.end();
    },
  };
};
