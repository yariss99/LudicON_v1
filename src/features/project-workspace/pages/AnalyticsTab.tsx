import { useMemo } from "react";
import { Link } from "react-router-dom";
import { lessonStudioRepository } from "../../lesson-studio/services/lessonStudioRepository";
import { useProjectWorkspace } from "../hooks/useProjectWorkspace";

export function AnalyticsTab() {
  const { project, artifacts, progress } = useProjectWorkspace();
  const lessons = useMemo(
    () => lessonStudioRepository.listByProject(project.id),
    [project.id],
  );

  const byKind = useMemo(() => {
    const map: Record<string, number> = {};
    for (const a of artifacts) {
      map[a.kind] = (map[a.kind] ?? 0) + 1;
    }
    return map;
  }, [artifacts]);

  const readyLessons = lessons.filter((l) => l.status === "published").length;
  const draftLessons = lessons.filter((l) => l.status === "draft").length;

  return (
    <div>
      <header style={{ marginBottom: "1.25rem" }}>
        <h2 className="pw-section-title" style={{ marginBottom: 0 }}>
          Analytics
        </h2>
        <p className="pw-lead" style={{ marginBottom: 0 }}>
          Project health at a glance — mock local metrics for this sprint.
        </p>
      </header>

      <div className="pw-stats" style={{ display: "grid", gap: "0.75rem", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))" }}>
        <div className="pw-card">
          <div className="pw-row-meta">Completion</div>
          <div className="pw-row-title" style={{ fontSize: "1.5rem" }}>
            {progress.percentComplete}%
          </div>
        </div>
        <div className="pw-card">
          <div className="pw-row-meta">Artifacts</div>
          <div className="pw-row-title" style={{ fontSize: "1.5rem" }}>
            {progress.totalArtifacts}
          </div>
        </div>
        <div className="pw-card">
          <div className="pw-row-meta">Lessons</div>
          <div className="pw-row-title" style={{ fontSize: "1.5rem" }}>
            {lessons.length}
          </div>
        </div>
        <div className="pw-card">
          <div className="pw-row-meta">Published lessons</div>
          <div className="pw-row-title" style={{ fontSize: "1.5rem" }}>
            {readyLessons}
          </div>
        </div>
        <div className="pw-card">
          <div className="pw-row-meta">Draft lessons</div>
          <div className="pw-row-title" style={{ fontSize: "1.5rem" }}>
            {draftLessons}
          </div>
        </div>
      </div>

      <section style={{ marginTop: "1.5rem" }}>
        <h3 className="pw-section-title">By artifact type</h3>
        {Object.keys(byKind).length === 0 ? (
          <p className="pw-lead">No artifacts yet.</p>
        ) : (
          <div className="pw-list">
            {Object.entries(byKind).map(([kind, count]) => (
              <div key={kind} className="pw-row">
                <span className="pw-row-title">{kind}</span>
                <span className="pw-row-meta">{count}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <div style={{ marginTop: "1.25rem" }}>
        <Link className="pw-btn pw-btn-primary" to={`/studio/${project.id}/lessons`}>
          Open Lesson Library
        </Link>
      </div>
    </div>
  );
}
