import type { ConfidenceActionId } from "../types/confidence";
import type { Project, ProjectResource } from "../types/project";
import type { IntentArtifactId, ParsedStudioIntent } from "../types/studio";
import { projectService } from "./projectService";
import { nowIso } from "../utils/date";

function upsertResource(
  resources: ProjectResource[],
  type: ProjectResource["type"],
  label: string,
  status: ProjectResource["status"],
): ProjectResource[] {
  const existing = resources.find((r) => r.type === type);
  if (existing) {
    return resources.map((r) =>
      r.type === type ? { ...r, label, status } : r,
    );
  }
  return [
    ...resources,
    { id: type, type, label, status },
  ];
}

function setTypeStatus(
  resources: ProjectResource[],
  type: ProjectResource["type"],
  status: ProjectResource["status"],
  label?: string,
): ProjectResource[] {
  if (!resources.some((r) => r.type === type)) {
    return upsertResource(resources, type, label ?? type, status);
  }
  return resources.map((r) =>
    r.type === type
      ? { ...r, status, label: label?.trim() || r.label }
      : r,
  );
}

function livingWorkspaceResources(
  intent: ParsedStudioIntent,
): ProjectResource[] {
  const selected = new Set(intent.artifacts);

  const artifact = (
    id: string,
    type: ProjectResource["type"],
    label: string,
    force = false,
  ): ProjectResource | null => {
    if (!force && !selected.has(id as IntentArtifactId)) return null;
    return {
      id,
      type,
      label,
      status: "draft",
    };
  };

  return [
    artifact("lesson", "lesson", "Lesson", true),
    artifact("activities", "activities", "Activities", true),
    artifact("worksheet", "worksheet", "Worksheet", true),
    artifact("presentation", "presentation", "Presentation", true),
    artifact("assessment", "assessment", "Assessment", true),
    artifact("game", "game", "Game", true),
    artifact("reflection", "reflection", "Reflection", true),
    {
      id: "resources",
      type: "resources",
      label: "Resources",
      status: "empty",
    },
  ].filter((item): item is ProjectResource => item !== null);
}

/**
 * Experience Engine orchestration:
 * intention → pedagogical thinking → Living Workspace.
 */
export class StudioService {
  createProjectFromIntent(intent: ParsedStudioIntent): Project {
    const baseTitle = intent.title.trim() || "New learning experience";
    let title = baseTitle;
    let suffix = 2;
    while (projectService.isTitleTaken(title)) {
      title = `${baseTitle} ${suffix}`;
      suffix += 1;
    }

    // Friendly title for the LEGO fractions demo story
    if (/lego/i.test(intent.prompt) && /fraction/i.test(intent.prompt)) {
      title = projectService.isTitleTaken("Fractions with LEGO")
        ? title
        : "Fractions with LEGO";
    }

    const project = projectService.create({
      title,
      subject: intent.subject,
      grade: intent.grade,
      description: intent.description,
      color: intent.color,
      icon: intent.icon,
      favorite: false,
    });

    return projectService.replaceResources(
      project.id,
      livingWorkspaceResources(intent),
    );
  }

  updateResourceLabel(
    projectId: string,
    resourceId: string,
    label: string,
  ): Project {
    const project = projectService.getById(projectId);
    if (!project) throw new Error("NOT_FOUND");

    const resources = project.resources.map((resource) =>
      resource.id === resourceId
        ? { ...resource, label: label.trim() || resource.label }
        : resource,
    );

    return projectService.replaceResources(projectId, resources);
  }

  selectGameActivity(
    projectId: string,
    activityTitle: string,
  ): Project {
    const project = projectService.getById(projectId);
    if (!project) throw new Error("NOT_FOUND");

    const resources = project.resources.map((resource) =>
      resource.type === "game"
        ? {
            ...resource,
            label: activityTitle,
            status: "ready" as const,
          }
        : resource,
    );

    return projectService.replaceResources(projectId, resources);
  }

  /**
   * One-click confidence improvements — teacher-triggered only.
   * Changes the learning experience, never “scores” the teacher.
   */
  applyConfidenceAction(
    projectId: string,
    actionId: ConfidenceActionId,
  ): Project {
    const project = projectService.getById(projectId);
    if (!project) throw new Error("NOT_FOUND");

    let resources = [...project.resources];

    switch (actionId) {
      case "ready_lesson":
        resources = setTypeStatus(resources, "lesson", "ready");
        break;
      case "add_short_assessment":
        resources = upsertResource(
          resources,
          "assessment",
          "Exit ticket (2 min)",
          "ready",
        );
        break;
      case "ready_assessment":
        resources = setTypeStatus(resources, "assessment", "ready");
        break;
      case "add_reflection":
        resources = upsertResource(
          resources,
          "reflection",
          "3-minute reflection",
          "ready",
        );
        break;
      case "ready_reflection":
        resources = setTypeStatus(resources, "reflection", "ready");
        break;
      case "add_collaborative_activity":
        resources = upsertResource(
          resources,
          "activities",
          "Pair talk — share & build",
          "ready",
        );
        break;
      case "add_support_path":
        resources = setTypeStatus(
          resources,
          "worksheet",
          "ready",
          "Practice — support + challenge",
        );
        break;
      case "ready_resources":
        resources = upsertResource(
          resources,
          "resources",
          "Materials checklist",
          "ready",
        );
        break;
      case "trim_optional_block":
        resources = setTypeStatus(
          resources,
          "presentation",
          "empty",
          "Presentation (optional)",
        );
        break;
      default:
        break;
    }

    return projectService.replaceResources(projectId, resources);
  }

  async wait(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }

  touchCreatedAtLabel(iso: string = nowIso()): string {
    return iso;
  }
}

export const studioService = new StudioService();
