/**
 * CE-004 — Pedagogical Conversation Engine (Create Experience facade).
 *
 * After each Learning Canvas update:
 * AI-003 infers → AI-002 decides → AI-002.5 validates → verbalize if approved.
 */

export {
  decidePedagogicalAction,
  pedagogicalDecisionEngine,
  type PedagogicalDecision,
  type PedagogicalAction,
  type DecisionContext,
} from "../../create-learning-experience/decision-engine";

export {
  validatePedagogicalDecision,
  pedagogicalValidationEngine,
  type ValidationResult,
} from "../../../engines/validation";

export {
  runPedagogicalInference,
  pedagogicalInferenceEngine,
  type InferenceResult,
} from "../../../engines/inference";

export {
  processTeacherMessage,
  createExperienceSession,
  type ExperienceEngineSession,
  type EngineTurnResult,
} from "./conversationEngine";

export { verbalizePedagogicalDecision } from "./verbalizePedagogicalDecision";
