import {
  AnyDocument,
  AnyVersion,
  archiveProject,
  Collection,
  LessonPlan,
  nowTimestamp,
  Project,
  ProjectId,
  Resource,
  restoreProject,
} from "@ludicon/domain";
import {
  archiveEvaluation,
  EvaluationProject,
  restoreEvaluation,
  type EvaluationProjectId,
} from "@ludicon/evaluation";
import { removeDocument, removeProject } from "./cascade.js";
import { COLLECTIONS } from "./collections.js";
import type { DataProvider } from "./provider.js";
import { createRepository, type Repository } from "./repository.js";

/**
 * Concrete repositories, bound to domain schemas.
 *
 * The cascades live next door in `cascade.ts`: they reach across collections
 * rather than working within one, which is a different job from what a
 * repository does.
 *
 * Where a record owns others, `remove` IS the cascade — there is no second,
 * shallower delete sitting beside it. That is the correction of a real failure:
 * this file used to offer `deleteWithContents` alongside the inherited `remove`,
 * and the one caller in the studio reached for `remove`, orphaning every lesson
 * plan, document, version snapshot and library row the project owned. A correct
 * method that has to be chosen over an incorrect one on the same object is a
 * trap, not an affordance, so the incorrect one no longer exists.
 */
export type ProjectRepository = Repository<Project> & {
  listForOwner(ownerId: string): Promise<Project[]>;
  listActive(): Promise<Project[]>;
  listArchived(): Promise<Project[]>;
  /** Put away, keeping everything the project owns. Reversible. */
  archive(projectId: ProjectId): Promise<Project | null>;
  restore(projectId: ProjectId): Promise<Project | null>;
};

/**
 * The papers.
 *
 * `remove` is inherited unchanged, and unlike `ProjectRepository`'s it needs no
 * cascade — which is a property of the model rather than an oversight. An
 * evaluation document owns everything it contains INSIDE its own record: pages,
 * sections, blocks and the barem are fields, not rows in other collections, and
 * no other collection carries an `EvaluationProjectId`. Deleting the record
 * therefore leaves nothing addressable behind. If that ever stops being true —
 * the first time a paper's images live in their own collection, say — this is
 * the comment that has to be revisited, and `removeProject` next door is the
 * shape the replacement takes.
 */
export type EvaluationProjectRepository = Repository<EvaluationProject> & {
  listForOwner(ownerId: string): Promise<EvaluationProject[]>;
  listActive(): Promise<EvaluationProject[]>;
  /** Archived ones included — the list page has to be able to show the archive. */
  listAll(): Promise<EvaluationProject[]>;
  /**
   * Put away, reversibly.
   *
   * On the repository rather than at the gesture, because both directions have
   * to go through the model's transitions: `archived` and `archivedAt` are two
   * fields that must agree, and the studio's previous version wrote the first
   * one by hand and left the second `null` forever. A transition cannot be
   * half-applied; a spread can.
   */
  archive(id: EvaluationProjectId): Promise<EvaluationProject | null>;
  restore(id: EvaluationProjectId): Promise<EvaluationProject | null>;
};

export type Repositories = {
  projects: ProjectRepository;
  evaluationProjects: EvaluationProjectRepository;
  lessonPlans: Repository<LessonPlan> & {
    findByProject(projectId: ProjectId): Promise<LessonPlan | null>;
  };
  /**
   * `remove` takes the version snapshots and the library entry that points at
   * the document with it. Leaving either behind would leave the teacher with a
   * shelf entry that opens nothing.
   */
  documents: Repository<AnyDocument> & {
    listForProject(projectId: ProjectId): Promise<AnyDocument[]>;
  };
  documentVersions: Repository<AnyVersion> & {
    listForProject(projectId: ProjectId): Promise<AnyVersion[]>;
    listForDocument(documentId: string): Promise<AnyVersion[]>;
  };
  resources: Repository<Resource> & {
    listForProject(projectId: ProjectId): Promise<Resource[]>;
  };
  collections: Repository<Collection>;
};

export function createRepositories(provider: DataProvider): Repositories {
  const projects = createRepository(provider, {
    collection: COLLECTIONS.projects,
    schema: Project,
    getId: (project) => project.id,
  });

  const evaluationProjects = createRepository(provider, {
    collection: COLLECTIONS.evaluationProjects,
    schema: EvaluationProject,
    getId: (paper) => paper.id,
  });

  const lessonPlans = createRepository(provider, {
    collection: COLLECTIONS.lessonPlans,
    schema: LessonPlan,
    getId: (plan) => plan.id,
  });

  const documents = createRepository(provider, {
    collection: COLLECTIONS.documents,
    schema: AnyDocument,
    getId: (document) => document.id,
  });

  const documentVersions = createRepository(provider, {
    collection: COLLECTIONS.documentVersions,
    schema: AnyVersion,
    getId: (version) => version.id,
  });

  const resources = createRepository(provider, {
    collection: COLLECTIONS.resources,
    schema: Resource,
    getId: (resource) => resource.id,
  });

  const collections = createRepository(provider, {
    collection: COLLECTIONS.collections,
    schema: Collection,
    getId: (collection) => collection.id,
  });

  const setArchived = async (
    projectId: ProjectId,
    archived: boolean,
  ): Promise<Project | null> => {
    const current = await projects.get(projectId);
    if (current === null) return null;
    const at = nowTimestamp();
    return projects.save(
      archived ? archiveProject(current, at) : restoreProject(current, at),
    );
  };

  /**
   * Read-modify-write through the model's transition, inside a transaction.
   *
   * `patch` re-reads the stored record rather than spreading the copy the caller
   * is holding, so putting a paper away cannot silently roll back an edit made
   * in another tab since the list was rendered.
   */
  const setPaperArchived = async (
    id: EvaluationProjectId,
    archived: boolean,
  ): Promise<EvaluationProject | null> => {
    const current = await evaluationProjects.get(id);
    if (current === null) return null;
    return evaluationProjects.patch(id, (stored) => {
      const at = nowTimestamp();
      return archived
        ? archiveEvaluation(stored, at)
        : restoreEvaluation(stored, at);
    });
  };

  const byRecent = { field: "updatedAt", direction: "desc" } as const;

  return {
    projects: {
      ...projects,
      listForOwner: (ownerId) =>
        projects.list({
          where: { ownerId, archived: false },
          orderBy: byRecent,
        }),
      listActive: () =>
        projects.list({ where: { archived: false }, orderBy: byRecent }),
      listArchived: () =>
        projects.list({ where: { archived: true }, orderBy: byRecent }),

      archive: (projectId) => setArchived(projectId, true),
      restore: (projectId) => setArchived(projectId, false),

      /**
       * The only delete, and it cascades.
       *
       * `ProjectId.parse` rather than a cast: `Repository<T>.remove` is declared
       * over `string` because the generic factory cannot know the brand, and
       * this is the boundary where a string becomes an id. It is a 1..128 length
       * check, which is exactly what an id read out of a URL deserves.
       */
      remove: async (id) => {
        await provider.transact((tx) => removeProject(tx, ProjectId.parse(id)));
      },
    },

    evaluationProjects: {
      ...evaluationProjects,
      listForOwner: (ownerId) =>
        evaluationProjects.list({
          where: { ownerId, archived: false },
          orderBy: byRecent,
        }),
      listActive: () =>
        evaluationProjects.list({
          where: { archived: false },
          orderBy: byRecent,
        }),
      listAll: () => evaluationProjects.list({ orderBy: byRecent }),

      archive: (id) => setPaperArchived(id, true),
      restore: (id) => setPaperArchived(id, false),
    },

    lessonPlans: {
      ...lessonPlans,
      async findByProject(projectId) {
        // One plan per project today. Returning the most recent keeps the
        // call site honest if that ever stops being true.
        const matches = await lessonPlans.list({
          where: { projectId },
          orderBy: { field: "updatedAt", direction: "desc" },
        });
        return matches[0] ?? null;
      },
    },

    documents: {
      ...documents,
      listForProject: (projectId) =>
        documents.list({ where: { projectId }, orderBy: byRecent }),

      /** The only delete, and it cascades — see `ProjectRepository` above. */
      remove: async (id) => {
        await provider.transact((tx) => removeDocument(tx, id));
      },
    },

    documentVersions: {
      ...documentVersions,
      listForProject: (projectId) =>
        documentVersions.list({
          where: { projectId },
          orderBy: { field: "createdAt", direction: "desc" },
        }),
      listForDocument: (documentId) =>
        documentVersions.list({
          where: { documentId },
          orderBy: { field: "version", direction: "desc" },
        }),
    },

    resources: {
      ...resources,
      listForProject: (projectId) =>
        resources.list({
          where: { projectId },
          orderBy: { field: "updatedAt", direction: "desc" },
        }),
    },

    collections,
  };
}
