import { useMemo, useState } from "react";
import type { Project, ProjectSortOption } from "../types/project";
import {
  activeProjects,
  archivedProjects,
  filterProjects,
} from "../utils/projectSearch";
import { sortProjects } from "../utils/projectSort";

export type ProjectListScope = "active" | "archived" | "all";

export function useProjectList(projects: readonly Project[]) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<ProjectSortOption>("recently_updated");
  const [scope, setScope] = useState<ProjectListScope>("active");

  const scoped = useMemo(() => {
    if (scope === "archived") return archivedProjects(projects);
    if (scope === "all") return [...projects];
    return activeProjects(projects);
  }, [projects, scope]);

  const results = useMemo(() => {
    const filtered = filterProjects(scoped, query);
    return sortProjects(filtered, sort);
  }, [scoped, query, sort]);

  return {
    query,
    setQuery,
    sort,
    setSort,
    scope,
    setScope,
    results,
    isFiltering: query.trim().length > 0,
    isEmpty: results.length === 0,
    activeCount: activeProjects(projects).length,
    archivedCount: archivedProjects(projects).length,
  };
}
