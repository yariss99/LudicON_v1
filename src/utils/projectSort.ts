import type { Project, ProjectSortOption } from "../types/project";

export const PROJECT_SORT_OPTIONS: Array<{
  value: ProjectSortOption;
  label: string;
}> = [
  { value: "recently_updated", label: "Recently updated" },
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "alphabetical", label: "Alphabetical" },
];

export function sortProjects(
  projects: readonly Project[],
  sort: ProjectSortOption,
): Project[] {
  const next = [...projects];

  switch (sort) {
    case "newest":
      return next.sort(
        (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
      );
    case "oldest":
      return next.sort(
        (a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt),
      );
    case "alphabetical":
      return next.sort((a, b) =>
        a.title.localeCompare(b.title, "ro", { sensitivity: "base" }),
      );
    case "recently_updated":
    default:
      return next.sort((a, b) => {
        if (a.favorite !== b.favorite) return a.favorite ? -1 : 1;
        return Date.parse(b.updatedAt) - Date.parse(a.updatedAt);
      });
  }
}
