/**
 * IT-003 — Pedagogical Decision Engine
 * Deterministic pedagogical reasoning layer. Not an LLM wrapper.
 */

export {
  createDecisionSession,
  processTeacherTurn,
  approveBlueprint,
  decidePedagogicalTurn,
  type DecisionSession,
} from "./decisionEngine";

export { runDecisionPipeline } from "./pipeline";
export {
  createInitialEngineState,
  canTransition,
  transition,
} from "./stateMachine";
export { createEmptyConversation } from "./services/conversationAnalyzer";
export { createEmptyBlueprint } from "./services/blueprintMapper";
export {
  APPROVAL_REQUIRED_SECTIONS,
  DEFAULT_PLATFORM_RULES,
  SECTION_ORDER,
} from "./constants";

export type * from "./types";
export {
  composeGuidedReply,
  formatGuidedReply,
  type GuidedReplyParts,
} from "./services/guidedReplyComposer";

