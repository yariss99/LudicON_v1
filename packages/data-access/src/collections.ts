/**
 * Storage collection names, declared exactly once.
 *
 * The pre-refactor tree had 48 storage key strings spread across 31 files,
 * including one key (`prima.studio.activeProject`) duplicated as a raw literal
 * in two different features with no shared constant.
 */
export const COLLECTIONS = {
  projects: "projects",
  /**
   * The A4 evaluation papers, stored apart from `projects`.
   *
   * A separate collection rather than a new shape inside `projects`: the two
   * schemas share only an id and an owner, and reading one as the other would
   * fail validation on every stored record. Keeping them apart is also what
   * lets the old collection be retired on its own schedule instead of forcing
   * a migration that has no honest mapping — see `local-storage-provider.ts`.
   */
  evaluationProjects: "evaluation-projects",
  lessonPlans: "lesson-plans",
  documents: "documents",
  documentVersions: "document-versions",
  resources: "resources",
  collections: "collections",
} as const;

export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];
