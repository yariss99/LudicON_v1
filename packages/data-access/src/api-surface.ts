import { COLLECTIONS, type CollectionName } from "./collections.js";

/**
 * What `apps/api` actually serves, written down as data.
 *
 * `HttpProvider` used to describe an API that does not exist. It addressed
 * `/{collection}/{id}` where the server mounts `/api/v1/{collection}`, it wrote
 * with `PUT` where the server registers no `PUT` handler at all and CORS does
 * not allow the method, and it parsed responses as bare entities where every
 * handler wraps its body in `{ok, data}`. Three independent mismatches, none of
 * them visible until a request was made, and the delete path swallowed its own
 * 404 so one of them could not fail loudly even then.
 *
 * The fix is not a longer `HttpProvider`. It is this table, which is the one
 * place the client's picture of the server is written down and the one place it
 * has to be corrected when the server grows. A collection absent from it is
 * absent from the API, and asking for it raises `UnsupportedOperationError` at
 * the call rather than returning a 404 the caller has to interpret.
 *
 * Kept next to the client on purpose. Deriving it from `@ludicon/contracts`
 * would be better and is not possible today: contracts declares the payload
 * schemas but not the routes, so the route table would be a second source of
 * truth wearing a shared name. When contracts grows a route manifest, this file
 * becomes a re-export of it.
 */
export const API_PREFIX = "/api/v1";

/**
 * The operations `DataProvider` names, and whether the API offers each one.
 *
 * `put` used to be `false` everywhere, and the finding behind that was right:
 * `DataProvider.put` is "insert or replace at an id the caller chose", while
 * `POST /` with a server-assigned id and `PATCH /:id` with a partial body are
 * two different operations wearing the same word. It stays `false` for the four
 * modules that work that way.
 *
 * It is `true` for `evaluation-projects`, and the resolution was to grow the
 * API rather than to split the seam into `create`/`update`. The reason is a
 * property of that model rather than a preference: the browser mints the paper's
 * id in `createEvaluationProject` before the document has ever been sent, and
 * every edit produces a new WHOLE document through the command layer — so
 * "replace the document at this id" is what the client genuinely does, and `PUT`
 * is the verb whose defined semantics are exactly that. Splitting the seam
 * instead would have added a `create`/`update` distinction to every caller in
 * order to describe a distinction this model does not have, and `LocalStorage-
 * Provider` would have had to implement both as the same line of code.
 */
export type CollectionSurface = {
  /** Path segment under `API_PREFIX`. */
  readonly path: string;
  /** The key the detail payload is nested under: `{ok, data: {project}}`. */
  readonly detailKey: string;
  readonly get: boolean;
  readonly list: boolean;
  readonly put: boolean;
  readonly remove: boolean;
  /**
   * The equality filters this endpoint understands.
   *
   * Enumerated rather than passed through, because the API's query schemas are
   * non-strict: an unknown parameter is stripped, and a list filtered by
   * something the server ignores comes back complete and looks correct. That is
   * the worst available failure, so `ListQuery.where` is checked against this
   * before the request rather than after it.
   */
  readonly filters: readonly string[];
};

/**
 * Five resource modules are mounted; two client collections still have no
 * server representation at all.
 *
 * `evaluation-projects` is the one that mattered — it is the only collection
 * this app writes — and it now has a table, a contract and a route, so
 * `VITE_DATA_PROVIDER=http` can serve the product. `document-versions` and
 * `collections` remain absent, deliberately: nothing in the current app reads
 * either one, and inventing endpoints for them would be a server surface with no
 * caller. Asking for them still raises `UnsupportedOperationError` at the call
 * rather than returning a 404 somebody has to interpret.
 */
export const API_SURFACE: Readonly<
  Partial<Record<CollectionName, CollectionSurface>>
> = Object.freeze({
  /**
   * The A4 papers. The one collection with a write path, and the only surface
   * here whose id comes from the client rather than from the server.
   *
   * `filters` is what `EvaluationProjectRepository` can actually ask for:
   * `listActive` sends `archived`, `listForOwner` sends `ownerId` too, and
   * `listAll` sends neither — which is why the server's `archived` has no
   * default. `discipline` and `grade` are the two projected columns the paper
   * list exists to be narrowed by. Anything absent from this array is refused
   * before the request, because a filter the server strips comes back as a
   * complete list that looks correctly filtered.
   */
  [COLLECTIONS.evaluationProjects]: {
    path: "evaluation-projects",
    detailKey: "evaluationProject",
    get: true,
    list: true,
    put: true,
    remove: true,
    filters: ["ownerId", "archived", "discipline", "grade"],
  },
  [COLLECTIONS.projects]: {
    path: "projects",
    detailKey: "project",
    get: true,
    list: true,
    put: false,
    remove: true,
    filters: ["state", "grade", "subject", "favorite", "archived", "search"],
  },
  [COLLECTIONS.lessonPlans]: {
    // No `GET /lesson-plans`. The only list is `by-project/:projectId`, which
    // `ListQuery` cannot express, so listing is off.
    path: "lesson-plans",
    detailKey: "lessonPlan",
    get: true,
    list: false,
    put: false,
    remove: false,
    filters: [],
  },
  [COLLECTIONS.documents]: {
    path: "documents",
    detailKey: "document",
    get: true,
    list: true,
    put: false,
    remove: false,
    filters: ["projectId", "lessonPlanId", "kind", "status"],
  },
  [COLLECTIONS.resources]: {
    path: "resources",
    detailKey: "resource",
    get: true,
    list: true,
    put: false,
    remove: false,
    filters: ["kind", "status", "projectId", "subject", "grade", "tag"],
  },
});

export type Operation = "get" | "list" | "put" | "remove";

/**
 * The sentence that names the missing server slice.
 *
 * Split out of the error's constructor so the three cases are visibly different
 * rather than a nested ternary: a collection the API has never heard of, a
 * collection whose module offers no whole-record write, and everything else.
 * The middle one is worth its own wording — "no PUT handler" without saying what
 * the module offers instead is what sends someone looking for a routing bug.
 */
function describe(collection: string, operation: Operation): string {
  if (API_SURFACE[collection as CollectionName] === undefined) {
    return (
      `apps/api serves no "${collection}" collection — it has no table, no contract and no route. ` +
      `Add the server slice before selecting the http data provider.`
    );
  }
  if (operation === "put") {
    return (
      `apps/api registers no PUT handler for "${collection}". DataProvider.put is an ` +
      `id-addressed replace, and that module offers POST create with a server-assigned id ` +
      `plus PATCH partial update. Only "evaluation-projects" is written whole at an id the ` +
      `client chose. Use its module's own verbs, or give this one a PUT.`
    );
  }
  return `apps/api serves "${collection}" but not ${operation}. See API_SURFACE in @ludicon/data-access.`;
}

/**
 * Raised when the client asks the API for something the API does not do.
 *
 * Carries the collection and the operation so the message names the missing
 * server slice rather than describing a transport failure. A 404 cannot say
 * "there is no evaluation-projects table"; this can.
 */
export class UnsupportedOperationError extends Error {
  constructor(
    readonly collection: string,
    readonly operation: Operation,
    detail?: string,
  ) {
    super(detail ?? describe(collection, operation));
    this.name = "UnsupportedOperationError";
  }
}

/** Every collection the API can answer for, for a start-up check. */
export const servedCollections = (): readonly string[] =>
  Object.keys(API_SURFACE);

/** The surface for a collection, or the error explaining why there is none. */
export function surfaceFor(
  collection: string,
  operation: Operation,
): CollectionSurface {
  const surface = API_SURFACE[collection as CollectionName];
  if (surface === undefined || surface[operation] === false) {
    throw new UnsupportedOperationError(collection, operation);
  }
  return surface;
}

/**
 * `ListQuery.orderBy` in the vocabulary the API accepts.
 *
 * The server takes `sort=recent|created|title`, not a field and a direction, so
 * only three of the infinitely many orderings a `ListQuery` can express are
 * reachable. Returning `null` for the rest lets the caller refuse loudly; the
 * rejected alternative was to drop the parameter, which is what the previous
 * implementation did and which returns correct-looking rows in the wrong order.
 */
export function toApiSort(field: string, direction: string): string | null {
  if (direction !== "desc" && field !== "title") return null;
  if (field === "updatedAt") return "recent";
  if (field === "createdAt") return "created";
  if (field === "title" && direction === "asc") return "title";
  return null;
}
