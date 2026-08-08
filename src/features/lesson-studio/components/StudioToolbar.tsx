import { Link } from "react-router-dom";
import { SaveStatusBadge } from "../../../modules/editor-persistence";
import { useCopilot } from "../../../modules/copilot";
import { useLessonStudio } from "../hooks/useLessonStudio";
import { statusLabel } from "../constants";

type StudioToolbarProps = {
  onHistory: () => void;
  onPreview: () => void;
  previewOpen: boolean;
};

export function StudioToolbar({
  onHistory,
  onPreview,
  previewOpen,
}: StudioToolbarProps) {
  const { project, lesson, autosave, lastSavedAt, saveNow } = useLessonStudio();
  const { openPanel } = useCopilot();

  const exportLesson = () => {
    const blob = new Blob([JSON.stringify(lesson, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${lesson.properties.title || "lesson"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <header className="ls-toolbar">
      <div className="ls-toolbar-left">
        <div className="ls-brand-crumb">
          <Link to={`/studio/${project.id}/lessons`}>Lessons</Link>
          <span>/</span>
          <strong>{lesson.properties.title || "Untitled lesson"}</strong>
        </div>
        <span className={`ls-badge ls-badge-${lesson.status}`}>
          {statusLabel(lesson.status)}
        </span>
        <SaveStatusBadge
          status={autosave}
          lastSavedAt={lastSavedAt}
          className={`ls-autosave${autosave === "dirty" ? " is-dirty" : ""}${autosave === "saving" ? " is-saving" : ""}${autosave === "saved" ? " is-saved" : ""}`}
        />
      </div>
      <div className="ls-toolbar-right">
        <button type="button" className="ls-btn" onClick={() => saveNow()}>
          Save
        </button>
        <button type="button" className="ls-btn" onClick={onPreview}>
          {previewOpen ? "Edit" : "Preview"}
        </button>
        <button type="button" className="ls-btn" onClick={exportLesson}>
          Export
        </button>
        <button type="button" className="ls-btn" onClick={onHistory}>
          History
        </button>
        <button
          type="button"
          className="ls-btn ls-btn-primary"
          onClick={() => openPanel()}
        >
          Copilot
        </button>
      </div>
    </header>
  );
}
