import {
  ASSET_KIND_LABEL,
  GRADE_LEVEL_LABEL,
  LessonPlanId,
  nowTimestamp,
  ProjectId,
  TeacherId,
  type GradeLevel,
  type LessonPlan,
  type Project,
} from "@ludicon/domain";

import { repositories } from "../../lib/data";
import { assetKindFor, type MaterialKind } from "./material-kinds";
import { readIntent } from "./read-intent";

/**
 * Owner of everything created locally.
 *
 * Sign-in is not wired into this shell yet (no publishable key, no provider in
 * `main.tsx`), and `Project.ownerId` is not optional. A single named constant
 * is more honest than a fabricated per-session identity, and it is the one
 * place to change when Clerk arrives.
 */
const LOCAL_TEACHER = TeacherId.parse("local-teacher");

export interface ExperienceDraft {
  kind: MaterialKind;
  description: string;
  subject: string;
  grade: GradeLevel;
  durationMinutes: number;
}

/**
 * What the project is called from now on.
 *
 * The topic alone. The kind used to be glued on as `"Fișă de lucru: <topic>"`,
 * which made the title the only place the choice was recorded — every surface
 * that wanted to know what the project was for had to read it back out of a
 * string. It is `Project.intendedKind` now, so the name can just be the name.
 */
function composeTitle(kind: MaterialKind, topic: string): string {
  return topic.length > 0 ? topic : ASSET_KIND_LABEL[assetKindFor(kind)];
}

/**
 * Creates the project and its lesson design as one unit.
 *
 * Subject, grade and duration come from the teacher's confirmation on the
 * last step rather than from a guess, so nothing here has to be corrected
 * later. The teacher's own sentence is kept verbatim as the description.
 */
export async function startExperience(
  draft: ExperienceDraft,
): Promise<LessonPlan> {
  const reading = readIntent(draft.description);
  const timestamp = nowTimestamp();
  const title = composeTitle(draft.kind, reading.topic);
  const subject = draft.subject.trim();
  const intendedKind = assetKindFor(draft.kind);

  const project: Project = {
    id: ProjectId.parse(crypto.randomUUID()),
    ownerId: LOCAL_TEACHER,
    title,
    description: draft.description.trim(),
    subject,
    grade: draft.grade,
    intendedKind,
    // What the teacher came here to make is already the first thing the
    // materials step will offer, so the choice survives the walk through the
    // design instead of being asked again.
    plannedMaterials:
      intendedKind === "lesson_plan"
        ? []
        : [{ kind: intendedKind, selected: true }],
    color: reading.color,
    state: "design",
    favorite: false,
    archived: false,
    archivedAt: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  const plan: LessonPlan = {
    id: LessonPlanId.parse(crypto.randomUUID()),
    projectId: project.id,
    title,
    subject,
    grade: GRADE_LEVEL_LABEL[draft.grade],
    durationMinutes: draft.durationMinutes,
    blocks: [],
    completion: {},
    score: null,
    validation: null,
    status: "draft",
    version: 0,
    approvedAt: null,
    approvedBy: null,
    approvalNote: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  await repositories.projects.save(project);
  return repositories.lessonPlans.save(plan);
}
