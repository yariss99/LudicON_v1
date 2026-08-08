/**
 * Drizzle queries for lesson designs and their pedagogical blocks.
 */
import { asc, eq } from "drizzle-orm";

import type { Executor } from "../../db/client.js";
import {
  lessonPlans,
  type LessonPlanInsert,
  type LessonPlanRow,
  pedagogicalBlocks,
  type PedagogicalBlockInsert,
  type PedagogicalBlockRow,
} from "../../db/schema.js";

export const findLessonPlanById = async (
  exec: Executor,
  id: string,
): Promise<LessonPlanRow | null> => {
  const [row] = await exec
    .select()
    .from(lessonPlans)
    .where(eq(lessonPlans.id, id))
    .limit(1);
  return row ?? null;
};

/** One design per project, guaranteed by `lesson_plans_project_id_key`. */
export const findLessonPlanByProjectId = async (
  exec: Executor,
  projectId: string,
): Promise<LessonPlanRow | null> => {
  const [row] = await exec
    .select()
    .from(lessonPlans)
    .where(eq(lessonPlans.projectId, projectId))
    .limit(1);
  return row ?? null;
};

export const insertLessonPlan = async (
  exec: Executor,
  values: LessonPlanInsert,
): Promise<LessonPlanRow> => {
  const [row] = await exec.insert(lessonPlans).values(values).returning();
  if (row === undefined) {
    throw new Error("lesson plan insert returned no row");
  }
  return row;
};

export const updateLessonPlan = async (
  exec: Executor,
  id: string,
  patch: Partial<LessonPlanInsert>,
): Promise<LessonPlanRow | null> => {
  const [row] = await exec
    .update(lessonPlans)
    .set(patch)
    .where(eq(lessonPlans.id, id))
    .returning();
  return row ?? null;
};

/** Canvas order, so the caller never has to re-sort. */
export const listBlocks = async (
  exec: Executor,
  lessonPlanId: string,
): Promise<PedagogicalBlockRow[]> =>
  exec
    .select()
    .from(pedagogicalBlocks)
    .where(eq(pedagogicalBlocks.lessonPlanId, lessonPlanId))
    .orderBy(asc(pedagogicalBlocks.section), asc(pedagogicalBlocks.orderIndex));

/**
 * Replaces the whole block set.
 *
 * The canvas is edited as a whole — blocks are added, reordered and moved
 * between sections in one gesture — so a diff would be more code and more ways
 * to be wrong than a delete-and-insert. Callers must supply a transaction; run
 * outside one, the delete could commit without the insert.
 */
export const replaceBlocks = async (
  exec: Executor,
  lessonPlanId: string,
  blocks: PedagogicalBlockInsert[],
): Promise<PedagogicalBlockRow[]> => {
  await exec
    .delete(pedagogicalBlocks)
    .where(eq(pedagogicalBlocks.lessonPlanId, lessonPlanId));
  if (blocks.length === 0) {
    return [];
  }
  return exec.insert(pedagogicalBlocks).values(blocks).returning();
};
