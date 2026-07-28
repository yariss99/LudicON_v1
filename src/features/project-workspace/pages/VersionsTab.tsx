import { useMemo, useState } from "react";
import { formatRelativeTime } from "../../../utils/date";
import { useProjectWorkspace } from "../hooks/useProjectWorkspace";
import { projectWorkspaceRepository } from "../services/projectWorkspaceRepository";
import { EmptyState } from "../components/EmptyState";

export function VersionsTab() {
  const { versions, restoreVersion, selectedArtifactId, setSelectedArtifactId } =
    useProjectWorkspace();
  const [compareA, setCompareA] = useState<string>("");
  const [compareB, setCompareB] = useState<string>("");

  const filtered = useMemo(() => {
    if (!selectedArtifactId) return versions;
    return versions.filter((v) => v.artifactId === selectedArtifactId);
  }, [versions, selectedArtifactId]);

  const comparison = useMemo(() => {
    if (!compareA || !compareB) return null;
    return projectWorkspaceRepository.compareVersions(compareA, compareB);
  }, [compareA, compareB]);

  if (versions.length === 0) {
    return (
      <EmptyState
        title="Nicio versiune încă"
        description="Fiecare creare sau modificare generează o versiune restaurabilă."
      />
    );
  }

  return (
    <div>
      <p className="pw-lead">
        Istoric, restaurare, comparare și rollback. Orice schimbare creează o
        versiune nouă.
      </p>

      <div className="pw-toolbar">
        <button
          type="button"
          className="pw-btn"
          onClick={() => setSelectedArtifactId(null)}
        >
          Toate artefactele
        </button>
        <span className="pw-chip">{filtered.length} versiuni</span>
      </div>

      <div className="pw-list" style={{ marginBottom: "1.5rem" }}>
        {filtered.map((v) => (
          <div key={v.id} className="pw-row">
            <div className="pw-row-main">
              <div className="pw-row-title">
                {v.snapshot.title} · v{v.version}
              </div>
              <div className="pw-row-meta">
                {v.note ?? "snapshot"} · {v.actor} ·{" "}
                {formatRelativeTime(v.createdAt)}
              </div>
            </div>
            <div className="pw-row-actions">
              <button
                type="button"
                className="pw-btn pw-btn-ghost"
                onClick={() => setSelectedArtifactId(v.artifactId)}
              >
                Filtrează
              </button>
              <button
                type="button"
                className="pw-btn"
                onClick={() => setCompareA(v.id)}
              >
                Compară A
              </button>
              <button
                type="button"
                className="pw-btn"
                onClick={() => setCompareB(v.id)}
              >
                Compară B
              </button>
              <button
                type="button"
                className="pw-btn pw-btn-primary"
                onClick={() => restoreVersion(v.id)}
              >
                Restaurează
              </button>
            </div>
          </div>
        ))}
      </div>

      {(compareA || compareB) && (
        <section>
          <h2 className="pw-section-title">Comparare versiuni</h2>
          <div className="pw-compare">
            <div className="pw-card">
              <div className="pw-stat-label">Versiune A</div>
              <pre className="pw-pre">
                {JSON.stringify(comparison?.a?.snapshot ?? null, null, 2)}
              </pre>
            </div>
            <div className="pw-card">
              <div className="pw-stat-label">Versiune B</div>
              <pre className="pw-pre">
                {JSON.stringify(comparison?.b?.snapshot ?? null, null, 2)}
              </pre>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
