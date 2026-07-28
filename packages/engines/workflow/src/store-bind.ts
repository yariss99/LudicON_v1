/**
 * Optional mirror for UI stores (Zustand / React).
 * The engine remains the source of truth; this helper only projects snapshots.
 *
 * No Zustand dependency is required — bring your own store and call bindWorkflowStore.
 */

import type { WorkflowEngine } from './workflow-engine.js';
import type { WorkflowSessionSnapshot } from './types.js';

export type WorkflowStoreSlice = {
  sessionsById: Record<string, WorkflowSessionSnapshot>;
  upsertSession: (session: WorkflowSessionSnapshot) => void;
  removeSession: (workflowId: string) => void;
};

/**
 * Subscribe a store-like object to engine transitions.
 * Returns an unsubscribe function.
 */
export function bindWorkflowStore(
  engine: WorkflowEngine,
  store: WorkflowStoreSlice,
): () => void {
  return engine.subscribe((event) => {
    if (event.type === 'rejected') return;
    store.upsertSession(event.session);
  });
}

/** Pure helper to build an initial empty slice (for Zustand create() users). */
export function createEmptyWorkflowStoreSlice(
  set: (partial: Partial<WorkflowStoreSlice>) => void,
  get: () => WorkflowStoreSlice,
): WorkflowStoreSlice {
  return {
    sessionsById: {},
    upsertSession: (session) => {
      set({
        sessionsById: {
          ...get().sessionsById,
          [session.workflowId]: session,
        },
      });
    },
    removeSession: (workflowId) => {
      const next = { ...get().sessionsById };
      delete next[workflowId];
      set({ sessionsById: next });
    },
  };
}
