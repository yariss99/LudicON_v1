/**
 * Lesson design business rules — including the approval gate.
 *
 * The gate is the product's central invariant: nothing may be generated from a
 * design the teacher has not approved. It is enforced here, in the service
 * layer, so it holds for every caller — the API, the worker, a migration
 * script, a future mobile client — and not merely for the button that happens
 * to be disabled in the interface.
 */
import type {
  ApproveLessonPlanBody,
  UpdateLessonPlanBody,
} from "@ludicon/contracts";
import type {
  CompletionState,
  LessonPlan,
  LessonSectionId,
  PedagogicalBlock,
  Timestamp,
} from "@ludicon/domain";
import {
  BlockId,
  canGenerateMaterials,
  LessonPlanId,
  ProjectId,
  TeacherId,
} from "@ludicon/domain";

import type { AuthContext } from "../../context.js";
import type { Database, Executor } from "../../db/client.js";
import type {
  LessonPlanRow,
  PedagogicalBlockInsert,
  PedagogicalBlockRow,
  ProjectRow,
} from "../../db/schema.js";
import {
  ApprovalRequiredError,
  ConflictError,
  NotFoundError,
} from "../../lib/errors.js";
import type { ProjectService } from "../projects/service.js";
import * as projectRepository from "../projects/repository.js";
import * as repository from "./repository.js";

const toTimestamp = (value: Date): Timestamp => value.toISOString();

/**
 * Expands the stored partial completion map into every section.
 *
 * Written out rather than derived with `Object.fromEntries`, which would need a
 * cast to escape its `{ [k: string]: … }` return type. A section absent from
 * storage is `empty`, which is what the navigator renders for it anyway.
 */
const completionFrom = (
  stored: Partial<Record<LessonSectionId, CompletionState>>,
): Record<LessonSectionId, CompletionState> => ({
  general: stored.general ?? "empty",
  competencies: stored.competencies ?? "empty",
  objectives: stored.objectives ?? "empty",
  sequence: stored.sequence ?? "empty",
  activities: stored.activities ?? "empty",
  resources: stored.resources ?? "empty",
  assessment: stored.assessment ?? "empty",
  reflection: stored.reflection ?? "empty",
  publication: stored.publication ?? "empty",
});

const toBlock = (row: PedagogicalBlockRow): PedagogicalBlock => ({
  id: BlockId.parse(row.id),
  section: row.section,
  title: row.title,
  purpose: row.purpose,
  estimatedMinutes: row.estimatedMinutes,
  objectives: row.objectives,
  competencies: row.competencies,
  strategy: row.strategy,
  resources: row.resources,
  notes: row.notes,
  status: row.status,
  order: row.orderIndex,
});

const toLessonPlan = (
  row: LessonPlanRow,
  blocks: PedagogicalBlockRow[],
): LessonPlan => ({
  id: LessonPlanId.parse(row.id),
  projectId: ProjectId.parse(row.projectId),
  title: row.title,
  subject: row.subject,
  grade: row.grade,
  durationMinutes: row.durationMinutes,
  blocks: blocks.map(toBlock),
  completion: completionFrom(row.completion),
  score: row.score ?? null,
  validation: row.validation ?? null,
  status: row.status,
  version: row.version,
  approvedAt: row.approvedAt === null ? null : toTimestamp(row.approvedAt),
  approvedBy: row.approvedBy === null ? null : TeacherId.parse(row.approvedBy),
  approvalNote: row.approvalNote,
  createdAt: toTimestamp(row.createdAt),
  updatedAt: toTimestamp(row.updatedAt),
});

const toBlockInsert = (
  lessonPlanId: string,
  block: PedagogicalBlock,
): PedagogicalBlockInsert => ({
  id: block.id,
  lessonPlanId,
  section: block.section,
  title: block.title,
  purpose: block.purpose,
  estimatedMinutes: block.estimatedMinutes,
  objectives: block.objectives,
  competencies: block.competencies,
  strategy: block.strategy,
  resources: block.resources,
  notes: block.notes,
  status: block.status,
  orderIndex: block.order,
});

/** What a generation request needs once the gate has been proved open. */
export type ApprovedContext = {
  project: ProjectRow;
  lessonPlan: LessonPlanRow;
};

export type LessonPlanService = ReturnType<typeof createLessonPlanService>;

export const createLessonPlanService = (
  db: Database,
  projects: ProjectService,
) => {
  const loadWithBlocks = async (
    exec: Executor,
    row: LessonPlanRow,
  ): Promise<LessonPlan> =>
    toLessonPlan(row, await repository.listBlocks(exec, row.id));

  /**
   * Loads a design and proves the caller owns the project it belongs to.
   * Ownership lives on the project; the design inherits it.
   */
  const loadOwned = async (
    auth: AuthContext,
    lessonPlanId: string,
  ): Promise<{ row: LessonPlanRow; project: ProjectRow }> => {
    const row = await repository.findLessonPlanById(db, lessonPlanId);
    if (row === null) {
      throw new NotFoundError("lesson plan", lessonPlanId);
    }
    const project = await projects.loadOwned(auth, row.projectId);
    return { row, project };
  };

  return {
    get: async (
      auth: AuthContext,
      lessonPlanId: string,
    ): Promise<LessonPlan> => {
      const { row } = await loadOwned(auth, lessonPlanId);
      return loadWithBlocks(db, row);
    },

    getForProject: async (
      auth: AuthContext,
      projectId: string,
    ): Promise<LessonPlan> => {
      await projects.loadOwned(auth, projectId);
      const row = await repository.findLessonPlanByProjectId(db, projectId);
      if (row === null) {
        throw new NotFoundError("lesson plan for project", projectId);
      }
      return loadWithBlocks(db, row);
    },

    /**
     * Applies a patch under optimistic concurrency.
     *
     * A client that sends the `version` it last read gets a `CONFLICT` if the
     * design moved underneath it, rather than silently overwriting a
     * co-teacher's edit. Blocks are replaced wholesale inside the same
     * transaction as the design row, so the canvas can never be half-written.
     */
    update: async (
      auth: AuthContext,
      lessonPlanId: string,
      patch: UpdateLessonPlanBody,
    ): Promise<LessonPlan> => {
      const { row } = await loadOwned(auth, lessonPlanId);

      if (patch.version !== undefined && patch.version !== row.version) {
        throw new ConflictError("lesson plan version is stale", {
          context: {
            lessonPlanId,
            expected: row.version,
            received: patch.version,
          },
        });
      }

      return db.transaction(async (tx) => {
        const updated = await repository.updateLessonPlan(tx, lessonPlanId, {
          ...(patch.title === undefined ? {} : { title: patch.title }),
          ...(patch.subject === undefined ? {} : { subject: patch.subject }),
          ...(patch.grade === undefined ? {} : { grade: patch.grade }),
          ...(patch.durationMinutes === undefined
            ? {}
            : { durationMinutes: patch.durationMinutes }),
          ...(patch.completion === undefined
            ? {}
            : { completion: patch.completion }),
          ...(patch.score === undefined ? {} : { score: patch.score ?? null }),
          ...(patch.validation === undefined
            ? {}
            : { validation: patch.validation ?? null }),
          ...(patch.status === undefined ? {} : { status: patch.status }),
          version: row.version + 1,
        });
        if (updated === null) {
          throw new NotFoundError("lesson plan", lessonPlanId);
        }

        const blocks =
          patch.blocks === undefined
            ? await repository.listBlocks(tx, lessonPlanId)
            : await repository.replaceBlocks(
                tx,
                lessonPlanId,
                patch.blocks.map((block) => toBlockInsert(lessonPlanId, block)),
              );

        return toLessonPlan(updated, blocks);
      });
    },

    /**
     * The approval gate opening.
     *
     * Approval is a transition, not a field write: it stamps the design, moves
     * the project into `approved`, and records who did it — all in one
     * transaction, because a project in `approved` state whose design has no
     * `approvedAt` would be a project that can generate without authority.
     *
     * Approving twice is a no-op rather than an error: the teacher's intent is
     * already satisfied, and a duplicate click should not read as a failure.
     */
    approve: async (
      auth: AuthContext,
      lessonPlanId: string,
      body: ApproveLessonPlanBody,
    ): Promise<{ lessonPlan: LessonPlan; project: ProjectRow }> => {
      const { row, project } = await loadOwned(auth, lessonPlanId);

      if (row.approvedAt !== null) {
        return { lessonPlan: await loadWithBlocks(db, row), project };
      }

      return db.transaction(async (tx) => {
        const approvedAt = new Date();
        const updated = await repository.updateLessonPlan(tx, lessonPlanId, {
          approvedAt,
          approvedBy: auth.userId,
          approvalNote: body.note ?? null,
          status: "ready",
          version: row.version + 1,
        });
        if (updated === null) {
          throw new NotFoundError("lesson plan", lessonPlanId);
        }

        const movedProject = await projectRepository.updateProject(
          tx,
          project.id,
          {
            state: "approved",
          },
        );
        if (movedProject === null) {
          throw new NotFoundError("project", project.id);
        }

        return {
          lessonPlan: toLessonPlan(
            updated,
            await repository.listBlocks(tx, lessonPlanId),
          ),
          project: movedProject,
        };
      });
    },

    /**
     * The gate itself, as a precondition other services call.
     *
     * Two independent facts must both hold: the project's state must permit
     * generation (`canGenerateMaterials`, from the domain) and the design must
     * actually carry an approval stamp. Checking only the state would let a
     * corrupted or hand-edited row generate; checking only the stamp would
     * ignore an archived or reverted project.
     */
    requireApprovedForGeneration: async (
      auth: AuthContext,
      projectId: string,
    ): Promise<ApprovedContext> => {
      const project = await projects.loadOwned(auth, projectId);
      const lessonPlan = await repository.findLessonPlanByProjectId(
        db,
        projectId,
      );

      if (lessonPlan === null || lessonPlan.approvedAt === null) {
        throw new ApprovalRequiredError(projectId, lessonPlan?.id ?? null);
      }
      if (!canGenerateMaterials(project.state)) {
        throw new ApprovalRequiredError(projectId, lessonPlan.id);
      }

      return { project, lessonPlan };
    },
  };
};
