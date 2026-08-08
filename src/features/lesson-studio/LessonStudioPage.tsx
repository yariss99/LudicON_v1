import { Link, Navigate, useLocation, useParams } from "react-router-dom";
import { useProjects } from "../../context/ProjectContext";
import { useExperienceMode } from "../experience-mode";
import { WorkflowNavigator } from "../teaching-workflow";
import { AdvancedLessonStudio } from "./components/AdvancedLessonStudio";
import { GuidedLessonWizard } from "./components/GuidedLessonWizard";
import { LessonStudioProvider } from "./hooks/useLessonStudio";
import { lessonStudioRepository } from "./services/lessonStudioRepository";
import "./styles/lesson-studio.css";

function lessonPath(projectId: string, lessonId: string, guided?: boolean) {
  return guided
    ? `/lesson-studio/${projectId}/${lessonId}/guided`
    : `/lesson-studio/${projectId}/${lessonId}`;
}

export function openLessonPath(
  projectId: string,
  lessonId: string,
  mode: "guided" | "advanced" | null | undefined,
  guidedCompleted?: boolean,
) {
  if (mode === "guided" && !guidedCompleted) {
    return lessonPath(projectId, lessonId, true);
  }
  return lessonPath(projectId, lessonId, false);
}

function StudioShell({
  projectId,
  lessonId,
}: {
  projectId: string;
  lessonId: string;
}) {
  const location = useLocation();
  const { preference } = useExperienceMode();
  const isGuidedRoute = location.pathname.endsWith("/guided");
  const lesson = lessonStudioRepository.getById(lessonId);

  // Guided preference + incomplete wizard → force wizard route
  if (
    !isGuidedRoute &&
    preference.mode === "guided" &&
    lesson &&
    !lesson.guidedCompleted
  ) {
    return (
      <Navigate to={lessonPath(projectId, lessonId, true)} replace />
    );
  }

  return (
    <LessonStudioProvider projectId={projectId} lessonId={lessonId}>
      <WorkflowNavigator
        projectId={projectId}
        kind="lesson"
        resourceId={lessonId}
        title={lesson?.properties.title}
        subject={lesson?.properties.subject}
        grade={lesson?.properties.grade}
      />
      {isGuidedRoute ? <GuidedLessonWizard /> : <AdvancedLessonStudio />}
    </LessonStudioProvider>
  );
}

export function LessonStudioPage() {
  const { projectId = "", lessonId = "" } = useParams();
  const { getProject } = useProjects();
  const project = getProject(projectId);
  const lesson = lessonId
    ? lessonStudioRepository.getById(lessonId)
    : undefined;

  if (!projectId) {
    return <Navigate to="/projects" replace />;
  }

  if (!project) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F8FA] p-8">
        <div className="max-w-md text-center">
          <h2 className="text-xl font-semibold text-slate-900">
            Project not found
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Cannot open Lesson Studio without a project.
          </p>
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

  if (!lesson || lesson.projectId !== projectId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F8FA] p-8">
        <div className="max-w-md text-center">
          <h2 className="text-xl font-semibold text-slate-900">
            Lesson not found
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            This lesson does not exist in the selected project.
          </p>
          <Link
            className="mt-4 inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
            to={`/studio/${projectId}/lessons`}
          >
            Back to Lesson Library
          </Link>
        </div>
      </div>
    );
  }

  return <StudioShell projectId={projectId} lessonId={lessonId} />;
}

/** Creates a lesson and opens Guided or Advanced based on experience mode. */
export function LessonStudioEntryPage() {
  const { projectId = "" } = useParams();
  const { getProject } = useProjects();
  const { preference } = useExperienceMode();
  const project = getProject(projectId);

  if (!projectId || !project) {
    return <Navigate to="/projects" replace />;
  }

  const created = lessonStudioRepository.create(projectId, {
    subject: project.subject,
    grade: project.grade,
    title: "Untitled lesson",
  });

  return (
    <Navigate
      to={openLessonPath(
        projectId,
        created.id,
        preference.mode,
        created.guidedCompleted,
      )}
      replace
    />
  );
}

export default LessonStudioPage;
