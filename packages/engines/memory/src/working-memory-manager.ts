import { uid } from './ids.js';
import type { WorkingMemoryState } from './types.js';

/**
 * WorkingMemoryManager — temporary session context; cleared when session ends.
 * Never persists temporary reasoning into long-term memory.
 */
export class WorkingMemoryManager {
  private readonly sessions = new Map<string, WorkingMemoryState>();

  start(teacherId: string, sessionId?: string): WorkingMemoryState {
    const now = new Date().toISOString();
    const state: WorkingMemoryState = {
      sessionId: sessionId ?? uid('sess'),
      teacherId,
      openAssetIds: [],
      recentDecisions: [],
      unsavedChanges: false,
      startedAt: now,
      updatedAt: now,
    };
    this.sessions.set(state.sessionId, state);
    return structuredClone(state);
  }

  get(sessionId: string): WorkingMemoryState | undefined {
    const state = this.sessions.get(sessionId);
    return state ? structuredClone(state) : undefined;
  }

  update(
    sessionId: string,
    patch: Partial<
      Pick<
        WorkingMemoryState,
        | 'currentBlueprintId'
        | 'conversationState'
        | 'openAssetIds'
        | 'unsavedChanges'
      >
    >,
  ): WorkingMemoryState | { error: string } {
    const current = this.sessions.get(sessionId);
    if (!current) return { error: 'Working session not found' };
    const next: WorkingMemoryState = {
      ...current,
      ...patch,
      conversationState: patch.conversationState
        ? { ...current.conversationState, ...patch.conversationState }
        : current.conversationState,
      updatedAt: new Date().toISOString(),
    };
    this.sessions.set(sessionId, next);
    return structuredClone(next);
  }

  pushDecision(
    sessionId: string,
    summary: string,
  ): WorkingMemoryState | { error: string } {
    const current = this.sessions.get(sessionId);
    if (!current) return { error: 'Working session not found' };
    const next: WorkingMemoryState = {
      ...current,
      recentDecisions: [
        {
          id: uid('dec'),
          summary,
          at: new Date().toISOString(),
        },
        ...current.recentDecisions,
      ].slice(0, 20),
      updatedAt: new Date().toISOString(),
    };
    this.sessions.set(sessionId, next);
    return structuredClone(next);
  }

  /** Clears working memory when the session ends */
  end(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }

  activeForTeacher(teacherId: string): WorkingMemoryState[] {
    return [...this.sessions.values()]
      .filter((s) => s.teacherId === teacherId)
      .map((s) => structuredClone(s));
  }
}
