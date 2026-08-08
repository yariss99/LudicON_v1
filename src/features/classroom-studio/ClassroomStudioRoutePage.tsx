import { Navigate, useParams, useSearchParams } from "react-router-dom";
import { useProjects } from "../../context/ProjectContext";
import { ClassroomStudioPage } from "./ClassroomStudioPage";

/** Standalone route: `/classroom-studio/:projectId` or `?project=` */
export function ClassroomStudioRoutePage() {
  const { projectId: paramId = "" } = useParams();
  const [params] = useSearchParams();
  const { projects, getProject } = useProjects();
  const projectId =
    paramId || params.get("project") || projects[0]?.id || "";

  if (!projectId || !getProject(projectId)) {
    return <Navigate to="/projects" replace />;
  }

  return <ClassroomStudioPage projectId={projectId} />;
}

export default ClassroomStudioRoutePage;
