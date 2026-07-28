/**
 * PS-001 — Pedagogical Knowledge Engine platform types.
 * Knowledge is a graph of validated entities — never generated content.
 */

export type KnowledgeDomainCategory =
  | 'curriculum'
  | 'subjects'
  | 'grades'
  | 'competencies'
  | 'specific_competencies'
  | 'learning_objectives'
  | 'learning_outcomes'
  | 'pedagogical_methods'
  | 'teaching_strategies'
  | 'learning_activities'
  | 'assessment_strategies'
  | 'assessment_instruments'
  | 'educational_resources'
  | 'digital_tools'
  | 'differentiation_strategies'
  | 'accessibility_guidelines'
  | 'blooms_taxonomy'
  | 'digital_competence_frameworks'
  | 'educational_standards'
  | 'instructional_templates';

export type KnowledgeEntityStatus =
  | 'draft'
  | 'verified'
  | 'published'
  | 'archived'
  | 'merged';

export type KnowledgeSourceKind =
  | 'official_curriculum'
  | 'internal_pedagogical_model'
  | 'instructional_blueprint_model'
  | 'validated_framework'
  | 'platform_authored'
  | 'external_provider';

/** Directional typed relationships */
export type PedagogicalRelationType =
  | 'contains'
  | 'supports'
  | 'recommends'
  | 'uses'
  | 'evaluates'
  | 'enriches'
  | 'specializes'
  | 'aligns_with'
  | 'requires'
  | 'alternative_to';

export type KnowledgeEntity = {
  id: string;
  title: string;
  description: string;
  category: KnowledgeDomainCategory;
  metadata: Record<string, string | number | boolean | string[]>;
  evidenceSource: {
    kind: KnowledgeSourceKind;
    sourceId: string;
    label: string;
  };
  version: string;
  language: string;
  status: KnowledgeEntityStatus;
  createdAt: string;
  updatedAt: string;
  /** Normalized title key for duplicate prevention */
  canonicalKey: string;
};

export type KnowledgeEdge = {
  id: string;
  type: PedagogicalRelationType;
  fromId: string;
  toId: string;
  metadata?: Record<string, string>;
};

export type GraphTraversalResult = {
  nodes: KnowledgeEntity[];
  edges: KnowledgeEdge[];
  path: string[];
};

export type SearchMode =
  | 'keyword'
  | 'semantic'
  | 'relationship'
  | 'similarity'
  | 'recommendation';

export type KnowledgeSearchRequest = {
  text?: string;
  mode?: SearchMode;
  category?: KnowledgeDomainCategory;
  categories?: KnowledgeDomainCategory[];
  relatedToId?: string;
  relationType?: PedagogicalRelationType;
  grade?: string;
  subject?: string;
  limit?: number;
};

export type KnowledgeSearchHit = {
  entity: KnowledgeEntity;
  score: number;
  explanation: string;
};

export type RecommendationRequest = {
  competencyId?: string;
  objectiveId?: string;
  grade?: string;
  subject?: string;
  topic?: string;
  limit?: number;
};

export type RecommendationResult = {
  recommendedActivities: KnowledgeSearchHit[];
  recommendedMethods: KnowledgeSearchHit[];
  suggestedResources: KnowledgeSearchHit[];
  alternativeAssessments: KnowledgeSearchHit[];
  digitalToolSuggestions: KnowledgeSearchHit[];
  differentiationOptions: KnowledgeSearchHit[];
  confidenceScore: number;
  explanation: string;
};

export type ValidationIssue = {
  code: string;
  message: string;
  severity: 'error' | 'warning';
  targetId?: string;
};

export type ValidationReport = {
  ok: boolean;
  issues: ValidationIssue[];
};

/** API: Knowledge Query */
export type KnowledgeQuery = {
  category?: KnowledgeDomainCategory;
  status?: KnowledgeEntityStatus;
  text?: string;
  grade?: string;
  subject?: string;
  topic?: string;
  language?: string;
};

/** API: Relationship Query */
export type RelationshipQuery = {
  fromId?: string;
  toId?: string;
  type?: PedagogicalRelationType;
  entityId?: string;
};

/** API: Recommendation Query */
export type RecommendationQuery = RecommendationRequest;

/** API: Validation Query */
export type ValidationQuery = {
  entityId?: string;
  relationships?: boolean;
  all?: boolean;
};

/** API: Graph Traversal */
export type GraphTraversalQuery = {
  startId: string;
  direction?: 'out' | 'in' | 'both';
  relationType?: PedagogicalRelationType;
  maxDepth?: number;
};

export const ALL_KNOWLEDGE_DOMAINS: KnowledgeDomainCategory[] = [
  'curriculum',
  'subjects',
  'grades',
  'competencies',
  'specific_competencies',
  'learning_objectives',
  'learning_outcomes',
  'pedagogical_methods',
  'teaching_strategies',
  'learning_activities',
  'assessment_strategies',
  'assessment_instruments',
  'educational_resources',
  'digital_tools',
  'differentiation_strategies',
  'accessibility_guidelines',
  'blooms_taxonomy',
  'digital_competence_frameworks',
  'educational_standards',
  'instructional_templates',
];
