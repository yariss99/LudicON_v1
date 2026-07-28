import { Link } from "react-router-dom";
import { formatRelativeTime } from "../../../utils/date";
import { ARTIFACT_KIND_LABEL } from "../constants";
import { useProjectWorkspace } from "../hooks/useProjectWorkspace";
import { ArtifactRow } from "../components/ArtifactRow";

export function OverviewTab() {
  const {
    project,
    progress,
    artifacts,
    activity,
    suggestions,
    units,
    metadata,
  } = useProjectWorkspace();

  const recent = [...artifacts]
    .filter((a) => a.status !== "archived")
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )
    .slice(0, 5);

  const upcoming = activity.slice(0, 4);

  return (
    <div>
      <p className="pw-lead">
        {project.description?.trim() ||
          `Unitate didactică pentru ${project.subject}, ${project.grade}. Toate materialele aparțin acestui proiect.`}
      </p>

      <div className="pw-grid-3" style={{ marginBottom: "1.25rem" }}>
        <div className="pw-card">
          <div className="pw-stat-value">{progress.percentComplete}%</div>
          <div className="pw-stat-label">Progres materiale gata</div>
          <div className="pw-progress" aria-hidden>
            <span style={{ width: `${progress.percentComplete}%` }} />
          </div>
        </div>
        <div className="pw-card">
          <div className="pw-stat-value">{progress.totalArtifacts}</div>
          <div className="pw-stat-label">
            Artefacte · {progress.readyCount} gata · {progress.draftCount}{" "}
            ciorne
          </div>
        </div>
        <div className="pw-card">
          <div className="pw-stat-value">{units.length}</div>
          <div className="pw-stat-label">
            Unități · {metadata.curriculumRef || "curriculum nesetat"}
          </div>
        </div>
      </div>

      <div className="pw-grid-2">
        <section>
          <h2 className="pw-section-title">Modificate recent</h2>
          <div className="pw-list">
            {recent.map((a) => (
              <ArtifactRow key={a.id} artifact={a} />
            ))}
            {recent.length === 0 ? (
              <p className="pw-lead">Niciun material încă.</p>
            ) : null}
          </div>
        </section>

        <section>
          <h2 className="pw-section-title">Activitate recentă</h2>
          <div className="pw-list">
            {upcoming.map((e) => (
              <div key={e.id} className="pw-row">
                <div className="pw-row-main">
                  <div className="pw-row-title">{e.title}</div>
                  <div className="pw-row-meta">
                    {e.detail} · {formatRelativeTime(e.timestamp)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section style={{ marginTop: "1.5rem" }}>
        <h2 className="pw-section-title">Recomandări PRIMA</h2>
        <div className="pw-list">
          {suggestions.slice(0, 3).map((s) => (
            <div key={s.id} className="pw-row">
              <div className="pw-row-main">
                <div className="pw-row-title">{s.title}</div>
                <div className="pw-row-meta">
                  {s.reason}
                  {s.kind !== "general"
                    ? ` · ${ARTIFACT_KIND_LABEL[s.kind] ?? s.kind}`
                    : ""}
                </div>
              </div>
              <Link className="pw-btn pw-btn-primary" to={s.href}>
                {s.actionLabel}
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
