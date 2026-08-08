import { Link } from "react-router-dom";
import { ARTIFACT_KIND_LABEL } from "../constants";
import { ArtifactRow } from "../components/ArtifactRow";
import { EmptyState } from "../components/EmptyState";
import { useProjectWorkspace } from "../hooks/useProjectWorkspace";
import type { ArtifactKind } from "../types";

type Props = {
  kind: ArtifactKind;
  title: string;
  lead: string;
  createLabel: string;
};

export function ArtifactsTab({ kind, title, lead, createLabel }: Props) {
  const {
    project,
    artifacts,
    selectedArtifactId,
    setSelectedArtifactId,
    createArtifact,
    duplicateArtifact,
    archiveArtifact,
    markReady,
    generateWithAi,
    exportArtifact,
  } = useProjectWorkspace();

  const list = artifacts.filter(
    (a) => a.kind === kind && a.status !== "archived",
  );

  const defaultTitle = `${ARTIFACT_KIND_LABEL[kind] ?? kind} nou(ă)`;

  return (
    <div>
      <div className="pw-toolbar">
        <div>
          <h2 className="pw-section-title" style={{ marginBottom: 0 }}>
            {title}
          </h2>
          <p className="pw-lead" style={{ marginBottom: 0 }}>
            {lead}
          </p>
        </div>
        <div className="pw-header-actions">
          <button
            type="button"
            className="pw-btn"
            onClick={() => createArtifact(kind, defaultTitle)}
          >
            {createLabel}
          </button>
          <button
            type="button"
            className="pw-btn pw-btn-primary"
            onClick={() =>
              generateWithAi(kind, `${ARTIFACT_KIND_LABEL[kind]} generat(ă)`)
            }
          >
            Generează cu AI
          </button>
          <Link
            className="pw-btn"
            to={`/create?type=${kind}&project=${project.id}&source=blank`}
          >
            Creation wizard
          </Link>
        </div>
      </div>

      {list.length === 0 ? (
        <EmptyState
          title={`Niciun material de tip ${ARTIFACT_KIND_LABEL[kind]?.toLowerCase() ?? kind}`}
          description="Tot ce creezi rămâne în acest proiect și poate fi versionat."
          action={
            <button
              type="button"
              className="pw-btn pw-btn-primary"
              onClick={() => generateWithAi(kind, defaultTitle)}
            >
              Generează primul
            </button>
          }
        />
      ) : (
        <div className="pw-list">
          {list.map((artifact) => (
            <ArtifactRow
              key={artifact.id}
              artifact={artifact}
              selected={selectedArtifactId === artifact.id}
              onSelect={() => setSelectedArtifactId(artifact.id)}
              actions={
                <>
                  <button
                    type="button"
                    className="pw-btn pw-btn-ghost"
                    onClick={() => markReady(artifact.id)}
                  >
                    Marchează gata
                  </button>
                  <button
                    type="button"
                    className="pw-btn pw-btn-ghost"
                    onClick={() => duplicateArtifact(artifact.id)}
                  >
                    Duplică
                  </button>
                  <button
                    type="button"
                    className="pw-btn pw-btn-ghost"
                    onClick={() => {
                      const uri = exportArtifact(artifact.id);
                      window.alert(`Export înregistrat: ${uri}`);
                    }}
                  >
                    Export
                  </button>
                  <button
                    type="button"
                    className="pw-btn pw-btn-ghost pw-btn-danger"
                    onClick={() => archiveArtifact(artifact.id)}
                  >
                    Arhivează
                  </button>
                </>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
