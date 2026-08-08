import type {
  DocumentId,
  LessonPlanId,
  ProjectId,
  ResourceId,
} from "@ludicon/domain";
import type { EvaluationProjectId } from "@ludicon/evaluation";

/**
 * Query key factory.
 *
 * One hierarchy, so invalidation is predictable: invalidating `projects.all()`
 * necessarily covers every list and detail key beneath it, because they share
 * its prefix. Hand-written key arrays scattered across features are the usual
 * cause of "why didn't my cache update" bugs.
 *
 * Keys are `as const` so TanStack Query's `DataTag` inference works and
 * `queryClient.setQueryData` stays typed at the call site.
 *
 * Every id parameter is BRANDED rather than `string`. A key factory whose
 * parameters are all `string` accepts any id for any entity, and the mistake is
 * invisible in review and at runtime — every id in this product is a random
 * UUID, so a key built from the wrong one is a perfectly plausible cache entry
 * that simply never matches the fetcher that fills it. Branding costs nothing at
 * runtime and turns that class of bug into a compile error. It is also why
 * `documents.versions` below could be split honestly: once the parameter has a
 * type, "versions of what" has an answer.
 */
export const queryKeys = {
  projects: {
    all: () => ["projects"] as const,
    list: (filters?: Readonly<Record<string, unknown>>) =>
      ["projects", "list", filters ?? {}] as const,
    detail: (projectId: ProjectId) =>
      ["projects", "detail", projectId] as const,
  },

  /**
   * The evaluation papers.
   *
   * The prefix is the collection name rather than `"projects"`, so invalidating
   * the old library never touches a paper the teacher is editing — the two are
   * different records and a shared prefix would make one a cache dependency of
   * the other for no reason.
   */
  evaluationProjects: {
    all: () => ["evaluation-projects"] as const,
    /**
     * Every list, whatever its filters — the key to invalidate after a write.
     *
     * `all()` would also work and would additionally refetch the paper the
     * teacher is editing, which autosave has just written into the cache by
     * hand. Refetching it costs a `JSON.parse` of the whole document on every
     * keystroke-plus-700ms, to arrive at the value already there.
     */
    lists: () => ["evaluation-projects", "list"] as const,
    list: (filters?: Readonly<Record<string, unknown>>) =>
      ["evaluation-projects", "list", filters ?? {}] as const,
    detail: (evaluationProjectId: EvaluationProjectId) =>
      ["evaluation-projects", "detail", evaluationProjectId] as const,
  },

  lessonPlans: {
    all: () => ["lesson-plans"] as const,
    detail: (lessonPlanId: LessonPlanId) =>
      ["lesson-plans", "detail", lessonPlanId] as const,
    byProject: (projectId: ProjectId) =>
      ["lesson-plans", "by-project", projectId] as const,
  },

  documents: {
    all: () => ["documents"] as const,
    list: (projectId: ProjectId, filters?: Readonly<Record<string, unknown>>) =>
      ["documents", "list", projectId, filters ?? {}] as const,
    detail: (documentId: DocumentId) =>
      ["documents", "detail", documentId] as const,

    /**
     * Version history, split by what the id names.
     *
     * There used to be one `versions(documentId: string)` here, and it was
     * called with a `ProjectId` in one place and a `DocumentId` in another. Both
     * compiled, both produced a three-element array, and both were cached under
     * a key that read identically — so the project-wide history and one
     * document's history occupied the same entry whenever a project id and a
     * document id happened to be compared. Nothing ever went wrong because the
     * ids are random UUIDs and never collide, which is precisely what made it a
     * latent bug rather than a visible one.
     *
     * Two keys with two branded parameters. They keep the `documents` prefix, so
     * `documents.all()` still invalidates both, which is the behaviour the one
     * key had and the only part of it worth keeping.
     */
    versionsOfDocument: (documentId: DocumentId) =>
      ["documents", "versions", "by-document", documentId] as const,
    versionsOfProject: (projectId: ProjectId) =>
      ["documents", "versions", "by-project", projectId] as const,
  },

  resources: {
    all: () => ["resources"] as const,
    list: (filters?: Readonly<Record<string, unknown>>) =>
      ["resources", "list", filters ?? {}] as const,
    detail: (resourceId: ResourceId) =>
      ["resources", "detail", resourceId] as const,
    search: (term: string) => ["resources", "search", term] as const,
  },

  collections: {
    all: () => ["collections"] as const,
    list: () => ["collections", "list"] as const,
  },
} as const;
