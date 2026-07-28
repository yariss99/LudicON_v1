import { useCallback, useMemo, useState } from "react";
import { classroomService } from "../../../services/classroomService";
import type { ClassroomSearchQuery } from "../../../types/classroom";

const EMPTY_QUERY: ClassroomSearchQuery = {
  text: "",
  competency: "",
  topic: "",
  method: "",
  resource: "",
  schoolYear: "",
  feedback: "",
};

export function useClassroomIntelligence(initialProjectId?: string) {
  const [tick, setTick] = useState(0);
  const [query, setQuery] = useState<ClassroomSearchQuery>(EMPTY_QUERY);
  const [selectedProjectId, setSelectedProjectId] = useState(
    initialProjectId ?? "prj_fractions",
  );

  const refresh = useCallback(() => setTick((n) => n + 1), []);

  const insights = useMemo(() => {
    void tick;
    return classroomService.getInsights();
  }, [tick]);

  const suggestions = useMemo(() => {
    void tick;
    return classroomService.getSuggestions();
  }, [tick]);

  const facets = useMemo(() => {
    void tick;
    return classroomService.getFacets();
  }, [tick]);

  const hits = useMemo(() => {
    void tick;
    return classroomService.search(query);
  }, [query, tick]);

  const evolution = useMemo(() => {
    void tick;
    return classroomService.getEvolution(selectedProjectId);
  }, [selectedProjectId, tick]);

  const versions = useMemo(() => {
    void tick;
    return classroomService.listVersions(selectedProjectId);
  }, [selectedProjectId, tick]);

  const experienceOptions = useMemo(() => {
    void tick;
    const map = new Map<string, string>();
    for (const version of classroomService.listVersions()) {
      map.set(version.projectId, version.title);
    }
    return [...map.entries()].map(([id, title]) => ({ id, title }));
  }, [tick]);

  const restoreVersion = useCallback(
    (versionId: string) => {
      const project = classroomService.restoreVersion(versionId);
      refresh();
      return project;
    },
    [refresh],
  );

  return {
    insights,
    suggestions,
    facets,
    hits,
    query,
    setQuery,
    selectedProjectId,
    setSelectedProjectId,
    evolution,
    versions,
    experienceOptions,
    restoreVersion,
    refresh,
  };
}
