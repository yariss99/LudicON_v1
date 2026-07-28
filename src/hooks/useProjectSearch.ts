import { useMemo, useState } from "react";
import type { Project } from "../types/project";
import { filterProjects } from "../utils/projectSearch";

export function useProjectSearch(projects: readonly Project[]) {
  const [query, setQuery] = useState("");

  const results = useMemo(
    () => filterProjects(projects, query),
    [projects, query],
  );

  return {
    query,
    setQuery,
    results,
    isFiltering: query.trim().length > 0,
    isEmpty: results.length === 0,
  };
}
