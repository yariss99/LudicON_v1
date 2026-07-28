/**
 * Shared constants for catalog workflows — all bind to the engine transition table.
 */

import type { WorkflowEvent, WorkflowState } from '../types.js';
import type { WorkflowRecoveryStrategy } from './types.js';

/** Full engine state vocabulary (every catalog workflow may use the shared machine). */
export const CATALOG_ALLOWED_STATES: readonly WorkflowState[] = [
  'Idle',
  'Initializing',
  'LoadingContext',
  'Planning',
  'Generating',
  'Validating',
  'Editing',
  'Reviewing',
  'Ready',
  'Publishing',
  'Completed',
  'Failed',
  'Cancelled',
] as const;

export const CATALOG_ALLOWED_EVENTS: readonly WorkflowEvent[] = [
  'CreateWorkflow',
  'LoadContext',
  'PlanningCompleted',
  'Generate',
  'GenerationCompleted',
  'ValidationPassed',
  'ValidationFailed',
  'Edit',
  'SaveDraft',
  'Publish',
  'Retry',
  'Cancel',
  'Restore',
  'Complete',
] as const;

/** Standard creation happy path used by generate-style workflows. */
export const STANDARD_CREATE_HAPPY_PATH: readonly WorkflowEvent[] = [
  'CreateWorkflow',
  'LoadContext',
  'PlanningCompleted',
  'Generate',
  'GenerationCompleted',
  'ValidationPassed',
  'ValidationPassed',
  'Publish',
  'Complete',
] as const;

/** Review / improve paths that may skip first-time curriculum load details in product UX but still use LoadContext. */
export const STANDARD_TRANSFORM_HAPPY_PATH: readonly WorkflowEvent[] = [
  'CreateWorkflow',
  'LoadContext',
  'PlanningCompleted',
  'Generate',
  'GenerationCompleted',
  'ValidationPassed',
  'ValidationPassed',
  'Complete',
] as const;

export const STANDARD_RECOVERY: WorkflowRecoveryStrategy = {
  onFailed: 'Retry→Planning',
  onCancelled: 'Restore',
  onValidationFailed: 'Edit',
  notes:
    'Failed → Retry returns to Planning; ValidationFailed → Editing; Cancelled → Restore from history or start a new session. AI never dispatches.',
};

export const PUBLISH_RECOVERY: WorkflowRecoveryStrategy = {
  onFailed: 'Retry→Generate',
  onCancelled: 'Restore',
  onValidationFailed: 'Edit',
  notes:
    'Publish failures Retry via Generate or Restore last Ready snapshot; teacher must re-confirm Publish.',
};
