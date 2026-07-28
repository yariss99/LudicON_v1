import { Link, useNavigate } from "react-router-dom";
import { formatRelativeTime } from "../../../utils/date";
import { useLessonBuilder } from "../hooks/useLessonBuilder";

export function LessonBuilderHeader() {
  const {
    project,
    lesson,
    dirty,
    saving,
    lastSavedAt,
    patchLesson,
    saveNow,
    runValidation,
    publish,
    archive,
    duplicate,
    setPanel,
  } = useLessonBuilder();
  const navigate = useNavigate();

  return (
    <header className="lb-top">
      <div className="lb-top-left">
        <div className="lb-kicker">
          <Link to={`/studio/${project.id}/lessons`} style={{ color: "inherit" }}>
            ← {project.title}
          </Link>
          {" · "}Lesson Builder
        </div>
        <input
          className="lb-title-input"
          value={lesson.general.title}
          onChange={(e) =>
            patchLesson((prev) => ({
              ...prev,
              general: { ...prev.general, title: e.target.value },
            }))
          }
          aria-label="Titlu lecție"
        />
        <div className="lb-meta">
          <span className="lb-chip">{lesson.general.subject}</span>
          <span className="lb-chip">{lesson.general.grade}</span>
          <span className="lb-chip">v{lesson.version}</span>
          <span className="lb-chip">{lesson.status}</span>
          <span className="lb-chip">
            {saving
              ? "Se salvează…"
              : dirty
                ? "Modificări nesalvate"
                : lastSavedAt
                  ? `Salvat ${formatRelativeTime(lastSavedAt)}`
                  : "Autosave activ"}
          </span>
        </div>
      </div>
      <div className="lb-actions">
        <button type="button" className="lb-btn" onClick={() => saveNow("manual-save")}>
          Salvează
        </button>
        <button type="button" className="lb-btn" onClick={() => setPanel("ai")}>
          AI
        </button>
        <button type="button" className="lb-btn" onClick={() => setPanel("versions")}>
          Istoric
        </button>
        <button type="button" className="lb-btn" onClick={runValidation}>
          Validează
        </button>
        <button
          type="button"
          className="lb-btn lb-btn-primary"
          onClick={() => {
            const result = publish();
            if (!result.ok) window.alert(result.error);
          }}
        >
          Publică
        </button>
        <button
          type="button"
          className="lb-btn"
          onClick={() => {
            const copy = duplicate();
            navigate(`/lesson-builder/${project.id}/${copy.id}`);
          }}
        >
          Duplică
        </button>
        <button
          type="button"
          className="lb-btn lb-btn-ghost lb-btn-danger"
          onClick={() => {
            if (window.confirm("Arhivezi lecția?")) {
              archive();
              navigate(`/studio/${project.id}/lessons`);
            }
          }}
        >
          Arhivează
        </button>
      </div>
    </header>
  );
}
