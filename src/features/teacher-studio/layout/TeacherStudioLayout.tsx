import { Outlet } from "react-router-dom";
import { TeacherStudioProvider, useTeacherStudio } from "../context/TeacherStudioContext";
import { useStudioKeyboard } from "../hooks/useStudioKeyboard";
import "../styles/teacher-studio.css";
import { StudioAiPanel } from "./StudioAiPanel";
import { StudioSidebar } from "./StudioSidebar";
import { StudioTopBar } from "./StudioTopBar";

function StudioShell() {
  const {
    assistantOpen,
    setAssistantOpen,
    mobileNavOpen,
    setMobileNavOpen,
    sidebarCollapsed,
  } = useTeacherStudio();
  useStudioKeyboard();

  return (
    <div className="teacher-studio">
      {mobileNavOpen ? (
        <button
          type="button"
          className="ts-nav-backdrop"
          aria-label="Închide meniul"
          onClick={() => setMobileNavOpen(false)}
        />
      ) : null}

      {assistantOpen ? (
        <button
          type="button"
          className="ts-assistant-backdrop"
          aria-label="Închide copilotul"
          onClick={() => setAssistantOpen(false)}
        />
      ) : null}

      <div
        className={[
          "ts-shell",
          assistantOpen ? "has-assistant" : "",
          sidebarCollapsed ? "is-collapsed" : "",
        ].join(" ")}
      >
        <StudioSidebar onNavigate={() => setMobileNavOpen(false)} />

        <div className="ts-main">
          <StudioTopBar />
          <div className="ts-content">
            <Outlet />
          </div>
        </div>

        {assistantOpen ? <StudioAiPanel /> : null}
      </div>
    </div>
  );
}

export function TeacherStudioLayout() {
  return (
    <TeacherStudioProvider>
      <StudioShell />
    </TeacherStudioProvider>
  );
}
