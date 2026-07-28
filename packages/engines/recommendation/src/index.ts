/**
 * @prima/engine-recommendation — PS-004 Recommendation Engine
 * Contextual, explainable, optional. Never decides. Never mutates Blueprints.
 */

export {
  RecommendationEngine,
  createRecommendationEngine,
} from './recommendation-engine.js';
export type { CreateRecommendationEngineOptions } from './recommendation-engine.js';

export { RecommendationRegistry } from './recommendation-registry.js';
export { RecommendationPolicyEngine } from './recommendation-policy-engine.js';
export { RecommendationEvaluator } from './recommendation-evaluator.js';
export { PriorityCalculator } from './priority-calculator.js';
export { RecommendationExplainer } from './recommendation-explainer.js';
export { RecommendationHistory } from './recommendation-history.js';
export { RecommendationLearning } from './recommendation-learning.js';
export { RecommendationDispatcher } from './recommendation-dispatcher.js';
export { DEFAULT_RECOMMENDATION_POLICIES } from './policies/default-policies.js';

export type {
  RecommendationCategory,
  RecommendationPriority,
  RecommendationStatus,
  RecommendationTrigger,
  PolicyConditionType,
  PolicyCondition,
  LearningStrategy,
  RecommendationPolicy,
  RecommendationExplanation,
  RecommendationCard,
  BlueprintObjectiveView,
  EvaluationContext,
  PolicyMatch,
  LearningRecord,
  PriorityWeight,
} from './types.js';
export {
  PRIORITY_ORDER,
  PRIORITY_WEIGHTS,
  ALL_RECOMMENDATION_CATEGORIES,
} from './types.js';
