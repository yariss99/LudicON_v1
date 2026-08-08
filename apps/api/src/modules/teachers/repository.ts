/**
 * The local teacher projection.
 *
 * Every owned row has a foreign key to `teachers`, so the row must exist before
 * a teacher's first write. Clerk owns the identity; this keeps a local
 * placeholder in step with it so referential integrity is real rather than
 * advisory.
 */
import { eq } from "drizzle-orm";

import type { Executor } from "../../db/client.js";
import { teachers, type TeacherRow } from "../../db/schema.js";

export type EnsureTeacherInput = {
  id: string;
  organizationId: string | null;
};

/**
 * Idempotent upsert. Safe to call on every write path: on conflict it only
 * refreshes the organization, so a teacher switching schools is reflected
 * without a second round trip to Clerk.
 */
export const ensureTeacher = async (
  exec: Executor,
  input: EnsureTeacherInput,
): Promise<TeacherRow> => {
  const [row] = await exec
    .insert(teachers)
    .values({ id: input.id, organizationId: input.organizationId })
    .onConflictDoUpdate({
      target: teachers.id,
      set: { organizationId: input.organizationId, updatedAt: new Date() },
    })
    .returning();

  if (row === undefined) {
    // `onConflictDoUpdate` always returns a row; an empty result would mean the
    // statement was silently skipped, which is not a state we want to continue from.
    throw new Error(`teacher upsert returned no row for ${input.id}`);
  }
  return row;
};

export const findTeacherById = async (
  exec: Executor,
  id: string,
): Promise<TeacherRow | null> => {
  const [row] = await exec
    .select()
    .from(teachers)
    .where(eq(teachers.id, id))
    .limit(1);
  return row ?? null;
};
