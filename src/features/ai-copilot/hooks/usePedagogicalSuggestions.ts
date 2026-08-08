import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { useProjects } from "../../../context/ProjectContext";
import { buildArtifactInventory } from "../services/artifactInventory";
import { createSuggestionEngine } from "../services/SuggestionEngine";
import { suggestionStateStore } from "../services/suggestionStateStore";
import type { PedagogicalSuggestion } from "../suggestionTypes";

/**
 * Observes project artifacts and surfaces undismissed pedagogical suggestions.
 * Panel open state is teacher-controlled (never auto-opens).
 */
export function usePedagogicalSuggestions(projectId: string | null) {
  const location = useLocation();
  const { getProject } = useProjects();
  const [dismissedIds, setDismissedIds] = useState<string[]>(
    () => suggestionStateStore.load().dismissedIds,
  );
  const [panelOpen, setPanelOpen] = useState(false);
  const [tick, setTick] = useState(0);

  // Re-evaluate when route changes or storage may have been updated by studios
  useEffect(() => {
    setTick((n) => n + 1);
  }, [location.pathname, projectId]);

  useEffect(() => {
    const onFocus = () => setTick((n) => n + 1);
    const onStorage = (e: StorageEvent) => {
      if (
        e.key?.includes("prima.") &&
        (e.key.includes("studio") || e.key.includes("lesson"))
      ) {
        setTick((n) => n + 1);
      }
    };
    window.addEventListener("focus", onFocus);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const suggestions = useMemo(() => {
    void tick;
    if (!projectId) return [] as PedagogicalSuggestion[];
    const project = getProject(projectId);
    if (!project) return [];
    const inventory = buildArtifactInventory(projectId, project.title);
    return createSuggestionEngine(dismissedIds).evaluate(inventory);
  }, [projectId, getProject, dismissedIds, tick]);

  const dismiss = useCallback((id: string) => {
    const next = suggestionStateStore.dismiss(id);
    setDismissedIds(next.dismissedIds);
  }, []);

  const openPanel = useCallback(() => setPanelOpen(true), []);
  const closePanel = useCallback(() => setPanelOpen(false), []);
  const togglePanel = useCallback(() => setPanelOpen((v) => !v), []);

  return {
    suggestions,
    hasOpportunity: suggestions.length > 0,
    panelOpen,
    openPanel,
    closePanel,
    togglePanel,
    dismiss,
  };
}
