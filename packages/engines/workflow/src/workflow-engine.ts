/**
 * WorkflowEngine — central runtime for all PRIMA teacher workflows.
 *
 * Principles enforced here:
 * - Single source of truth per session snapshot
 * - Explicit, table-driven transitions only
 * - Immutable transition history
 * - AI cannot dispatch state changes
 * - Teacher (or trusted system adapters) validate progress toward Complete
 */

import { invalidTransitionError, WorkflowEngineError } from './errors.js';
import {
  isRecoverableState,
  isTerminalState,
  listAvailableEvents,
  resolveTransition,
} from './transition-map.js';
import { WorkflowSession } from './session.js';
import type {
  WorkflowActor,
  WorkflowDefinition,
  WorkflowDispatchPayload,
  WorkflowEngineListener,
  WorkflowEvent,
  WorkflowHistoryEntry,
  WorkflowSessionSnapshot,
  WorkflowState,
  TeacherContext,
} from './types.js';

export type CreateWorkflowEngineOptions = {
  /** Optional clock for deterministic tests. */
  readonly clock?: () => Date;
};

export type StartWorkflowInput = {
  readonly definition: WorkflowDefinition;
  readonly teacher: TeacherContext;
  readonly actor: WorkflowActor;
  readonly workflowId?: string;
  /** When true, immediately dispatches CreateWorkflow after session creation. */
  readonly autoCreate?: boolean;
  readonly payload?: WorkflowDispatchPayload;
};

export type DispatchResult = {
  readonly session: WorkflowSessionSnapshot;
  readonly entry: WorkflowHistoryEntry;
  readonly previousState: WorkflowState;
  readonly newState: WorkflowState;
};

/**
 * In-memory registry of workflow sessions.
 * UI layers (React/Zustand) may mirror snapshots via {@link subscribe}.
 */
export class WorkflowEngine {
  private readonly sessions = new Map<string, WorkflowSession>();
  private readonly listeners = new Set<WorkflowEngineListener>();
  private readonly clock: () => Date;

  constructor(options: CreateWorkflowEngineOptions = {}) {
    this.clock = options.clock ?? (() => new Date());
  }

  subscribe(listener: WorkflowEngineListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Start a workflow session in Idle (optionally auto-dispatch CreateWorkflow).
   */
  startWorkflow(input: StartWorkflowInput): WorkflowSessionSnapshot {
    this.assertActorMayMutate(input.actor, 'CreateWorkflow');

    const session = WorkflowSession.start({
      definition: input.definition,
      teacher: input.teacher,
      workflowId: input.workflowId,
      clock: this.clock,
    });

    if (this.sessions.has(session.getWorkflowId())) {
      throw new WorkflowEngineError(
        'DUPLICATE_WORKFLOW',
        `Workflow id ${session.getWorkflowId()} already exists.`,
      );
    }

    this.sessions.set(session.getWorkflowId(), session);

    if (input.autoCreate !== false) {
      return this.dispatch(session.getWorkflowId(), 'CreateWorkflow', input.actor, input.payload)
        .session;
    }

    const snap = session.getSnapshot();
    this.emit({ type: 'transition', session: snap });
    return snap;
  }

  /**
   * Apply an event to a workflow. Rejects illegal transitions and AI actors.
   */
  dispatch(
    workflowId: string,
    event: WorkflowEvent,
    actor: WorkflowActor,
    payload?: WorkflowDispatchPayload,
  ): DispatchResult {
    this.assertActorMayMutate(actor, event);

    const session = this.requireSession(workflowId);
    const previousState = session.getCurrentState();

    if (event === 'Restore') {
      throw new WorkflowEngineError(
        'USE_RESTORE_API',
        'Use engine.restore() or engine.rollback() for Restore transitions.',
        { currentState: previousState, event },
      );
    }

    const nextState = resolveTransition(previousState, event);
    if (!nextState) {
      const err = invalidTransitionError(previousState, event);
      this.emit({
        type: 'rejected',
        session: session.getSnapshot(),
        reason: err.message,
      });
      throw err;
    }

    const entry = session.applyTransition({
      event,
      nextState,
      actor,
      payload,
      clock: this.clock,
    });

    const snap = session.getSnapshot();
    this.emit({ type: 'transition', session: snap, entry });
    if (nextState === 'Completed') {
      this.emit({ type: 'completed', session: snap, entry });
    }
    return {
      session: snap,
      entry,
      previousState,
      newState: nextState,
    };
  }

  getCurrentState(workflowId: string): WorkflowState {
    return this.requireSession(workflowId).getCurrentState();
  }

  getSession(workflowId: string): WorkflowSessionSnapshot {
    return this.requireSession(workflowId).getSnapshot();
  }

  getAvailableActions(workflowId: string): readonly WorkflowEvent[] {
    const session = this.requireSession(workflowId);
    const state = session.getCurrentState();
    const actions = [...listAvailableEvents(state)];
    if (session.getSnapshot().historyCursor >= 0 && !isTerminalState(state)) {
      if (!actions.includes('Restore')) {
        // Surface restore as available when history exists (via rollback/restore APIs).
        actions.push('Restore');
      }
    }
    if (state === 'Cancelled' || state === 'Failed') {
      if (!actions.includes('Restore')) actions.push('Restore');
    }
    return Object.freeze(actions);
  }

  /**
   * Roll back one transition (append Restore → previous state).
   */
  rollback(
    workflowId: string,
    actor: WorkflowActor,
    metadata?: Readonly<Record<string, unknown>>,
  ): DispatchResult {
    this.assertActorMayMutate(actor, 'Restore');
    const session = this.requireSession(workflowId);
    const previousState = session.getCurrentState();
    if (isTerminalState(previousState) && previousState === 'Completed') {
      throw new WorkflowEngineError(
        'ROLLBACK_COMPLETED',
        'Completed workflows cannot be rolled back; start a new workflow.',
        { currentState: previousState, event: 'Restore' },
      );
    }
    const entry = session.rollback({ actor, clock: this.clock, metadata });
    const snap = session.getSnapshot();
    this.emit({ type: 'restored', session: snap, entry });
    return {
      session: snap,
      entry,
      previousState,
      newState: snap.state,
    };
  }

  /**
   * Restore to a historical entry index (recoverable workflows).
   */
  restore(
    workflowId: string,
    historyIndex: number,
    actor: WorkflowActor,
    metadata?: Readonly<Record<string, unknown>>,
  ): DispatchResult {
    this.assertActorMayMutate(actor, 'Restore');
    const session = this.requireSession(workflowId);
    const target = session.getSnapshot().history.entries[historyIndex];
    if (!target) {
      throw new WorkflowEngineError(
        'RESTORE_INVALID_INDEX',
        `No history entry at index ${historyIndex}.`,
      );
    }
    if (!isRecoverableState(target.newState) && target.newState !== 'Idle') {
      // Allow restore to Idle/Failed/Cancelled targets when explicitly in history.
    }
    const previousState = session.getCurrentState();
    const entry = session.restoreTo({
      historyIndex,
      actor,
      clock: this.clock,
      metadata,
    });
    const snap = session.getSnapshot();
    this.emit({ type: 'restored', session: snap, entry });
    return {
      session: snap,
      entry,
      previousState,
      newState: snap.state,
    };
  }

  /**
   * Teacher-confirmed completion shortcut when already Ready / Publishing.
   */
  complete(
    workflowId: string,
    actor: WorkflowActor,
    payload?: WorkflowDispatchPayload,
  ): DispatchResult {
    if (actor.role !== 'teacher' && actor.role !== 'system') {
      throw new WorkflowEngineError(
        'TEACHER_REQUIRED',
        'Only a teacher (or system acting after teacher approval) may complete a workflow.',
      );
    }
    const state = this.getCurrentState(workflowId);
    if (state === 'Publishing') {
      return this.dispatch(workflowId, 'Complete', actor, payload);
    }
    if (state === 'Ready') {
      return this.dispatch(workflowId, 'Complete', actor, payload);
    }
    throw invalidTransitionError(state, 'Complete');
  }

  listSessions(): readonly WorkflowSessionSnapshot[] {
    return [...this.sessions.values()].map((s) => s.getSnapshot());
  }

  /** Test / recovery seam — replace session snapshot (system only). */
  replaceSession(snapshot: WorkflowSessionSnapshot, actor: WorkflowActor): void {
    if (actor.role === 'ai') {
      throw new WorkflowEngineError(
        'AI_FORBIDDEN',
        'AI cannot replace workflow session state.',
      );
    }
    const existing = this.sessions.get(snapshot.workflowId);
    if (existing) {
      existing.replaceSnapshot(snapshot);
    } else {
      this.sessions.set(snapshot.workflowId, new WorkflowSession(snapshot));
    }
    this.emit({ type: 'restored', session: snapshot });
  }

  private requireSession(workflowId: string): WorkflowSession {
    const session = this.sessions.get(workflowId);
    if (!session) {
      throw new WorkflowEngineError(
        'WORKFLOW_NOT_FOUND',
        `Unknown workflow id: ${workflowId}`,
      );
    }
    return session;
  }

  /**
   * AI may never mutate workflow state.
   * System may dispatch automation completions (GenerationCompleted, etc.).
   * Teacher dispatches craft and final approval events.
   */
  private assertActorMayMutate(actor: WorkflowActor, event: WorkflowEvent): void {
    if (actor.role === 'ai') {
      throw new WorkflowEngineError(
        'AI_FORBIDDEN',
        `AI cannot dispatch workflow event "${event}". Teacher remains responsible for state.`,
        { event },
      );
    }
    if (!actor.id.trim()) {
      throw new WorkflowEngineError('ACTOR_REQUIRED', 'Actor id is required.');
    }
  }

  private emit(
    event: Parameters<WorkflowEngineListener>[0],
  ): void {
    for (const listener of this.listeners) {
      listener(event);
    }
  }
}

export function createWorkflowEngine(
  options?: CreateWorkflowEngineOptions,
): WorkflowEngine {
  return new WorkflowEngine(options);
}
