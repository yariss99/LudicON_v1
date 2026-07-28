import { Link, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { formatRelativeTime } from "../../../utils/date";
import { createGameInProject } from "../../game-builder/hooks/useGameBuilder";
import { gameBuilderRepository } from "../../game-builder/services/gameBuilderRepository";
import {
  applyGameAiAction,
  ensureLessonForProject,
} from "../../game-builder/services/gameCoreBridge";
import { GAME_KINDS, SOURCE_KINDS } from "../../game-builder/constants";
import { lessonBuilderRepository } from "../../lesson-builder/services/lessonBuilderRepository";
import { useProjectWorkspace } from "../hooks/useProjectWorkspace";
import { EmptyState } from "../components/EmptyState";
import type { GameKind, GameSourceKind } from "../../game-builder/types";

/**
 * Project Workspace → Games tab.
 * Opens Game Builder; games always bind to a lesson + project and start from a source.
 */
export function GamesTab() {
  const { project, refresh } = useProjectWorkspace();
  const navigate = useNavigate();
  const [tick, setTick] = useState(0);
  const [kind, setKind] = useState<GameKind>("quiz");
  const [sourceKind, setSourceKind] = useState<GameSourceKind>("lesson");
  const [lessonId, setLessonId] = useState("");

  const lessons = useMemo(
    () => lessonBuilderRepository.listByProject(project.id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [project.id, tick],
  );

  const games = useMemo(
    () => gameBuilderRepository.listByProject(project.id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [project.id, tick],
  );

  const reload = () => {
    setTick((t) => t + 1);
    refresh();
  };

  const resolveLessonId = () => {
    if (lessonId) return lessonId;
    if (lessons[0]) return lessons[0].id;
    return ensureLessonForProject(project);
  };

  const openBuilder = (id: string) => {
    navigate(`/game-builder/${project.id}/${id}`);
  };

  const createFromSource = (aiAction?: "generate_complete" | "from_lesson" | "from_story" | "from_assessment" | "from_worksheet") => {
    const created = createGameInProject({
      project,
      lessonId: resolveLessonId(),
      kind,
      seedFromSource: !aiAction,
    });
    if (aiAction) {
      const withSource = {
        ...created,
        source: {
          ...created.source,
          kind: sourceKind,
        },
        kind,
      };
      const { game: generated } = applyGameAiAction({
        project,
        game: withSource,
        action: aiAction,
      });
      gameBuilderRepository.save(generated, {
        note: `ai:${aiAction}`,
        actor: "ai",
      });
      reload();
      openBuilder(generated.id);
      return;
    }
    reload();
    openBuilder(created.id);
  };

  return (
    <div>
      <div className="pw-toolbar">
        <div>
          <h2 className="pw-section-title" style={{ marginBottom: 0 }}>
            Jocuri
          </h2>
          <p className="pw-lead" style={{ marginBottom: 0 }}>
            Game Builder — jocuri aliniate curricular, generate din lecții,
            fișe, evaluări sau povești. Niciodată dintr-un canvas gol.
          </p>
        </div>
        <div className="pw-header-actions">
          <select
            className="pw-input"
            style={{ minHeight: "2.35rem", borderRadius: 999 }}
            value={lessonId || lessons[0]?.id || ""}
            onChange={(e) => setLessonId(e.target.value)}
            aria-label="Lecție părinte"
          >
            {lessons.length === 0 ? (
              <option value="">Lecție automată</option>
            ) : (
              lessons.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.general.title}
                </option>
              ))
            )}
          </select>
          <select
            className="pw-input"
            style={{ minHeight: "2.35rem", borderRadius: 999 }}
            value={kind}
            onChange={(e) => setKind(e.target.value as GameKind)}
            aria-label="Tip joc"
          >
            {GAME_KINDS.map((k) => (
              <option key={k.id} value={k.id}>
                {k.label}
              </option>
            ))}
          </select>
          <select
            className="pw-input"
            style={{ minHeight: "2.35rem", borderRadius: 999 }}
            value={sourceKind}
            onChange={(e) => setSourceKind(e.target.value as GameSourceKind)}
            aria-label="Sursă"
          >
            {SOURCE_KINDS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="pw-btn"
            onClick={() => {
              const action =
                sourceKind === "story"
                  ? "from_story"
                  : sourceKind === "assessment"
                    ? "from_assessment"
                    : sourceKind === "worksheet"
                      ? "from_worksheet"
                      : sourceKind === "lesson"
                        ? "from_lesson"
                        : "generate_complete";
              createFromSource(action);
            }}
          >
            Generează cu AI
          </button>
          <button
            type="button"
            className="pw-btn pw-btn-primary"
            onClick={() => createFromSource()}
          >
            Joc nou
          </button>
        </div>
      </div>

      {games.length === 0 ? (
        <EmptyState
          title="Niciun joc în proiect"
          description="Creează un joc dintr-o lecție sau altă resursă PRIMA — editorul vine pre-populat."
          action={
            <button
              type="button"
              className="pw-btn pw-btn-primary"
              onClick={() => createFromSource()}
            >
              Deschide Game Builder
            </button>
          }
        />
      ) : (
        <div className="pw-list">
          {games.map((g) => {
            const lesson = lessonBuilderRepository.getById(g.lessonId);
            return (
              <div key={g.id} className="pw-row">
                <div className="pw-row-main">
                  <div className="pw-row-title">{g.title}</div>
                  <div className="pw-row-meta">
                    {GAME_KINDS.find((k) => k.id === g.kind)?.label ?? g.kind}
                    {" · "}
                    {lesson?.general.title ?? g.lessonId}
                    {" · "}sursă {g.source.kind}
                    {" · "}v{g.version} · {g.status} · ~{g.estimatedMinutes} min
                    {" · "}
                    {formatRelativeTime(g.updatedAt)}
                    {g.validation ? ` · scor ${g.validation.score}` : ""}
                  </div>
                </div>
                <div className="pw-row-actions">
                  <Link
                    className="pw-btn pw-btn-primary"
                    to={`/game-builder/${project.id}/${g.id}`}
                  >
                    Editează
                  </Link>
                  <button
                    type="button"
                    className="pw-btn"
                    onClick={() => {
                      const copy = gameBuilderRepository.duplicate(g.id);
                      reload();
                      openBuilder(copy.id);
                    }}
                  >
                    Duplică
                  </button>
                  <button
                    type="button"
                    className="pw-btn pw-btn-ghost pw-btn-danger"
                    onClick={() => {
                      gameBuilderRepository.archive(g.id);
                      reload();
                    }}
                  >
                    Arhivează
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
