import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProjects } from "../../../context/ProjectContext";
import type {
  IntentArtifact,
  StudioPhase,
  StudioSuggestionId,
} from "../../../types/studio";
import { saveLastWorkspace } from "../../experience/sessionMemory";
import { INTENT_STORAGE_KEY } from "../constants";
import {
  includedArtifactIds,
  inferIntentArtifacts,
} from "../intentArtifacts";
import { parseStudioIntent } from "../intentParser";

export function useStudioPlanning() {
  const navigate = useNavigate();
  const { createStudioProject } = useProjects();
  const [phase, setPhase] = useState<StudioPhase>("compose");
  const [pendingPrompt, setPendingPrompt] = useState("");
  const [suggestionId, setSuggestionId] = useState<
    StudioSuggestionId | undefined
  >();
  const [artifacts, setArtifacts] = useState<IntentArtifact[]>([]);
  /** Story mode skips Intent Panel for the 3-minute demo arc */
  const [storyMode, setStoryMode] = useState(false);

  const openIntent = useCallback(
    (prompt: string, nextSuggestion?: StudioSuggestionId) => {
      const trimmed = prompt.trim();
      if (!trimmed) return;
      setPendingPrompt(trimmed);
      setSuggestionId(nextSuggestion);
      setArtifacts(inferIntentArtifacts(trimmed, nextSuggestion));
      setStoryMode(false);
      setPhase("intent");
    },
    [],
  );

  /**
   * Mission X path: intention → thinking → workspace.
   * No forms. No competing UI. Product explains itself.
   */
  const beginExperience = useCallback((prompt: string) => {
    const trimmed = prompt.trim();
    if (!trimmed) return;
    setPendingPrompt(trimmed);
    setSuggestionId(undefined);
    setArtifacts(inferIntentArtifacts(trimmed));
    setStoryMode(true);
    setPhase("planning");
  }, []);

  const startPlanning = openIntent;

  const toggleArtifact = useCallback((id: IntentArtifact["id"]) => {
    setArtifacts((current) =>
      current.map((item) =>
        item.id === id ? { ...item, included: !item.included } : item,
      ),
    );
  }, []);

  const confirmIntent = useCallback(() => {
    const selected = includedArtifactIds(artifacts);
    if (selected.length === 0) return;
    setStoryMode(false);
    setPhase("planning");
  }, [artifacts]);

  const backToCompose = useCallback(() => {
    setPhase("compose");
    setStoryMode(false);
  }, []);

  const finishPlanning = useCallback(() => {
    const selected = includedArtifactIds(artifacts);
    const intent = parseStudioIntent(pendingPrompt, suggestionId, selected);
    const project = createStudioProject(intent);

    try {
      sessionStorage.setItem(
        INTENT_STORAGE_KEY,
        JSON.stringify({ projectId: project.id, prompt: intent.prompt }),
      );
    } catch {
      /* ignore */
    }

    saveLastWorkspace({
      projectId: project.id,
      title: project.title,
      prompt: intent.prompt,
      savedAt: new Date().toISOString(),
    });

    navigate(`/studio/${project.id}`, { replace: true });
  }, [
    artifacts,
    pendingPrompt,
    suggestionId,
    createStudioProject,
    navigate,
  ]);

  return {
    phase,
    pendingPrompt,
    artifacts,
    storyMode,
    openIntent,
    beginExperience,
    startPlanning,
    toggleArtifact,
    confirmIntent,
    backToCompose,
    finishPlanning,
  };
}
