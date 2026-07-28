/**
 * Tool & Capability Engine types.
 * Unified, provider-independent execution of external capabilities.
 */

export type ToolCategory =
  | 'ai-provider'
  | 'image-generation'
  | 'pdf-generation'
  | 'word-export'
  | 'powerpoint-export'
  | 'spreadsheet-export'
  | 'translation'
  | 'speech'
  | 'ocr'
  | 'search'
  | 'calendar'
  | 'cloud-storage'
  | 'email'
  | 'lms-integration'
  | 'printing'
  | (string & {});

export type ToolPermission =
  | 'read'
  | 'write'
  | 'generate'
  | 'export'
  | 'delete'
  | 'external-access'
  | 'sensitive';

export type ToolExecutionStatus =
  | 'succeeded'
  | 'failed'
  | 'denied'
  | 'timeout'
  | 'unavailable'
  | 'partial';

export type ToolRetryPolicy = {
  readonly maxAttempts: number;
  readonly baseDelayMs: number;
  readonly retryOn: readonly (
    | 'timeout'
    | 'network'
    | 'unavailable'
    | 'transient'
  )[];
};

export type JsonSchemaHint = {
  readonly schemaId: string;
  readonly requiredFields: readonly string[];
  readonly description?: string;
};

export type ToolDescriptor = {
  readonly toolId: string;
  readonly toolName: string;
  readonly category: ToolCategory;
  readonly version: string;
  readonly description: string;
  readonly requiredPermissions: readonly ToolPermission[];
  readonly requiredContext: readonly string[];
  readonly supportedActions: readonly string[];
  readonly inputSchema: JsonSchemaHint;
  readonly outputSchema: JsonSchemaHint;
  readonly timeoutMs: number;
  readonly retryPolicy: ToolRetryPolicy;
  readonly metadata: Readonly<Record<string, unknown>>;
};

export type EducationalToolContext = {
  readonly subject?: string;
  readonly grade?: string;
  readonly topic?: string;
  readonly curriculumRef?: string;
  readonly locale?: string;
  readonly extra?: Readonly<Record<string, unknown>>;
};

export type ToolContext = {
  readonly workflowId?: string;
  readonly teacherId: string;
  readonly projectId?: string;
  readonly sessionId?: string;
  readonly permissions: readonly ToolPermission[];
  readonly locale?: string;
  readonly language?: string;
  readonly educationalContext?: EducationalToolContext;
  readonly metadata?: Readonly<Record<string, unknown>>;
};

export type ToolInvokeRequest = {
  readonly toolId: string;
  readonly action: string;
  readonly input: Readonly<Record<string, unknown>>;
  readonly context: ToolContext;
  /** Optional override — defaults to descriptor timeout. */
  readonly timeoutMs?: number;
};

export type ToolResult = {
  readonly executionId: string;
  readonly toolId: string;
  readonly action: string;
  readonly status: ToolExecutionStatus;
  readonly durationMs: number;
  readonly output: Readonly<Record<string, unknown>>;
  readonly logs: readonly string[];
  readonly warnings: readonly string[];
  readonly errors: readonly string[];
  readonly costUsd: number;
  readonly attempts: number;
  readonly metadata: Readonly<Record<string, unknown>>;
};

export type ToolHealth = {
  readonly healthy: boolean;
  readonly latencyMs?: number;
  readonly message?: string;
};

/**
 * Strategy interface every capability implements.
 * Application code never calls vendors — only ToolEngine.execute.
 */
export type ToolHandler = {
  readonly descriptor: ToolDescriptor;
  execute(input: {
    action: string;
    input: Readonly<Record<string, unknown>>;
    context: ToolContext;
    signal?: AbortSignal;
  }): Promise<{
    output: Readonly<Record<string, unknown>>;
    logs?: readonly string[];
    warnings?: readonly string[];
    costUsd?: number;
    partial?: boolean;
  }>;
  healthCheck?(): Promise<ToolHealth>;
};

export type ToolExecutionLog = {
  readonly entryId: string;
  readonly timestamp: string;
  readonly executionId: string;
  readonly toolId: string;
  readonly action: string;
  readonly teacherId: string;
  readonly workflowId?: string;
  readonly status: ToolExecutionStatus;
  readonly durationMs: number;
  readonly costUsd: number;
  readonly attempts: number;
  readonly error?: string;
};

export type ToolMonitorSnapshot = {
  readonly totalExecutions: number;
  readonly successCount: number;
  readonly failureCount: number;
  readonly deniedCount: number;
  readonly totalDurationMs: number;
  readonly totalCostUsd: number;
  readonly byTool: Readonly<Record<string, { ok: number; fail: number; avgMs: number }>>;
};

export type SandboxPolicy = {
  readonly allowNetwork: boolean;
  readonly allowFilesystem: boolean;
  readonly allowCredentials: boolean;
  readonly maxMemoryHintMb?: number;
};

export const DEFAULT_RETRY_POLICY: ToolRetryPolicy = {
  maxAttempts: 2,
  baseDelayMs: 25,
  retryOn: ['timeout', 'network', 'unavailable', 'transient'],
};
