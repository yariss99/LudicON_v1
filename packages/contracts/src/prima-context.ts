/**
 * Canonical PRIMA Context Model (ES-007) — typed form.
 * No Context Engine behaviour. Snapshots are immutable.
 */

import type { UserContext } from './event-envelope.js';

export type ContextSchemaVersion = string;
export type ContextSufficiency = 'Sparse' | 'Partial' | 'Sufficient';

export type ContextDimensionId =
  | 'identity'
  | 'teacher'
  | 'project'
  | 'educational'
  | 'curriculum'
  | 'school'
  | 'class'
  | 'student'
  | 'parent'
  | 'resource'
  | 'blueprint'
  | 'strategy'
  | 'memory'
  | 'conversation'
  | 'execution'
  | 'ai'
  | 'security'
  | 'localization'
  | 'plugin'
  | 'correlation'
  | 'workingSummary';

export type SecurityClassification =
  | 'public'
  | 'internal'
  | 'confidential'
  | 'restricted';

export type ContextPersistence = 'durable' | 'session' | 'transient';

export type DimensionPresence = 'present' | 'absent' | 'unknown' | 'forbidden';

export interface ContextDimensionMeta {
  readonly id: ContextDimensionId;
  readonly presence: DimensionPresence;
  readonly source?: string;
  readonly sufficiency?: ContextSufficiency;
  readonly classification: SecurityClassification;
  readonly persistence: ContextPersistence;
  readonly capturedAt?: string;
}

export interface IdentityContextData {
  readonly subjectId: string;
  readonly actorType: 'teacher' | 'admin' | 'system' | 'student' | 'parent';
}

export interface TeacherContextData {
  readonly teacherId: string;
  readonly displayName?: string;
  readonly preferenceRefs?: readonly string[];
}

export interface ProjectContextData {
  readonly projectId: string;
  readonly title?: string;
  readonly entryPath?: 'continua' | 'new' | 'reuse';
}

export interface EducationalContextData {
  readonly learningGoals?: readonly string[];
  readonly constraints?: readonly string[];
  readonly successNotion?: string;
  readonly learnersDescribed?: string;
}

export interface CurriculumContextData {
  readonly knowledgePackId?: string;
  readonly knowledgePackVersion?: string;
  readonly knowledgePackageRef?: string;
  readonly subject?: string;
  readonly gradeBand?: string;
  readonly provenanceAttached: boolean;
}

export interface SchoolContextData {
  readonly schoolId?: string;
  readonly tenantId?: string;
}

export interface ClassContextData {
  readonly classLabel?: string;
  readonly levelBand?: string;
  readonly differentiationNotes?: string;
  /** Never individual student ids in MVP */
  readonly aggregateOnly: true;
}

/** Future — must remain absent in MVP snapshots */
export interface StudentContextData {
  readonly studentId: string;
}

/** Future — must remain absent in MVP snapshots */
export interface ParentContextData {
  readonly parentId: string;
}

export interface ResourceContextData {
  readonly generationPackageId?: string;
  readonly resourceIds?: readonly string[];
}

export interface BlueprintContextData {
  readonly blueprintId?: string;
  readonly blueprintVersionId?: string;
  readonly approvalState?: 'none' | 'pending' | 'approved' | 'superseded';
}

export interface StrategyContextData {
  readonly strategyId?: string;
  readonly state?: 'proposed' | 'confirmed' | 'superseded';
}

export interface MemoryContextData {
  readonly profileId?: string;
  readonly acceptedItemIds?: readonly string[];
  readonly advisoryOnly: true;
}

export interface ConversationContextData {
  readonly sessionId?: string;
  readonly pipelinePosition?: string;
}

export interface ExecutionContextData {
  readonly kernelId?: string;
  readonly startedAt: string;
  readonly deadlineAt?: string;
}

export interface AiContextData {
  readonly workerSlot?: string;
  readonly policyCaps?: readonly string[];
}

export interface SecurityContextData {
  readonly tenantId?: string;
  readonly roles?: readonly string[];
  readonly permissions?: readonly string[];
}

export interface LocalizationContextData {
  readonly uiLocale?: string;
  readonly contentLanguage?: string;
  readonly region?: string;
}

export interface PluginContextData {
  readonly admittedPluginIds?: readonly string[];
}

export interface CorrelationContextData {
  readonly correlationId: string;
  readonly causationId?: string;
  readonly commandId?: string;
  readonly traceId?: string;
}

export interface WorkingSummaryContextData {
  readonly sufficiency: ContextSufficiency;
  readonly unknowns?: readonly string[];
}

export interface ContextDimension<T = unknown> {
  readonly meta: ContextDimensionMeta;
  readonly data?: T;
}

/**
 * Immutable PRIMA Context Object — single source of truth for one execution.
 */
export interface PrimaContext {
  readonly contextId: string;
  readonly schemaVersion: ContextSchemaVersion;
  readonly contextVersion: number;
  readonly createdAt: string;
  readonly correlationId: string;
  readonly causationId?: string;
  readonly sufficiency: ContextSufficiency;
  readonly identity: ContextDimension<IdentityContextData>;
  readonly teacher?: ContextDimension<TeacherContextData>;
  readonly project?: ContextDimension<ProjectContextData>;
  readonly educational?: ContextDimension<EducationalContextData>;
  readonly curriculum?: ContextDimension<CurriculumContextData>;
  readonly school?: ContextDimension<SchoolContextData>;
  readonly class?: ContextDimension<ClassContextData>;
  /** MVP: must be absent or presence=forbidden */
  readonly student?: ContextDimension<StudentContextData>;
  /** MVP: must be absent or presence=forbidden */
  readonly parent?: ContextDimension<ParentContextData>;
  readonly resource?: ContextDimension<ResourceContextData>;
  readonly blueprint?: ContextDimension<BlueprintContextData>;
  readonly strategy?: ContextDimension<StrategyContextData>;
  readonly memory?: ContextDimension<MemoryContextData>;
  readonly conversation?: ContextDimension<ConversationContextData>;
  readonly execution?: ContextDimension<ExecutionContextData>;
  readonly ai?: ContextDimension<AiContextData>;
  readonly security?: ContextDimension<SecurityContextData>;
  readonly localization?: ContextDimension<LocalizationContextData>;
  readonly plugin?: ContextDimension<PluginContextData>;
  readonly correlation: ContextDimension<CorrelationContextData>;
  readonly workingSummary?: ContextDimension<WorkingSummaryContextData>;
  readonly provenance: readonly ContextProvenanceEntry[];
  /** Optional bridge to legacy UserContext shape */
  readonly userBridge?: UserContext;
}

export interface ContextProvenanceEntry {
  readonly dimensionId: ContextDimensionId;
  readonly contributor: string;
  readonly at: string;
  readonly note?: string;
}

export interface ContextValidationIssue {
  readonly code: string;
  readonly message: string;
  readonly dimensionId?: ContextDimensionId;
  readonly severity: 'error' | 'warning';
}

export interface ContextValidationResult {
  readonly ok: boolean;
  readonly issues: readonly ContextValidationIssue[];
}

/** MVP constitutional rules — pure validation, no I/O. */
export function validatePrimaContextMvp(ctx: PrimaContext): ContextValidationResult {
  const issues: ContextValidationIssue[] = [];

  if (!ctx.contextId) {
    issues.push({
      code: 'CTX_ID_REQUIRED',
      message: 'contextId is required',
      severity: 'error',
    });
  }
  if (!ctx.correlationId) {
    issues.push({
      code: 'CTX_CORR_REQUIRED',
      message: 'correlationId is required',
      severity: 'error',
    });
  }
  if (ctx.identity.meta.presence !== 'present' || !ctx.identity.data?.subjectId) {
    issues.push({
      code: 'CTX_IDENTITY_REQUIRED',
      message: 'Identity Context must be present',
      dimensionId: 'identity',
      severity: 'error',
    });
  }
  if (ctx.student && ctx.student.meta.presence === 'present') {
    issues.push({
      code: 'CTX_STUDENT_FORBIDDEN',
      message: 'Student Context is forbidden in MVP',
      dimensionId: 'student',
      severity: 'error',
    });
  }
  if (ctx.parent && ctx.parent.meta.presence === 'present') {
    issues.push({
      code: 'CTX_PARENT_FORBIDDEN',
      message: 'Parent Context is forbidden in MVP',
      dimensionId: 'parent',
      severity: 'error',
    });
  }
  if (ctx.class?.data && ctx.class.data.aggregateOnly !== true) {
    issues.push({
      code: 'CTX_CLASS_AGGREGATE',
      message: 'Class Context must be aggregate-only',
      dimensionId: 'class',
      severity: 'error',
    });
  }
  if (ctx.memory?.data && ctx.memory.data.advisoryOnly !== true) {
    issues.push({
      code: 'CTX_MEMORY_ADVISORY',
      message: 'Memory Context must be advisoryOnly',
      dimensionId: 'memory',
      severity: 'error',
    });
  }
  if (ctx.curriculum?.data && ctx.curriculum.data.provenanceAttached !== true) {
    issues.push({
      code: 'CTX_CURRICULUM_PROVENANCE',
      message: 'Curriculum Context requires provenanceAttached',
      dimensionId: 'curriculum',
      severity: 'warning',
    });
  }

  return { ok: issues.every((i) => i.severity !== 'error'), issues };
}

export const PRIMA_CONTEXT_SCHEMA_VERSION = '1.0.0';
