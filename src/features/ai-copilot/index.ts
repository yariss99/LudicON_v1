export { AiCopilotProvider, useAiCopilot } from "./hooks/useAiCopilot";
export { AiCopilotHost } from "./components/AiCopilotHost";
export { FloatingCopilotButton } from "./components/FloatingCopilotButton";
export { SuggestionPanel } from "./components/SuggestionPanel";
export { SuggestionCard } from "./components/SuggestionCard";
export { SuggestionEngine, createSuggestionEngine } from "./services/SuggestionEngine";
export { SuggestionRegistry } from "./services/SuggestionRegistry";
export type {
  CopilotPanelMode,
  CopilotRuntimeContext,
  CopilotQuickActionId,
} from "./types";
export type {
  PedagogicalSuggestion,
  SuggestionRuleId,
  SuggestionProvider,
  ArtifactInventory,
} from "./suggestionTypes";
