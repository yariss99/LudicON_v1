/**
 * @prima/engine-knowledge — ENG-02 Knowledge Engine + PS-001 pedagogical graph
 */

export { KnowledgeEngine, createKnowledgeEngine } from './knowledge-engine.js';
export type { KnowledgeEngineOptions } from './knowledge-engine.js';
export { InMemoryKnowledgeStore } from './store.js';
export { KnowledgeCache } from './cache.js';
export { searchKnowledge } from './retrieval.js';
export type { SemanticSearchPort } from './retrieval.js';
export { KNOWLEDGE_ENGINE_MANIFEST } from './manifest.js';

/** PS-001 Platform Service — pedagogical knowledge graph */
export {
  createPedagogicalKnowledgePlatform,
  KnowledgeRegistry,
  RelationshipEngine,
  KnowledgeGraph,
  KnowledgeValidator,
  SemanticSearch,
  RecommendationService,
  PlatformKnowledgeCache,
  CurriculumService,
  CompetencyService,
  MethodService,
  ActivityService,
  AssessmentService,
  ResourceService,
  seedRomanianPrimary,
  ALL_KNOWLEDGE_DOMAINS,
  canonicalKey,
} from './platform/index.js';
export type {
  CreatePlatformOptions,
  PedagogicalKnowledgePlatform,
  KnowledgeDomainCategory,
  KnowledgeEntity,
  KnowledgeEdge,
  KnowledgeQuery,
  RelationshipQuery,
  RecommendationQuery,
  ValidationQuery,
  GraphTraversalQuery,
  RecommendationResult,
  KnowledgeSearchRequest,
  KnowledgeSearchHit,
} from './platform/index.js';
