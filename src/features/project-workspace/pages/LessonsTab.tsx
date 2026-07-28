import { Link, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { formatRelativeTime } from "../../../utils/date";
import { createLessonInProject } from "../../lesson-builder/hooks/useLessonBuilder";
import { lessonBuilderRepository } from "../../lesson-builder/services/lessonBuilderRepository";
import { applyAiAction } from "../../lesson-builder/services/lessonCoreBridge";
import { useProjectWorkspace } from "../hooks/useProjectWorkspace";
import { EmptyState } from "../components/EmptyState";

/**
 * Project Workspace → Lessons tab.
 * Opens the flagship Lesson Builder; never creates orphan lessons.
 */
export function LessonsTab() {
  const { project, refresh } = useProjectWorkspace();
  const navigate = useNavigate();
  const [tick, setTick] = useState(0);
  const [importOpen, setImportOpen] = useState(false);
  const [importRaw, setImportRaw] = useState("");

  const lessons = useMemo(
    () => lessonBuilderRepository.listByProject(project.id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [project.id, tick],
  );

  const reload = () => {
    setTick((t) => t + 1);
    refresh();
  };

  const openBuilder = (lessonId: string) => {
    navigate(`/lesson-builder/${project.id}/${lessonId}`);
  };

  return (
    <div>
      <div className="pw-toolbar">
        <div>
          <h2 className="pw-section-title" style={{ marginBottom: 0 }}>
            Lecții
          </h2>
          <p className="pw-lead" style={{ marginBottom: 0 }}>
            Lesson Builder — planificare, generare AI, validare, versionare și
            publicare, mereu în acest proiect.
          </p>
        </div>
        <div className="pw-header-actions">
          <button
            type="button"
            className="pw-btn"
            onClick={() => setImportOpen((v) => !v)}
          >
            Importă
          </button>
          <button
            type="button"
            className="pw-btn"
            onClick={() => {
              const lesson = createLessonInProject(project);
              const { lesson: generated } = applyAiAction({
                project,
                lesson,
                action: "generate_complete",
              });
              lessonBuilderRepository.save(generated, {
                note: "ai:generate_complete",
                actor: "ai",
              });
              reload();
              openBuilder(generated.id);
            }}
          >
            Generează cu AI
          </button>
          <button
            type="button"
            className="pw-btn pw-btn-primary"
            onClick={() => {
              const lesson = createLessonInProject(project);
              reload();
              openBuilder(lesson.id);
            }}
          >
            Lecție nouă
          </button>
        </div>
      </div>

      {importOpen ? (
        <div className="pw-card" style={{ marginBottom: "1rem" }}>
          <p className="pw-lead">Lipește JSON-ul unei lecții exportate.</p>
          <textarea
            className="pw-textarea"
            style={{ width: "100%", minHeight: "7rem" }}
            value={importRaw}
            onChange={(e) => setImportRaw(e.target.value)}
          />
          <div className="pw-header-actions" style={{ marginTop: "0.65rem" }}>
            <button
              type="button"
              className="pw-btn pw-btn-primary"
              onClick={() => {
                try {
                  const parsed = JSON.parse(importRaw);
                  const imported = lessonBuilderRepository.importLesson(
                    project.id,
                    parsed,
                  );
                  reload();
                  openBuilder(imported.id);
                } catch (e) {
                  window.alert(
                    e instanceof Error ? e.message : "Import invalid",
                  );
                }
              }}
            >
              Importă în proiect
            </button>
          </div>
        </div>
      ) : null}

      {lessons.length === 0 ? (
        <EmptyState
          title="Nicio lecție în proiect"
          description="Creează prima lecție în Lesson Builder — totul rămâne legat de acest proiect."
          action={
            <button
              type="button"
              className="pw-btn pw-btn-primary"
              onClick={() => {
                const lesson = createLessonInProject(project);
                reload();
                openBuilder(lesson.id);
              }}
            >
              Deschide Lesson Builder
            </button>
          }
        />
      ) : (
        <div className="pw-list">
          {lessons.map((lesson) => (
            <div key={lesson.id} className="pw-row">
              <div className="pw-row-main">
                <div className="pw-row-title">{lesson.general.title}</div>
                <div className="pw-row-meta">
                  v{lesson.version} · {lesson.status} ·{" "}
                  {formatRelativeTime(lesson.updatedAt)}
                  {lesson.validation
                    ? ` · scor ${lesson.validation.score}`
                    : ""}
                </div>
              </div>
              <div className="pw-row-actions">
                <Link
                  className="pw-btn pw-btn-primary"
                  to={`/lesson-builder/${project.id}/${lesson.id}`}
                >
                  Editează
                </Link>
                <button
                  type="button"
                  className="pw-btn"
                  onClick={() => {
                    const copy = lessonBuilderRepository.duplicate(lesson.id);
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
                    lessonBuilderRepository.archive(lesson.id);
                    reload();
                  }}
                >
                  Arhivează
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
