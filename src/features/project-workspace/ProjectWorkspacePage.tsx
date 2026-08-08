import { Link, Navigate, Route, Routes, useParams } from "react-router-dom";
import { useProjects } from "../../context/ProjectContext";
import { ProjectWorkspaceProvider } from "./hooks/useProjectWorkspace";
import { ProjectWorkspaceLayout } from "./layout/ProjectWorkspaceLayout";
import { OverviewTab } from "./pages/OverviewTab";
import { LessonsTab } from "./pages/LessonsTab";
import { WorksheetsTab } from "./pages/WorksheetsTab";
import { AssessmentsTab } from "./pages/AssessmentsTab";
import { StoriesTab } from "./pages/StoriesTab";
import { GamesTab } from "./pages/GamesTab";
import { PresentationsTab } from "./pages/PresentationsTab";
import { ResourcesTab } from "./pages/ResourcesTab";
import { ClassroomTab } from "./pages/ClassroomTab";
import { AnalyticsTab } from "./pages/AnalyticsTab";
import { AiSuggestionsTab } from "./pages/AiSuggestionsTab";
import { VersionsTab } from "./pages/VersionsTab";
import { ActivityTab } from "./pages/ActivityTab";
import { SettingsTab } from "./pages/SettingsTab";
import "./styles/project-workspace.css";

function ProjectMissing({ projectId }: { projectId: string }) {
  return (
    <div className="project-workspace">
      <div className="pw-missing">
        <h1 className="pw-title">Proiect negăsit</h1>
        <p className="pw-lead">
          Nu există un proiect cu ID-ul <code>{projectId}</code>.
        </p>
        <Link className="pw-btn pw-btn-primary" to="/projects">
          Înapoi la proiecte
        </Link>
      </div>
    </div>
  );
}

/**
 * Project Workspace root — every educational artifact lives here.
 * Mounted at `/studio/:projectId/*` (and optionally `/projects/:projectId/*`).
 */
export function ProjectWorkspacePage() {
  const { projectId = "" } = useParams();
  const { getProject } = useProjects();
  const project = getProject(projectId);

  if (!projectId) {
    return <Navigate to="/projects" replace />;
  }

  if (!project) {
    return <ProjectMissing projectId={projectId} />;
  }

  return (
    <ProjectWorkspaceProvider projectId={project.id}>
      <Routes>
        <Route element={<ProjectWorkspaceLayout />}>
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<OverviewTab />} />
          <Route path="lessons" element={<LessonsTab />} />
          <Route path="worksheets" element={<WorksheetsTab />} />
          <Route path="assessments" element={<AssessmentsTab />} />
          <Route path="stories" element={<StoriesTab />} />
          <Route path="games" element={<GamesTab />} />
          <Route path="presentations" element={<PresentationsTab />} />
          <Route path="resources" element={<ResourcesTab />} />
          <Route path="classroom" element={<ClassroomTab />} />
          <Route path="analytics" element={<AnalyticsTab />} />
          <Route path="ai" element={<AiSuggestionsTab />} />
          <Route path="versions" element={<VersionsTab />} />
          <Route path="activity" element={<ActivityTab />} />
          <Route path="settings" element={<SettingsTab />} />
          <Route path="*" element={<Navigate to="overview" replace />} />
        </Route>
      </Routes>
    </ProjectWorkspaceProvider>
  );
}

export default ProjectWorkspacePage;
