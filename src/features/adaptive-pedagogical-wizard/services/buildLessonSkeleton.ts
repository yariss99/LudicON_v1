import {
  createBlock,
  createLessonInStudio,
  lessonStudioRepository,
} from "../../lesson-studio/services/lessonStudioRepository";
import { openLessonPath } from "../../lesson-studio/LessonStudioPage";
import { projectWorkspaceRepository } from "../../project-workspace/services/projectWorkspaceRepository";
import { teachingWorkflowStore } from "../../teaching-workflow/services/teachingWorkflowStore";
import {
  homeLessonProgressStore,
  notifyArtifactsChanged,
} from "../../home-workspace/services/homeLessonProgressStore";
import { blockDocumentStore } from "../../../modules/block-editor/services/documentStore";
import { BlockRegistry } from "../../../modules/block-editor/registry/BlockRegistry";
import type { LessonBlockType, LessonDifficulty } from "../../lesson-studio/types";
import {
  CLASS_PROFILE_OPTIONS,
  ORGANIZATION_OPTIONS,
  PURPOSE_OPTIONS,
  RESOURCE_OPTIONS,
} from "../constants";
import { applyBranchDefaults } from "./adaptiveFlow";
import type { InterviewAnswers } from "../types";

export type SkeletonResult = {
  lessonId: string;
  projectId: string;
  href: string;
  blockEditorHref: string;
};

type PhasePlan = {
  type: LessonBlockType;
  title: string;
  /** Structural cue only — never full lesson content. */
  cue: string;
};

function difficultyFromProfile(
  answers: InterviewAnswers,
): LessonDifficulty {
  if (
    answers.classProfile === "support_needed" ||
    answers.purpose === "remedial"
  ) {
    return "easy";
  }
  if (
    answers.classProfile === "high_performing" ||
    answers.purpose === "enrichment"
  ) {
    return "hard";
  }
  return "medium";
}

function objectiveScaffolds(answers: InterviewAnswers): string[] {
  const topic = answers.topic.trim();
  const purpose = PURPOSE_OPTIONS.find((p) => p.id === answers.purpose)?.label;
  const base = [
    `Students will engage with ${topic} (${purpose ?? "lesson"}).`,
    `Students will demonstrate understanding of key ideas in ${topic}.`,
  ];
  if (answers.purpose === "assessment") {
    return [
      `Students will demonstrate competency related to ${topic}.`,
      `Students will complete a check for understanding on ${topic}.`,
    ];
  }
  if (answers.purpose === "remedial") {
    return [
      `Students will revisit core ideas of ${topic} with support.`,
      `Students will practice ${topic} with guided scaffolding.`,
    ];
  }
  if (answers.purpose === "enrichment") {
    return [
      `Students will extend their thinking about ${topic}.`,
      `Students will apply ${topic} in a more complex context.`,
    ];
  }
  if (answers.duration && answers.duration <= 30) {
    return base.slice(0, 1);
  }
  return [...base, `Students will reflect on their learning about ${topic}.`];
}

function phasePlan(answers: InterviewAnswers): PhasePlan[] {
  const topic = answers.topic.trim();
  const org =
    ORGANIZATION_OPTIONS.find((o) => o.id === answers.organization)?.label ??
    "Mixed";
  const minutes = answers.duration ?? 40;

  const plans: PhasePlan[] = [
    {
      type: "objectives",
      title: "Objectives",
      cue: `Learning goals for “${topic}”. Refine these with your own wording.`,
    },
  ];

  if (answers.purpose !== "assessment") {
    plans.push({
      type: "introduction",
      title: "Introduction",
      cue: `Opening phase (~${Math.max(3, Math.round(minutes * 0.1))} min). Hook and purpose — write your own opener.`,
    });
  }

  if (
    answers.purpose === "introduction" ||
    answers.purpose === "consolidation" ||
    answers.purpose === "remedial"
  ) {
    plans.push({
      type: "previous_knowledge",
      title: "Previous knowledge",
      cue: "Activate what students already know. Add your prompt or warm-up.",
    });
  }

  if (
    answers.purpose === "introduction" ||
    answers.purpose === "consolidation" ||
    answers.purpose === "enrichment"
  ) {
    plans.push({
      type: "discovery",
      title: "Discovery",
      cue: `Explore ${topic}. Organization: ${org}. Add your teaching moves.`,
    });
  }

  if (answers.purpose !== "assessment" || minutes >= 40) {
    plans.push({
      type: "practice",
      title:
        answers.purpose === "assessment" ? "Practice check" : "Practice",
      cue: `Guided / independent practice (${org}). Add tasks you author.`,
    });
  }

  if (
    answers.organization === "groups" ||
    answers.organization === "pair" ||
    answers.organization === "mixed"
  ) {
    plans.push({
      type: "interactive_activity",
      title: "Interactive activity",
      cue: `Collaborative moment (${org}). Design the activity yourself.`,
    });
  }

  plans.push({
    type: "assessment",
    title:
      answers.purpose === "assessment"
        ? "Assessment"
        : "Check for understanding",
    cue:
      answers.purpose === "assessment"
        ? "Primary assessment phase — add your items and success criteria."
        : "Formative check — add a quick exit ticket or oral probe.",
  });

  if (minutes >= 50 && answers.purpose !== "assessment") {
    plans.push({
      type: "homework",
      title: "Homework / follow-up",
      cue: "Optional extension. Leave blank if not needed.",
    });
  }

  if (minutes >= 40) {
    plans.push({
      type: "reflection",
      title: "Reflection",
      cue: "Closing reflection prompt for students — write your question.",
    });
  }

  const resourceLabels = answers.resources
    .map((id) => RESOURCE_OPTIONS.find((r) => r.id === id)?.label)
    .filter(Boolean);
  if (resourceLabels.length > 0 || answers.resourcesOther) {
    const other = answers.resourcesOther.trim();
    plans.push({
      type: "resources",
      title: "Resources",
      cue: `Available: ${[...resourceLabels, other].filter(Boolean).join(", ")}. List materials you will use.`,
    });
  }

  return plans;
}

function syncWorkspace(projectId: string, title: string, lessonId: string) {
  const unit = projectWorkspaceRepository.ensureDefaultUnit(projectId);
  projectWorkspaceRepository.createArtifact({
    projectId,
    kind: "lesson",
    title,
    unitId: unit.id,
    createdBy: "teacher",
    payload: { studioId: lessonId, via: "adaptive-pedagogical-wizard" },
    tags: ["wizard", "adaptive", "lesson"],
  });
  projectWorkspaceRepository.addActivity({
    projectId,
    kind: "teacher_action",
    title: "Created lesson (adaptive interview)",
    detail: title,
    actor: "teacher",
    artifactId: lessonId,
  });
}

/**
 * Creates a high-quality pedagogical skeleton — structure only, no authored content.
 */
export function buildLessonSkeleton(
  rawAnswers: InterviewAnswers,
): SkeletonResult {
  const answers = applyBranchDefaults(rawAnswers);
  if (!answers.projectId) {
    throw new Error("Project is required to create a lesson skeleton.");
  }
  if (!answers.purpose || !answers.duration) {
    throw new Error("Interview is incomplete.");
  }

  const purposeLabel =
    PURPOSE_OPTIONS.find((p) => p.id === answers.purpose)?.label ?? "";
  const profileLabel =
    CLASS_PROFILE_OPTIONS.find((p) => p.id === answers.classProfile)?.label ??
    "";
  const orgLabel =
    ORGANIZATION_OPTIONS.find((o) => o.id === answers.organization)?.label ??
    "";

  const objectives = objectiveScaffolds(answers);
  const keywords = [
    purposeLabel,
    profileLabel,
    orgLabel,
    `${answers.duration} min`,
    ...answers.resources.map(
      (id) => RESOURCE_OPTIONS.find((r) => r.id === id)?.label ?? id,
    ),
  ].filter(Boolean);

  const lesson = createLessonInStudio(answers.projectId, {
    title: answers.topic.trim(),
    subject: answers.subject || "General",
    grade: answers.grade || "",
    durationMinutes: answers.duration,
    teachingUnit: answers.topic.trim(),
    learningObjectives: objectives,
    competencies: [],
    keywords,
    difficulty: difficultyFromProfile(answers),
  });

  const phases = phasePlan(answers);
  const blocks = phases.map((phase, order) => ({
    ...createBlock(phase.type, order),
    title: phase.title,
    content: phase.cue,
  }));

  // Objectives block lists scaffold goals (structure), not prose content.
  const objectivesBlock = blocks.find((b) => b.type === "objectives");
  if (objectivesBlock) {
    objectivesBlock.content = [
      "Learning objectives (edit freely):",
      ...objectives.map((o, i) => `${i + 1}. ${o}`),
      "",
      "These are structural scaffolds — replace with your own objectives.",
    ].join("\n");
  }

  const saved = lessonStudioRepository.save(
    {
      ...lesson,
      blocks,
      status: "in_progress",
      properties: {
        ...lesson.properties,
        learningObjectives: objectives,
        keywords,
        difficulty: difficultyFromProfile(answers),
        durationMinutes: answers.duration,
      },
    },
    { note: "Adaptive pedagogical skeleton" },
  );

  // Mirror phase titles into Universal Block Editor (structure outline).
  const ubDoc = blockDocumentStore.create({
    title: `${saved.properties.title} — structure`,
    projectId: answers.projectId,
    resourceKind: "lesson",
  });
  ubDoc.blocks = [
    {
      ...BlockRegistry.createBlock("text", 0),
      title: "Lesson structure",
      content: `Outline for “${saved.properties.title}” — phases only, no authored content.`,
    },
    ...phases.map((phase, index) => ({
      ...BlockRegistry.createBlock(
        index === phases.length - 1 ? "reflection" : "text",
        index + 1,
      ),
      title: phase.title,
      content: phase.cue,
    })),
  ];
  blockDocumentStore.save(ubDoc);

  syncWorkspace(answers.projectId, saved.properties.title, saved.id);
  teachingWorkflowStore.touch({
    projectId: answers.projectId,
    kind: "lesson",
    resourceId: saved.id,
    markCompleted: true,
  });
  homeLessonProgressStore.add({
    projectId: answers.projectId,
    lessonId: saved.id,
    title: saved.properties.title,
    subject: saved.properties.subject,
    grade: saved.properties.grade,
    createdAt: saved.createdAt,
  });
  notifyArtifactsChanged();

  return {
    lessonId: saved.id,
    projectId: answers.projectId,
    href: openLessonPath(answers.projectId, saved.id, "advanced", true),
    blockEditorHref: `/block-editor?doc=${ubDoc.id}`,
  };
}
