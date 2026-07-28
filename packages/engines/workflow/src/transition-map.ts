/**
 * Canonical transition table.
 * Shared by every workflow kind — no per-workflow branching.
 */

import type { WorkflowEvent, WorkflowState, WorkflowTransition } from './types.js';

/**
 * Legal edges of the PRIMA workflow state machine.
 *
 * Happy path:
 * Idle → Initializing → LoadingContext → Planning → Generating → Validating
 *   → Reviewing → Ready → Publishing → Completed
 *
 * Side paths: Editing, Failed, Cancelled, Retry, Restore, SaveDraft.
 */
export const WORKFLOW_TRANSITIONS: readonly WorkflowTransition[] = [
  // Bootstrap
  { from: 'Idle', event: 'CreateWorkflow', to: 'Initializing' },
  { from: 'Initializing', event: 'LoadContext', to: 'LoadingContext' },
  { from: 'LoadingContext', event: 'PlanningCompleted', to: 'Planning' },

  // Produce
  { from: 'Planning', event: 'Generate', to: 'Generating' },
  { from: 'Generating', event: 'GenerationCompleted', to: 'Validating' },

  // Validate
  { from: 'Validating', event: 'ValidationPassed', to: 'Reviewing' },
  { from: 'Validating', event: 'ValidationFailed', to: 'Editing' },

  // Teacher craft
  { from: 'Reviewing', event: 'Edit', to: 'Editing' },
  { from: 'Reviewing', event: 'ValidationPassed', to: 'Ready' },
  { from: 'Ready', event: 'Edit', to: 'Editing' },
  { from: 'Editing', event: 'SaveDraft', to: 'Editing' },
  { from: 'Editing', event: 'Generate', to: 'Generating' },
  { from: 'Editing', event: 'ValidationPassed', to: 'Reviewing' },

  // Publish
  { from: 'Ready', event: 'Publish', to: 'Publishing' },
  { from: 'Reviewing', event: 'Publish', to: 'Publishing' },
  { from: 'Publishing', event: 'Complete', to: 'Completed' },
  { from: 'Ready', event: 'Complete', to: 'Completed' },

  // Failure / retry
  { from: 'Generating', event: 'ValidationFailed', to: 'Failed' },
  { from: 'Publishing', event: 'ValidationFailed', to: 'Failed' },
  { from: 'Initializing', event: 'ValidationFailed', to: 'Failed' },
  { from: 'LoadingContext', event: 'ValidationFailed', to: 'Failed' },
  { from: 'Planning', event: 'ValidationFailed', to: 'Failed' },
  { from: 'Failed', event: 'Retry', to: 'Planning' },
  { from: 'Failed', event: 'Generate', to: 'Generating' },

  // Cancel from non-terminal active states
  { from: 'Initializing', event: 'Cancel', to: 'Cancelled' },
  { from: 'LoadingContext', event: 'Cancel', to: 'Cancelled' },
  { from: 'Planning', event: 'Cancel', to: 'Cancelled' },
  { from: 'Generating', event: 'Cancel', to: 'Cancelled' },
  { from: 'Validating', event: 'Cancel', to: 'Cancelled' },
  { from: 'Editing', event: 'Cancel', to: 'Cancelled' },
  { from: 'Reviewing', event: 'Cancel', to: 'Cancelled' },
  { from: 'Ready', event: 'Cancel', to: 'Cancelled' },
  { from: 'Publishing', event: 'Cancel', to: 'Cancelled' },
  { from: 'Failed', event: 'Cancel', to: 'Cancelled' },

  // Restore is handled specially by the engine (history cursor), but Cancelled may re-enter via Restore event to last recoverable snapshot state through engine.restore().
] as const;

const transitionIndex: ReadonlyMap<string, WorkflowState> = (() => {
  const map = new Map<string, WorkflowState>();
  for (const t of WORKFLOW_TRANSITIONS) {
    map.set(`${t.from}::${t.event}`, t.to);
  }
  return map;
})();

export function resolveTransition(
  from: WorkflowState,
  event: WorkflowEvent,
): WorkflowState | undefined {
  return transitionIndex.get(`${from}::${event}`);
}

export function listAvailableEvents(from: WorkflowState): readonly WorkflowEvent[] {
  const events: WorkflowEvent[] = [];
  for (const t of WORKFLOW_TRANSITIONS) {
    if (t.from === from) events.push(t.event);
  }
  // Restore is always available when history allows — exposed by the engine, not the static table.
  return events;
}

/** States from which work is considered finished (no forward craft). */
export function isTerminalState(state: WorkflowState): boolean {
  return state === 'Completed' || state === 'Cancelled';
}

/** States safe to treat as restore targets (not Idle bootstrap). */
export function isRecoverableState(state: WorkflowState): boolean {
  return (
    state !== 'Idle' &&
    state !== 'Completed' &&
    state !== 'Cancelled'
  );
}
