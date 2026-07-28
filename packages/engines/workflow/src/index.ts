/**
 * @prima/engine-workflow — generic Workflow Engine & State Machine
 *
 * Controls every teacher workflow via a shared state table.
 * No UI. No per-workflow transition forks.
 */

export type {
  WorkflowState,
  WorkflowEvent,
  WorkflowActorRole,
  WorkflowActor,
  WorkflowKind,
  WorkflowDefinition,
  TeacherContext,
  PendingTask,
  WorkflowContext,
  WorkflowTransition,
  WorkflowHistoryEntry,
  WorkflowHistory,
  WorkflowSessionSnapshot,
  WorkflowDispatchPayload,
  WorkflowEngineListener,
} from './types.js';

export { WORKFLOW_STATES, WORKFLOW_EVENTS } from './types.js';

export {
  WORKFLOW_TRANSITIONS,
  resolveTransition,
  listAvailableEvents,
  isTerminalState,
  isRecoverableState,
} from './transition-map.js';

export { WorkflowSession, WorkflowSessionError } from './session.js';
export {
  createInitialContext,
  mergeContext,
} from './session.js';

export { createEmptyHistory, appendHistoryEntry } from './history.js';

export { WorkflowEngineError, invalidTransitionError } from './errors.js';

export {
  WorkflowEngine,
  createWorkflowEngine,
} from './workflow-engine.js';
export type {
  CreateWorkflowEngineOptions,
  StartWorkflowInput,
  DispatchResult,
} from './workflow-engine.js';

export {
  LESSON_CREATION_WORKFLOW,
  WORKSHEET_GENERATION_WORKFLOW,
  QUIZ_GENERATION_WORKFLOW,
  STORY_GENERATION_WORKFLOW,
  PRESENTATION_GENERATION_WORKFLOW,
  EXAMPLE_WORKFLOW_DEFINITIONS,
} from './examples.js';

export {
  bindWorkflowStore,
  createEmptyWorkflowStoreSlice,
} from './store-bind.js';
export type { WorkflowStoreSlice } from './store-bind.js';

/** Product workflow catalog (definitions for this engine). */
export {
  PRIMA_WORKFLOW_CATALOG,
  WORKFLOW_CATALOG_VERSION,
  WORKFLOW_ENGINE_COMPATIBILITY,
  buildCatalogDocument,
  createDefaultWorkflowRegistry,
  createWorkflowRegistry,
  WorkflowRegistry,
  toEngineDefinition,
  validateCatalogWorkflow,
  assertCatalogWorkflow,
  catalogToJson,
  workflowToJson,
  ALL_CATALOG_WORKFLOWS,
  WF_CREATE_LESSON,
  WF_CREATE_WORKSHEET,
  WF_CREATE_ASSESSMENT,
  WF_CREATE_QUIZ,
  WF_CREATE_STORY,
  WF_CREATE_PRESENTATION,
  WF_GENERATE_IMAGE_PROMPT,
  WF_IMPROVE_LESSON,
  WF_ADAPT_LESSON,
  WF_TRANSLATE_RESOURCE,
  WF_SUMMARIZE_RESOURCE,
  WF_REVIEW_LESSON,
  WF_PUBLISH_RESOURCE,
  WF_DUPLICATE_PROJECT,
  WF_EXPORT_RESOURCE,
  WF_FUTURE_EXTENSION,
} from './catalog/index.js';

export type {
  WorkflowId,
  WorkflowPermission,
  ProducedObjectType,
  WorkflowPhase,
  WorkflowValidationRule,
  WorkflowRecoveryStrategy,
  WorkflowContextRequirement,
  CatalogWorkflow,
  WorkflowCatalogDocument,
  SchemaIssue,
} from './catalog/index.js';
