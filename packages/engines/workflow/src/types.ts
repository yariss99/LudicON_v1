/**
 * Workflow Engine domain types.
 * Generic — no lesson/quiz/worksheet-specific fields in the transition model.
 */

/** Canonical workflow lifecycle states (single vocabulary for all workflows). */
export type WorkflowState =
  | 'Idle'
  | 'Initializing'
  | 'LoadingContext'
  | 'Planning'
  | 'Generating'
  | 'Validating'
  | 'Editing'
  | 'Reviewing'
  | 'Ready'
  | 'Publishing'
  | 'Completed'
  | 'Failed'
  | 'Cancelled';

/** Canonical workflow events (inputs to the state machine). */
export type WorkflowEvent =
  | 'CreateWorkflow'
  | 'LoadContext'
  | 'PlanningCompleted'
  | 'Generate'
  | 'GenerationCompleted'
  | 'ValidationPassed'
  | 'ValidationFailed'
  | 'Edit'
  | 'SaveDraft'
  | 'Publish'
  | 'Retry'
  | 'Cancel'
  | 'Restore'
  | 'Complete';

/**
 * Who initiates a dispatch.
 * AI never mutates workflow state directly — only teacher or system adapters may dispatch.
 */
export type WorkflowActorRole = 'teacher' | 'system' | 'ai';

export type WorkflowActor = {
  readonly role: WorkflowActorRole;
  /** Stable user / service identity (teacher id, system component id, etc.). */
  readonly id: string;
};

/** Opaque workflow kind — registry key only; engine logic does not branch on it. */
export type WorkflowKind = string;

export type WorkflowDefinition = {
  readonly kind: WorkflowKind;
  readonly displayName: string;
  readonly version: string;
};

export type TeacherContext = {
  readonly teacherId: string;
  readonly displayName?: string;
  readonly locale?: string;
  readonly schoolId?: string;
};

export type PendingTask = {
  readonly taskId: string;
  readonly label: string;
  readonly createdAt: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
};

/**
 * Session memory for a running workflow.
 * Holds references and temporary data — not transition rules.
 */
export type WorkflowContext = {
  readonly teacher: TeacherContext;
  readonly projectId?: string;
  readonly resourceId?: string;
  readonly lessonId?: string;
  /** Assisting-intelligence context bag (proposals only — never authority). */
  readonly aiContext: Readonly<Record<string, unknown>>;
  readonly pendingTasks: readonly PendingTask[];
  /** Ephemeral scratch pad; cleared on Complete / Cancel unless restored. */
  readonly temporaryMemory: Readonly<Record<string, unknown>>;
};

export type WorkflowTransition = {
  readonly from: WorkflowState;
  readonly event: WorkflowEvent;
  readonly to: WorkflowState;
};

export type WorkflowHistoryEntry = {
  readonly entryId: string;
  readonly timestamp: string;
  readonly previousState: WorkflowState;
  readonly newState: WorkflowState;
  readonly event: WorkflowEvent;
  readonly actorId: string;
  readonly actorRole: WorkflowActorRole;
  readonly workflowId: string;
  readonly metadata: Readonly<Record<string, unknown>>;
};

export type WorkflowHistory = {
  readonly workflowId: string;
  readonly entries: readonly WorkflowHistoryEntry[];
};

export type WorkflowSessionSnapshot = {
  readonly workflowId: string;
  readonly kind: WorkflowKind;
  readonly definitionVersion: string;
  readonly state: WorkflowState;
  readonly context: WorkflowContext;
  readonly history: WorkflowHistory;
  readonly createdAt: string;
  readonly updatedAt: string;
  /** Index into history for restore/rollback cursor (last applied entry). */
  readonly historyCursor: number;
};

/** Payload carried with a dispatch (never replaces actor authority). */
export type WorkflowDispatchPayload = {
  readonly metadata?: Readonly<Record<string, unknown>>;
  /** Partial context merge applied after a successful transition. */
  readonly contextPatch?: Partial<
    Omit<WorkflowContext, 'teacher' | 'pendingTasks' | 'aiContext' | 'temporaryMemory'>
  > & {
    readonly teacher?: Partial<TeacherContext>;
    readonly aiContext?: Readonly<Record<string, unknown>>;
    readonly temporaryMemory?: Readonly<Record<string, unknown>>;
    readonly pendingTasks?: readonly PendingTask[];
  };
};

export type WorkflowEngineListener = (event: {
  readonly type: 'transition' | 'rejected' | 'restored' | 'completed';
  readonly session: WorkflowSessionSnapshot;
  readonly entry?: WorkflowHistoryEntry;
  readonly reason?: string;
}) => void;

export const WORKFLOW_STATES: readonly WorkflowState[] = [
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

export const WORKFLOW_EVENTS: readonly WorkflowEvent[] = [
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
