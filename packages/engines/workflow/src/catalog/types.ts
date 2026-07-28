/**
 * Workflow Catalog types — product definitions executed by @prima/engine-workflow.
 * Transition legality remains in the engine; this layer describes purpose, phases, and contracts.
 */

import type {
  WorkflowDefinition,
  WorkflowEvent,
  WorkflowKind,
  WorkflowState,
} from '../types.js';

/** Stable catalog identifier (equals WorkflowDefinition.kind). */
export type WorkflowId = WorkflowKind;

export type WorkflowPermission =
  | 'workflow:start'
  | 'workflow:edit'
  | 'workflow:generate'
  | 'workflow:review'
  | 'workflow:publish'
  | 'workflow:export'
  | 'workflow:duplicate'
  | 'project:read'
  | 'project:write'
  | 'resource:read'
  | 'resource:write'
  | 'curriculum:read';

export type ProducedObjectType =
  | 'Lesson'
  | 'Worksheet'
  | 'Assessment'
  | 'Quiz'
  | 'Story'
  | 'Presentation'
  | 'ImagePrompt'
  | 'AdaptedLesson'
  | 'TranslatedResource'
  | 'Summary'
  | 'ReviewReport'
  | 'PublishedResource'
  | 'ProjectCopy'
  | 'ExportPackage'
  | 'DraftResource';

/** Pedagogical / product phase — maps onto engine states without forking the machine. */
export type WorkflowPhase = {
  readonly phaseId: string;
  readonly title: string;
  readonly description: string;
  /** Engine state while this phase is the primary teacher job. */
  readonly engineState: WorkflowState;
  /** Event that typically enters this phase (from prior phase). */
  readonly enterEvent?: WorkflowEvent;
  /** Context keys that must be present before leaving this phase. */
  readonly requiredContextKeys: readonly string[];
  readonly actor: 'teacher' | 'system' | 'either';
};

export type WorkflowValidationRule = {
  readonly ruleId: string;
  readonly description: string;
  /** Engine state where the rule is evaluated. */
  readonly appliesAt: WorkflowState | 'any';
  readonly severity: 'block' | 'warn';
};

export type WorkflowRecoveryStrategy = {
  readonly onFailed: 'Retry→Planning' | 'Retry→Generate' | 'Restore' | 'Cancel';
  readonly onCancelled: 'Restore' | 'StartNew';
  readonly onValidationFailed: 'Edit' | 'Generate' | 'Cancel';
  readonly notes: string;
};

export type WorkflowContextRequirement = {
  readonly key: string;
  readonly required: boolean;
  readonly description: string;
};

/**
 * Full catalog entry. Compatible with WorkflowEngine via {@link toEngineDefinition}.
 */
export type CatalogWorkflow = WorkflowDefinition & {
  readonly id: WorkflowId;
  readonly purpose: string;
  readonly entryConditions: readonly string[];
  readonly requiredContext: readonly WorkflowContextRequirement[];
  readonly requiredPermissions: readonly WorkflowPermission[];
  readonly initialState: WorkflowState;
  readonly allowedStates: readonly WorkflowState[];
  readonly allowedEvents: readonly WorkflowEvent[];
  /** Happy-path event sequence from Idle to Completed (engine events only). */
  readonly happyPathEvents: readonly WorkflowEvent[];
  readonly phases: readonly WorkflowPhase[];
  readonly validationRules: readonly WorkflowValidationRule[];
  readonly failureStates: readonly WorkflowState[];
  readonly recovery: WorkflowRecoveryStrategy;
  readonly completionCriteria: readonly string[];
  readonly producedObjects: readonly ProducedObjectType[];
  readonly aiRequestTypes?: readonly string[];
  readonly tags?: readonly string[];
};

export type WorkflowCatalogDocument = {
  readonly catalogVersion: string;
  readonly engineCompatibility: string;
  readonly workflows: readonly CatalogWorkflow[];
};

export function toEngineDefinition(
  catalog: CatalogWorkflow,
): WorkflowDefinition {
  return {
    kind: catalog.id,
    displayName: catalog.displayName,
    version: catalog.version,
  };
}
