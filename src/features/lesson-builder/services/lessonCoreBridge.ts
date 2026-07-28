import { createId } from "../../../utils/id";
import type { Project } from "../../../types/project";
import { LESSON_PHASES } from "../constants";
import type {
  LessonAiActionId,
  LessonBlock,
  LessonDocument,
  LessonPhase,
  LessonSectionId,
} from "../types";
import { buildProjectCoreContext } from "../../project-workspace/services/projectCoreBridge";
import { projectWorkspaceRepository } from "../../project-workspace/services/projectWorkspaceRepository";

export type LessonCorePromptPackage = {
  readonly system: string;
  readonly user: string;
  readonly action: LessonAiActionId;
  readonly projectId: string;
  readonly lessonId: string;
  readonly engines: readonly string[];
};

export function buildLessonPromptPackage(input: {
  project: Project;
  lesson: LessonDocument;
  action: LessonAiActionId;
  sectionId?: LessonSectionId;
}): LessonCorePromptPackage {
  const meta = projectWorkspaceRepository.getMetadata(input.project.id);
  const core = buildProjectCoreContext({
    project: input.project,
    activeTab: "lessons",
    activeArtifactId: input.lesson.workspaceArtifactId,
    intent: `Lesson Builder · ${input.action} · ${input.lesson.general.title}`,
  });

  return {
    system:
      "PRIMA Lesson Builder — project-scoped educational assistant. Never invent isolated lessons.",
    user: [
      `Project: ${core.projectTitle}`,
      `Subject: ${core.subject}`,
      `Grade: ${core.grade}`,
      meta.curriculumRef ? `Curriculum: ${meta.curriculumRef}` : null,
      `Competencies: ${(core.competencies.length ? core.competencies : input.lesson.competencies).join("; ") || "n/a"}`,
      `Lesson: ${input.lesson.general.title}`,
      `Action: ${input.action}`,
      input.sectionId ? `Section: ${input.sectionId}` : null,
      `Objectives: ${input.lesson.objectives.join("; ") || "none yet"}`,
    ]
      .filter(Boolean)
      .join("\n"),
    action: input.action,
    projectId: input.project.id,
    lessonId: input.lesson.id,
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

function phaseContent(id: string, subject: string, title: string): string {
  const map: Record<string, string> = {
    introduction: `Salută clasa și anunță titlul „${title}”. Activează cunoștințele anterioare prin 1–2 întrebări.`,
    motivation: `Leagă tema de viața elevilor la ${subject}. Prezintă o enigmă scurtă sau un exemplu surprinzător.`,
    knowledge_construction: `Construiește conceptul-cheie pas cu pas. Modelează un exemplu pe tablă, apoi verifică înțelegerea.`,
    practice: `Activitate ghidată: elevii aplică ideea în perechi. Feedback rapid din partea profesorului.`,
    assessment: `Verificare formativă scurtă (exit ticket / 2 itemi). Observă greșelile tipice.`,
    reflection: `Elevii notează ce au învățat și ce rămâne neclar. O întrebare metacognitivă.`,
    closure: `Rezumă obiectivele atinse și anunță următorul pas / tema.`,
  };
  return map[id] ?? "";
}

export function applyAiAction(input: {
  project: Project;
  lesson: LessonDocument;
  action: LessonAiActionId;
  sectionId?: LessonSectionId;
}): { lesson: LessonDocument; prompt: LessonCorePromptPackage } {
  const prompt = buildLessonPromptPackage(input);
  const lesson = input.lesson;
  const subject = lesson.general.subject || input.project.subject;
  const title = lesson.general.title;

  let next: LessonDocument = { ...lesson };

  switch (input.action) {
    case "generate_complete": {
      const phases: LessonPhase[] = LESSON_PHASES.map((p) => {
        const existing = lesson.phases.find((x) => x.id === p.id);
        return {
          id: p.id,
          title: p.label,
          content: phaseContent(p.id, subject, title),
          durationMinutes: existing?.durationMinutes ?? p.defaultMinutes,
        };
      });
      const blocks: LessonBlock[] = [
        {
          id: createId("lblock"),
          kind: "activity",
          title: "Activare",
          content: "Brainwriting: 3 cuvinte legate de temă.",
          phaseId: "introduction",
          durationMinutes: 3,
          reusable: true,
          order: 0,
        },
        {
          id: createId("lblock"),
          kind: "activity",
          title: "Practică ghidată",
          content: "Rezolvă împreună un exemplu, apoi un item similar.",
          phaseId: "practice",
          durationMinutes: 10,
          reusable: true,
          order: 1,
        },
        {
          id: createId("lblock"),
          kind: "assessment",
          title: "Exit ticket",
          content: "Un item scurt + o confuzie de clarificat.",
          phaseId: "assessment",
          durationMinutes: 4,
          reusable: true,
          order: 2,
        },
      ];
      next = {
        ...lesson,
        objectives:
          lesson.objectives.length > 0
            ? lesson.objectives
            : [
                `Elevii explică ideea principală din „${title}".`,
                "Elevii aplică conceptul într-un exercițiu scurt.",
              ],
        competencies:
          lesson.competencies.length > 0
            ? lesson.competencies
            : [`Competență specifică · ${subject}`],
        prerequisites:
          lesson.prerequisites.length > 0
            ? lesson.prerequisites
            : ["Vocabular de bază al unității"],
        resources:
          lesson.resources.length > 0
            ? lesson.resources
            : ["Manual", "Tablă / proiector", "Fișă scurtă"],
        phases,
        blocks,
        differentiation:
          lesson.differentiation ||
          "Suport vizual pentru elevii care au nevoie; item de extensie pentru ritm rapid.",
        assessment:
          lesson.assessment ||
          "Observare + exit ticket cu un item aliniat la obiectiv.",
        homework:
          lesson.homework ||
          "Temă scurtă: un exercițiu de consolidare (max. 10 minute).",
        reflection:
          lesson.reflection ||
          "Ce a fost clar? Ce mai vreau să exersez? Cum am colaborat?",
        teacherNotes:
          lesson.teacherNotes ||
          `Generat în proiectul „${input.project.title}" cu PRIMA Core.`,
      };
      break;
    }
    case "generate_section": {
      const section = input.sectionId ?? "phases";
      if (section === "objectives") {
        next = {
          ...lesson,
          objectives: [
            ...lesson.objectives,
            `Obiectiv generat: aplică noțiunea din „${title}".`,
          ],
        };
      } else if (section === "assessment") {
        next = {
          ...lesson,
          assessment:
            "Evaluare formativă: 2 itemi + observație pe colaborare.",
        };
      } else if (section === "homework") {
        next = {
          ...lesson,
          homework: "Temă: exercițiu scurt + o întrebare de reflecție.",
        };
      } else if (section === "reflection") {
        next = {
          ...lesson,
          reflection:
            "Ce am învățat azi? Unde am greșit util? Ce voi face diferit?",
        };
      } else if (section === "resources") {
        next = {
          ...lesson,
          resources: [
            ...lesson.resources,
            "Resursă sugerată: fișă diferențiată",
            "Link didactic intern (Memory Engine)",
          ],
        };
      } else {
        next = {
          ...lesson,
          phases: lesson.phases.map((p) =>
            p.content.trim()
              ? p
              : {
                  ...p,
                  content: phaseContent(p.id, subject, title),
                },
          ),
        };
      }
      break;
    }
    case "improve":
      next = {
        ...lesson,
        teacherNotes: `${lesson.teacherNotes}\n\n[PRIMA] Îmbunătățire: clarifică verbajul obiectivelor și scurtează introducerea.`.trim(),
        phases: lesson.phases.map((p) =>
          p.id === "introduction" && p.content
            ? {
                ...p,
                content: `${p.content}\n\n(Revizuit: păstrează mesajul în sub 2 minute.)`,
              }
            : p,
        ),
      };
      break;
    case "differentiate":
      next = {
        ...lesson,
        differentiation:
          "Nivel A: schelă cu indicii. Nivel B: sarcină standard. Nivel C: provocare de transfer.",
      };
      break;
    case "adapt_difficulty":
      next = {
        ...lesson,
        blocks: [
          ...lesson.blocks,
          {
            id: createId("lblock"),
            kind: "activity",
            title: "Variantă ușoară / grea",
            content:
              "Pregătește același obiectiv pe două niveluri de complexitate.",
            phaseId: "practice",
            reusable: true,
            order: lesson.blocks.length,
          },
        ],
      };
      break;
    case "suggest_resources":
      next = {
        ...lesson,
        resources: [
          ...lesson.resources,
          "Imagine-ancoră",
          "Scurt video explicativ",
          "Fișă tipărită",
        ],
      };
      break;
    case "suggest_assessment":
      next = {
        ...lesson,
        assessment:
          "Rubrică scurtă (3 criterii) + item de autoevaluare pentru elev.",
      };
      break;
    case "suggest_homework":
      next = {
        ...lesson,
        homework:
          "Temă opțională diferențiată: consolidare SAU extensie creativă.",
      };
      break;
    case "generate_reflection":
      next = {
        ...lesson,
        reflection:
          "1) Ce idee păstrez? 2) Ce întrebare am încă? 3) Cui aș explica tema în 30 de secunde?",
      };
      break;
    default:
      break;
  }

  return { lesson: next, prompt };
}

/** Sync lesson document into Project Workspace artifact store. */
export function syncLessonToWorkspace(lesson: LessonDocument): string {
  const existingId = lesson.workspaceArtifactId;
  if (existingId) {
    const existing = projectWorkspaceRepository.getArtifact(existingId);
    if (existing && existing.projectId === lesson.projectId) {
      projectWorkspaceRepository.updateArtifact(existingId, {
        title: lesson.general.title,
        status:
          lesson.status === "published"
            ? "ready"
            : lesson.status === "archived"
              ? "archived"
              : "draft",
        payload: {
          lessonId: lesson.id,
          version: lesson.version,
          status: lesson.status,
        },
        note: `lesson-sync v${lesson.version}`,
        actor: "system",
      });
      return existingId;
    }
  }

  const unit = projectWorkspaceRepository.ensureDefaultUnit(lesson.projectId);
  const artifact = projectWorkspaceRepository.createArtifact({
    projectId: lesson.projectId,
    kind: "lesson",
    title: lesson.general.title,
    unitId: unit.id,
    createdBy: lesson.createdBy,
    payload: {
      lessonId: lesson.id,
      version: lesson.version,
      status: lesson.status,
    },
    tags: ["lesson-builder"],
  });
  return artifact.id;
}
