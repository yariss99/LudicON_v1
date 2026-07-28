import { Link, useNavigate } from "react-router-dom";
import { formatRelativeTime } from "../../../utils/date";
import { PRESENTATION_KINDS } from "../constants";
import { usePresentationBuilder } from "../hooks/usePresentationBuilder";
import { lessonBuilderRepository } from "../../lesson-builder/services/lessonBuilderRepository";

export function PresentationBuilderHeader() {
  const {
    project,
    presentation,
    dirty,
    saving,
    lastSavedAt,
    patchPresentation,
    saveNow,
    runValidation,
    publish,
    archive,
    duplicate,
    setPanel,
    setSectionId,
  } = usePresentationBuilder();
  const navigate = useNavigate();
  const lesson = presentation.lessonId
    ? lessonBuilderRepository.getById(presentation.lessonId)
    : undefined;

  return (
    <header className="pb-top">
      <div>
        <div className="pb-kicker">
          <Link
            to={`/studio/${project.id}/presentations`}
            style={{ color: "inherit" }}
          >
            ← {project.title}
          </Link>
          {" · "}Presentation Builder
          {lesson ? ` · ${lesson.general.title}` : ""}
        </div>
        <input
          className="pb-title-input"
          value={presentation.title}
          onChange={(e) =>
            patchPresentation((prev) => ({ ...prev, title: e.target.value }))
          }
          aria-label="Titlu prezentare"
        />
        <div className="pb-meta">
          <span className="pb-chip">
            {PRESENTATION_KINDS.find((k) => k.id === presentation.kind)?.label ??
              presentation.kind}
          </span>
          <span className="pb-chip">sursă: {presentation.source.label}</span>
          <span className="pb-chip">{presentation.grade}</span>
          <span className="pb-chip">~{presentation.estimatedMinutes} min</span>
          <span className="pb-chip">
            {presentation.slides.length} slide-uri
          </span>
          <span className="pb-chip">v{presentation.version}</span>
          <span className="pb-chip">{presentation.status}</span>
          <span className="pb-chip">
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
      <div className="pb-actions">
        <button type="button" className="pb-btn" onClick={() => saveNow()}>
          Salvează
        </button>
        <button
          type="button"
          className="pb-btn"
          onClick={() => {
            setSectionId("preview");
            setPanel("preview");
          }}
        >
          Preview
        </button>
        <button
          type="button"
          className="pb-btn"
          onClick={() => {
            setSectionId("presenter");
            setPanel("presenter");
          }}
        >
          Presenter
        </button>
        <button
          type="button"
          className="pb-btn"
          onClick={() => setPanel("ai")}
        >
          AI
        </button>
        <button type="button" className="pb-btn" onClick={runValidation}>
          Validează
        </button>
        <button
          type="button"
          className="pb-btn pb-btn-primary"
          onClick={() => {
            const result = publish();
            if (!result.ok) window.alert(result.error);
          }}
        >
          Publică
        </button>
        <button
          type="button"
          className="pb-btn"
          onClick={() => {
            const copy = duplicate();
            navigate(
              `/presentation-builder/${project.id}/${copy.id}`,
            );
          }}
        >
          Duplică
        </button>
        <button
          type="button"
          className="pb-btn pb-btn-ghost pb-btn-danger"
          onClick={() => {
            if (window.confirm("Arhivezi prezentarea?")) {
              archive();
              navigate(`/studio/${project.id}/presentations`);
            }
          }}
        >
          Arhivează
        </button>
      </div>
    </header>
  );
}
