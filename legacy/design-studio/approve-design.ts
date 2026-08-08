import { COLLECTIONS } from "@ludicon/data-access";
import {
  approveLessonPlan,
  LessonPlan,
  nowTimestamp,
  Project,
  type ProjectId,
} from "@ludicon/domain";

import { dataProvider } from "../../lib/data";

export type ApprovalRequest = {
  plan: LessonPlan;
  projectId: ProjectId;
  /** The teacher's own words, kept with the approval. Empty means none. */
  note: string;
};

export type ApprovalResult = {
  plan: LessonPlan;
  project: Project;
};

/**
 * The approval gate, as a single act.
 *
 * Both halves move together or neither does. Approval used to happen as a side
 * effect of pressing the button that navigated onward — the teacher was never
 * asked, and if the project write failed after the plan write had landed, the
 * design said "approved" while the project still said "in design": two answers
 * to the one question the whole downstream chain asks.
 *
 * `approvedBy` is the project's own owner. There is no separate session
 * identity to invent: the teacher who owns the project is the teacher at the
 * keyboard, and when sign-in arrives this reads the same field.
 */
export function approveDesign({
  plan,
  projectId,
  note,
}: ApprovalRequest): Promise<ApprovalResult> {
  return dataProvider.transact(async (tx) => {
    const project = await tx.get(COLLECTIONS.projects, projectId, Project);
    if (project === null) {
      throw new Error(`project ${projectId} not found`);
    }

    const trimmed = note.trim();
    const approved = approveLessonPlan(plan, {
      at: nowTimestamp(),
      by: project.ownerId,
      ...(trimmed.length === 0 ? {} : { note: trimmed }),
    });

    const savedPlan = await tx.put(
      COLLECTIONS.lessonPlans,
      approved.id,
      approved,
      LessonPlan,
    );

    const opened: Project = {
      ...project,
      state: "approved",
      updatedAt: approved.updatedAt,
    };
    const savedProject = await tx.put(
      COLLECTIONS.projects,
      project.id,
      opened,
      Project,
    );

    return { plan: savedPlan, project: savedProject };
  });
}
