import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useProjects } from "../../context/ProjectContext";
import { classroomService } from "../../services/classroomService";
import { projectService } from "../../services/projectService";
import { studioService } from "../../services/studioService";
import type { ConfidenceActionId } from "../../types/confidence";
import type { Project, ProjectResource } from "../../types/project";
import { ConfidencePanel } from "../confidence";
import { blueprintReviewRepository } from "../blueprint-review";
import GameActivityPanel from "../experience/components/GameActivityPanel";
import type { GameActivitySuggestion } from "../experience/constants";
import { saveLastWorkspace } from "../experience/sessionMemory";
import LivingCanvas from "./components/LivingCanvas";
import ProjectHeader from "./components/ProjectHeader";
import StudioShell from "./components/StudioShell";
import { INTENT_STORAGE_KEY } from "./constants";

function rememberExperience(project: Project, label?: string) {
  classroomService.snapshotExperience(project, {
    label,
    note: "Saved from Living Workspace.",
  });
}

function readIntentPrompt(projectId: string): string | undefined {
  try {
    const raw = sessionStorage.getItem(INTENT_STORAGE_KEY);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as { projectId?: string; prompt?: string };
    if (parsed.projectId === projectId) return parsed.prompt;
  } catch {
    return undefined;
  }
  return undefined;
}

function StudioWorkspacePage() {
  const { projectId = "" } = useParams();
  const navigate = useNavigate();
  const { getProject, refresh } = useProjects();
  const project = getProject(projectId);
  const [resources, setResources] = useState<ProjectResource[]>([]);
  const [gamePanelOpen, setGamePanelOpen] = useState(false);
  const [pulseNote, setPulseNote] = useState<string | null>(null);

  useEffect(() => {
    setResources(project?.resources ?? []);
  }, [project]);

  const intentPrompt = useMemo(
    () => (projectId ? readIntentPrompt(projectId) : undefined),
    [projectId],
  );

  const reviewDoc = useMemo(
    () =>
      projectId
        ? blueprintReviewRepository.getByProjectId(projectId)
        : null,
    [projectId],
  );
  const generationLocked = Boolean(
    reviewDoc && !reviewDoc.generationUnlocked,
  );

  if (!project) {
    return (
      <StudioShell>
        <p className="text-slate-600">Workspace not found.</p>
        <Link to="/" className="mt-4 inline-block text-sm text-blue-600">
          Back to PRIMA
        </Link>
      </StudioShell>
    );
  }

  const remember = (title = project.title) => {
    saveLastWorkspace({
      projectId: project.id,
      title,
      prompt: intentPrompt ?? project.description,
      savedAt: new Date().toISOString(),
    });
  };

  const openResource = (resource: ProjectResource) => {
    if (generationLocked) {
      setPulseNote(
        "Materialele se deblochează după ce confirmi proiectul lecției.",
      );
      window.setTimeout(() => setPulseNote(null), 2400);
      return;
    }
    if (resource.type === "game") {
      setGamePanelOpen(true);
      return;
    }
    if (resource.type === "lesson") {
      navigate(`/projects/${project.id}/lessons/new`);
      return;
    }
    if (resource.type === "ai_notes" || resource.type === "reflection") {
      navigate(`/ai?project=${project.id}`);
      return;
    }
    // Soft open — keep teacher in the living workspace story
    setPulseNote(`„${resource.label}” e gata să o modelezi când ești pregătit.`);
    window.setTimeout(() => setPulseNote(null), 2000);
  };

  const reorder = (next: ProjectResource[]) => {
    setResources(next);
    const updated = projectService.replaceResources(project.id, next);
    rememberExperience(updated, "Reordered resources");
    refresh();
    remember();
  };

  const rename = (resourceId: string, label: string) => {
    const updated = studioService.updateResourceLabel(
      project.id,
      resourceId,
      label,
    );
    setResources(updated.resources);
    rememberExperience(updated, "Updated resource");
    refresh();
    remember(updated.title);
    setPulseNote("Actualizat imediat — spațiul tău rămâne aliniat.");
    window.setTimeout(() => setPulseNote(null), 1800);
  };

  const selectGame = (activity: GameActivitySuggestion) => {
    const updated = studioService.selectGameActivity(
      project.id,
      activity.title,
    );
    setResources(updated.resources);
    rememberExperience(updated, `Chose ${activity.title}`);
    refresh();
    remember();
    setGamePanelOpen(false);
    setPulseNote(`Joc pregătit: ${activity.title}`);
    window.setTimeout(() => setPulseNote(null), 2200);
  };

  const applyConfidenceImprovement = (actionId: ConfidenceActionId) => {
    const updated = studioService.applyConfidenceAction(project.id, actionId);
    setResources(updated.resources);
    rememberExperience(updated, "Confidence improvement");
    refresh();
    remember();
    setPulseNote("Un pas mic aplicat — lecția ta este mai pregătită.");
    window.setTimeout(() => setPulseNote(null), 2200);
  };

  return (
    <StudioShell dense>
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 no-underline hover:text-slate-800"
          >
            <ArrowLeft size={16} />
            Înapoi la birou
          </Link>
          <Link
            to={`/classroom?project=${project.id}`}
            className="text-sm font-medium text-slate-500 no-underline hover:text-slate-800"
          >
            Memoria lecției →
          </Link>
        </div>

        {generationLocked && reviewDoc ? (
          <div className="mb-6 rounded-3xl bg-amber-50 px-4 py-3 text-sm text-amber-950 ring-1 ring-amber-100">
            <p className="font-semibold">Materialele așteaptă confirmarea</p>
            <p className="mt-1 text-xs leading-relaxed">
              Confirmă mai întâi proiectul lecției, apoi pregătim împreună
              materialele pentru clasă.
            </p>
            <Link
              to={`/blueprint/review/${reviewDoc.id}`}
              className="mt-2 inline-block text-sm font-semibold text-amber-950 underline-offset-2 hover:underline"
            >
              Verifică și modifică lecția
            </Link>
          </div>
        ) : null}

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <ProjectHeader project={project} intentPrompt={intentPrompt} />
            <LivingCanvas
              projectId={project.id}
              resources={resources}
              onOpenResource={openResource}
              onReorder={reorder}
              onRenameResource={rename}
            />
            {pulseNote ? (
              <p className="desk-enter mt-4 text-sm font-medium text-emerald-700">
                {pulseNote}
              </p>
            ) : null}
          </div>
          <ConfidencePanel
            project={project}
            resources={resources}
            intention={intentPrompt ?? project.description}
            onApplyImprovement={applyConfidenceImprovement}
          />
        </div>
      </div>

      <GameActivityPanel
        open={gamePanelOpen}
        onClose={() => setGamePanelOpen(false)}
        onSelect={selectGame}
      />
    </StudioShell>
  );
}

export default StudioWorkspacePage;
