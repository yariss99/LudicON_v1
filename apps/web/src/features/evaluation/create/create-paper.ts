import { nowTimestamp, TeacherId } from "@ludicon/domain";
import type { Discipline, GradeLevel } from "@ludicon/domain";
import {
  createEvaluationProject,
  type EvaluationProject,
} from "@ludicon/evaluation";

import { repositories } from "../../../lib/data";

/**
 * Owner of everything created locally.
 *
 * Sign-in exists in this shell but `auth/session.ts` deliberately exposes only
 * whether a teacher is signed in, not who they are — the guard needs three
 * states and nothing else. `EvaluationProject.ownerId` is not optional, so a
 * single named constant is more honest than a fabricated per-session identity,
 * and it is the one line to change when the API starts issuing real ids.
 * `legacy/create-experience-flow/start-experience.ts` made the same call.
 */
const LOCAL_TEACHER = TeacherId.parse("local-teacher");

export interface NewPaper {
  readonly title: string;
  readonly description: string;
  readonly discipline: Discipline;
  readonly grade: GradeLevel;
  readonly durationMinutes: number;
}

/**
 * Builds the paper and writes it, in that order and nothing between.
 *
 * `newId` is injected because the model package cannot reach `crypto` — see its
 * `model/factory.ts`. Every id in the new document therefore comes from one
 * generator, which is what lets undo restore a removed subtree under the ids
 * the rest of the document still names.
 *
 * A plain `save`, not a `transact`: this writes one record, and the local
 * provider's transaction snapshots the entire keyspace to be able to roll back.
 * There is nothing here for it to roll back across.
 */
export async function createPaper(input: NewPaper): Promise<EvaluationProject> {
  const paper = createEvaluationProject({
    ownerId: LOCAL_TEACHER,
    createdAt: nowTimestamp(),
    newId: () => crypto.randomUUID(),
    meta: {
      title: input.title.trim(),
      description: input.description.trim(),
      discipline: input.discipline,
      grade: input.grade,
      durationMinutes: input.durationMinutes,
    },
  });

  return repositories.evaluationProjects.save(paper);
}
