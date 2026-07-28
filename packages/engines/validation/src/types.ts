/**
 * Validation Engine domain types.
 * Gatekeeper for every artifact before teacher delivery.
 */

export type ArtifactType =
  | 'Lesson'
  | 'Worksheet'
  | 'Quiz'
  | 'Presentation'
  | 'Story'
  | 'Assessment'
  | 'ImagePrompt'
  | 'Project'
  | (string & {});

export type ValidationProfileId =
  | 'Draft'
  | 'InternalReview'
  | 'Publication'
  | 'Export'
  | 'AIDebug'
  | (string & {});

export type ValidationSeverity = 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';

export type ValidatorStatus = 'passed' | 'failed' | 'skipped';

export type OverallValidationStatus =
  | 'approved'
  | 'approved_with_warnings'
  | 'rejected'
  | 'repaired';

export type ValidatorId =
  | 'schema'
  | 'curriculum'
  | 'competency'
  | 'learning-objective'
  | 'pedagogical'
  | 'accessibility'
  | 'language'
  | 'formatting'
  | 'safety'
  | 'duplicate'
  | 'consistency'
  | 'ai-output'
  | 'reference'
  | (string & {});

/** Artifact envelope submitted to the Validation Engine. */
export type ValidationArtifact = {
  readonly artifactId: string;
  readonly artifactType: ArtifactType;
  readonly version: string;
  readonly workflowId?: string;
  readonly teacherId?: string;
  readonly projectId?: string;
  readonly locale?: string;
  readonly payload: Readonly<Record<string, unknown>>;
  readonly metadata?: Readonly<Record<string, unknown>>;
};

export type ValidationContext = {
  readonly profileId: ValidationProfileId;
  readonly curriculumRef?: string;
  readonly expectedGrade?: string;
  readonly expectedSubject?: string;
  readonly expectedCompetencies?: readonly string[];
  readonly expectedObjectives?: readonly string[];
  readonly knownArtifactFingerprints?: readonly string[];
  readonly allowRepair?: boolean;
  readonly metadata?: Readonly<Record<string, unknown>>;
};

export type ValidatorResult = {
  readonly validatorId: ValidatorId;
  readonly status: ValidatorStatus;
  readonly severity: ValidationSeverity;
  readonly score: number;
  readonly message: string;
  readonly recommendation?: string;
  readonly repairPossible: boolean;
  readonly metadata: Readonly<Record<string, unknown>>;
};

export type RepairSuggestion = {
  readonly suggestionId: string;
  readonly validatorId: ValidatorId;
  readonly description: string;
  readonly autoApplied: boolean;
  readonly fieldPath?: string;
};

export type QualityWeights = {
  readonly schema: number;
  readonly curriculum: number;
  readonly pedagogical: number;
  readonly learningObjectives: number;
  readonly consistency: number;
  readonly accessibility: number;
  readonly language: number;
};

export const DEFAULT_QUALITY_WEIGHTS: QualityWeights = {
  schema: 0.1,
  curriculum: 0.2,
  pedagogical: 0.25,
  learningObjectives: 0.15,
  consistency: 0.1,
  accessibility: 0.1,
  language: 0.1,
};

export type ValidationReport = {
  readonly reportId: string;
  readonly artifactId: string;
  readonly artifactType: ArtifactType;
  readonly profileId: ValidationProfileId;
  readonly overallScore: number;
  readonly overallStatus: OverallValidationStatus;
  readonly executedValidators: readonly ValidatorId[];
  readonly passedValidators: readonly ValidatorId[];
  readonly failedValidators: readonly ValidatorId[];
  readonly warnings: readonly ValidatorResult[];
  readonly errors: readonly ValidatorResult[];
  readonly results: readonly ValidatorResult[];
  readonly repairSuggestions: readonly RepairSuggestion[];
  readonly repairedPayload?: Readonly<Record<string, unknown>>;
  readonly executionTimeMs: number;
  readonly timestamp: string;
};

export type ValidationAuditEntry = {
  readonly entryId: string;
  readonly timestamp: string;
  readonly workflowId?: string;
  readonly teacherId?: string;
  readonly artifactId: string;
  readonly artifactVersion: string;
  readonly validatorId: ValidatorId | 'aggregate';
  readonly result: ValidatorStatus | OverallValidationStatus;
  readonly severity?: ValidationSeverity;
  readonly message?: string;
  readonly reportId?: string;
};

/** Externalized rule (JSON / YAML / TS providers). */
export type ValidationRule = {
  readonly ruleId: string;
  readonly description: string;
  readonly validatorId: ValidatorId;
  readonly artifactTypes: readonly ArtifactType[];
  readonly profiles: readonly ValidationProfileId[];
  readonly severity: ValidationSeverity;
  readonly enabled: boolean;
  /**
   * Declarative condition — evaluated deterministically.
   * Supports simple path comparisons used by the rule engine.
   */
  readonly when: RuleCondition;
  readonly message: string;
  readonly recommendation?: string;
  readonly repairPossible?: boolean;
  readonly scoreImpact?: number;
};

export type RuleCondition =
  | { readonly op: 'always' }
  | { readonly op: 'missing'; readonly path: string }
  | { readonly op: 'empty'; readonly path: string }
  | {
      readonly op: 'eq';
      readonly path: string;
      readonly value: string | number | boolean;
    }
  | {
      readonly op: 'gt';
      readonly path: string;
      readonly value: number;
    }
  | {
      readonly op: 'and';
      readonly conditions: readonly RuleCondition[];
    }
  | {
      readonly op: 'or';
      readonly conditions: readonly RuleCondition[];
    };

export type ValidationProfile = {
  readonly profileId: ValidationProfileId;
  readonly displayName: string;
  readonly description: string;
  readonly validatorIds: readonly ValidatorId[];
  /** Severities that block approval for this profile. */
  readonly blockingSeverities: readonly ValidationSeverity[];
  readonly allowRepair: boolean;
  readonly minScore?: number;
};

export type Validator = {
  readonly id: ValidatorId;
  readonly displayName: string;
  validate(
    artifact: ValidationArtifact,
    context: ValidationContext,
    rules: readonly ValidationRule[],
  ): ValidatorResult | Promise<ValidatorResult>;
};

export type RuleProvider = {
  readonly id: string;
  loadRules(): readonly ValidationRule[] | Promise<readonly ValidationRule[]>;
};
