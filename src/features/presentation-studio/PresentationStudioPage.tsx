import { Link, Navigate, useLocation, useParams } from "react-router-dom";
import { useProjects } from "../../context/ProjectContext";
import { useExperienceMode } from "../experience-mode";
import { WorkflowNavigator } from "../teaching-workflow";
import { AdvancedPresentationStudio } from "./components/AdvancedPresentationStudio";
import { GuidedPresentationWizard } from "./components/GuidedPresentationWizard";
import { PresentationStudioProvider } from "./hooks/usePresentationStudio";
import { presentationStudioRepository } from "./services/presentationStudioRepository";

function presentationPath(
  projectId: string,
  presentationId: string,
  guided?: boolean,
) {
  return guided
    ? `/presentation-studio/${projectId}/${presentationId}/guided`
    : `/presentation-studio/${projectId}/${presentationId}`;
}

export function openPresentationPath(
  projectId: string,
  presentationId: string,
  mode: "guided" | "advanced" | null | undefined,
  guidedCompleted?: boolean,
) {
  if (mode === "guided" && !guidedCompleted) {
    return presentationPath(projectId, presentationId, true);
  }
  return presentationPath(projectId, presentationId, false);
}

function StudioShell({
  projectId,
  presentationId,
}: {
  projectId: string;
  presentationId: string;
}) {
  const location = useLocation();
  const { preference } = useExperienceMode();
  const isGuidedRoute = location.pathname.endsWith("/guided");
  const presentation = presentationStudioRepository.getById(presentationId);

  if (
    !isGuidedRoute &&
    preference.mode === "guided" &&
    presentation &&
    !presentation.guidedCompleted
  ) {
    return (
      <Navigate
        to={presentationPath(projectId, presentationId, true)}
        replace
      />
    );
  }

  return (
    <PresentationStudioProvider
      projectId={projectId}
      presentationId={presentationId}
    >
      <WorkflowNavigator
        projectId={projectId}
        kind="presentation"
        resourceId={presentationId}
        title={presentation?.properties.title}
        subject={presentation?.properties.subject}
        grade={presentation?.properties.grade}
      />
      {isGuidedRoute ? (
        <GuidedPresentationWizard />
      ) : (
        <AdvancedPresentationStudio />
      )}
    </PresentationStudioProvider>
  );
}

export function PresentationStudioPage() {
  const { projectId = "", presentationId = "" } = useParams();
  const { getProject } = useProjects();
  const project = getProject(projectId);
  const presentation = presentationId
    ? presentationStudioRepository.getById(presentationId)
    : undefined;

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

  if (!presentation || presentation.projectId !== projectId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F8FA] p-8">
        <div className="max-w-md text-center">
          <h2 className="text-xl font-semibold">Presentation not found</h2>
          <Link
            className="mt-4 inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
            to={`/studio/${projectId}/presentations`}
          >
            Back to Presentations
          </Link>
        </div>
      </div>
    );
  }

  return (
    <StudioShell projectId={projectId} presentationId={presentationId} />
  );
}

export function PresentationStudioEntryPage() {
  const { projectId = "" } = useParams();
  const { getProject } = useProjects();
  const { preference } = useExperienceMode();
  const project = getProject(projectId);

  if (!projectId || !project) {
    return <Navigate to="/projects" replace />;
  }

  const created = presentationStudioRepository.create(projectId, {
    subject: project.subject,
    grade: project.grade,
    title: "Untitled presentation",
    sourceKind: "blank",
  });

  return (
    <Navigate
      to={openPresentationPath(
        projectId,
        created.id,
        preference.mode,
        created.guidedCompleted,
      )}
      replace
    />
  );
}

export default PresentationStudioPage;
