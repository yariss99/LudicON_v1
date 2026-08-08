import {
  AnyDocument,
  AnyVersion,
  Collection,
  LessonPlan,
  nowTimestamp,
  Resource,
  type ProjectId,
} from "@ludicon/domain";
import { COLLECTIONS } from "./collections.js";
import type { DataProvider } from "./provider.js";

/** What a cascading delete actually removed, so the interface can say so. */
export type ProjectRemoval = {
  lessonPlans: number;
  documents: number;
  versions: number;
  resources: number;
};

export async function removeDocument(
  tx: DataProvider,
  documentId: string,
): Promise<void> {
  const [versions, shelfEntries] = await Promise.all([
    tx.list(COLLECTIONS.documentVersions, AnyVersion, {
      where: { documentId },
    }),
    tx.list(COLLECTIONS.resources, Resource, { where: { documentId } }),
  ]);

  for (const version of versions) {
    await tx.remove(COLLECTIONS.documentVersions, version.id);
  }
  for (const entry of shelfEntries) {
    await tx.remove(COLLECTIONS.resources, entry.id);
  }
  await forgetResources(
    tx,
    shelfEntries.map((entry) => entry.id),
  );
  await tx.remove(COLLECTIONS.documents, documentId);
}

/**
 * The cascade itself, inside one unit of work.
 *
 * Order matters only for readability — the transaction either lands whole or
 * is rolled back whole — but it reads outside-in: the things that reference
 * others go first, the project last.
 */
export async function removeProject(
  tx: DataProvider,
  projectId: ProjectId,
): Promise<ProjectRemoval> {
  const where = { projectId };

  const [plans, docs, versions, shelfEntries] = await Promise.all([
    tx.list(COLLECTIONS.lessonPlans, LessonPlan, { where }),
    tx.list(COLLECTIONS.documents, AnyDocument, { where }),
    tx.list(COLLECTIONS.documentVersions, AnyVersion, { where }),
    tx.list(COLLECTIONS.resources, Resource, { where }),
  ]);

  for (const version of versions) {
    await tx.remove(COLLECTIONS.documentVersions, version.id);
  }
  for (const document of docs) {
    await tx.remove(COLLECTIONS.documents, document.id);
  }
  for (const entry of shelfEntries) {
    await tx.remove(COLLECTIONS.resources, entry.id);
  }
  for (const plan of plans) {
    await tx.remove(COLLECTIONS.lessonPlans, plan.id);
  }

  await forgetResources(
    tx,
    shelfEntries.map((entry) => entry.id),
  );
  await tx.remove(COLLECTIONS.projects, projectId);

  return {
    lessonPlans: plans.length,
    documents: docs.length,
    versions: versions.length,
    resources: shelfEntries.length,
  };
}

/**
 * Drops removed ids out of every shelf that held them.
 *
 * `Collection.resourceIds` is an id list rather than a foreign key, so nothing
 * else would notice the resources were gone — the shelf would simply show one
 * fewer item than it counted.
 */
async function forgetResources(
  tx: DataProvider,
  removed: readonly string[],
): Promise<void> {
  if (removed.length === 0) return;
  const gone = new Set<string>(removed);

  const shelves = await tx.list(COLLECTIONS.collections, Collection);
  for (const shelf of shelves) {
    const kept = shelf.resourceIds.filter((id) => !gone.has(id));
    if (kept.length === shelf.resourceIds.length) continue;
    await tx.put(
      COLLECTIONS.collections,
      shelf.id,
      { ...shelf, resourceIds: kept, updatedAt: nowTimestamp() },
      Collection,
    );
  }
}
