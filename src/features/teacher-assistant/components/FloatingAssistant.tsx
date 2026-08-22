import { useLocation } from "react-router-dom";
import { useTeacherAssistant } from "../hooks/useTeacherAssistant";
import { AssistantPanel } from "./AssistantPanel";
import "../styles/teacher-assistant.css";

/**
 * Floating co-pilot for builders / workspace outside Teacher Studio shell.
 * Hidden on studio routes where the docked panel is available.
 */
export function FloatingAssistant() {
  const location = useLocation();
  const { floatingOpen, setFloatingOpen, toggleFloating, context } =
    useTeacherAssistant();

  const studioShell =
    location.pathname === "/" ||
    location.pathname === "/projects" ||
    location.pathname === "/library" ||
    location.pathname === "/activity" ||
    location.pathname === "/calendar" ||
    location.pathname === "/notifications" ||
    location.pathname === "/settings" ||
    location.pathname === "/assistant";

  if (studioShell) return null;

  return (
    <div className="teacher-assistant">
      {floatingOpen ? (
        <div className="ta-float" role="dialog" aria-label="LudicON Copilot">
          <AssistantPanel
            compact
            onClose={() => setFloatingOpen(false)}
          />
        </div>
      ) : null}
      <button
        type="button"
        className="ta-fab"
        aria-label={floatingOpen ? "Închide Copilotul" : "Deschide Copilotul"}
        aria-expanded={floatingOpen}
        title={
          context.projectTitle
            ? `Copilot · ${context.projectTitle}`
            : "LudicON Copilot"
        }
        onClick={toggleFloating}
      >
        AI
      </button>
    </div>
  );
}
