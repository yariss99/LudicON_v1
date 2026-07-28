import type { Project } from "../../../types/project";
import { nowIso } from "../../../utils/date";
import { lessonBuilderRepository } from "../../lesson-builder/services/lessonBuilderRepository";
import { assessmentBuilderRepository } from "../../assessment-builder/services/assessmentBuilderRepository";
import { storyBuilderRepository } from "../../story-builder/services/storyBuilderRepository";
import { gameBuilderRepository } from "../../game-builder/services/gameBuilderRepository";
import { presentationBuilderRepository } from "../../presentation-builder/services/presentationBuilderRepository";
import { projectWorkspaceRepository } from "../../project-workspace/services/projectWorkspaceRepository";
import { resourceCenterRepository } from "../../resource-center/services/resourceCenterRepository";
import { buildProjectCoreContext } from "../../project-workspace/services/projectCoreBridge";
import type {
  AssistantContextPackage,
  AssistantWorkflowStage,
  TeacherMemoryProfile,
} from "../types";
import { assistantRepository } from "./assistantRepository";

export type AssistantRouteContext = {
  readonly pathname: string;
  readonly projectId?: string;
  readonly lessonId?: string;
  readonly documentId?: string;
  readonly documentKind?: string;
};

function inferWorkflow(pathname: string): AssistantWorkflowStage {
  if (pathname.includes("assessment")) return "assessment";
  if (pathname.includes("reflection") || pathname.includes("reflect"))
    return "reflection";
  if (pathname.includes("publishing") || pathname.includes("report"))
    return "reporting";
  if (pathname.includes("resource") || pathname.includes("library"))
    return "portfolio";
  if (pathname.includes("game") || pathname.includes("story")) return "teaching";
  if (pathname.includes("lesson") || pathname.includes("create"))
    return "planning";
  return "planning";
}

function parseRoute(pathname: string): AssistantRouteContext {
  const parts = pathname.split("/").filter(Boolean);
  const ctx: AssistantRouteContext = { pathname };

  const projectIdx = parts.findIndex(
    (p) =>
      p === "studio" ||
      p === "lesson-builder" ||
      p === "assessment-builder" ||
      p === "story-builder" ||
      p === "game-builder" ||
      p === "presentation-builder",
  );
  if (projectIdx >= 0 && parts[projectIdx + 1]) {
    (ctx as { projectId?: string }).projectId = parts[projectIdx + 1];
  }
  if (pathname.includes("resource-center")) {
    const qProject = new URLSearchParams(pathname.split("?")[1] ?? "").get(
      "project",
    );
    if (qProject) (ctx as { projectId?: string }).projectId = qProject;
  }

  if (parts[0] === "lesson-builder" && parts[2]) {
    (ctx as { lessonId?: string }).lessonId = parts[2];
    (ctx as { documentId?: string }).documentId = parts[2];
    (ctx as { documentKind?: string }).documentKind = "lesson";
  }
  if (parts[0] === "assessment-builder" && parts[2]) {
    (ctx as { documentId?: string }).documentId = parts[2];
    (ctx as { documentKind?: string }).documentKind = "assessment";
  }
  if (parts[0] === "story-builder" && parts[2]) {
    (ctx as { documentId?: string }).documentId = parts[2];
    (ctx as { documentKind?: string }).documentKind = "story";
  }
  if (parts[0] === "game-builder" && parts[2]) {
    (ctx as { documentId?: string }).documentId = parts[2];
    (ctx as { documentKind?: string }).documentKind = "game";
  }
  if (parts[0] === "presentation-builder" && parts[2]) {
    (ctx as { documentId?: string }).documentId = parts[2];
    (ctx as { documentKind?: string }).documentKind = "presentation";
  }
  return ctx;
}

export function buildAssistantContext(input: {
  teacherId: string;
  teacherName: string;
  projects: readonly Project[];
  pathname: string;
  search?: string;
  activeProjectId?: string | null;
  memory?: TeacherMemoryProfile;
}): AssistantContextPackage {
  const route = parseRoute(
    input.search ? `${input.pathname}?${input.search}` : input.pathname,
  );
  const projectId = route.projectId || input.activeProjectId || undefined;
  const project = projectId
    ? input.projects.find((p) => p.id === projectId)
    : undefined;

  const meta = project
    ? projectWorkspaceRepository.getMetadata(project.id)
    : undefined;

  let lessonId = route.lessonId;
  let lessonTitle: string | undefined;
  let documentTitle: string | undefined;
  let learningObjectives: string[] = [];
  let competencies: string[] = [...(meta?.competencies ?? [])];
  let validationSummary: string | undefined;

  if (route.documentKind === "lesson" && route.documentId) {
    const lesson = lessonBuilderRepository.getById(route.documentId);
    if (lesson) {
      lessonId = lesson.id;
      lessonTitle = lesson.general.title;
      documentTitle = lesson.general.title;
      learningObjectives = [...lesson.objectives];
      competencies = Array.from(
        new Set([...competencies, ...lesson.competencies]),
      );
      validationSummary = lesson.validation
        ? `Lecție validare: ${lesson.validation.passed ? "OK" : "blocată"} (${lesson.validation.score})`
        : undefined;
    }
  }

  if (route.documentKind === "assessment" && route.documentId) {
    const doc = assessmentBuilderRepository.getById(route.documentId);
    if (doc) {
      lessonId = doc.lessonId;
      documentTitle = doc.title;
      learningObjectives = [...doc.objectives];
      competencies = Array.from(
        new Set([...competencies, ...doc.competencies]),
      );
      validationSummary = doc.validation
        ? `Evaluare: ${doc.validation.passed ? "OK" : "blocată"} (${doc.validation.score})`
        : undefined;
      const lesson = lessonBuilderRepository.getById(doc.lessonId);
      lessonTitle = lesson?.general.title;
    }
  }

  if (route.documentKind === "story" && route.documentId) {
    const doc = storyBuilderRepository.getById(route.documentId);
    if (doc) {
      lessonId = doc.lessonId;
      documentTitle = doc.title;
      learningObjectives = [...doc.objectives];
      competencies = Array.from(
        new Set([...competencies, ...doc.competencies]),
      );
      const lesson = lessonBuilderRepository.getById(doc.lessonId);
      lessonTitle = lesson?.general.title;
    }
  }

  if (route.documentKind === "game" && route.documentId) {
    const doc = gameBuilderRepository.getById(route.documentId);
    if (doc) {
      lessonId = doc.lessonId;
      documentTitle = doc.title;
      learningObjectives = [...doc.objectives];
      competencies = Array.from(
        new Set([...competencies, ...doc.competencies]),
      );
      const lesson = lessonBuilderRepository.getById(doc.lessonId);
      lessonTitle = lesson?.general.title;
    }
  }

  if (route.documentKind === "presentation" && route.documentId) {
    const doc = presentationBuilderRepository.getById(route.documentId);
    if (doc) {
      lessonId = doc.lessonId;
      documentTitle = doc.title;
      learningObjectives = [...doc.objectives];
      competencies = Array.from(
        new Set([...competencies, ...doc.competencies]),
      );
      const lesson = doc.lessonId
        ? lessonBuilderRepository.getById(doc.lessonId)
        : undefined;
      lessonTitle = lesson?.general.title;
    }
  }

  if (!lessonId && project) {
    const first = lessonBuilderRepository.listByProject(project.id)[0];
    if (first) {
      lessonId = first.id;
      lessonTitle = first.general.title;
      if (!learningObjectives.length)
        learningObjectives = [...first.objectives];
      competencies = Array.from(
        new Set([...competencies, ...first.competencies]),
      );
    }
  }

  const relatedAssets: {
    kind: string;
    id: string;
    title: string;
  }[] = [];
  if (project) {
    for (const l of lessonBuilderRepository.listByProject(project.id).slice(0, 4)) {
      relatedAssets.push({ kind: "lesson", id: l.id, title: l.general.title });
    }
    for (const a of assessmentBuilderRepository
      .listByProject(project.id)
      .slice(0, 3)) {
      relatedAssets.push({ kind: "assessment", id: a.id, title: a.title });
    }
    for (const s of storyBuilderRepository.listByProject(project.id).slice(0, 2)) {
      relatedAssets.push({ kind: "story", id: s.id, title: s.title });
    }
    for (const g of gameBuilderRepository.listByProject(project.id).slice(0, 2)) {
      relatedAssets.push({ kind: "game", id: g.id, title: g.title });
    }
    for (const p of presentationBuilderRepository
      .listByProject(project.id)
      .slice(0, 2)) {
      relatedAssets.push({ kind: "presentation", id: p.id, title: p.title });
    }
  }

  const memory =
    input.memory ?? assistantRepository.getMemory(input.teacherId);
  const previousAiActions = assistantRepository
    .listConversations()
    .flatMap((c) => c.messages)
    .filter((m) => m.role === "assistant" && m.intent)
    .slice(-8)
    .map((m) => m.intent!);

  const core = project
    ? buildProjectCoreContext({
        project,
        activeTab: "ai",
        activeArtifactId: route.documentId,
        intent: "Teacher AI Assistant context",
      })
    : null;

  const resources = project
    ? resourceCenterRepository.listByProject(project.id)
    : resourceCenterRepository.listActive();

  return {
    teacherId: input.teacherId,
    teacherName: input.teacherName,
    projectId: project?.id,
    projectTitle: project?.title ?? core?.projectTitle,
    lessonId,
    lessonTitle,
    documentId: route.documentId,
    documentKind: route.documentKind,
    documentTitle,
    grade: project?.grade ?? core?.grade,
    subject: project?.subject ?? core?.subject,
    curriculumRef: meta?.curriculumRef ?? core?.curriculumRef,
    competencies,
    learningObjectives,
    workflowStage: inferWorkflow(input.pathname),
    workflowPath: input.pathname,
    preferences: {
      style: memory.styleNotes[0] ?? "",
      format: memory.preferredFormats[0] ?? "",
      workflow: memory.frequentWorkflows[0] ?? "",
    },
    previousAiActions,
    validationSummary,
    resourceCount: resources.length,
    relatedAssets,
    locale: "ro-RO",
    capturedAt: nowIso(),
  };
}
