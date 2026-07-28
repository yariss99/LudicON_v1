import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useProjects } from "../../context/ProjectContext";
import {
  GameBuilderProvider,
  createGameInProject,
} from "./hooks/useGameBuilder";
import { gameBuilderRepository } from "./services/gameBuilderRepository";
import { ensureLessonForProject } from "./services/gameCoreBridge";
import { GameBuilderHeader } from "./components/GameBuilderHeader";
import { GameSectionNav } from "./components/GameSectionNav";
import { GameEditorPane } from "./components/GameEditorPane";
import { GameSideRail } from "./components/GameSideRail";
import "./styles/game-builder.css";

function GameBuilderShell() {
  return (
    <div className="game-builder">
      <div className="gb-shell">
        <GameBuilderHeader />
        <div className="gb-body">
          <GameSectionNav />
          <main className="gb-main">
            <GameEditorPane />
          </main>
          <GameSideRail />
        </div>
      </div>
    </div>
  );
}

function GameMissing({
  projectId,
  gameId,
}: {
  projectId: string;
  gameId: string;
}) {
  const navigate = useNavigate();
  const { getProject } = useProjects();
  const project = getProject(projectId);

  return (
    <div className="game-builder">
      <div className="gb-missing">
        <h1 className="gb-section-title">Joc negăsit</h1>
        <p className="gb-lead">
          Nu există jocul <code>{gameId}</code> în acest proiect.
        </p>
        <div className="gb-actions" style={{ justifyContent: "center" }}>
          <Link className="gb-btn" to={`/studio/${projectId}/games`}>
            Înapoi la jocuri
          </Link>
          {project ? (
            <button
              type="button"
              className="gb-btn gb-btn-primary"
              onClick={() => {
                const lessonId = ensureLessonForProject(project);
                const created = createGameInProject({ project, lessonId });
                navigate(`/game-builder/${project.id}/${created.id}`);
              }}
            >
              Creează joc
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/** Route: `/game-builder/:projectId/:gameId` */
export function GameBuilderPage() {
  const { projectId = "", gameId = "" } = useParams();
  const { getProject } = useProjects();
  const project = getProject(projectId);
  const [ready, setReady] = useState(false);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    if (!projectId || !gameId || !project) {
      setMissing(true);
      setReady(false);
      return;
    }
    const doc = gameBuilderRepository.getById(gameId);
    if (!doc || doc.projectId !== project.id || !doc.lessonId) {
      setMissing(true);
      setReady(false);
      return;
    }
    setMissing(false);
    setReady(true);
  }, [project, projectId, gameId]);

  if (!projectId) {
    return (
      <div className="game-builder">
        <div className="gb-missing">
          <p className="gb-lead">Game Builder necesită un proiect.</p>
          <Link className="gb-btn gb-btn-primary" to="/projects">
            Alege un proiect
          </Link>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="game-builder">
        <div className="gb-missing">
          <h1 className="gb-section-title">Proiect negăsit</h1>
          <Link className="gb-btn gb-btn-primary" to="/projects">
            Înapoi
          </Link>
        </div>
      </div>
    );
  }

  if (missing || !gameId) {
    return <GameMissing projectId={projectId} gameId={gameId || "—"} />;
  }

  if (!ready) return null;

  return (
    <GameBuilderProvider projectId={project.id} gameId={gameId}>
      <GameBuilderShell />
    </GameBuilderProvider>
  );
}

/** `/game-builder/:projectId` */
export function GameBuilderEntryPage() {
  const { projectId = "" } = useParams();
  const navigate = useNavigate();
  const { getProject } = useProjects();
  const project = getProject(projectId);

  useEffect(() => {
    if (!project) return;
    const existing = gameBuilderRepository.listByProject(project.id)[0];
    if (existing) {
      navigate(`/game-builder/${project.id}/${existing.id}`, { replace: true });
      return;
    }
    const lessonId = ensureLessonForProject(project);
    const created = createGameInProject({ project, lessonId });
    navigate(`/game-builder/${project.id}/${created.id}`, { replace: true });
  }, [project, navigate]);

  if (!project) {
    return (
      <div className="game-builder">
        <div className="gb-missing">
          <h1 className="gb-section-title">Proiect negăsit</h1>
          <Link className="gb-btn gb-btn-primary" to="/projects">
            Înapoi la proiecte
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="game-builder">
      <div className="gb-missing">
        <p className="gb-lead">Se deschide Game Builder…</p>
      </div>
    </div>
  );
}

export default GameBuilderPage;
