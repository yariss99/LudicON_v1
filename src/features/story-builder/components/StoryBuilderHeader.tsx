import { Link, useNavigate } from "react-router-dom";
import { formatRelativeTime } from "../../../utils/date";
import { STORY_KINDS } from "../constants";
import { useStoryBuilder } from "../hooks/useStoryBuilder";
import { lessonBuilderRepository } from "../../lesson-builder/services/lessonBuilderRepository";

export function StoryBuilderHeader() {
  const {
    project,
    story,
    dirty,
    saving,
    lastSavedAt,
    patchStory,
    saveNow,
    runValidation,
    publish,
    archive,
    duplicate,
    setPanel,
  } = useStoryBuilder();
  const navigate = useNavigate();
  const lesson = lessonBuilderRepository.getById(story.lessonId);

  return (
    <header className="sb-top">
      <div>
        <div className="sb-kicker">
          <Link to={`/studio/${project.id}/stories`} style={{ color: "inherit" }}>
            ← {project.title}
          </Link>
          {" · "}Story Builder
          {lesson ? ` · ${lesson.general.title}` : ""}
        </div>
        <input
          className="sb-title-input"
          value={story.title}
          onChange={(e) =>
            patchStory((prev) => ({ ...prev, title: e.target.value }))
          }
          aria-label="Titlu poveste"
        />
        <div className="sb-meta">
          <span className="sb-chip">
            {STORY_KINDS.find((k) => k.id === story.kind)?.label ?? story.kind}
          </span>
          <span className="sb-chip">{story.subject}</span>
          <span className="sb-chip">{story.grade}</span>
          <span className="sb-chip">~{story.estimatedMinutes} min</span>
          <span className="sb-chip">v{story.version}</span>
          <span className="sb-chip">{story.status}</span>
          <span className="sb-chip">
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
      <div className="sb-actions">
        <button type="button" className="sb-btn" onClick={() => saveNow()}>
          Salvează
        </button>
        <button type="button" className="sb-btn" onClick={() => setPanel("preview")}>
          Preview
        </button>
        <button type="button" className="sb-btn" onClick={() => setPanel("ai")}>
          AI
        </button>
        <button type="button" className="sb-btn" onClick={runValidation}>
          Validează
        </button>
        <button
          type="button"
          className="sb-btn sb-btn-primary"
          onClick={() => {
            const result = publish();
            if (!result.ok) window.alert(result.error);
          }}
        >
          Publică
        </button>
        <button
          type="button"
          className="sb-btn"
          onClick={() => {
            const copy = duplicate();
            navigate(`/story-builder/${project.id}/${copy.id}`);
          }}
        >
          Duplică
        </button>
        <button
          type="button"
          className="sb-btn sb-btn-ghost sb-btn-danger"
          onClick={() => {
            if (window.confirm("Arhivezi povestea?")) {
              archive();
              navigate(`/studio/${project.id}/stories`);
            }
          }}
        >
          Arhivează
        </button>
      </div>
    </header>
  );
}
