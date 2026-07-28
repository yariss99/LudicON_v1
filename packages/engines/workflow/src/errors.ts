/**
 * Workflow engine errors — invalid transitions and authority violations.
 */

import type { WorkflowEvent, WorkflowState } from './types.js';

export class WorkflowEngineError extends Error {
  readonly code: string;
  readonly currentState?: WorkflowState;
  readonly event?: WorkflowEvent;

  constructor(
    code: string,
    message: string,
    details?: { currentState?: WorkflowState; event?: WorkflowEvent },
  ) {
    super(message);
    this.name = 'WorkflowEngineError';
    this.code = code;
    this.currentState = details?.currentState;
    this.event = details?.event;
  }
}

export function invalidTransitionError(
  state: WorkflowState,
  event: WorkflowEvent,
): WorkflowEngineError {
  return new WorkflowEngineError(
    'INVALID_TRANSITION',
    `Invalid workflow transition: cannot apply event "${event}" while in state "${state}".`,
    { currentState: state, event },
  );
}
