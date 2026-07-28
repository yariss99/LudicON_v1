import { Outlet } from "react-router-dom";
import { TeacherStudioProvider, useTeacherStudio } from "../context/TeacherStudioContext";
import { useStudioKeyboard } from "../hooks/useStudioKeyboard";
import "../styles/teacher-studio.css";
import { StudioAiPanel } from "./StudioAiPanel";
import { StudioSidebar } from "./StudioSidebar";
import { StudioTopBar } from "./StudioTopBar";

function StudioShell() {
  const { assistantOpen, mobileNavOpen, setMobileNavOpen } = useTeacherStudio();
  useStudioKeyboard();

  return (
    <div className="teacher-studio">
      {mobileNavOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-900/20 lg:hidden"
          aria-label="Închide meniul"
          onClick={() => setMobileNavOpen(false)}
        />
      ) : null}

      <div
        className={[
          "ts-shell",
          assistantOpen ? "has-assistant" : "",
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
