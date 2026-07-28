import type { Project, ProjectResource } from "../../../types/project";

function resourceScore(resource: ProjectResource): number {
  if (resource.status === "ready") return 1;
  if (resource.status === "draft") return 0.55;
  return 0;
}

export function getProjectProgress(project: Project): number {
  if (project.resources.length === 0) return 0;
  const total = project.resources.reduce(
    (sum, resource) => sum + resourceScore(resource),
    0,
  );
  return Math.round((total / project.resources.length) * 100);
}

export function getRemainingTasks(project: Project): string[] {
  return project.resources
    .filter((resource) => resource.status !== "ready")
    .map((resource) => resource.label)
    .slice(0, 3);
}
