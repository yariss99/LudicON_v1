import { useMemo, useState } from "react";
import { adaptFindingsToDna } from "../../../engines/dna";
import { analyzeLearningExperience } from "../../../engines/pedagogy";
import { pedagogicalDnaService } from "../../../services/pedagogicalDnaService";
import type { Project, ProjectResource } from "../../../types/project";

type UsePedagogicalReviewArgs = {
  project: Project;
  resources: ProjectResource[];
  intention?: string;
  defaultAvailableMinutes?: number;
};

export function usePedagogicalReview({
  project,
  resources,
  intention,
  defaultAvailableMinutes = 45,
}: UsePedagogicalReviewArgs) {
  const [availableMinutes, setAvailableMinutes] = useState(
    defaultAvailableMinutes,
  );

  const dna = useMemo(() => pedagogicalDnaService.getProfile(), []);

  const review = useMemo(() => {
    const base = analyzeLearningExperience({
      project,
      resources,
      intention,
      availableMinutes,
    });
    return {
      ...base,
      suggestions: adaptFindingsToDna(base.suggestions, dna),
      improvements: adaptFindingsToDna(base.improvements, dna),
    };
  }, [project, resources, intention, availableMinutes, dna]);

  return {
    review,
    dna,
    availableMinutes,
    setAvailableMinutes,
  };
}
