import "./App.css";

import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";

import { ProjectProvider } from "./context/ProjectContext";
import {
  AiCopilotHost,
  AiCopilotProvider,
} from "./features/ai-copilot";
import { CopilotHost, CopilotProvider } from "./modules/copilot";
import {
  ExperienceGate,
  ExperienceModePage,
  ExperienceModeProvider,
} from "./features/experience-mode";
import {
  AppShellLayout,
  DashboardPage,
  ProjectsPage,
  AssistantEntryPage,
  LessonBuilderEntryShell,
  WorksheetBuilderEntryShell,
  AssessmentBuilderEntryShell,
  GameBuilderEntryShell,
  StoryBuilderEntryShell,
  PresentationBuilderEntryShell,
  ResourceCenterEntryShell,
  ClassroomStudioEntryShell,
  AnalyticsPage,
  SettingsPage,
  NotificationsPage,
} from "./features/app-shell";
import { ProjectDetails } from "./features/projects/pages/ProjectDetails";
import { NewProjectPage } from "./features/create-project";

const CreateExperiencePage = lazy(() =>
  import("./features/create-experience").then((m) => ({
    default: m.CreateExperiencePage,
  })),
);
const UniversalCreationWizardPage = lazy(() =>
  import("./features/universal-creation-wizard").then((m) => ({
    default: m.UniversalCreationWizardPage,
  })),
);
const BlockEditorPage = lazy(() =>
  import("./modules/block-editor").then((m) => ({
    default: m.BlockEditorPage,
  })),
);
const ProjectWorkspacePage = lazy(() =>
  import("./features/project-workspace").then((m) => ({
    default: m.ProjectWorkspacePage,
  })),
);
const LessonStudioPage = lazy(() =>
  import("./features/lesson-studio").then((m) => ({
    default: m.LessonStudioPage,
  })),
);
const LessonStudioEntryPage = lazy(() =>
  import("./features/lesson-studio").then((m) => ({
    default: m.LessonStudioEntryPage,
  })),
);
const WorksheetStudioPage = lazy(() =>
  import("./features/worksheet-studio").then((m) => ({
    default: m.WorksheetStudioPage,
  })),
);
const WorksheetStudioEntryPage = lazy(() =>
  import("./features/worksheet-studio").then((m) => ({
    default: m.WorksheetStudioEntryPage,
  })),
);
const AssessmentStudioPage = lazy(() =>
  import("./features/assessment-studio").then((m) => ({
    default: m.AssessmentStudioPage,
  })),
);
const AssessmentStudioEntryPage = lazy(() =>
  import("./features/assessment-studio").then((m) => ({
    default: m.AssessmentStudioEntryPage,
  })),
);
const LessonBuilderPage = lazy(() =>
  import("./features/lesson-builder").then((m) => ({
    default: m.LessonBuilderPage,
  })),
);
const LessonBuilderEntryPage = lazy(() =>
  import("./features/lesson-builder").then((m) => ({
    default: m.LessonBuilderEntryPage,
  })),
);
const AssessmentBuilderPage = lazy(() =>
  import("./features/assessment-builder").then((m) => ({
    default: m.AssessmentBuilderPage,
  })),
);
const AssessmentBuilderEntryPage = lazy(() =>
  import("./features/assessment-builder").then((m) => ({
    default: m.AssessmentBuilderEntryPage,
  })),
);
const StoryBuilderPage = lazy(() =>
  import("./features/story-builder").then((m) => ({
    default: m.StoryBuilderPage,
  })),
);
const StoryBuilderEntryPage = lazy(() =>
  import("./features/story-builder").then((m) => ({
    default: m.StoryBuilderEntryPage,
  })),
);
const StoryStudioPage = lazy(() =>
  import("./features/story-studio").then((m) => ({
    default: m.StoryStudioPage,
  })),
);
const StoryStudioEntryPage = lazy(() =>
  import("./features/story-studio").then((m) => ({
    default: m.StoryStudioEntryPage,
  })),
);
const GameBuilderPage = lazy(() =>
  import("./features/game-builder").then((m) => ({
    default: m.GameBuilderPage,
  })),
);
const GameBuilderEntryPage = lazy(() =>
  import("./features/game-builder").then((m) => ({
    default: m.GameBuilderEntryPage,
  })),
);
const GameStudioPage = lazy(() =>
  import("./features/game-studio").then((m) => ({
    default: m.GameStudioPage,
  })),
);
const GameStudioEntryPage = lazy(() =>
  import("./features/game-studio").then((m) => ({
    default: m.GameStudioEntryPage,
  })),
);
const PresentationBuilderPage = lazy(() =>
  import("./features/presentation-builder").then((m) => ({
    default: m.PresentationBuilderPage,
  })),
);
const PresentationBuilderEntryPage = lazy(() =>
  import("./features/presentation-builder").then((m) => ({
    default: m.PresentationBuilderEntryPage,
  })),
);
const PresentationStudioPage = lazy(() =>
  import("./features/presentation-studio").then((m) => ({
    default: m.PresentationStudioPage,
  })),
);
const PresentationStudioEntryPage = lazy(() =>
  import("./features/presentation-studio").then((m) => ({
    default: m.PresentationStudioEntryPage,
  })),
);
const ResourceCenterPage = lazy(() =>
  import("./features/resource-center").then((m) => ({
    default: m.ResourceCenterPage,
  })),
);
const ResourceStudioRoutePage = lazy(() =>
  import("./features/resource-studio/ResourceStudioRoutePage").then((m) => ({
    default: m.ResourceStudioRoutePage,
  })),
);
const ClassroomStudioRoutePage = lazy(() =>
  import("./features/classroom-studio").then((m) => ({
    default: m.ClassroomStudioRoutePage,
  })),
);

function RouteFallback() {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-[#F7F8FA]"
      role="status"
      aria-label="Loading"
    >
      <div className="w-full max-w-md space-y-3 px-6">
        <div className="h-4 w-32 animate-pulse rounded-full bg-slate-200" />
        <div className="h-10 w-2/3 animate-pulse rounded-2xl bg-slate-200" />
        <div className="h-40 animate-pulse rounded-3xl bg-slate-200/80" />
      </div>
    </div>
  );
}

function App() {
  return (
    <ProjectProvider>
      <BrowserRouter>
        <ExperienceModeProvider>
          <AiCopilotProvider>
            <CopilotProvider>
            <Suspense fallback={<RouteFallback />}>
              <Routes>
                <Route
                  path="/onboarding/experience"
                  element={<ExperienceModePage />}
                />

                <Route
                  element={
                    <ExperienceGate>
                      <AppShellLayout />
                    </ExperienceGate>
                  }
                >
                  <Route index element={<DashboardPage />} />
                  <Route path="projects" element={<ProjectsPage />} />
                  <Route path="projects/new" element={<NewProjectPage />} />
                  <Route path="projects/:projectId" element={<ProjectDetails />} />
                  <Route path="assistant" element={<AssistantEntryPage />} />
                  <Route
                    path="builders/lesson"
                    element={<LessonBuilderEntryShell />}
                  />
                  <Route
                    path="builders/worksheet"
                    element={<WorksheetBuilderEntryShell />}
                  />
                  <Route
                    path="builders/assessment"
                    element={<AssessmentBuilderEntryShell />}
                  />
                  <Route
                    path="builders/game"
                    element={<GameBuilderEntryShell />}
                  />
                  <Route
                    path="builders/story"
                    element={<StoryBuilderEntryShell />}
                  />
                  <Route
                    path="builders/presentation"
                    element={<PresentationBuilderEntryShell />}
                  />
                  <Route path="resources" element={<ResourceCenterEntryShell />} />
                  <Route
                    path="builders/classroom"
                    element={<ClassroomStudioEntryShell />}
                  />
                  <Route path="analytics" element={<AnalyticsPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                  <Route path="notifications" element={<NotificationsPage />} />
                </Route>

                <Route
                  path="/create"
                  element={<UniversalCreationWizardPage />}
                />
                <Route
                  path="/create/experience"
                  element={<CreateExperiencePage />}
                />
                <Route path="/block-editor" element={<BlockEditorPage />} />
                <Route
                  path="/resource-studio"
                  element={<ResourceStudioRoutePage />}
                />
                <Route
                  path="/classroom-studio"
                  element={<ClassroomStudioRoutePage />}
                />
                <Route
                  path="/classroom-studio/:projectId"
                  element={<ClassroomStudioRoutePage />}
                />
                <Route path="/resource-center" element={<ResourceCenterPage />} />
                <Route
                  path="/resource-center/:resourceId"
                  element={<ResourceCenterPage />}
                />

                <Route
                  path="/studio/:projectId/*"
                  element={<ProjectWorkspacePage />}
                />

                <Route
                  path="/lesson-studio/:projectId/:lessonId/guided"
                  element={<LessonStudioPage />}
                />
                <Route
                  path="/lesson-studio/:projectId/:lessonId"
                  element={<LessonStudioPage />}
                />
                <Route
                  path="/lesson-studio/:projectId"
                  element={<LessonStudioEntryPage />}
                />
                <Route
                  path="/worksheet-studio/:projectId/:worksheetId/guided"
                  element={<WorksheetStudioPage />}
                />
                <Route
                  path="/worksheet-studio/:projectId/:worksheetId"
                  element={<WorksheetStudioPage />}
                />
                <Route
                  path="/worksheet-studio/:projectId"
                  element={<WorksheetStudioEntryPage />}
                />
                <Route
                  path="/assessment-studio/:projectId/:assessmentId/guided"
                  element={<AssessmentStudioPage />}
                />
                <Route
                  path="/assessment-studio/:projectId/:assessmentId"
                  element={<AssessmentStudioPage />}
                />
                <Route
                  path="/assessment-studio/:projectId"
                  element={<AssessmentStudioEntryPage />}
                />
                <Route
                  path="/lesson-builder/:projectId/:lessonId"
                  element={<LessonBuilderPage />}
                />
                <Route
                  path="/lesson-builder/:projectId"
                  element={<LessonBuilderEntryPage />}
                />
                <Route
                  path="/assessment-builder/:projectId/:assessmentId"
                  element={<AssessmentBuilderPage />}
                />
                <Route
                  path="/assessment-builder/:projectId"
                  element={<AssessmentBuilderEntryPage />}
                />
                <Route
                  path="/story-studio/:projectId/:storyId/guided"
                  element={<StoryStudioPage />}
                />
                <Route
                  path="/story-studio/:projectId/:storyId"
                  element={<StoryStudioPage />}
                />
                <Route
                  path="/story-studio/:projectId"
                  element={<StoryStudioEntryPage />}
                />
                <Route
                  path="/story-builder/:projectId/:storyId"
                  element={<StoryBuilderPage />}
                />
                <Route
                  path="/story-builder/:projectId"
                  element={<StoryBuilderEntryPage />}
                />
                <Route
                  path="/game-studio/:projectId/:gameId/guided"
                  element={<GameStudioPage />}
                />
                <Route
                  path="/game-studio/:projectId/:gameId"
                  element={<GameStudioPage />}
                />
                <Route
                  path="/game-studio/:projectId"
                  element={<GameStudioEntryPage />}
                />
                <Route
                  path="/game-builder/:projectId/:gameId"
                  element={<GameBuilderPage />}
                />
                <Route
                  path="/game-builder/:projectId"
                  element={<GameBuilderEntryPage />}
                />
                <Route
                  path="/presentation-studio/:projectId/:presentationId/guided"
                  element={<PresentationStudioPage />}
                />
                <Route
                  path="/presentation-studio/:projectId/:presentationId"
                  element={<PresentationStudioPage />}
                />
                <Route
                  path="/presentation-studio/:projectId"
                  element={<PresentationStudioEntryPage />}
                />
                <Route
                  path="/presentation-builder/:projectId/:presentationId"
                  element={<PresentationBuilderPage />}
                />
                <Route
                  path="/presentation-builder/:projectId"
                  element={<PresentationBuilderEntryPage />}
                />

                <Route path="/desk" element={<Navigate to="/" replace />} />
                <Route
                  path="/create/wizard"
                  element={<Navigate to="/create" replace />}
                />
                <Route path="/studio" element={<Navigate to="/projects" replace />} />
                <Route path="/library" element={<Navigate to="/resource-studio" replace />} />
                <Route path="/activity" element={<Navigate to="/" replace />} />
                <Route path="/calendar" element={<Navigate to="/" replace />} />
                <Route path="/ai" element={<Navigate to="/assistant" replace />} />
                <Route path="/help" element={<Navigate to="/settings" replace />} />
                <Route path="/dashboard" element={<Navigate to="/" replace />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
            <AiCopilotHost />
            <CopilotHost />
            </CopilotProvider>
          </AiCopilotProvider>
        </ExperienceModeProvider>
      </BrowserRouter>
    </ProjectProvider>
  );
}

export default App;
