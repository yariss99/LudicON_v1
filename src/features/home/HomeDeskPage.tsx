import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProjects } from "../../context/ProjectContext";
import {
  activeProjects,
  archivedProjects,
  sortProjectsByUpdatedAt,
} from "../../utils/projectSearch";
import type { StudioSuggestionId } from "../../types/studio";
import IntentPanel from "../studio/components/IntentPanel";
import PlanningAnimation from "../studio/components/PlanningAnimation";
import StudioShell from "../studio/components/StudioShell";
import { useStudioPlanning } from "../studio/hooks/useStudioPlanning";
import {
  buildCoachSuggestions,
  DESK_SPACES,
  type CoachSuggestion,
  type DeskSpaceId,
  type QuickCreateItem,
} from "./constants";
import AICoachPanel from "./components/AICoachPanel";
import ContinueWorkingCard from "./components/ContinueWorkingCard";
import DeskHero from "./components/DeskHero";
import DeskShell from "./components/DeskShell";
import MorningNote from "./components/MorningNote";
import QuickCreateSection from "./components/QuickCreateSection";
import SpacesRail from "./components/SpacesRail";
import TodayPanel from "./components/TodayPanel";

function focusPrompt() {
  window.scrollTo({ top: 0, behavior: "smooth" });
  window.setTimeout(() => {
    document.querySelector<HTMLTextAreaElement>("textarea")?.focus();
  }, 280);
}

function HomeDeskPage() {
  const navigate = useNavigate();
  const { projects } = useProjects();
  const {
    phase,
    pendingPrompt,
    artifacts,
    openIntent,
    toggleArtifact,
    confirmIntent,
    backToCompose,
    finishPlanning,
  } = useStudioPlanning();
  const [prompt, setPrompt] = useState("");
  const [suggestionId, setSuggestionId] = useState<
    StudioSuggestionId | undefined
  >();
  const [activeSpace, setActiveSpace] = useState<DeskSpaceId>("class-3a");

  const active = useMemo(
    () => sortProjectsByUpdatedAt(activeProjects(projects)),
    [projects],
  );
  const archived = useMemo(() => archivedProjects(projects), [projects]);
  const favorites = useMemo(
    () => active.filter((project) => project.favorite),
    [active],
  );

  const visibleProjects = useMemo(() => {
    if (activeSpace === "archive") return archived;
    if (activeSpace === "favorites") return favorites;
    if (activeSpace === "class-3a" || activeSpace === "class-3b") {
      return active.filter((project) =>
        project.grade.toLowerCase().includes("iii"),
      );
    }
    return active;
  }, [active, archived, favorites, activeSpace]);

  const continueProject = visibleProjects[0] ?? active[0] ?? null;

  const coachSuggestions = useMemo(
    () => buildCoachSuggestions(continueProject?.title),
    [continueProject?.title],
  );

  const spaceLabel =
    DESK_SPACES.find((space) => space.id === activeSpace)?.label ?? "Desk";

  const handleSpace = (space: DeskSpaceId) => {
    if (space === "projects") {
      navigate("/projects");
      return;
    }
    setActiveSpace(space);
  };

  const handleQuickCreate = (item: QuickCreateItem) => {
    setSuggestionId(item.id);
    setPrompt(item.prompt);
    openIntent(item.prompt, item.id);
  };

  const handleCoach = (suggestion: CoachSuggestion) => {
    if (suggestion.action === "continue") {
      if (continueProject) {
        navigate(`/studio/${continueProject.id}`);
        return;
      }
      focusPrompt();
      return;
    }
    if (suggestion.href) {
      navigate(suggestion.href);
      return;
    }
    if (suggestion.prompt) {
      setPrompt(suggestion.prompt);
      openIntent(suggestion.prompt);
    }
  };

  if (phase === "intent") {
    return (
      <StudioShell>
        <IntentPanel
          prompt={pendingPrompt}
          artifacts={artifacts}
          onToggle={toggleArtifact}
          onConfirm={confirmIntent}
          onBack={backToCompose}
        />
      </StudioShell>
    );
  }

  if (phase === "planning") {
    return (
      <StudioShell>
        <PlanningAnimation active onComplete={finishPlanning} />
      </StudioShell>
    );
  }

  return (
    <DeskShell>
      <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)_280px] lg:items-start xl:grid-cols-[240px_minmax(0,1fr)_300px]">
        <SpacesRail
          activeSpace={activeSpace}
          onSelect={handleSpace}
          projectCount={active.length}
          favoriteCount={favorites.length}
          archiveCount={archived.length}
        />

        <div className="min-w-0 rounded-[28px] border border-slate-200/60 bg-white/50 px-4 py-5 shadow-[0_12px_40px_rgba(15,23,42,0.03)] sm:px-6 sm:py-7 lg:px-8">
          <div className="mb-6">
            <TodayPanel
              onSuggestion={(next) => {
                setPrompt(next);
                openIntent(next);
              }}
            />
          </div>

          <DeskHero
            spaceLabel={spaceLabel}
            prompt={prompt}
            onPromptChange={(value) => {
              setPrompt(value);
              setSuggestionId(undefined);
            }}
            onSubmit={() => openIntent(prompt, suggestionId)}
          />

          <p className="mb-3 text-center text-xs text-slate-400">
            One action. Natural language. No forms.
          </p>

          <QuickCreateSection onSelect={handleQuickCreate} />

          <ContinueWorkingCard
            project={continueProject}
            onCreate={focusPrompt}
          />
        </div>

        <AICoachPanel suggestions={coachSuggestions} onSelect={handleCoach} />
      </div>

      <MorningNote
        onAction={() =>
          openIntent(
            "Create a differentiated worksheet for Mathematics Grade 3 about fractions.",
          )
        }
      />
    </DeskShell>
  );
}

export default HomeDeskPage;
