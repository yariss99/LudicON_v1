import { statusLabel } from "../constants";
import { useLessonStudio } from "../hooks/useLessonStudio";

export function ContextSidebar() {
  const { project, lesson, wordCount } = useLessonStudio();
  const p = lesson.properties;

  return (
    <aside className="ls-panel ls-panel-right" aria-label="Context">
      <h2 className="ls-panel-title">Context</h2>

      <div className="ls-context-row">
        <span>Project</span>
        <strong>{project.title}</strong>
      </div>
      <div className="ls-context-row">
        <span>Class</span>
        <strong>{p.grade || project.grade || "—"}</strong>
      </div>
      <div className="ls-context-row">
        <span>Subject</span>
        <strong>{p.subject || project.subject || "—"}</strong>
      </div>
      <div className="ls-context-row">
        <span>Competencies</span>
        <strong>{p.competencies.length || "—"}</strong>
      </div>
      <div className="ls-context-row">
        <span>Estimated Duration</span>
        <strong>{p.durationMinutes} min</strong>
      </div>
      <div className="ls-context-row">
        <span>Word Count</span>
        <strong>{wordCount}</strong>
      </div>
      <div className="ls-context-row">
        <span>Lesson Status</span>
        <strong>
          <span className={`ls-badge ls-badge-${lesson.status}`}>
            {statusLabel(lesson.status)}
          </span>
        </strong>
      </div>
      <div className="ls-context-row">
        <span>Sections</span>
        <strong>{lesson.blocks.length}</strong>
      </div>
      <div className="ls-context-row">
        <span>Version</span>
        <strong>v{lesson.version}</strong>
      </div>
    </aside>
  );
}
