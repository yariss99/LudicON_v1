import { Link } from "react-router-dom";
import { useResourceCenter } from "../hooks/useResourceCenter";

export function ResourceCenterHeader({
  embedded,
}: {
  embedded?: boolean;
}) {
  const {
    resources,
    filteredHits,
    projectScopeId,
    reindex,
    createUpload,
    setSectionId,
    setPanel,
  } = useResourceCenter();

  return (
    <header className="rc-top">
      <div>
        <div className="rc-kicker">
          {embedded ? (
            "Project Workspace · Resurse"
          ) : (
            <>
              <Link to="/projects" style={{ color: "inherit" }}>
                ← Proiecte
              </Link>
              {" · "}Intelligent Resource Center
              {projectScopeId ? (
                <>
                  {" · "}
                  <Link
                    to={`/studio/${projectScopeId}/resources`}
                    style={{ color: "inherit" }}
                  >
                    proiect
                  </Link>
                </>
              ) : null}
            </>
          )}
        </div>
        <h1 className="rc-title">Centrul inteligent de resurse</h1>
        <div className="rc-meta">
          <span className="rc-chip">{resources.length} indexate</span>
          <span className="rc-chip">{filteredHits.length} vizibile</span>
          <span className="rc-chip">knowledge graph</span>
          <span className="rc-chip">nu este un file manager</span>
        </div>
      </div>
      <div className="rc-actions">
        <button type="button" className="rc-btn" onClick={reindex}>
          Reindexează
        </button>
        <button
          type="button"
          className="rc-btn"
          onClick={() => {
            setSectionId("search");
            setPanel("search");
          }}
        >
          Căutare
        </button>
        <button
          type="button"
          className="rc-btn"
          onClick={() => {
            setSectionId("graph");
            setPanel("graph");
          }}
        >
          Graph
        </button>
        <button
          type="button"
          className="rc-btn"
          onClick={() => setPanel("ai")}
        >
          AI
        </button>
        <button
          type="button"
          className="rc-btn rc-btn-primary"
          onClick={() => {
            const name = window.prompt("Nume resursă / upload");
            if (!name?.trim()) return;
            createUpload({
              name: name.trim(),
              assetType: "teacher_upload",
              description: "Resursă încărcată de profesor",
            });
            setSectionId("metadata");
          }}
        >
          Adaugă resursă
        </button>
        {!embedded ? (
          <Link className="rc-btn" to="/library">
            Bibliotecă Studio
          </Link>
        ) : null}
      </div>
    </header>
  );
}
