import { Link, Navigate, useLocation, useParams } from "react-router-dom";
import { useProjects } from "../../context/ProjectContext";
import { useExperienceMode } from "../experience-mode";
import { projectWorkspaceRepository } from "../project-workspace/services/projectWorkspaceRepository";
import { WorkflowNavigator } from "../teaching-workflow";
import { AdvancedAssessmentStudio } from "./components/AdvancedAssessmentStudio";
import { GuidedAssessmentWizard } from "./components/GuidedAssessmentWizard";
import { AssessmentStudioProvider } from "./hooks/useAssessmentStudio";
import { assessmentStudioRepository } from "./services/assessmentStudioRepository";

function assessmentPath(
  projectId: string,
  assessmentId: string,
  guided?: boolean,
) {
  return guided
    ? `/assessment-studio/${projectId}/${assessmentId}/guided`
    : `/assessment-studio/${projectId}/${assessmentId}`;
}

export function openAssessmentPath(
  projectId: string,
  assessmentId: string,
  mode: "guided" | "advanced" | null | undefined,
  guidedCompleted?: boolean,
) {
  if (mode === "guided" && !guidedCompleted) {
    return assessmentPath(projectId, assessmentId, true);
  }
  return assessmentPath(projectId, assessmentId, false);
}

function StudioShell({
  projectId,
  assessmentId,
}: {
  projectId: string;
  assessmentId: string;
}) {
  const location = useLocation();
  const { preference } = useExperienceMode();
  const isGuidedRoute = location.pathname.endsWith("/guided");
  const assessment = assessmentStudioRepository.getById(assessmentId);

  if (
    !isGuidedRoute &&
    preference.mode === "guided" &&
    assessment &&
    !assessment.guidedCompleted
  ) {
    return (
      <Navigate to={assessmentPath(projectId, assessmentId, true)} replace />
    );
  }

  return (
    <AssessmentStudioProvider
      projectId={projectId}
      assessmentId={assessmentId}
    >
      <WorkflowNavigator
        projectId={projectId}
        kind="assessment"
        resourceId={assessmentId}
        title={assessment?.properties.title}
        subject={assessment?.properties.subject}
        grade={assessment?.properties.grade}
      />
      {isGuidedRoute ? (
        <GuidedAssessmentWizard />
      ) : (
        <AdvancedAssessmentStudio />
      )}
    </AssessmentStudioProvider>
  );
}

export function AssessmentStudioPage() {
  const { projectId = "", assessmentId = "" } = useParams();
  const { getProject } = useProjects();
  const project = getProject(projectId);
  const assessment = assessmentId
    ? assessmentStudioRepository.getById(assessmentId)
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

  if (!assessment || assessment.projectId !== projectId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F8FA] p-8">
        <div className="max-w-md text-center">
          <h2 className="text-xl font-semibold">Assessment not found</h2>
          <Link
            className="mt-4 inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
            to={`/studio/${projectId}/assessments`}
          >
            Back to Assessments
          </Link>
        </div>
      </div>
    );
  }

  return <StudioShell projectId={projectId} assessmentId={assessmentId} />;
}

export function AssessmentStudioEntryPage() {
  const { projectId = "" } = useParams();
  const { getProject } = useProjects();
  const { preference } = useExperienceMode();
  const project = getProject(projectId);

  if (!projectId || !project) {
    return <Navigate to="/projects" replace />;
  }

  const meta = projectWorkspaceRepository.getMetadata(projectId);
  const created = assessmentStudioRepository.create(projectId, {
    subject: project.subject,
    grade: project.grade,
    title: "Untitled assessment",
    projectCompetencies: [...meta.competencies],
  });

  return (
    <Navigate
      to={openAssessmentPath(
        projectId,
        created.id,
        preference.mode,
        created.guidedCompleted,
      )}
      replace
    />
  );
}

export default AssessmentStudioPage;
