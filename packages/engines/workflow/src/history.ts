/**
 * Immutable workflow history helpers.
 */

import { newId, nowIso } from './ids.js';
import type {
  WorkflowActor,
  WorkflowEvent,
  WorkflowHistory,
  WorkflowHistoryEntry,
  WorkflowState,
} from './types.js';

export function createEmptyHistory(workflowId: string): WorkflowHistory {
  return { workflowId, entries: Object.freeze([]) };
}

export function appendHistoryEntry(input: {
  history: WorkflowHistory;
  previousState: WorkflowState;
  newState: WorkflowState;
  event: WorkflowEvent;
  actor: WorkflowActor;
  metadata?: Readonly<Record<string, unknown>>;
  clock?: () => Date;
}): WorkflowHistory {
  const entry: WorkflowHistoryEntry = {
    entryId: newId('wfh'),
    timestamp: nowIso(input.clock),
    previousState: input.previousState,
    newState: input.newState,
    event: input.event,
    actorId: input.actor.id,
    actorRole: input.actor.role,
    workflowId: input.history.workflowId,
    metadata: Object.freeze({ ...(input.metadata ?? {}) }),
  };

  return {
    workflowId: input.history.workflowId,
    entries: Object.freeze([...input.history.entries, entry]),
  };
}

export function historyEntryAt(
  history: WorkflowHistory,
  index: number,
): WorkflowHistoryEntry | undefined {
  if (index < 0 || index >= history.entries.length) return undefined;
  return history.entries[index];
}
