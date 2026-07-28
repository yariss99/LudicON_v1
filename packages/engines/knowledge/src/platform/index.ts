/**
 * PS-001 — Pedagogical Knowledge Engine (platform service layer).
 * Canonical pedagogical knowledge graph — does not generate content.
 */

export { createPedagogicalKnowledgePlatform } from './platform-api.js';
export type {
  CreatePlatformOptions,
  PedagogicalKnowledgePlatform,
} from './platform-api.js';

export { KnowledgeRegistry, canonicalKey } from './knowledge-registry.js';
export { RelationshipEngine } from './relationship-engine.js';
export { KnowledgeGraph } from './knowledge-graph.js';
export { KnowledgeValidator } from './knowledge-validator.js';
export { SemanticSearch } from './semantic-search.js';
export { RecommendationService } from './recommendation-service.js';
export { PlatformKnowledgeCache } from './platform-cache.js';
export { seedRomanianPrimary } from './seed/romanian-primary.js';
export {
  CurriculumService,
  CompetencyService,
  MethodService,
  ActivityService,
  AssessmentService,
  ResourceService,
} from './domain-services.js';

export type {
  KnowledgeDomainCategory,
  KnowledgeEntityStatus,
  KnowledgeSourceKind,
  PedagogicalRelationType,
  KnowledgeEntity,
  KnowledgeEdge,
  GraphTraversalResult,
  SearchMode,
  KnowledgeSearchRequest,
  KnowledgeSearchHit,
  RecommendationRequest,
  RecommendationResult,
  ValidationIssue,
  ValidationReport,
  KnowledgeQuery,
  RelationshipQuery,
  RecommendationQuery,
  ValidationQuery,
  GraphTraversalQuery,
} from './types.js';
export { ALL_KNOWLEDGE_DOMAINS } from './types.js';
