import { Link, Navigate, useLocation, useParams } from "react-router-dom";
import { useProjects } from "../../context/ProjectContext";
import { useExperienceMode } from "../experience-mode";
import { WorkflowNavigator } from "../teaching-workflow";
import { AdvancedStoryStudio } from "./components/AdvancedStoryStudio";
import { GuidedStoryWizard } from "./components/GuidedStoryWizard";
import { StoryStudioProvider } from "./hooks/useStoryStudio";
import { storyStudioRepository } from "./services/storyStudioRepository";

function storyPath(projectId: string, storyId: string, guided?: boolean) {
  return guided
    ? `/story-studio/${projectId}/${storyId}/guided`
    : `/story-studio/${projectId}/${storyId}`;
}

export function openStoryPath(
  projectId: string,
  storyId: string,
  mode: "guided" | "advanced" | null | undefined,
  guidedCompleted?: boolean,
) {
  if (mode === "guided" && !guidedCompleted) {
    return storyPath(projectId, storyId, true);
  }
  return storyPath(projectId, storyId, false);
}

function StudioShell({
  projectId,
  storyId,
}: {
  projectId: string;
  storyId: string;
}) {
  const location = useLocation();
  const { preference } = useExperienceMode();
  const isGuidedRoute = location.pathname.endsWith("/guided");
  const story = storyStudioRepository.getById(storyId);

  if (
    !isGuidedRoute &&
    preference.mode === "guided" &&
    story &&
    !story.guidedCompleted
  ) {
    return <Navigate to={storyPath(projectId, storyId, true)} replace />;
  }

  return (
    <StoryStudioProvider projectId={projectId} storyId={storyId}>
      <WorkflowNavigator
        projectId={projectId}
        kind="story"
        resourceId={storyId}
        title={story?.properties.title}
        subject={story?.properties.subject}
        grade={story?.properties.grade}
      />
      {isGuidedRoute ? <GuidedStoryWizard /> : <AdvancedStoryStudio />}
    </StoryStudioProvider>
  );
}

export function StoryStudioPage() {
  const { projectId = "", storyId = "" } = useParams();
  const { getProject } = useProjects();
  const project = getProject(projectId);
  const story = storyId ? storyStudioRepository.getById(storyId) : undefined;

  if (!projectId) return <Navigate to="/projects" replace />;

  if (!project) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F8FA] p-8">
        <div className="max-w-md text-center">
          <h2 className="text-xl font-semibold">Project not found</h2>
          <Link
            className="mt-4 inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
            to="/projects"
          >
            Back to projects
          </Link>
        </div>
      </div>
    );
  }

  if (!story || story.projectId !== projectId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F8FA] p-8">
        <div className="max-w-md text-center">
          <h2 className="text-xl font-semibold">Story not found</h2>
          <Link
            className="mt-4 inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
            to={`/studio/${projectId}/stories`}
          >
            Back to Stories
          </Link>
        </div>
      </div>
    );
  }

  return <StudioShell projectId={projectId} storyId={storyId} />;
}

export function StoryStudioEntryPage() {
  const { projectId = "" } = useParams();
  const { getProject } = useProjects();
  const { preference } = useExperienceMode();
  const project = getProject(projectId);

  if (!projectId || !project) {
    return <Navigate to="/projects" replace />;
  }

  const created = storyStudioRepository.create(projectId, {
    subject: project.subject,
    grade: project.grade,
    title: "Untitled story",
    sourceKind: "blank",
    theme: "adventure",
  });

  return (
    <Navigate
      to={openStoryPath(
        projectId,
        created.id,
        preference.mode,
        created.guidedCompleted,
      )}
      replace
    />
  );
}

export default StoryStudioPage;
