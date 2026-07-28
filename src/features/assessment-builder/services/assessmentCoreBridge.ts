import { createId } from "../../../utils/id";
import type { Project } from "../../../types/project";
import { buildProjectCoreContext } from "../../project-workspace/services/projectCoreBridge";
import { projectWorkspaceRepository } from "../../project-workspace/services/projectWorkspaceRepository";
import { lessonBuilderRepository } from "../../lesson-builder/services/lessonBuilderRepository";
import type {
  AssessmentAiActionId,
  AssessmentDocument,
  AssessmentQuestion,
  AssessmentSectionId,
  DifficultyLevel,
} from "../types";
import { createBlankQuestion, createBlankRubric } from "./assessmentBuilderRepository";

export type AssessmentCorePromptPackage = {
  readonly system: string;
  readonly user: string;
  readonly action: AssessmentAiActionId;
  readonly projectId: string;
  readonly lessonId: string;
  readonly assessmentId: string;
  readonly engines: readonly string[];
};

export function buildAssessmentPromptPackage(input: {
  project: Project;
  assessment: AssessmentDocument;
  action: AssessmentAiActionId;
  sectionId?: AssessmentSectionId;
}): AssessmentCorePromptPackage {
  const lesson = lessonBuilderRepository.getById(input.assessment.lessonId);
  const meta = projectWorkspaceRepository.getMetadata(input.project.id);
  const core = buildProjectCoreContext({
    project: input.project,
    activeTab: "assessments",
    activeArtifactId: input.assessment.workspaceArtifactId,
    intent: `Assessment Builder · ${input.action} · ${input.assessment.title}`,
  });

  return {
    system:
      "PRIMA Assessment Builder — assessments always belong to a lesson and project. Teacher remains in control.",
    user: [
      `Project: ${core.projectTitle}`,
      `Subject: ${core.subject}`,
      `Grade: ${core.grade}`,
      meta.curriculumRef ? `Curriculum: ${meta.curriculumRef}` : null,
      `Lesson: ${lesson?.general.title ?? input.assessment.lessonId}`,
      `Assessment: ${input.assessment.title} (${input.assessment.kind})`,
      `Action: ${input.action}`,
      input.sectionId ? `Section: ${input.sectionId}` : null,
      `Objectives: ${input.assessment.objectives.join("; ") || lesson?.objectives.join("; ") || "n/a"}`,
      `Competencies: ${input.assessment.competencies.join("; ") || lesson?.competencies.join("; ") || "n/a"}`,
    ]
      .filter(Boolean)
      .join("\n"),
    action: input.action,
    projectId: input.project.id,
    lessonId: input.assessment.lessonId,
    assessmentId: input.assessment.id,
    engines: [
      "WorkflowEngine",
      "ContextEngine",
      "PromptBuilder",
      "AiOrchestrator",
      "ValidationEngine",
      "MemoryEngine",
      "ToolEngine",
      "Runtime",
    ],
  };
}

function sampleQuestions(
  subject: string,
  title: string,
  competencies: readonly string[],
): AssessmentQuestion[] {
  const comp = competencies[0] ?? `${subject} · competență`;
  return [
    {
      ...createBlankQuestion("multiple_choice", 0),
      prompt: `Care afirmație despre „${title}" este corectă?`,
      difficulty: "easy",
      bloom: "remember",
      competencyIds: [comp],
      answerKey: "A",
      feedbackCorrect: "Corect — ai identificat ideea esențială.",
      feedbackIncorrect: "Reia definiția din lecție.",
      estimatedSeconds: 45,
    },
    {
      ...createBlankQuestion("short_answer", 1),
      prompt: `Explică pe scurt legătura dintre ${subject} și tema lecției.`,
      difficulty: "medium",
      bloom: "understand",
      points: 2,
      competencyIds: [comp],
      answerKey: "Răspuns care menționează conceptul-cheie.",
      estimatedSeconds: 90,
    },
    {
      ...createBlankQuestion("calculation", 2),
      prompt: "Rezolvă itemul de aplicare legat de exemplul din oră.",
      difficulty: "medium",
      bloom: "apply",
      points: 3,
      competencyIds: competencies.slice(0, 2),
      answerKey: "Vezi baremul pas cu pas.",
      estimatedSeconds: 120,
    },
    {
      ...createBlankQuestion("long_answer", 3),
      prompt: `Analizează o situație nouă folosind ideile din „${title}".`,
      difficulty: "hard",
      bloom: "analyze",
      points: 4,
      competencyIds: competencies.slice(0, 2),
      estimatedSeconds: 180,
    },
  ];
}

export function applyAssessmentAiAction(input: {
  project: Project;
  assessment: AssessmentDocument;
  action: AssessmentAiActionId;
  sectionId?: AssessmentSectionId;
}): { assessment: AssessmentDocument; prompt: AssessmentCorePromptPackage; note?: string } {
  const prompt = buildAssessmentPromptPackage(input);
  const lesson = lessonBuilderRepository.getById(input.assessment.lessonId);
  const doc = input.assessment;
  const subject = doc.subject || input.project.subject;
  const competencies =
    doc.competencies.length > 0
      ? doc.competencies
      : lesson?.competencies ?? [];
  const objectives =
    doc.objectives.length > 0
      ? doc.objectives
      : lesson?.objectives ?? [`Verifică înțelegerea: ${doc.title}`];

  let next: AssessmentDocument = { ...doc };
  let note: string | undefined;

  switch (input.action) {
    case "generate_complete": {
      const questions = sampleQuestions(subject, doc.title, competencies);
      next = {
        ...doc,
        objectives,
        competencies:
          competencies.length > 0
            ? competencies
            : [`Competență · ${subject}`],
        criteria: [
          "Corectitudine",
          "Claritate a explicației",
          "Aplicare în context nou",
        ],
        groups: [
          {
            id: doc.groups[0]?.id ?? createId("agroup"),
            title: "Itemi principali",
            instructions: "Lucrează independent. Citește cu atenție.",
            questions,
            order: 0,
          },
        ],
        scoring: {
          ...doc.scoring,
          mode: "weighted",
          passingScore: 60,
          totalPoints: questions.reduce((s, q) => s + q.points, 0),
        },
        rubrics: doc.rubrics.length > 0 ? doc.rubrics : [createBlankRubric()],
        teacherNotes: `Generat pentru lecția ${lesson?.general.title ?? doc.lessonId} în proiectul „${input.project.title}".`,
      };
      break;
    }
    case "generate_bank": {
      const bankItems = sampleQuestions(subject, doc.title, competencies).map(
        (q, i) => ({ ...q, id: createId("aq"), order: doc.bank.length + i }),
      );
      next = { ...doc, bank: [...doc.bank, ...bankItems] };
      break;
    }
    case "generate_variants": {
      const groups = doc.groups.map((g) => ({
        ...g,
        questions: [
          ...g.questions,
          ...g.questions.slice(0, 2).map((q, i) => ({
            ...q,
            id: createId("aq"),
            prompt: `${q.prompt} (variantă ${i + 1})`,
            order: g.questions.length + i,
          })),
        ],
      }));
      next = { ...doc, groups };
      break;
    }
    case "adjust_difficulty": {
      const cycle: DifficultyLevel[] = ["easy", "medium", "hard"];
      next = {
        ...doc,
        groups: doc.groups.map((g) => ({
          ...g,
          questions: g.questions.map((q, i) => ({
            ...q,
            difficulty: cycle[i % cycle.length]!,
          })),
        })),
      };
      break;
    }
    case "generate_rubrics":
      next = { ...doc, rubrics: [...doc.rubrics, createBlankRubric()] };
      break;
    case "generate_answer_keys":
      next = {
        ...doc,
        groups: doc.groups.map((g) => ({
          ...g,
          questions: g.questions.map((q) => ({
            ...q,
            answerKey:
              q.answerKey ||
              (q.type === "multiple_choice"
                ? q.choices?.find((c) => c.isCorrect)?.label ?? "A"
                : "Răspuns model"),
          })),
        })),
      };
      break;
    case "generate_feedback":
      next = {
        ...doc,
        groups: doc.groups.map((g) => ({
          ...g,
          questions: g.questions.map((q) => ({
            ...q,
            feedbackCorrect:
              q.feedbackCorrect || "Excelent — ai demonstrat înțelegerea.",
            feedbackIncorrect:
              q.feedbackIncorrect ||
              "Revizuiește exemplul din lecție și încearcă din nou.",
          })),
        })),
      };
      break;
    case "competency_mapping": {
      const comps =
        competencies.length > 0
          ? competencies
          : [`Competență · ${subject}`];
      next = {
        ...doc,
        competencies: comps,
        groups: doc.groups.map((g) => ({
          ...g,
          questions: g.questions.map((q, i) => ({
            ...q,
            competencyIds:
              q.competencyIds.length > 0
                ? q.competencyIds
                : [comps[i % comps.length]!],
          })),
        })),
      };
      break;
    }
    case "detect_duplicates": {
      const prompts = doc.groups
        .flatMap((g) => g.questions)
        .map((q) => q.prompt.trim().toLowerCase());
      const repeated = prompts.filter((p, i) => p && prompts.indexOf(p) !== i);
      note =
        repeated.length > 0
          ? `Găsite ${repeated.length} enunțuri duplicate.`
          : "Nu s-au detectat itemi repetați.";
      next = {
        ...doc,
        teacherNotes: `${doc.teacherNotes}\n\n[PRIMA] ${note}`.trim(),
      };
      break;
    }
    case "suggest_improvements":
      next = {
        ...doc,
        teacherNotes: `${doc.teacherNotes}\n\n[PRIMA] Sugestii: echilibrează Bloom (aplicare/analiză), adaugă un item de transfer, clarifică baremul pentru răspunsuri deschise.`.trim(),
      };
      break;
    default:
      break;
  }

  return { assessment: next, prompt, note };
}

export function syncAssessmentToWorkspace(
  assessment: AssessmentDocument,
): string {
  const existingId = assessment.workspaceArtifactId;
  if (existingId) {
    const existing = projectWorkspaceRepository.getArtifact(existingId);
    if (existing && existing.projectId === assessment.projectId) {
      projectWorkspaceRepository.updateArtifact(existingId, {
        title: assessment.title,
        status:
          assessment.status === "published"
            ? "ready"
            : assessment.status === "archived"
              ? "archived"
              : "draft",
        payload: {
          assessmentId: assessment.id,
          lessonId: assessment.lessonId,
          version: assessment.version,
          kind: assessment.kind,
        },
        note: `assessment-sync v${assessment.version}`,
        actor: "system",
      });
      return existingId;
    }
  }

  const unit = projectWorkspaceRepository.ensureDefaultUnit(assessment.projectId);
  const artifact = projectWorkspaceRepository.createArtifact({
    projectId: assessment.projectId,
    kind: "assessment",
    title: assessment.title,
    unitId: unit.id,
    createdBy: assessment.createdBy,
    payload: {
      assessmentId: assessment.id,
      lessonId: assessment.lessonId,
      version: assessment.version,
      kind: assessment.kind,
    },
    tags: ["assessment-builder", assessment.kind],
  });
  return artifact.id;
}

export function ensureLessonForProject(project: Project): string {
  const existing = lessonBuilderRepository.listByProject(project.id)[0];
  if (existing) return existing.id;
  const created = lessonBuilderRepository.create({
    projectId: project.id,
    general: {
      title: `Lecție pentru evaluări · ${project.title}`,
      subject: project.subject,
      grade: project.grade,
    },
  });
  return created.id;
}
