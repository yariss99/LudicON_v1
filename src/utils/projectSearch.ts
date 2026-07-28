import type { Project } from "../types/project";

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export function matchesProjectQuery(project: Project, query: string): boolean {
  const needle = normalize(query);
  if (!needle) return true;

  const haystack = [project.title, project.subject, project.grade]
    .map(normalize)
    .join(" ");

  return haystack.includes(needle);
}

export function filterProjects(
  projects: readonly Project[],
  query: string,
): Project[] {
  if (!query.trim()) return [...projects];
  return projects.filter((project) => matchesProjectQuery(project, query));
}

export function sortProjectsByUpdatedAt(
  projects: readonly Project[],
): Project[] {
  return [...projects].sort((a, b) => {
    if (a.favorite !== b.favorite) return a.favorite ? -1 : 1;
    return Date.parse(b.updatedAt) - Date.parse(a.updatedAt);
  });
}

export function activeProjects(projects: readonly Project[]): Project[] {
  return projects.filter((project) => !project.archived);
}

export function archivedProjects(projects: readonly Project[]): Project[] {
  return projects.filter((project) => project.archived);
}
