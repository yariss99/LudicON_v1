/**
 * @prima/engine-validation — mandatory Validation Engine
 */

export type {
  ArtifactType,
  ValidationProfileId,
  ValidationSeverity,
  ValidatorStatus,
  OverallValidationStatus,
  ValidatorId,
  ValidationArtifact,
  ValidationContext,
  ValidatorResult,
  RepairSuggestion,
  QualityWeights,
  ValidationReport,
  ValidationAuditEntry,
  ValidationRule,
  RuleCondition,
  ValidationProfile,
  Validator,
  RuleProvider,
} from './types.js';

export { DEFAULT_QUALITY_WEIGHTS } from './types.js';

export { evaluateCondition } from './rule-engine.js';
export { RuleEngine, createStaticRuleProvider } from './rule-store.js';
export { DEFAULT_VALIDATION_RULES } from './rules/default-rules.js';
export { VALIDATION_PROFILES, getProfile } from './profiles.js';
export { ValidatorRegistry } from './validator-registry.js';
export {
  createDefaultValidators,
  createSchemaValidator,
  createCurriculumValidator,
  createCompetencyValidator,
  createLearningObjectiveValidator,
  createPedagogicalValidator,
  createAccessibilityValidator,
  createLanguageValidator,
  createFormattingValidator,
  createSafetyValidator,
  createDuplicateValidator,
  createConsistencyValidator,
  createAiOutputValidator,
  createReferenceValidator,
} from './validators.js';
export { QualityScorer } from './quality-scorer.js';
export { RepairEngine } from './repair-engine.js';
export type { RepairOutcome } from './repair-engine.js';
export { ValidationAuditService } from './audit-service.js';
export {
  ValidationEngine,
  createValidationEngine,
  isDeliverableToTeacher,
} from './validation-engine.js';
export type { CreateValidationEngineOptions } from './validation-engine.js';
