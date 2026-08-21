import { ASSESSMENT_SECTION_GROUPS } from "../constants";
import type {
  AssessmentDocument,
  AssessmentSectionId,
  AssessmentStageId,
  AssessmentStageStatus,
} from "../types";

/**
 * Workflow presentation layer.
 * Every signal is read from fields that already exist on the document —
 * nothing here is persisted, and no completion is inferred that the data
 * does not genuinely support.
 */

export type WorkflowStage = {
  readonly id: AssessmentStageId;
  readonly label: string;
  readonly hint: string;
  readonly index: number;
  readonly status: AssessmentStageStatus;
  readonly isCurrent: boolean;
  readonly entrySectionId: AssessmentSectionId;
};

/** A command the builder already exposes, chosen by the current state. */
export type WorkflowNextCommand = "addGroup" | "runValidation" | "publish";

export type WorkflowNextAction = {
  readonly label: string;
  readonly hint: string;
  readonly sectionId?: AssessmentSectionId;
  readonly command?: WorkflowNextCommand;
};

type Counts = {
  readonly questions: number;
  readonly answered: number;
};

function counts(assessment: AssessmentDocument): Counts {
  let questions = 0;
  let answered = 0;
  for (const group of assessment.groups) {
    for (const question of group.questions) {
      questions += 1;
      if (question.answerKey?.trim()) answered += 1;
    }
  }
  return { questions, answered };
}

function hasText(value: string): boolean {
  return value.trim().length > 0;
}

function statusOf(
  stageId: AssessmentStageId,
  assessment: AssessmentDocument,
  c: Counts,
): AssessmentStageStatus {
  switch (stageId) {
    case "about": {
      const described = hasText(assessment.subject) && hasText(assessment.grade);
      if (described && assessment.objectives.length > 0) return "done";
      if (
        described ||
        assessment.objectives.length > 0 ||
        assessment.competencies.length > 0 ||
        assessment.criteria.length > 0
      ) {
        return "started";
      }
      return "todo";
    }
    case "content": {
      if (c.questions > 0 && c.answered === c.questions) return "done";
      if (assessment.groups.length > 0) return "started";
      return "todo";
    }
    case "grading": {
      if (assessment.scoring.totalPoints > 0 && assessment.scoring.passingScore > 0) {
        return "done";
      }
      if (assessment.rubrics.length > 0 || assessment.scoring.passingScore > 0) {
        return "started";
      }
      return "todo";
    }
    case "finish": {
      if (assessment.status === "published") return "done";
      if (assessment.validation) return "started";
      return "todo";
    }
  }
}

export function buildWorkflowStages(
  assessment: AssessmentDocument,
  sectionId: AssessmentSectionId,
): readonly WorkflowStage[] {
  const c = counts(assessment);

  return ASSESSMENT_SECTION_GROUPS.map((group, index) => ({
    id: group.id,
    label: group.label,
    hint: group.hint,
    index,
    status: statusOf(group.id, assessment, c),
    isCurrent: group.sectionIds.includes(sectionId),
    entrySectionId: group.sectionIds[0]!,
  }));
}

/**
 * One contextual next step, always expressed through an action the builder
 * already has. Guidance only — the teacher can ignore it and go anywhere.
 */
export function buildNextAction(
  assessment: AssessmentDocument,
): WorkflowNextAction {
  const c = counts(assessment);

  if (!hasText(assessment.subject) || !hasText(assessment.grade)) {
    return {
      label: "Completează disciplina și clasa",
      hint: "Contextul ajută PRIMA să propună itemi potriviți.",
      sectionId: "general",
    };
  }

  if (assessment.objectives.length === 0) {
    return {
      label: "Adaugă obiectivele evaluării",
      hint: "Ce trebuie să demonstreze elevii la finalul evaluării?",
      sectionId: "objectives",
    };
  }

  if (assessment.groups.length === 0) {
    return {
      label: "Adaugă primul grup de itemi",
      hint: "Grupurile țin itemii împreună, cu instrucțiuni comune.",
      command: "addGroup",
      sectionId: "questions",
    };
  }

  if (c.questions === 0) {
    return {
      label: "Adaugă primul item",
      hint: "Alege un tip de item în grupul creat.",
      sectionId: "questions",
    };
  }

  if (c.answered < c.questions) {
    const remaining = c.questions - c.answered;
    return {
      label: `Completează baremele (${remaining})`,
      hint: "Baremele fac corectarea rapidă și corectă.",
      sectionId: "answer_key",
    };
  }

  if (assessment.scoring.passingScore <= 0) {
    return {
      label: "Stabilește pragul de promovare",
      hint: "De la ce procent consideri evaluarea promovată?",
      sectionId: "scoring",
    };
  }

  if (!assessment.validation) {
    return {
      label: "Verifică evaluarea",
      hint: "PRIMA semnalează ce mai poate fi îmbunătățit.",
      command: "runValidation",
    };
  }

  if (!assessment.validation.passed) {
    return {
      label: "Reia verificarea",
      hint: "Rezolvă semnalările, apoi verifică din nou.",
      command: "runValidation",
    };
  }

  if (assessment.status !== "published") {
    return {
      label: "Publică evaluarea",
      hint: "Evaluarea trece verificarea și poate fi publicată.",
      command: "publish",
    };
  }

  return {
    label: "Exportă pentru clasă",
    hint: "Evaluarea este publicată — pregătește varianta printabilă.",
    sectionId: "export",
  };
}
