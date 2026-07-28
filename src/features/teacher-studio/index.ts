/**
 * @feature teacher-studio
 * PRIMA Teacher Studio — primary teacher workspace (not a dashboard).
 */

export { TeacherStudioLayout } from "./layout/TeacherStudioLayout";
export { StudioHomePage } from "./pages/StudioHomePage";
export { StudioProjectsPage } from "./pages/StudioProjectsPage";
export { StudioLibraryPage } from "./pages/StudioLibraryPage";
export { StudioActivityPage } from "./pages/StudioActivityPage";
export { StudioCalendarPage } from "./pages/StudioCalendarPage";
export { StudioNotificationsPage } from "./pages/StudioNotificationsPage";
export { StudioSettingsPage } from "./pages/StudioSettingsPage";
export {
  TeacherStudioProvider,
  useTeacherStudio,
  useStudioHomeData,
} from "./context/TeacherStudioContext";
export type * from "./types";
