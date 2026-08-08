export { CopilotProvider } from "./CopilotProvider";
export { useCopilot, CopilotContext } from "./CopilotContext";
export { CopilotHost } from "./components/CopilotHost";
export { FloatingCopilotButton } from "./components/FloatingCopilotButton";
export { SuggestionPanel } from "./components/SuggestionPanel";
export { SuggestionCard } from "./components/SuggestionCard";
export { CopilotEngine, defaultCopilotEngine } from "./engine/CopilotEngine";
export { SuggestionRegistry } from "./engine/SuggestionRegistry";
export type { SuggestionRule } from "./engine/SuggestionRule";
export { CopilotStore } from "./store/CopilotStore";
export type {
  ActiveSuggestion,
  SuggestionAction,
  CopilotEvaluationContext,
  CopilotEngineContract,
  CopilotArtifactSnapshot,
} from "./types";
