import type { Project } from "../../../types/project";
import { lessonStudioRepository } from "../../lesson-studio/services/lessonStudioRepository";
import type { CopilotDocumentKind, CopilotRuntimeContext } from "../types";

function activityFromRoute(pathname: string): string {
  if (pathname.includes("/lesson-studio/")) return "Editing in Lesson Studio";
  if (pathname.includes("/studio/") && pathname.includes("/lessons"))
    return "Browsing Lesson Library";
  if (pathname.includes("/studio/")) return "Working in Project Workspace";
  if (pathname.startsWith("/projects")) return "Managing projects";
  if (pathname === "/" || pathname === "") return "Viewing dashboard";
  if (pathname.includes("assessment")) return "Working on assessments";
  if (pathname.includes("worksheet")) return "Working on worksheets";
  if (pathname.includes("game")) return "Working on games";
  if (pathname.includes("story")) return "Working on stories";
  if (pathname.includes("presentation")) return "Working on presentations";
  if (pathname.includes("resource")) return "Browsing resources";
  return "Navigating P.R.R.I.M.A. ON";
}

function documentKindFromRoute(pathname: string): CopilotDocumentKind {
  if (pathname.includes("/lesson-studio/")) return "lesson";
  if (pathname.includes("/lesson-builder/")) return "lesson";
  if (pathname.includes("/assessment")) return "assessment";
  if (pathname.includes("/worksheet") || pathname.includes("/worksheets"))
    return "worksheet";
  if (pathname.includes("/game")) return "game";
  if (pathname.includes("/story")) return "story";
  if (pathname.includes("/presentation")) return "presentation";
  if (pathname.includes("/resource")) return "resource";
  if (pathname.includes("/studio/") || pathname.match(/\/projects\/[^/]+$/))
    return "project";
  return "page";
}

export function resolveCopilotContext(options: {
  pathname: string;
  projects: Project[];
  selection?: string | null;
}): CopilotRuntimeContext {
  const { pathname, projects, selection = null } = options;
  const parts = pathname.split("/").filter(Boolean);

  let projectId: string | null = null;
  let lessonId: string | null = null;

  const studioIdx = parts.indexOf("studio");
  const lessonStudioIdx = parts.indexOf("lesson-studio");
  const lessonBuilderIdx = parts.indexOf("lesson-builder");
  const projectsIdx = parts.indexOf("projects");

  if (studioIdx >= 0 && parts[studioIdx + 1]) {
    projectId = parts[studioIdx + 1];
  } else if (lessonStudioIdx >= 0 && parts[lessonStudioIdx + 1]) {
    projectId = parts[lessonStudioIdx + 1];
    lessonId = parts[lessonStudioIdx + 2] ?? null;
  } else if (lessonBuilderIdx >= 0 && parts[lessonBuilderIdx + 1]) {
    projectId = parts[lessonBuilderIdx + 1];
    lessonId = parts[lessonBuilderIdx + 2] ?? null;
  } else if (projectsIdx >= 0 && parts[projectsIdx + 1]) {
    projectId = parts[projectsIdx + 1];
  } else {
    // builder routes like /assessment-builder/:projectId/...
    const builder = parts.find((p) => p.endsWith("-builder"));
    if (builder) {
      const idx = parts.indexOf(builder);
      projectId = parts[idx + 1] ?? null;
    }
  }

  const project = projectId
    ? projects.find((p) => p.id === projectId)
    : null;

  const lesson =
    lessonId && projectId
      ? lessonStudioRepository.getById(lessonId)
      : projectId
        ? lessonStudioRepository.listByProject(projectId)[0]
        : undefined;

  const documentKind = documentKindFromRoute(pathname);
  const documentTitle =
    documentKind === "lesson"
      ? lesson?.properties.title ?? null
      : documentKind === "project"
        ? project?.title ?? null
        : parts.at(-1)?.replace(/-/g, " ") ?? null;

  return {
    projectId: project?.id ?? projectId,
    projectName: project?.title ?? null,
    lessonId: lesson?.id ?? lessonId,
    lessonTitle: lesson?.properties.title ?? null,
    documentKind: project || lessonId ? documentKind : documentKind === "page" ? "none" : documentKind,
    documentTitle,
    subject: lesson?.properties.subject || project?.subject || null,
    grade: lesson?.properties.grade || project?.grade || null,
    curriculum: project?.curriculum || null,
    competencies: lesson?.properties.competencies ?? [],
    selection,
    route: pathname,
    activity: activityFromRoute(pathname),
  };
}

export function buildContextGreeting(ctx: CopilotRuntimeContext): string {
  const bits: string[] = [];
  if (ctx.projectName) bits.push(`project **${ctx.projectName}**`);
  if (ctx.lessonTitle) bits.push(`lesson **${ctx.lessonTitle}**`);
  if (ctx.subject) bits.push(ctx.subject);
  if (ctx.grade) bits.push(ctx.grade);
  if (bits.length === 0) {
    return "I'm your AI Copilot for P.R.R.I.M.A. ON. Open a project or lesson so I can work with full context.";
  }
  return `I'm ready to help with ${bits.join(" · ")}. Pick a smart prompt or quick action — I already know where you are.`;
}
