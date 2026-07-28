/** FEATURE-007 — KHPM runtime types */

export type KnowledgeNodeKind =
  | "lesson_design"
  | "pedagogical_object"
  | "teaching_strategy"
  | "learning_activity"
  | "assessment_method"
  | "differentiation_strategy"
  | "reflection_note"
  | "template"
  | "digital_resource"
  | "media"
  | "curriculum_ref"
  | "professional_note"
  | "research_summary"
  | "best_practice"
  | "collection"
  | "pattern"
  | "competency"
  | "objective"
  | "topic"
  | "subject"
  | "grade";

export type KnowledgeEdgeKind =
  | "part_of"
  | "supports"
  | "assesses"
  | "derived_from"
  | "similar_to"
  | "tagged"
  | "uses"
  | "improves"
  | "related_reflection"
  | "suggested";

export type KnowledgeVisibility = "private" | "shared" | "school";
export type LinkSuggestionStatus = "pending" | "approved" | "rejected";

export type KnowledgeNode = {
  id: string;
  schemaVersion: string;
  kind: KnowledgeNodeKind;
  title: string;
  summary: string;
  subject?: string;
  grade?: string;
  tags: string[];
  bloomLevel?: string;
  difficulty?: string;
  estimatedMinutes?: number;
  strategy?: string;
  competencyIds?: string[];
  objectiveIds?: string[];
  lessonProjectId?: string;
  reflectionId?: string;
  publicationId?: string;
  objectId?: string;
  visibility: KnowledgeVisibility;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
};

export type KnowledgeEdge = {
  id: string;
  kind: KnowledgeEdgeKind;
  fromId: string;
  toId: string;
  label?: string;
  status: LinkSuggestionStatus | "active";
  createdAt: string;
};

export type KnowledgeCollection = {
  id: string;
  title: string;
  description: string;
  nodeIds: string[];
  autoSuggest: boolean;
  visibility: KnowledgeVisibility;
  createdAt: string;
  updatedAt: string;
};

export type KnowledgeSearchQuery = {
  text?: string;
  subject?: string;
  grade?: string;
  kind?: KnowledgeNodeKind;
  strategy?: string;
  bloomLevel?: string;
  tags?: string[];
  maxMinutes?: number;
  competency?: string;
};

export type KnowledgeSearchHit = {
  nodeId: string;
  title: string;
  kind: KnowledgeNodeKind;
  score: number;
  excerpt: string;
};

export type KnowledgeRecommendation = {
  id: string;
  nodeId: string;
  title: string;
  reason: string;
  score: number;
  kind: KnowledgeNodeKind;
};

export type PedagogicalPattern = {
  id: string;
  title: string;
  description: string;
  structureHints: string[];
  evidenceCount: number;
  templateNodeId?: string;
};

export type KnowledgeTimelinePoint = {
  id: string;
  labelRo: string;
  at: string;
  relatedNodeIds: string[];
};
