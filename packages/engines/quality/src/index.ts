/**
 * @prima/engine-quality — PS-005 Quality Engine
 * Explainable pedagogical review. Never generates content. Never rewrites Blueprints.
 */

export { QualityEngine, createQualityEngine } from './quality-engine.js';
export type { CreateQualityEngineOptions } from './quality-engine.js';

export { QualityPolicyEngine } from './quality-policy-engine.js';
export { QualityEvaluator } from './quality-evaluator.js';
export { QualityScorer } from './quality-scorer.js';
export { EvidenceCollector } from './evidence-collector.js';
export { DimensionAnalyzer } from './dimension-analyzer.js';
export { TrendAnalyzer } from './trend-analyzer.js';
export { QualityHistory } from './quality-history.js';
export { QualityExplainer } from './quality-explainer.js';
export { EvaluationQueue } from './evaluation-queue.js';
export { DEFAULT_QUALITY_POLICIES } from './policies/default-policies.js';
export {
  DEFAULT_SCORING_MODEL,
  SCORING_MODEL_VERSION,
} from './config/default-scoring.js';

export type {
  QualityDimension,
  ScoreConfidence,
  QualityBand,
  PolicySeverity,
  QualityTrigger,
  EvaluationLogicType,
  QualityPolicy,
  ScoringModelConfig,
  EvidenceItem,
  DimensionScore,
  DetectedRisk,
  QualityReport,
  BlueprintQualityInput,
  AssetQualityInput,
  LessonQualityInput,
  PolicyEvaluationResult,
  TrendSnapshot,
} from './types.js';
export {
  ALL_QUALITY_DIMENSIONS,
  TRIGGER_AFFECTED_DIMENSIONS,
} from './types.js';
