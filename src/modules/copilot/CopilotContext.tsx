import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useLocation } from "react-router-dom";
import { useProjects } from "../../context/ProjectContext";
import { defaultCopilotEngine } from "./engine/CopilotEngine";
import {
  buildArtifactSnapshot,
  resolveProjectIdFromPath,
} from "./services/artifactSnapshot";
import { CopilotStore } from "./store/CopilotStore";
import type { ActiveSuggestion, CopilotEngineContract } from "./types";

export type CopilotContextValue = {
  suggestions: ActiveSuggestion[];
  hasSuggestions: boolean;
  /** True when suggestion set gained items since last seen open. */
  hasNewSuggestions: boolean;
  panelOpen: boolean;
  openPanel: () => void;
  closePanel: () => void;
  togglePanel: () => void;
  dismiss: (suggestionId: string) => void;
  projectId: string | null;
};

const CopilotContext = createContext<CopilotContextValue | null>(null);

type ProviderProps = {
  children: ReactNode;
  engine?: CopilotEngineContract;
};

/**
 * CopilotProvider — observes route + studio artifacts, never auto-opens UI.
 */
export function CopilotProvider({
  children,
  engine = defaultCopilotEngine,
}: ProviderProps) {
  const location = useLocation();
  const { getProject, projects } = useProjects();
  const [dismissedIds, setDismissedIds] = useState(
    () => CopilotStore.load().dismissedIds,
  );
  const [panelOpen, setPanelOpen] = useState(false);
  const [tick, setTick] = useState(0);
  const [hasNewSuggestions, setHasNewSuggestions] = useState(false);
  const seenIdsRef = useRef<Set<string>>(new Set());

  const projectId = useMemo(() => {
    const fromPath = resolveProjectIdFromPath(location.pathname);
    if (fromPath) return fromPath;
    return projects.find((p) => !p.archived)?.id ?? null;
  }, [location.pathname, projects]);

  useEffect(() => {
    setTick((n) => n + 1);
  }, [location.pathname, projectId]);

  useEffect(() => {
    const refresh = () => setTick((n) => n + 1);
    const onStorage = (e: StorageEvent) => {
      if (e.key?.startsWith("prima.") && e.key.includes("studio")) refresh();
    };
    const onArtifacts = () => refresh();
    window.addEventListener("focus", refresh);
    window.addEventListener("storage", onStorage);
    window.addEventListener("prima:artifacts-changed", onArtifacts);
    // Studios mutate localStorage in the same tab — poll lightly while mounted
    const interval = window.setInterval(refresh, 4000);
    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("prima:artifacts-changed", onArtifacts);
      window.clearInterval(interval);
    };
  }, []);

  const suggestions = useMemo(() => {
    void tick;
    if (!projectId) return [] as ActiveSuggestion[];
    const project = getProject(projectId);
    if (!project) return [];
    const snapshot = buildArtifactSnapshot(projectId, project.title);
    return engine.evaluate(
      { snapshot, route: location.pathname },
      new Set(dismissedIds),
    );
  }, [tick, projectId, getProject, engine, location.pathname, dismissedIds]);

  useEffect(() => {
    const ids = suggestions.map((s) => s.id);
    const isNew = ids.some((id) => !seenIdsRef.current.has(id));
    if (isNew && ids.length > 0 && !panelOpen) {
      setHasNewSuggestions(true);
    }
    if (panelOpen) {
      for (const id of ids) seenIdsRef.current.add(id);
      setHasNewSuggestions(false);
    }
  }, [suggestions, panelOpen]);

  const openPanel = useCallback(() => {
    setPanelOpen(true);
    setHasNewSuggestions(false);
    for (const s of suggestions) seenIdsRef.current.add(s.id);
  }, [suggestions]);

  const closePanel = useCallback(() => setPanelOpen(false), []);
  const togglePanel = useCallback(() => {
    setPanelOpen((open) => {
      const next = !open;
      if (next) {
        setHasNewSuggestions(false);
        for (const s of suggestions) seenIdsRef.current.add(s.id);
      }
      return next;
    });
  }, [suggestions]);

  const dismiss = useCallback((suggestionId: string) => {
    const next = CopilotStore.dismiss(suggestionId);
    setDismissedIds(next.dismissedIds);
  }, []);

  const value = useMemo<CopilotContextValue>(
    () => ({
      suggestions,
      hasSuggestions: suggestions.length > 0,
      hasNewSuggestions,
      panelOpen,
      openPanel,
      closePanel,
      togglePanel,
      dismiss,
      projectId,
    }),
    [
      suggestions,
      hasNewSuggestions,
      panelOpen,
      openPanel,
      closePanel,
      togglePanel,
      dismiss,
      projectId,
    ],
  );

  return (
    <CopilotContext.Provider value={value}>{children}</CopilotContext.Provider>
  );
}

export function useCopilot(): CopilotContextValue {
  const ctx = useContext(CopilotContext);
  if (!ctx) {
    throw new Error("useCopilot must be used within CopilotProvider");
  }
  return ctx;
}

export { CopilotContext };
