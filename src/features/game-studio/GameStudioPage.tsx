import { Link, Navigate, useLocation, useParams } from "react-router-dom";
import { useProjects } from "../../context/ProjectContext";
import { useExperienceMode } from "../experience-mode";
import { WorkflowNavigator } from "../teaching-workflow";
import { AdvancedGameStudio } from "./components/AdvancedGameStudio";
import { GuidedGameWizard } from "./components/GuidedGameWizard";
import { GameStudioProvider } from "./hooks/useGameStudio";
import { gameStudioRepository } from "./services/gameStudioRepository";

function gamePath(projectId: string, gameId: string, guided?: boolean) {
  return guided
    ? `/game-studio/${projectId}/${gameId}/guided`
    : `/game-studio/${projectId}/${gameId}`;
}

export function openGamePath(
  projectId: string,
  gameId: string,
  mode: "guided" | "advanced" | null | undefined,
  guidedCompleted?: boolean,
) {
  if (mode === "guided" && !guidedCompleted) {
    return gamePath(projectId, gameId, true);
  }
  return gamePath(projectId, gameId, false);
}

function StudioShell({
  projectId,
  gameId,
}: {
  projectId: string;
  gameId: string;
}) {
  const location = useLocation();
  const { preference } = useExperienceMode();
  const isGuidedRoute = location.pathname.endsWith("/guided");
  const game = gameStudioRepository.getById(gameId);

  if (
    !isGuidedRoute &&
    preference.mode === "guided" &&
    game &&
    !game.guidedCompleted
  ) {
    return <Navigate to={gamePath(projectId, gameId, true)} replace />;
  }

  return (
    <GameStudioProvider projectId={projectId} gameId={gameId}>
      <WorkflowNavigator
        projectId={projectId}
        kind="game"
        resourceId={gameId}
        title={game?.properties.title}
        subject={game?.properties.subject}
        grade={game?.properties.grade}
      />
      {isGuidedRoute ? <GuidedGameWizard /> : <AdvancedGameStudio />}
    </GameStudioProvider>
  );
}

export function GameStudioPage() {
  const { projectId = "", gameId = "" } = useParams();
  const { getProject } = useProjects();
  const project = getProject(projectId);
  const game = gameId ? gameStudioRepository.getById(gameId) : undefined;

  if (!projectId) return <Navigate to="/projects" replace />;

  if (!project) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F8FA] p-8">
        <div className="max-w-md text-center">
          <h2 className="text-xl font-semibold">Project not found</h2>
          <Link
            className="mt-4 inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
            to="/projects"
          >
            Back to projects
          </Link>
        </div>
      </div>
    );
  }

  if (!game || game.projectId !== projectId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F8FA] p-8">
        <div className="max-w-md text-center">
          <h2 className="text-xl font-semibold">Game not found</h2>
          <Link
            className="mt-4 inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
            to={`/studio/${projectId}/games`}
          >
            Back to Games
          </Link>
        </div>
      </div>
    );
  }

  return <StudioShell projectId={projectId} gameId={gameId} />;
}

export function GameStudioEntryPage() {
  const { projectId = "" } = useParams();
  const { getProject } = useProjects();
  const { preference } = useExperienceMode();
  const project = getProject(projectId);

  if (!projectId || !project) {
    return <Navigate to="/projects" replace />;
  }

  const created = gameStudioRepository.create(projectId, {
    subject: project.subject,
    grade: project.grade,
    title: "Untitled game",
    sourceKind: "scratch",
    gameType: "quiz_challenge",
  });

  return (
    <Navigate
      to={openGamePath(
        projectId,
        created.id,
        preference.mode,
        created.guidedCompleted,
      )}
      replace
    />
  );
}

export default GameStudioPage;
