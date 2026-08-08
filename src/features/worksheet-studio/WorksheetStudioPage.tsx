import { Link, Navigate, useLocation, useParams } from "react-router-dom";
import { useProjects } from "../../context/ProjectContext";
import { useExperienceMode } from "../experience-mode";
import { WorkflowNavigator } from "../teaching-workflow";
import { AdvancedWorksheetStudio } from "./components/AdvancedWorksheetStudio";
import { GuidedWorksheetWizard } from "./components/GuidedWorksheetWizard";
import { WorksheetStudioProvider } from "./hooks/useWorksheetStudio";
import { worksheetStudioRepository } from "./services/worksheetStudioRepository";

function worksheetPath(
  projectId: string,
  worksheetId: string,
  guided?: boolean,
) {
  return guided
    ? `/worksheet-studio/${projectId}/${worksheetId}/guided`
    : `/worksheet-studio/${projectId}/${worksheetId}`;
}

export function openWorksheetPath(
  projectId: string,
  worksheetId: string,
  mode: "guided" | "advanced" | null | undefined,
  guidedCompleted?: boolean,
) {
  if (mode === "guided" && !guidedCompleted) {
    return worksheetPath(projectId, worksheetId, true);
  }
  return worksheetPath(projectId, worksheetId, false);
}

function StudioShell({
  projectId,
  worksheetId,
}: {
  projectId: string;
  worksheetId: string;
}) {
  const location = useLocation();
  const { preference } = useExperienceMode();
  const isGuidedRoute = location.pathname.endsWith("/guided");
  const worksheet = worksheetStudioRepository.getById(worksheetId);

  if (
    !isGuidedRoute &&
    preference.mode === "guided" &&
    worksheet &&
    !worksheet.guidedCompleted
  ) {
    return (
      <Navigate to={worksheetPath(projectId, worksheetId, true)} replace />
    );
  }

  return (
    <WorksheetStudioProvider projectId={projectId} worksheetId={worksheetId}>
      <WorkflowNavigator
        projectId={projectId}
        kind="worksheet"
        resourceId={worksheetId}
        title={worksheet?.properties.title}
        subject={worksheet?.properties.subject}
        grade={worksheet?.properties.grade}
      />
      {isGuidedRoute ? <GuidedWorksheetWizard /> : <AdvancedWorksheetStudio />}
    </WorksheetStudioProvider>
  );
}

export function WorksheetStudioPage() {
  const { projectId = "", worksheetId = "" } = useParams();
  const { getProject } = useProjects();
  const project = getProject(projectId);
  const worksheet = worksheetId
    ? worksheetStudioRepository.getById(worksheetId)
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

  if (!worksheet || worksheet.projectId !== projectId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F8FA] p-8">
        <div className="max-w-md text-center">
          <h2 className="text-xl font-semibold">Worksheet not found</h2>
          <Link
            className="mt-4 inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
            to={`/studio/${projectId}/worksheets`}
          >
            Back to Worksheets
          </Link>
        </div>
      </div>
    );
  }

  return <StudioShell projectId={projectId} worksheetId={worksheetId} />;
}

export function WorksheetStudioEntryPage() {
  const { projectId = "" } = useParams();
  const { getProject } = useProjects();
  const { preference } = useExperienceMode();
  const project = getProject(projectId);

  if (!projectId || !project) {
    return <Navigate to="/projects" replace />;
  }

  const created = worksheetStudioRepository.create(projectId, {
    subject: project.subject,
    grade: project.grade,
    title: "Untitled worksheet",
  });

  return (
    <Navigate
      to={openWorksheetPath(
        projectId,
        created.id,
        preference.mode,
        created.guidedCompleted,
      )}
      replace
    />
  );
}

export default WorksheetStudioPage;
