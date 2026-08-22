import "./App.css";

import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";

import {
  AuthProvider,
  AuthReady,
  GuestOnly,
  LoginPage,
  RegisterPage,
  RequireAuth,
  WelcomePage,
  useAuth,
} from "./features/auth";
import { ProjectProvider } from "./context/ProjectContext";
import {
  TeacherStudioLayout,
  StudioHomePage,
  StudioQuickCreatePage,
  StudioProjectsPage,
  StudioLibraryPage,
  StudioActivityPage,
  StudioCalendarPage,
  StudioNotificationsPage,
  StudioSettingsPage,
} from "./features/teacher-studio";
import { TeacherAssistantProvider } from "./features/teacher-assistant/hooks/useTeacherAssistant";
import { FloatingAssistant } from "./features/teacher-assistant/components/FloatingAssistant";

const CreateExperiencePage = lazy(() =>
  import("./features/create-experience").then((m) => ({
    default: m.CreateExperiencePage,
  })),
);
const BlueprintReviewPage = lazy(() =>
  import("./features/blueprint-review").then((m) => ({
    default: m.BlueprintReviewPage,
  })),
);
const GenerationWorkspacePage = lazy(() =>
  import("./features/generation-workspace").then((m) => ({
    default: m.GenerationWorkspacePage,
  })),
);
const AssetStudioPage = lazy(() =>
  import("./features/asset-studio").then((m) => ({
    default: m.AssetStudioPage,
  })),
);
const UniversalEditorPage = lazy(() =>
  import("./features/universal-editor").then((m) => ({
    default: m.UniversalEditorPage,
  })),
);
const PublishingDashboardPage = lazy(() =>
  import("./features/publishing").then((m) => ({
    default: m.PublishingDashboardPage,
  })),
);
const ReflectivePracticePage = lazy(() =>
  import("./features/reflective-practice").then((m) => ({
    default: m.ReflectivePracticePage,
  })),
);
const KnowledgeHubPage = lazy(() =>
  import("./features/knowledge-hub").then((m) => ({
    default: m.KnowledgeHubPage,
  })),
);
const StudentLearningPage = lazy(() =>
  import("./features/student-learning").then((m) => ({
    default: m.StudentLearningPage,
  })),
);
const ProjectWorkspacePage = lazy(() =>
  import("./features/project-workspace").then((m) => ({
    default: m.ProjectWorkspacePage,
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
const ResourceCenterPage = lazy(() =>
  import("./features/resource-center").then((m) => ({
    default: m.ResourceCenterPage,
  })),
);
const TeacherAssistantPage = lazy(() =>
  import("./features/teacher-assistant/TeacherAssistantPage").then((m) => ({
    default: m.TeacherAssistantPage,
  })),
);
const DesignSystemShowcasePage = lazy(() =>
  import("./design-system/DesignSystemShowcasePage"),
);

function RouteFallback() {
  return (
    <div className="lx-fallback" role="status" aria-label="Se încarcă">
      <div className="w-full max-w-md space-y-3 px-6">
        <div className="lx-fallback-bar h-4 w-32 animate-pulse" />
        <div className="lx-fallback-bar h-10 w-2/3 animate-pulse" />
        <div className="lx-fallback-block h-40 animate-pulse" />
      </div>
    </div>
  );
}

function AuthenticatedChrome() {
  const { status } = useAuth();
  if (status !== "authenticated") return null;
  return <FloatingAssistant />;
}

function App() {
  return (
    <AuthProvider>
    <ProjectProvider>
      <BrowserRouter>
        <AuthReady>
        <TeacherAssistantProvider>
          <AuthenticatedChrome />
          <Suspense fallback={<RouteFallback />}>
            <Routes>
            <Route element={<GuestOnly />}>
              <Route path="/welcome" element={<WelcomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            <Route element={<RequireAuth />}>
            {/* Teacher Studio — primary workspace */}
            <Route element={<TeacherStudioLayout />}>
              <Route index element={<StudioHomePage />} />
              <Route path="create" element={<StudioQuickCreatePage />} />
              <Route path="projects" element={<StudioProjectsPage />} />
              <Route path="library" element={<StudioLibraryPage />} />
              <Route path="activity" element={<StudioActivityPage />} />
              <Route path="calendar" element={<StudioCalendarPage />} />
              <Route
                path="notifications"
                element={<StudioNotificationsPage />}
              />
              <Route path="settings" element={<StudioSettingsPage />} />
            </Route>

            {/* Focused task surfaces (leave Studio shell) */}
            <Route
              path="/create/experience"
              element={<CreateExperiencePage />}
            />
            <Route path="/knowledge" element={<KnowledgeHubPage />} />
            <Route path="/resource-center" element={<ResourceCenterPage />} />
            <Route
              path="/resource-center/:resourceId"
              element={<ResourceCenterPage />}
            />
            <Route path="/assistant" element={<TeacherAssistantPage />} />
            <Route path="/learning" element={<StudentLearningPage />} />
            <Route
              path="/design-system"
              element={<DesignSystemShowcasePage />}
            />
            <Route
              path="/blueprint/review/:blueprintId"
              element={<BlueprintReviewPage />}
            />
            <Route path="/blueprint/review" element={<BlueprintReviewPage />} />
            <Route
              path="/generation/:blueprintId"
              element={<GenerationWorkspacePage />}
            />
            <Route
              path="/asset-studio/:workspaceId/:assetTypeId"
              element={<AssetStudioPage />}
            />
            <Route path="/editor/:objectId" element={<UniversalEditorPage />} />
            <Route path="/editor" element={<UniversalEditorPage />} />
            <Route path="/publishing" element={<PublishingDashboardPage />} />
            <Route path="/reflection" element={<ReflectivePracticePage />} />
            {/* Project Workspace — heart of PRIMA */}
            <Route
              path="/studio/:projectId/*"
              element={<ProjectWorkspacePage />}
            />
            <Route
              path="/projects/:projectId/*"
              element={<ProjectWorkspacePage />}
            />

            {/* Lesson Builder — flagship educational app */}
            <Route
              path="/lesson-builder/:projectId/:lessonId"
              element={<LessonBuilderPage />}
            />
            <Route
              path="/lesson-builder/:projectId"
              element={<LessonBuilderEntryPage />}
            />

            {/* Assessment Builder — assessments belong to lesson + project */}
            <Route
              path="/assessment-builder/:projectId/:assessmentId"
              element={<AssessmentBuilderPage />}
            />
            <Route
              path="/assessment-builder/:projectId"
              element={<AssessmentBuilderEntryPage />}
            />

            {/* Story Builder — stories belong to lesson + project */}
            <Route
              path="/story-builder/:projectId/:storyId"
              element={<StoryBuilderPage />}
            />
            <Route
              path="/story-builder/:projectId"
              element={<StoryBuilderEntryPage />}
            />

            {/* Game Builder — games belong to lesson + project, sourced from resources */}
            <Route
              path="/game-builder/:projectId/:gameId"
              element={<GameBuilderPage />}
            />
            <Route
              path="/game-builder/:projectId"
              element={<GameBuilderEntryPage />}
            />

            {/* Presentation Builder — decks from PRIMA lessons/stories/worksheets/assessments */}
            <Route
              path="/presentation-builder/:projectId/:presentationId"
              element={<PresentationBuilderPage />}
            />
            <Route
              path="/presentation-builder/:projectId"
              element={<PresentationBuilderEntryPage />}
            />

            {/* Compatibility redirects */}
            <Route path="/desk" element={<Navigate to="/" replace />} />
            <Route path="/studio" element={<Navigate to="/projects" replace />} />
            <Route path="/studio/create" element={<Navigate to="/create/experience" replace />} />
            <Route path="/profile" element={<Navigate to="/settings" replace />} />
            <Route path="/experience" element={<Navigate to="/" replace />} />
            <Route path="/timeline" element={<Navigate to="/activity" replace />} />
            <Route path="/classroom" element={<Navigate to="/" replace />} />
            <Route path="/dna" element={<Navigate to="/" replace />} />
            <Route path="/community" element={<Navigate to="/" replace />} />
            <Route path="/analytics" element={<Navigate to="/" replace />} />
            <Route path="/ai" element={<Navigate to="/assistant" replace />} />
            <Route path="/assistant-legacy" element={<Navigate to="/assistant" replace />} />
            <Route path="/help" element={<Navigate to="/settings" replace />} />
            <Route path="/prima/*" element={<Navigate to="/" replace />} />
            <Route path="/dashboard" element={<Navigate to="/" replace />} />
            <Route path="/dashboard-legacy" element={<Navigate to="/" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
          </Suspense>
        </TeacherAssistantProvider>
        </AuthReady>
      </BrowserRouter>
    </ProjectProvider>
    </AuthProvider>
  );
}

export default App;
