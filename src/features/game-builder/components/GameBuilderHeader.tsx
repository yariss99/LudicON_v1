import { Link, useNavigate } from "react-router-dom";
import { formatRelativeTime } from "../../../utils/date";
import { GAME_KINDS } from "../constants";
import { useGameBuilder } from "../hooks/useGameBuilder";
import { lessonBuilderRepository } from "../../lesson-builder/services/lessonBuilderRepository";

export function GameBuilderHeader() {
  const {
    project,
    game,
    dirty,
    saving,
    lastSavedAt,
    patchGame,
    saveNow,
    runValidation,
    publish,
    archive,
    duplicate,
    setPanel,
  } = useGameBuilder();
  const navigate = useNavigate();
  const lesson = lessonBuilderRepository.getById(game.lessonId);

  return (
    <header className="gb-top">
      <div>
        <div className="gb-kicker">
          <Link to={`/studio/${project.id}/games`} style={{ color: "inherit" }}>
            ← {project.title}
          </Link>
          {" · "}Game Builder
          {lesson ? ` · ${lesson.general.title}` : ""}
        </div>
        <input
          className="gb-title-input"
          value={game.title}
          onChange={(e) =>
            patchGame((prev) => ({ ...prev, title: e.target.value }))
          }
          aria-label="Titlu joc"
        />
        <div className="gb-meta">
          <span className="gb-chip">
            {GAME_KINDS.find((k) => k.id === game.kind)?.label ?? game.kind}
          </span>
          <span className="gb-chip">sursă: {game.source.label}</span>
          <span className="gb-chip">{game.grade}</span>
          <span className="gb-chip">~{game.estimatedMinutes} min</span>
          <span className="gb-chip">v{game.version}</span>
          <span className="gb-chip">{game.status}</span>
          <span className="gb-chip">
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
      <div className="gb-actions">
        <button type="button" className="gb-btn" onClick={() => saveNow()}>
          Salvează
        </button>
        <button type="button" className="gb-btn" onClick={() => setPanel("preview")}>
          Preview
        </button>
        <button type="button" className="gb-btn" onClick={() => setPanel("simulate")}>
          Simulare
        </button>
        <button type="button" className="gb-btn" onClick={() => setPanel("ai")}>
          AI
        </button>
        <button type="button" className="gb-btn" onClick={runValidation}>
          Validează
        </button>
        <button
          type="button"
          className="gb-btn gb-btn-primary"
          onClick={() => {
            const result = publish();
            if (!result.ok) window.alert(result.error);
          }}
        >
          Publică
        </button>
        <button
          type="button"
          className="gb-btn"
          onClick={() => {
            const copy = duplicate();
            navigate(`/game-builder/${project.id}/${copy.id}`);
          }}
        >
          Duplică
        </button>
        <button
          type="button"
          className="gb-btn gb-btn-ghost gb-btn-danger"
          onClick={() => {
            if (window.confirm("Arhivezi jocul?")) {
              archive();
              navigate(`/studio/${project.id}/games`);
            }
          }}
        >
          Arhivează
        </button>
      </div>
    </header>
  );
}
