/**
 * Runtime Orchestrator types — coordination only, no educational business logic.
 */

export type EngineId =
  | 'workflow'
  | 'context'
  | 'prompt'
  | 'ai'
  | 'validation'
  | 'memory'
  | 'tools'
  | (string & {});

export type RuntimeEventType =
  | 'WorkflowStarted'
  | 'ContextLoaded'
  | 'PromptCompiled'
  | 'AICompleted'
  | 'ValidationPassed'
  | 'ValidationFailed'
  | 'RepairCompleted'
  | 'MemorySaved'
  | 'ArtifactPublished'
  | 'ExecutionCompleted'
  | 'ExecutionFailed'
  | 'StepStarted'
  | 'StepCompleted'
  | 'StepFailed'
  | (string & {});

export type PipelineStepKind =
  | 'sequential'
  | 'parallel'
  | 'conditional'
  | 'retry'
  | 'timeout';

export type RuntimeExecutionStatus =
  | 'running'
  | 'succeeded'
  | 'failed'
  | 'cancelled'
  | 'partial';

export type RuntimeRequest = {
  readonly requestId?: string;
  readonly workflowKind: string;
  readonly teacherId: string;
  readonly projectId: string;
  readonly locale?: string;
  readonly intent: string;
  readonly educationalContext: Readonly<Record<string, unknown>>;
  readonly metadata?: Readonly<Record<string, unknown>>;
  readonly pipelineId?: string;
  /** Cancellation signal for the whole run. */
  readonly signal?: AbortSignal;
};

export type RuntimeExecutionContext = {
  readonly executionId: string;
  readonly requestId: string;
  workflowId?: string;
  readonly teacherId: string;
  readonly projectId: string;
  readonly locale?: string;
  readonly startedAt: string;
  /** Accumulated intermediate results keyed by step id / engine id. */
  readonly bag: Record<string, unknown>;
  readonly warnings: string[];
  costsUsd: number;
  tokenUsage: number;
  readonly engineTimingsMs: Record<string, number>;
  cancelled: boolean;
};

export type EngineStepResult = {
  readonly ok: boolean;
  readonly output?: Readonly<Record<string, unknown>>;
  readonly error?: string;
  readonly retryable?: boolean;
  readonly costUsd?: number;
  readonly tokens?: number;
  readonly warnings?: readonly string[];
  /** Optional event to emit after the step. */
  readonly emit?: RuntimeEventType;
};

/**
 * Port every Core engine adapts to.
 * Runtime never imports concrete engine packages.
 */
export type RuntimeEnginePort = {
  readonly engineId: EngineId;
  readonly displayName: string;
  readonly version: string;
  execute(
    input: Readonly<Record<string, unknown>>,
    ctx: RuntimeExecutionContext,
  ): Promise<EngineStepResult>;
};

export type PipelineStep = {
  readonly stepId: string;
  readonly engineId: EngineId;
  readonly kind?: PipelineStepKind;
  /** Build engine input from execution context. */
  readonly inputFrom?: (ctx: RuntimeExecutionContext) => Readonly<Record<string, unknown>>;
  /** Skip when returns false (conditional execution). */
  readonly when?: (ctx: RuntimeExecutionContext) => boolean;
  readonly timeoutMs?: number;
  readonly retry?: {
    readonly maxAttempts: number;
    readonly baseDelayMs: number;
  };
  /** Parallel group id — steps with same group run together. */
  readonly parallelGroup?: string;
  /**
   * On failure:
   * - abort (default): stop pipeline
   * - continue: record warning and proceed
   * - rollback: restore bag snapshot taken before this step, then abort
   */
  readonly onFailure?: 'abort' | 'continue' | 'rollback';
};

export type PipelineDefinition = {
  readonly pipelineId: string;
  readonly displayName: string;
  readonly steps: readonly PipelineStep[];
};

export type RuntimeEvent = {
  readonly eventId: string;
  readonly type: RuntimeEventType;
  readonly timestamp: string;
  readonly executionId: string;
  readonly workflowId?: string;
  readonly engineId?: EngineId;
  readonly stepId?: string;
  readonly payload: Readonly<Record<string, unknown>>;
};

export type RuntimeObservability = {
  readonly executionId: string;
  readonly requestId: string;
  readonly workflowId?: string;
  readonly status: RuntimeExecutionStatus;
  readonly durationMs: number;
  readonly engineTimingsMs: Readonly<Record<string, number>>;
  readonly failures: readonly string[];
  readonly warnings: readonly string[];
  readonly costUsd: number;
  readonly tokenUsage: number;
};

export type RuntimeResult = {
  readonly executionId: string;
  readonly status: RuntimeExecutionStatus;
  readonly artifact?: Readonly<Record<string, unknown>>;
  readonly context: RuntimeExecutionContext;
  readonly observability: RuntimeObservability;
  readonly events: readonly RuntimeEvent[];
};

export type RuntimeEventListener = (event: RuntimeEvent) => void;
