import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProjects } from "../../context/ProjectContext";
import { useCopilot } from "../../modules/copilot";
import { wizardPath } from "../universal-creation-wizard/constants";
import type { CreateActionId } from "./constants";
import { CopilotSection } from "./components/CopilotSection";
import { CreateActionCards } from "./components/CreateActionCards";
import { GreetingHeader } from "./components/GreetingHeader";
import { LessonProgressCard } from "./components/LessonProgressCard";
import { ProjectsSection } from "./components/ProjectsSection";
import {
  homeLessonProgressStore,
  type HomeLessonProgress,
} from "./services/homeLessonProgressStore";

/**
 * Home Workspace — first screen after login / experience gate.
 */
export function HomeWorkspacePage() {
  const navigate = useNavigate();
  const { projects } = useProjects();
  const { projectId } = useCopilot();
  const [progress] = useState<HomeLessonProgress[]>(() =>
    homeLessonProgressStore.list(),
  );

  const activeProjects = useMemo(
    () =>
      [...projects]
        .filter((p) => !p.archived)
        .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt)),
    [projects],
  );

  const latestProjectId = activeProjects[0]?.id ?? projectId;

  const onAction = useCallback(
    (id: CreateActionId) => {
      const typeMap: Record<CreateActionId, "lesson" | "worksheet" | "game" | "story"> =
        {
          lesson: "lesson",
          worksheet: "worksheet",
          game: "game",
          story: "story",
        };
      navigate(
        wizardPath({
          type: typeMap[id],
          projectId: latestProjectId ?? undefined,
          source: "blank",
        }),
      );
    },
    [latestProjectId, navigate],
  );

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-8">
      <GreetingHeader />
      <CreateActionCards onAction={onAction} />

      {progress.length > 0 ? (
        <section aria-labelledby="lesson-progress">
          <h2
            id="lesson-progress"
            className="mb-3 text-lg font-semibold tracking-tight text-slate-900"
          >
            Continue building
          </h2>
          <div className="space-y-3">
            {progress.slice(0, 3).map((entry) => (
              <LessonProgressCard key={entry.lessonId} entry={entry} />
            ))}
          </div>
        </section>
      ) : null}

      <ProjectsSection projects={activeProjects} />
      <CopilotSection projectId={latestProjectId} />
    </div>
  );
}

export default HomeWorkspacePage;
