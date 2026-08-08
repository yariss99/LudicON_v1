import {
  COLLECTIONS,
  createRepositories,
  HttpProvider,
  LocalStorageProvider,
  servedCollections,
  type DataProvider,
  type Repositories,
} from "@ludicon/data-access";
import { env } from "./env";

/**
 * The collections this app actually reads.
 *
 * Written down so the http provider can be checked against the server's real
 * surface at start-up instead of one failed request at a time. It is ONE entry
 * now: `evaluation-projects` is the whole product.
 *
 * `resources` was the second, and it was here for the library page. That page
 * is gone — nothing in this app has ever written a `Resource`, so it listed a
 * collection with no producer — and the entry had to go with it rather than
 * being left as a harmless extra. This list is a start-up GATE: a name on it is
 * a refusal to boot against a server that does not serve it, so an unread
 * collection here would block the app over a slice it no longer needs. The
 * repository and the domain schema stay untouched in `@ludicon/data-access` and
 * `@ludicon/domain`, where `apps/api` still models resources over real tables.
 */
const REQUIRED_COLLECTIONS: readonly string[] = [
  COLLECTIONS.evaluationProjects,
];

/**
 * Chooses the persistence backend.
 *
 * This function is the ONLY place in the web app that knows whether data comes
 * from localStorage or the API. Everything above it — repositories, queries,
 * components — is identical either way.
 *
 * The check below exists because that claim was once false. `apps/api` served no
 * `evaluation-projects` collection at all — no table, no contract, no route — so
 * the flag selected a provider that could not answer a single question this
 * product asks, and it failed per-request rather than at start-up. The slice has
 * since been built (table, contract, `PUT`-addressed routes), so the guard now
 * passes and the sentence above is true again.
 *
 * The guard stays anyway, and is deliberately a throw rather than a fallback to
 * localStorage: an operator who asked for the API and silently got the browser's
 * own storage has been lied to about where their data is. It reads
 * `servedCollections()` rather than a hardcoded list, so the next slice this
 * product grows before the server does will name itself here instead of
 * reappearing as a mystery.
 *
 * It checks presence, not writability. Nothing writes `resources` through the
 * seam today; if something ever does, this should also require
 * `API_SURFACE[collection]?.get === true`.
 */
function createProvider(): DataProvider {
  if (env.VITE_DATA_PROVIDER !== "http") return new LocalStorageProvider();

  const served = new Set(servedCollections());
  const missing = REQUIRED_COLLECTIONS.filter(
    (collection) => !served.has(collection),
  );

  if (missing.length > 0) {
    throw new Error(
      `VITE_DATA_PROVIDER=http, but apps/api serves none of: ${missing.join(", ")}. ` +
        `See API_SURFACE in @ludicon/data-access for what it does serve. ` +
        `Until the server grows those slices, this app runs on VITE_DATA_PROVIDER=local.`,
    );
  }

  return new HttpProvider({
    baseUrl: env.VITE_API_URL,
    getToken: async () => {
      // Clerk mints short-lived tokens; read it at call time rather than
      // caching, so a rotated session doesn't 401 the whole app.
      const clerk = (
        globalThis as {
          Clerk?: { session?: { getToken(): Promise<string | null> } };
        }
      ).Clerk;
      return (await clerk?.session?.getToken()) ?? null;
    },
  });
}

export const dataProvider: DataProvider = createProvider();
export const repositories: Repositories = createRepositories(dataProvider);
