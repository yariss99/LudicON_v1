import { Link } from "react-router-dom";
import { useProjectWorkspace } from "../hooks/useProjectWorkspace";

export function WorkspaceHeader() {
  const { project, metadata, progress } = useProjectWorkspace();

  return (
    <header className="pw-header">
      <div>
        <div className="pw-kicker">Spațiu de proiect · PRIMA</div>
        <h1 className="pw-title">{project.title}</h1>
        <div className="pw-meta" aria-label="Informații proiect">
          <span className="pw-chip">{project.subject}</span>
          <span className="pw-chip">{project.grade}</span>
          {metadata.schoolYear ? (
            <span className="pw-chip">{metadata.schoolYear}</span>
          ) : null}
          {metadata.semester ? (
            <span className="pw-chip">Sem. {metadata.semester}</span>
          ) : null}
          <span className="pw-chip">{metadata.status}</span>
          <span className="pw-chip">{progress.percentComplete}% gata</span>
        </div>
      </div>
      <div className="pw-header-actions">
        <Link className="pw-btn" to="/projects">
          Toate proiectele
        </Link>
        <Link
          className="pw-btn pw-btn-primary"
          to={`/create/experience?project=${project.id}`}
        >
          Creează cu PRIMA
        </Link>
      </div>
    </header>
  );
}
