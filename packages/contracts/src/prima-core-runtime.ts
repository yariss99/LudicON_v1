/**
 * PRIMA Core shared runtime contracts — single source of truth (AFPRR H4).
 * Schema version: 1.0.0
 *
 * Engines MUST import these types instead of defining local duplicates.
 * No educational business logic.
 */

export const PRIMA_CORE_CONTRACT_SCHEMA_VERSION = '1.0.0' as const;

/** Immutable educational facts shared across Core engines. */
export type CoreEducationalContext = {
  readonly locale?: string;
  readonly subject?: string;
  readonly grade?: string;
  readonly topic?: string;
  readonly curriculumRef?: string;
  readonly learningObjectives?: readonly string[];
  readonly competencies?: readonly string[];
  readonly constraints?: readonly string[];
  readonly teacherNotes?: string;
  readonly extra?: Readonly<Record<string, unknown>>;
};

export type ArtifactMetadata = {
  readonly artifactId: string;
  readonly artifactType: string;
  readonly version: string;
  readonly workflowId?: string;
  readonly teacherId?: string;
  readonly projectId?: string;
  readonly locale?: string;
  readonly createdAt?: string;
  readonly schemaVersion?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
};

export type WorkflowContext = {
  readonly schemaVersion: typeof PRIMA_CORE_CONTRACT_SCHEMA_VERSION;
  readonly workflowId: string;
  readonly workflowKind: string;
  readonly teacherId: string;
  readonly projectId: string;
  readonly state?: string;
  readonly educationalContext: CoreEducationalContext;
  readonly metadata?: Readonly<Record<string, unknown>>;
};

/**
 * Cross-cutting Core execution identity (distinct from EOS Kernel ExecutionContext
 * in `./context.ts`).
 */
export type CoreExecutionContext = {
  readonly schemaVersion: typeof PRIMA_CORE_CONTRACT_SCHEMA_VERSION;
  readonly executionId: string;
  readonly requestId: string;
  readonly workflowId?: string;
  readonly teacherId: string;
  readonly projectId: string;
  readonly correlationId: string;
  readonly startedAt: string;
  readonly locale?: string;
};

/** AFPRR checklist alias — prefer CoreExecutionContext to avoid clash with EOS ExecutionContext. */
export type RuntimeExecutionContextContract = CoreExecutionContext;

export type ContextSnapshot = {
  readonly schemaVersion: typeof PRIMA_CORE_CONTRACT_SCHEMA_VERSION;
  readonly snapshotId: string;
  readonly sessionId?: string;
  readonly teacherId: string;
  readonly projectId: string;
  readonly workflowId?: string;
  readonly educationalContext: CoreEducationalContext;
  readonly resolvedAt: string;
  readonly domains?: Readonly<Record<string, unknown>>;
  readonly metadata?: Readonly<Record<string, unknown>>;
};

/** Prompt Abstract Syntax / compiled package (P-C-005). */
export type PromptAstNode =
  | {
      readonly kind: 'system';
      readonly text: string;
    }
  | {
      readonly kind: 'user';
      readonly text: string;
    }
  | {
      readonly kind: 'section';
      readonly title: string;
      readonly children: readonly PromptAstNode[];
    }
  | {
      readonly kind: 'variable';
      readonly name: string;
      readonly value: string;
    };

export type PromptPackage = {
  readonly schemaVersion: typeof PRIMA_CORE_CONTRACT_SCHEMA_VERSION;
  readonly packageId: string;
  readonly system: string;
  readonly user: string;
  readonly requestType: string;
  readonly schemaId: string;
  readonly locale?: string;
  readonly ast: readonly PromptAstNode[];
  readonly educationalContext: CoreEducationalContext;
  readonly compiledAt: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
};

export type PromptResult = {
  readonly schemaVersion: typeof PRIMA_CORE_CONTRACT_SCHEMA_VERSION;
  readonly resultId: string;
  readonly packageId: string;
  readonly promptPackage: PromptPackage;
  readonly ok: boolean;
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
};

export type CoreValidationSeverity = 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';

export type ValidationIssue = {
  readonly code: string;
  readonly message: string;
  readonly path?: string;
  readonly severity: CoreValidationSeverity | 'error' | 'warning';
  readonly validatorId?: string;
};

export type ValidationSummary = {
  readonly schemaVersion: typeof PRIMA_CORE_CONTRACT_SCHEMA_VERSION;
  readonly overallStatus:
    | 'approved'
    | 'approved_with_warnings'
    | 'rejected'
    | 'repaired';
  readonly overallScore: number;
  readonly criticalCount: number;
  readonly errorCount: number;
  readonly warningCount: number;
  readonly readyToExport: boolean;
};

/** Canonical artifact validation gate report (P-C-006). */
export type ValidationReport = {
  readonly schemaVersion: typeof PRIMA_CORE_CONTRACT_SCHEMA_VERSION;
  readonly reportId: string;
  readonly artifactId: string;
  readonly artifactType: string;
  readonly profileId: string;
  readonly summary: ValidationSummary;
  readonly overallScore: number;
  readonly overallStatus: ValidationSummary['overallStatus'];
  readonly issues: readonly ValidationIssue[];
  readonly executionTimeMs: number;
  readonly timestamp: string;
  readonly repairedPayload?: Readonly<Record<string, unknown>>;
  readonly metadata?: Readonly<Record<string, unknown>>;
};

/** Lightweight AI output schema check — NOT the publication ValidationReport. */
export type AiOutputValidationReport = {
  readonly schemaVersion: typeof PRIMA_CORE_CONTRACT_SCHEMA_VERSION;
  readonly ok: boolean;
  readonly issues: readonly {
    readonly code: string;
    readonly message: string;
    readonly path?: string;
    readonly severity: 'error' | 'warning';
  }[];
  readonly repaired: boolean;
};

export type MemorySnapshot = {
  readonly schemaVersion: typeof PRIMA_CORE_CONTRACT_SCHEMA_VERSION;
  readonly snapshotId: string;
  readonly label: string;
  readonly createdAt: string;
  readonly createdBy: string;
  readonly memoryIds: readonly string[];
  readonly recordCount: number;
  readonly metadata?: Readonly<Record<string, unknown>>;
};

export type ToolExecutionResult = {
  readonly schemaVersion: typeof PRIMA_CORE_CONTRACT_SCHEMA_VERSION;
  readonly executionId: string;
  readonly toolId: string;
  readonly action: string;
  readonly status:
    | 'succeeded'
    | 'failed'
    | 'denied'
    | 'timeout'
    | 'unavailable'
    | 'partial';
  readonly durationMs: number;
  readonly output: Readonly<Record<string, unknown>>;
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
  readonly costUsd: number;
};

export type RuntimeExecution = {
  readonly schemaVersion: typeof PRIMA_CORE_CONTRACT_SCHEMA_VERSION;
  readonly executionId: string;
  readonly requestId: string;
  readonly status: 'running' | 'succeeded' | 'failed' | 'cancelled' | 'partial';
  readonly workflowId?: string;
  readonly artifact?: Readonly<Record<string, unknown>>;
  readonly promptPackageId?: string;
  readonly validationReportId?: string;
  readonly memoryRef?: string;
  readonly durationMs: number;
  readonly costUsd: number;
  readonly tokenUsage: number;
  readonly warnings: readonly string[];
  readonly failures: readonly string[];
};

export type CoreContractName =
  | 'WorkflowContext'
  | 'CoreExecutionContext'
  | 'ExecutionContext'
  | 'PromptPackage'
  | 'PromptResult'
  | 'ValidationReport'
  | 'ValidationSummary'
  | 'MemorySnapshot'
  | 'RuntimeExecution'
  | 'ToolExecutionResult'
  | 'ContextSnapshot'
  | 'ArtifactMetadata'
  | 'AiOutputValidationReport';

export const CORE_CONTRACT_NAMES: readonly CoreContractName[] = [
  'WorkflowContext',
  'CoreExecutionContext',
  'ExecutionContext',
  'PromptPackage',
  'PromptResult',
  'ValidationReport',
  'ValidationSummary',
  'MemorySnapshot',
  'RuntimeExecution',
  'ToolExecutionResult',
  'ContextSnapshot',
  'ArtifactMetadata',
  'AiOutputValidationReport',
] as const;
