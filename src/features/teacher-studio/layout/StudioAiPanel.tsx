import { AssistantPanel } from "../../teacher-assistant/components/AssistantPanel";
import { useTeacherStudio } from "../context/TeacherStudioContext";
import "../../teacher-assistant/styles/teacher-assistant.css";

/**
 * Docked Teacher AI Assistant inside Teacher Studio shell.
 * Replaces the old static suggestion panel.
 */
export function StudioAiPanel() {
  const { assistantOpen, setAssistantOpen } = useTeacherStudio();

  if (!assistantOpen) return null;

  return (
    <aside className="ts-assistant is-open" aria-label="Asistent PRIMA">
      <div style={{ height: "100%", minHeight: 0 }}>
        <AssistantPanel onClose={() => setAssistantOpen(false)} compact />
      </div>
    </aside>
  );
}
