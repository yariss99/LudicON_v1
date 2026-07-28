import { Link, useNavigate } from "react-router-dom";
import { formatRelativeTime } from "../../../utils/date";
import { ASSESSMENT_KINDS } from "../constants";
import { useAssessmentBuilder } from "../hooks/useAssessmentBuilder";
import { lessonBuilderRepository } from "../../lesson-builder/services/lessonBuilderRepository";

export function AssessmentBuilderHeader() {
  const {
    project,
    assessment,
    dirty,
    saving,
    lastSavedAt,
    patchAssessment,
    saveNow,
    runValidation,
    publish,
    archive,
    duplicate,
    setPanel,
  } = useAssessmentBuilder();
  const navigate = useNavigate();
  const lesson = lessonBuilderRepository.getById(assessment.lessonId);

  return (
    <header className="ab-top">
      <div>
        <div className="ab-kicker">
          <Link
            to={`/studio/${project.id}/assessments`}
            style={{ color: "inherit" }}
          >
            ← {project.title}
          </Link>
          {" · "}Assessment Builder
          {lesson ? ` · ${lesson.general.title}` : ""}
        </div>
        <input
          className="ab-title-input"
          value={assessment.title}
          onChange={(e) =>
            patchAssessment((prev) => ({ ...prev, title: e.target.value }))
          }
          aria-label="Titlu evaluare"
        />
        <div className="ab-meta">
          <span className="ab-chip">
            {ASSESSMENT_KINDS.find((k) => k.id === assessment.kind)?.label ??
              assessment.kind}
          </span>
          <span className="ab-chip">{assessment.subject}</span>
          <span className="ab-chip">{assessment.grade}</span>
          <span className="ab-chip">v{assessment.version}</span>
          <span className="ab-chip">{assessment.status}</span>
          <span className="ab-chip">
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
      <div className="ab-actions">
        <button type="button" className="ab-btn" onClick={() => saveNow()}>
          Salvează
        </button>
        <button type="button" className="ab-btn" onClick={() => setPanel("ai")}>
          AI
        </button>
        <button
          type="button"
          className="ab-btn"
          onClick={() => setPanel("analytics")}
        >
          Analitică
        </button>
        <button type="button" className="ab-btn" onClick={runValidation}>
          Validează
        </button>
        <button
          type="button"
          className="ab-btn ab-btn-primary"
          onClick={() => {
            const result = publish();
            if (!result.ok) window.alert(result.error);
          }}
        >
          Publică
        </button>
        <button
          type="button"
          className="ab-btn"
          onClick={() => {
            const copy = duplicate();
            navigate(`/assessment-builder/${project.id}/${copy.id}`);
          }}
        >
          Duplică
        </button>
        <button
          type="button"
          className="ab-btn ab-btn-ghost ab-btn-danger"
          onClick={() => {
            if (window.confirm("Arhivezi evaluarea?")) {
              archive();
              navigate(`/studio/${project.id}/assessments`);
            }
          }}
        >
          Arhivează
        </button>
      </div>
    </header>
  );
}
