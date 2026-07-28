/**
 * WorkflowSession — mutable runtime handle around an immutable snapshot.
 * AI cannot obtain a privileged session; all mutations go through WorkflowEngine.dispatch.
 */

import { appendHistoryEntry, createEmptyHistory } from './history.js';
import { newId, nowIso } from './ids.js';
import type {
  WorkflowActor,
  WorkflowContext,
  WorkflowDefinition,
  WorkflowDispatchPayload,
  WorkflowEvent,
  WorkflowHistoryEntry,
  WorkflowSessionSnapshot,
  WorkflowState,
  TeacherContext,
} from './types.js';

export function createInitialContext(teacher: TeacherContext): WorkflowContext {
  return {
    teacher: { ...teacher },
    aiContext: Object.freeze({}),
    pendingTasks: Object.freeze([]),
    temporaryMemory: Object.freeze({}),
  };
}

export function mergeContext(
  base: WorkflowContext,
  patch?: WorkflowDispatchPayload['contextPatch'],
): WorkflowContext {
  if (!patch) return base;
  return {
    teacher: { ...base.teacher, ...(patch.teacher ?? {}) },
    projectId: patch.projectId ?? base.projectId,
    resourceId: patch.resourceId ?? base.resourceId,
    lessonId: patch.lessonId ?? base.lessonId,
    aiContext: Object.freeze({
      ...base.aiContext,
      ...(patch.aiContext ?? {}),
    }),
    pendingTasks: Object.freeze(
      patch.pendingTasks ? [...patch.pendingTasks] : [...base.pendingTasks],
    ),
    temporaryMemory: Object.freeze({
      ...base.temporaryMemory,
      ...(patch.temporaryMemory ?? {}),
    }),
  };
}

export class WorkflowSession {
  private snapshot: WorkflowSessionSnapshot;

  constructor(snapshot: WorkflowSessionSnapshot) {
    this.snapshot = freezeSnapshot(snapshot);
  }

  static start(input: {
    definition: WorkflowDefinition;
    teacher: TeacherContext;
    workflowId?: string;
    clock?: () => Date;
  }): WorkflowSession {
    const workflowId = input.workflowId ?? newId('wf');
    const createdAt = nowIso(input.clock);
    return new WorkflowSession({
      workflowId,
      kind: input.definition.kind,
      definitionVersion: input.definition.version,
      state: 'Idle',
      context: createInitialContext(input.teacher),
      history: createEmptyHistory(workflowId),
      createdAt,
      updatedAt: createdAt,
      historyCursor: -1,
    });
  }

  getSnapshot(): WorkflowSessionSnapshot {
    return this.snapshot;
  }

  getCurrentState(): WorkflowState {
    return this.snapshot.state;
  }

  getWorkflowId(): string {
    return this.snapshot.workflowId;
  }

  /** Apply a legal transition; returns the new history entry. */
  applyTransition(input: {
    event: WorkflowEvent;
    nextState: WorkflowState;
    actor: WorkflowActor;
    payload?: WorkflowDispatchPayload;
    clock?: () => Date;
  }): WorkflowHistoryEntry {
    const previousState = this.snapshot.state;
    const history = appendHistoryEntry({
      history: this.snapshot.history,
      previousState,
      newState: input.nextState,
      event: input.event,
      actor: input.actor,
      metadata: input.payload?.metadata,
      clock: input.clock,
    });
    const entry = history.entries[history.entries.length - 1]!;
    this.snapshot = freezeSnapshot({
      ...this.snapshot,
      state: input.nextState,
      context: mergeContext(this.snapshot.context, input.payload?.contextPatch),
      history,
      updatedAt: entry.timestamp,
      historyCursor: history.entries.length - 1,
    });
    return entry;
  }

  /**
   * Roll back one step using history (undo last transition).
   * Does not delete history — appends a Restore entry pointing at prior state.
   */
  rollback(input: {
    actor: WorkflowActor;
    clock?: () => Date;
    metadata?: Readonly<Record<string, unknown>>;
  }): WorkflowHistoryEntry {
    const cursor = this.snapshot.historyCursor;
    if (cursor < 0) {
      throw new WorkflowSessionError(
        'ROLLBACK_EMPTY',
        `Workflow ${this.snapshot.workflowId} has no transitions to roll back.`,
      );
    }
    const last = this.snapshot.history.entries[cursor]!;
    const targetState = last.previousState;
    return this.applyTransition({
      event: 'Restore',
      nextState: targetState,
      actor: input.actor,
      payload: {
        metadata: {
          ...(input.metadata ?? {}),
          rollbackOf: last.entryId,
          restoredState: targetState,
        },
      },
      clock: input.clock,
    });
  }

  /**
   * Restore to a specific history index (recoverable workflows).
   */
  restoreTo(input: {
    historyIndex: number;
    actor: WorkflowActor;
    clock?: () => Date;
    metadata?: Readonly<Record<string, unknown>>;
  }): WorkflowHistoryEntry {
    const entry = this.snapshot.history.entries[input.historyIndex];
    if (!entry) {
      throw new WorkflowSessionError(
        'RESTORE_INVALID_INDEX',
        `History index ${input.historyIndex} is out of range for workflow ${this.snapshot.workflowId}.`,
      );
    }
    return this.applyTransition({
      event: 'Restore',
      nextState: entry.newState,
      actor: input.actor,
      payload: {
        metadata: {
          ...(input.metadata ?? {}),
          restoreToEntryId: entry.entryId,
          restoreToIndex: input.historyIndex,
        },
      },
      clock: input.clock,
    });
  }

  replaceSnapshot(snapshot: WorkflowSessionSnapshot): void {
    this.snapshot = freezeSnapshot(snapshot);
  }
}

export class WorkflowSessionError extends Error {
  readonly code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = 'WorkflowSessionError';
    this.code = code;
  }
}

function freezeSnapshot(snapshot: WorkflowSessionSnapshot): WorkflowSessionSnapshot {
  return {
    ...snapshot,
    context: {
      ...snapshot.context,
      teacher: { ...snapshot.context.teacher },
      aiContext: Object.freeze({ ...snapshot.context.aiContext }),
      pendingTasks: Object.freeze([...snapshot.context.pendingTasks]),
      temporaryMemory: Object.freeze({ ...snapshot.context.temporaryMemory }),
    },
    history: {
      workflowId: snapshot.history.workflowId,
      entries: Object.freeze([...snapshot.history.entries]),
    },
  };
}
