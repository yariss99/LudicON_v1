/**
 * FEATURE-007 — Knowledge Hub & Pedagogical Memory (KHPM) contracts.
 * Teacher-owned pedagogical knowledge graph. Private by default.
 */

export const PRIMA_KHPM_SCHEMA_VERSION = '1.0.0';

export type KnowledgeNodeKind =
  | 'lesson_design'
  | 'pedagogical_object'
  | 'teaching_strategy'
  | 'learning_activity'
  | 'assessment_method'
  | 'differentiation_strategy'
  | 'reflection_note'
  | 'template'
  | 'digital_resource'
  | 'media'
  | 'curriculum_ref'
  | 'professional_note'
  | 'research_summary'
  | 'best_practice'
  | 'collection'
  | 'pattern'
  | 'competency'
  | 'objective'
  | 'topic'
  | 'subject'
  | 'grade'
  | (string & {});

export type KnowledgeEdgeKind =
  | 'part_of'
  | 'supports'
  | 'assesses'
  | 'derived_from'
  | 'similar_to'
  | 'tagged'
  | 'uses'
  | 'improves'
  | 'related_reflection'
  | 'suggested'
  | (string & {});

export type KnowledgeVisibility = 'private' | 'shared' | 'school';

export type LinkSuggestionStatus = 'pending' | 'approved' | 'rejected';

export type KnowledgeHubBloomLevel =
  | 'remember'
  | 'understand'
  | 'apply'
  | 'analyze'
  | 'evaluate'
  | 'create'
  | 'unspecified';

export interface KnowledgeNode {
  readonly id: string;
  readonly schemaVersion: string;
  readonly kind: KnowledgeNodeKind;
  readonly title: string;
  readonly summary: string;
  readonly subject?: string;
  readonly grade?: string;
  readonly tags: readonly string[];
  readonly bloomLevel?: KnowledgeHubBloomLevel;
  readonly difficulty?: string;
  readonly estimatedMinutes?: number;
  readonly strategy?: string;
  readonly competencyIds?: readonly string[];
  readonly objectiveIds?: readonly string[];
  readonly lessonProjectId?: string;
  readonly reflectionId?: string;
  readonly publicationId?: string;
  readonly objectId?: string;
  readonly visibility: KnowledgeVisibility;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly metadata?: Record<string, unknown>;
}

export interface KnowledgeEdge {
  readonly id: string;
  readonly kind: KnowledgeEdgeKind;
  readonly fromId: string;
  readonly toId: string;
  readonly label?: string;
  readonly status: LinkSuggestionStatus | 'active';
  readonly createdAt: string;
}

export interface KnowledgeCollection {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly nodeIds: readonly string[];
  readonly autoSuggest: boolean;
  readonly visibility: KnowledgeVisibility;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface KnowledgeSearchQuery {
  readonly text?: string;
  readonly subject?: string;
  readonly grade?: string;
  readonly kind?: KnowledgeNodeKind;
  readonly strategy?: string;
  readonly bloomLevel?: KnowledgeHubBloomLevel;
  readonly tags?: readonly string[];
  readonly maxMinutes?: number;
  readonly competency?: string;
}

export interface KnowledgeHubSearchHit {
  readonly nodeId: string;
  readonly title: string;
  readonly kind: KnowledgeNodeKind;
  readonly score: number;
  readonly excerpt: string;
}

export interface KnowledgeRecommendation {
  readonly id: string;
  readonly nodeId: string;
  readonly title: string;
  readonly reason: string;
  readonly score: number;
  readonly kind: KnowledgeNodeKind;
}

export interface PedagogicalPattern {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly structureHints: readonly string[];
  readonly evidenceCount: number;
  readonly templateNodeId?: string;
}

export interface KnowledgeTimelinePoint {
  readonly id: string;
  readonly labelRo: string;
  readonly at: string;
  readonly relatedNodeIds: readonly string[];
}

export const KNOWLEDGE_NODE_KIND_LABELS_RO: Readonly<Record<string, string>> = {
  lesson_design: 'Proiect de lecție',
  pedagogical_object: 'Obiect pedagogic',
  teaching_strategy: 'Strategie didactică',
  learning_activity: 'Activitate de învățare',
  assessment_method: 'Metodă de evaluare',
  differentiation_strategy: 'Diferențiere',
  reflection_note: 'Notă de reflecție',
  template: 'Șablon',
  digital_resource: 'Resursă digitală',
  media: 'Media',
  curriculum_ref: 'Referință curriculară',
  professional_note: 'Notă profesională',
  research_summary: 'Rezumat cercetare',
  best_practice: 'Bună practică',
  collection: 'Colecție',
  pattern: 'Pattern pedagogic',
  competency: 'Competență',
  objective: 'Obiectiv',
  topic: 'Temă',
  subject: 'Disciplină',
  grade: 'Clasă',
};
