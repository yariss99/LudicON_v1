import { useMemo, useState } from "react";
import { analyzeConfidence } from "../../../engines/confidence";
import type { Project, ProjectResource } from "../../../types/project";

type UseConfidenceArgs = {
  project: Project;
  resources: ProjectResource[];
  intention?: string;
  defaultAvailableMinutes?: number;
};

export function useConfidence({
  project,
  resources,
  intention,
  defaultAvailableMinutes = 45,
}: UseConfidenceArgs) {
  const [availableMinutes, setAvailableMinutes] = useState(
    defaultAvailableMinutes,
  );

  const report = useMemo(
    () =>
      analyzeConfidence({
        project,
        resources,
        intention,
        availableMinutes,
      }),
    [project, resources, intention, availableMinutes],
  );

  return {
    report,
    availableMinutes,
    setAvailableMinutes,
  };
}
