import {
  ActivityService,
  AssessmentService,
  CompetencyService,
  CurriculumService,
  MethodService,
  ResourceService,
} from './domain-services.js';
import { KnowledgeGraph } from './knowledge-graph.js';
import { KnowledgeRegistry } from './knowledge-registry.js';
import { KnowledgeValidator } from './knowledge-validator.js';
import { PlatformKnowledgeCache } from './platform-cache.js';
import { RecommendationService } from './recommendation-service.js';
import { RelationshipEngine } from './relationship-engine.js';
import { SemanticSearch } from './semantic-search.js';
import { seedRomanianPrimary } from './seed/romanian-primary.js';
import type {
  GraphTraversalQuery,
  KnowledgeEntity,
  KnowledgeQuery,
  KnowledgeSearchHit,
  KnowledgeSearchRequest,
  RecommendationQuery,
  RecommendationResult,
  RelationshipQuery,
  ValidationQuery,
  ValidationReport,
  GraphTraversalResult,
  KnowledgeEdge,
} from './types.js';

export interface PedagogicalKnowledgePlatform {
  readonly registry: KnowledgeRegistry;
  readonly relationships: RelationshipEngine;
  readonly graph: KnowledgeGraph;
  readonly search: SemanticSearch;
  readonly recommendations: RecommendationService;
  readonly validator: KnowledgeValidator;
  readonly cache: PlatformKnowledgeCache;
  readonly curriculum: CurriculumService;
  readonly competencies: CompetencyService;
  readonly methods: MethodService;
  readonly activities: ActivityService;
  readonly assessments: AssessmentService;
  readonly resources: ResourceService;

  queryKnowledge(q: KnowledgeQuery): KnowledgeEntity[];
  queryRelationships(q: RelationshipQuery): KnowledgeEdge[];
  recommend(q: RecommendationQuery): RecommendationResult;
  validate(q?: ValidationQuery): ValidationReport;
  traverse(q: GraphTraversalQuery): GraphTraversalResult | { error: string };
  semanticSearch(q: KnowledgeSearchRequest): KnowledgeSearchHit[];

  addEntity(
    ...args: Parameters<KnowledgeRegistry['add']>
  ): ReturnType<KnowledgeRegistry['add']>;
  updateEntity(
    ...args: Parameters<KnowledgeRegistry['update']>
  ): ReturnType<KnowledgeRegistry['update']>;
  archiveEntity(id: string): ReturnType<KnowledgeRegistry['archive']>;
  mergeDuplicates(
    keepId: string,
    absorbId: string,
  ): ReturnType<KnowledgeRegistry['mergeDuplicates']>;
  addRelationship(
    ...args: Parameters<RelationshipEngine['add']>
  ): ReturnType<RelationshipEngine['add']>;
  removeRelationship(edgeId: string): boolean;
  bulkImport(
    ...args: Parameters<KnowledgeRegistry['bulkImport']>
  ): ReturnType<KnowledgeRegistry['bulkImport']>;
}

export interface CreatePlatformOptions {
  /** Seed Romanian primary demo graph (default true) */
  seed?: boolean;
}

/**
 * Composition root / DI for PS-001 Pedagogical Knowledge Engine.
 */
export function createPedagogicalKnowledgePlatform(
  options: CreatePlatformOptions = {},
): PedagogicalKnowledgePlatform {
  const cache = new PlatformKnowledgeCache();
  const registry = new KnowledgeRegistry();
  const relationships = new RelationshipEngine(registry);
  const graph = new KnowledgeGraph(registry, relationships);
  const search = new SemanticSearch(registry, relationships, graph);
  const recommendations = new RecommendationService(registry, graph, search);
  const validator = new KnowledgeValidator(registry, relationships);
  const curriculum = new CurriculumService(registry);
  const competencies = new CompetencyService(registry);
  const methods = new MethodService(registry);
  const activities = new ActivityService(registry);
  const assessments = new AssessmentService(registry);
  const resources = new ResourceService(registry);

  const invalidate = () => cache.invalidateAll();

  const platform: PedagogicalKnowledgePlatform = {
    registry,
    relationships,
    graph,
    search,
    recommendations,
    validator,
    cache,
    curriculum,
    competencies,
    methods,
    activities,
    assessments,
    resources,

    queryKnowledge(q) {
      const key = `kq:${JSON.stringify(q)}`;
      const hit = cache.get<KnowledgeEntity[]>(key);
      if (hit) return hit;
      const result = registry.query(q);
      cache.set(key, result);
      return result;
    },

    queryRelationships(q) {
      return relationships.query(q);
    },

    recommend(q) {
      const key = `rec:${JSON.stringify(q)}`;
      const hit = cache.get<RecommendationResult>(key);
      if (hit) return hit;
      const result = recommendations.recommend(q);
      cache.set(key, result);
      return result;
    },

    validate(q = { all: true }) {
      return validator.validate(q);
    },

    traverse(q) {
      const key = `trav:${JSON.stringify(q)}`;
      const hit = cache.get<GraphTraversalResult>(key);
      if (hit) return hit;
      const result = graph.traverse(q.startId, {
        direction: q.direction,
        relationType: q.relationType,
        maxDepth: q.maxDepth,
      });
      if (!('error' in result)) cache.set(key, result);
      return result;
    },

    semanticSearch(q) {
      const key = `ss:${JSON.stringify(q)}`;
      const hit = cache.get<KnowledgeSearchHit[]>(key);
      if (hit) return hit;
      const result = search.search(q);
      cache.set(key, result);
      return result;
    },

    addEntity(...args) {
      const r = registry.add(...args);
      invalidate();
      return r;
    },

    updateEntity(...args) {
      const r = registry.update(...args);
      invalidate();
      return r;
    },

    archiveEntity(id) {
      const r = registry.archive(id);
      invalidate();
      return r;
    },

    mergeDuplicates(keepId, absorbId) {
      const r = registry.mergeDuplicates(keepId, absorbId);
      if (!('error' in r)) {
        relationships.repoint(absorbId, keepId);
        invalidate();
      }
      return r;
    },

    addRelationship(...args) {
      const r = relationships.add(...args);
      invalidate();
      return r;
    },

    removeRelationship(edgeId) {
      const ok = relationships.remove(edgeId);
      if (ok) invalidate();
      return ok;
    },

    bulkImport(...args) {
      const r = registry.bulkImport(...args);
      invalidate();
      return r;
    },
  };

  if (options.seed !== false) {
    seedRomanianPrimary(registry, relationships);
  }

  return platform;
}
