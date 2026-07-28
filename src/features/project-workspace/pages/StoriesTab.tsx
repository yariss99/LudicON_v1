import { Link, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { formatRelativeTime } from "../../../utils/date";
import { createStoryInProject } from "../../story-builder/hooks/useStoryBuilder";
import { storyBuilderRepository } from "../../story-builder/services/storyBuilderRepository";
import {
  applyStoryAiAction,
  ensureLessonForProject,
} from "../../story-builder/services/storyCoreBridge";
import { STORY_KINDS } from "../../story-builder/constants";
import { lessonBuilderRepository } from "../../lesson-builder/services/lessonBuilderRepository";
import { useProjectWorkspace } from "../hooks/useProjectWorkspace";
import { EmptyState } from "../components/EmptyState";
import type { StoryKind } from "../../story-builder/types";

/**
 * Project Workspace → Stories tab.
 * Opens Story Builder; stories always bind to a lesson + project.
 */
export function StoriesTab() {
  const { project, refresh } = useProjectWorkspace();
  const navigate = useNavigate();
  const [tick, setTick] = useState(0);
  const [kind, setKind] = useState<StoryKind>("interactive");
  const [lessonId, setLessonId] = useState("");

  const lessons = useMemo(
    () => lessonBuilderRepository.listByProject(project.id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [project.id, tick],
  );

  const stories = useMemo(
    () => storyBuilderRepository.listByProject(project.id),
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
    navigate(`/story-builder/${project.id}/${id}`);
  };

  return (
    <div>
      <div className="pw-toolbar">
        <div>
          <h2 className="pw-section-title" style={{ marginBottom: 0 }}>
            Povești
          </h2>
          <p className="pw-lead" style={{ marginBottom: 0 }}>
            Story Builder — povești interactive, aliniate curricular, mereu
            legate de o lecție din acest proiect.
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
            onChange={(e) => setKind(e.target.value as StoryKind)}
            aria-label="Tip poveste"
          >
            {STORY_KINDS.map((k) => (
              <option key={k.id} value={k.id}>
                {k.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="pw-btn"
            onClick={() => {
              const created = createStoryInProject({
                project,
                lessonId: resolveLessonId(),
                kind,
              });
              const { story: generated } = applyStoryAiAction({
                project,
                story: created,
                action: "generate_story",
              });
              storyBuilderRepository.save(generated, {
                note: "ai:generate_story",
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
              const created = createStoryInProject({
                project,
                lessonId: resolveLessonId(),
                kind,
              });
              reload();
              openBuilder(created.id);
            }}
          >
            Poveste nouă
          </button>
        </div>
      </div>

      {stories.length === 0 ? (
        <EmptyState
          title="Nicio poveste în proiect"
          description="Creează o poveste legată de o lecție — engagement + obiective de învățare."
          action={
            <button
              type="button"
              className="pw-btn pw-btn-primary"
              onClick={() => {
                const created = createStoryInProject({
                  project,
                  lessonId: resolveLessonId(),
                  kind,
                });
                reload();
                openBuilder(created.id);
              }}
            >
              Deschide Story Builder
            </button>
          }
        />
      ) : (
        <div className="pw-list">
          {stories.map((s) => {
            const lesson = lessonBuilderRepository.getById(s.lessonId);
            return (
              <div key={s.id} className="pw-row">
                <div className="pw-row-main">
                  <div className="pw-row-title">{s.title}</div>
                  <div className="pw-row-meta">
                    {STORY_KINDS.find((k) => k.id === s.kind)?.label ?? s.kind}
                    {" · "}
                    {lesson?.general.title ?? s.lessonId}
                    {" · "}v{s.version} · {s.status} · ~{s.estimatedMinutes} min
                    {" · "}
                    {formatRelativeTime(s.updatedAt)}
                    {s.validation ? ` · scor ${s.validation.score}` : ""}
                  </div>
                </div>
                <div className="pw-row-actions">
                  <Link
                    className="pw-btn pw-btn-primary"
                    to={`/story-builder/${project.id}/${s.id}`}
                  >
                    Editează
                  </Link>
                  <button
                    type="button"
                    className="pw-btn"
                    onClick={() => {
                      const copy = storyBuilderRepository.duplicate(s.id);
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
                      storyBuilderRepository.archive(s.id);
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
