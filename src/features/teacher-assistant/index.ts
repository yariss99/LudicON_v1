export { TeacherAssistantPage } from "./TeacherAssistantPage";
export {
  TeacherAssistantProvider,
  useTeacherAssistant,
} from "./hooks/useTeacherAssistant";
export { AssistantPanel } from "./components/AssistantPanel";
export { FloatingAssistant } from "./components/FloatingAssistant";
export { assistantRepository } from "./services/assistantRepository";
export { buildAssistantContext } from "./services/assistantContextManager";
export {
  runAssistantTurn,
  detectIntent,
  buildOrchestrationPrompt,
} from "./services/assistantConversationEngine";
export { validateAssistantResponse } from "./services/assistantValidation";
export { buildProactiveHints } from "./services/assistantProactive";
export type * from "./types";
