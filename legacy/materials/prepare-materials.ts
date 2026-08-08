import { COLLECTIONS } from "@ludicon/data-access";
import {
  AnyDocument,
  AnyVersion,
  ASSET_KIND_LABEL,
  nowTimestamp,
  Project,
  Resource,
  ResourceId,
  withPlannedKinds,
  type LessonPlan,
} from "@ludicon/domain";

import { dataProvider } from "../../lib/data";
import { buildVersion, newDocumentId } from "../../lib/documents";
import { BUILDERS } from "../builder/registry";
import type { BuilderKind } from "../builder/types";
import { MATERIALS_COPY } from "./copy";

export type PrepareRequest = {
  plan: LessonPlan;
  project: Project;
  kinds: readonly BuilderKind[];
};

/**
 * Turns approved intent into real materials.
 *
 * Each chosen kind becomes an actual `Document` — envelope plus the per-kind
 * body its builder knows how to edit — so the next click opens the thing that
 * was just made. This used to write `Resource` rows only, which meant the
 * builder, whose whole job is to open a `Document`, had nothing to open: the
 * last link of the chain pointed at a record type nothing in the app created.
 *
 * Everything lands in one unit of work:
 *   - the document
 *   - its first version snapshot, so history starts at the beginning rather
 *     than at the teacher's first edit
 *   - a library entry carrying `documentId`, so the shelf points at the
 *     artifact instead of describing a second one
 *   - the project's own state and material plan
 */
export function prepareMaterials({
  plan,
  project,
  kinds,
}: PrepareRequest): Promise<AnyDocument[]> {
  return dataProvider.transact(async (tx) => {
    const at = nowTimestamp();
    const created: AnyDocument[] = [];

    for (const kind of kinds) {
      const document: AnyDocument = {
        id: newDocumentId(),
        projectId: project.id,
        lessonPlanId: plan.id,
        kind,
        status: "draft",
        version: 0,
        title: `${ASSET_KIND_LABEL[kind]} — ${plan.title}`,
        subject: plan.subject,
        grade: plan.grade,
        validation: null,
        createdAt: at,
        updatedAt: at,
        publishedAt: null,
        // The teacher asked for it, from a design they approved. Nothing here
        // was decided on their behalf.
        createdBy: "teacher",
        body: BUILDERS[kind].createBody(),
      };

      const saved = await tx.put(
        COLLECTIONS.documents,
        document.id,
        document,
        AnyDocument,
      );

      const snapshot = buildVersion(saved, MATERIALS_COPY.versionNoteCreated);
      await tx.put(
        COLLECTIONS.documentVersions,
        snapshot.id,
        snapshot,
        AnyVersion,
      );

      const entry: Resource = {
        id: ResourceId.parse(crypto.randomUUID()),
        ownerId: project.ownerId,
        projectId: project.id,
        documentId: saved.id,
        kind,
        title: saved.title,
        summary: MATERIALS_COPY.shelfSummary(plan.title),
        subject: plan.subject,
        grade: plan.grade,
        tags: [],
        status: "draft",
        openedAt: null,
        reuseCount: 0,
        createdAt: at,
        updatedAt: at,
      };
      await tx.put(COLLECTIONS.resources, entry.id, entry, Resource);

      created.push(saved);
    }

    const next: Project = {
      ...project,
      state: "materials_ready",
      plannedMaterials: withPlannedKinds(project, kinds),
      updatedAt: at,
    };
    await tx.put(COLLECTIONS.projects, next.id, next, Project);

    return created;
  });
}
