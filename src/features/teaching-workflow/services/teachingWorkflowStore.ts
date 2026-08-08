import { WORKFLOW_STORAGE_KEY, type FlowStepKind } from "../constants";

export type TeachingWorkflowState = {
  /** Last focused project. */
  projectId: string | null;
  /** Last resource kind the teacher worked on. */
  currentKind: FlowStepKind | null;
  /** Last resource id (studio document). */
  currentResourceId: string | null;
  /** Steps the teacher marked / we inferred as visited. */
  completedKinds: FlowStepKind[];
  /** Dismissed "what's next" card ids for this session scope. */
  dismissedNextIds: string[];
  updatedAt: string;
};

const empty = (): TeachingWorkflowState => ({
  projectId: null,
  currentKind: null,
  currentResourceId: null,
  completedKinds: [],
  dismissedNextIds: [],
  updatedAt: new Date().toISOString(),
});

function read(): TeachingWorkflowState {
  try {
    const raw = localStorage.getItem(WORKFLOW_STORAGE_KEY);
    if (!raw) return empty();
    const parsed = JSON.parse(raw) as TeachingWorkflowState;
    return {
      ...empty(),
      ...parsed,
      completedKinds: Array.isArray(parsed.completedKinds)
        ? parsed.completedKinds
        : [],
      dismissedNextIds: Array.isArray(parsed.dismissedNextIds)
        ? parsed.dismissedNextIds
        : [],
    };
  } catch {
    return empty();
  }
}

function write(state: TeachingWorkflowState) {
  localStorage.setItem(WORKFLOW_STORAGE_KEY, JSON.stringify(state));
}

export const teachingWorkflowStore = {
  load(): TeachingWorkflowState {
    return read();
  },

  touch(input: {
    projectId: string;
    kind: FlowStepKind;
    resourceId: string;
    markCompleted?: boolean;
  }): TeachingWorkflowState {
    const prev = read();
    const completed = new Set(prev.completedKinds);
    if (input.markCompleted !== false) completed.add(input.kind);
    const next: TeachingWorkflowState = {
      projectId: input.projectId,
      currentKind: input.kind,
      currentResourceId: input.resourceId,
      completedKinds: [...completed],
      dismissedNextIds: prev.dismissedNextIds,
      updatedAt: new Date().toISOString(),
    };
    write(next);
    return next;
  },

  dismissNext(id: string): TeachingWorkflowState {
    const prev = read();
    const dismissedNextIds = prev.dismissedNextIds.includes(id)
      ? prev.dismissedNextIds
      : [...prev.dismissedNextIds, id];
    const next = {
      ...prev,
      dismissedNextIds,
      updatedAt: new Date().toISOString(),
    };
    write(next);
    return next;
  },

  syncCompletedFromInventory(
    projectId: string,
    present: FlowStepKind[],
  ): TeachingWorkflowState {
    const prev = read();
    const completed = new Set([...prev.completedKinds, ...present]);
    const next: TeachingWorkflowState = {
      ...prev,
      projectId,
      completedKinds: [...completed],
      updatedAt: new Date().toISOString(),
    };
    write(next);
    return next;
  },
};
