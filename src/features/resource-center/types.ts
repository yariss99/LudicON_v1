/**
 * Intelligent Resource Center — PRIMA educational knowledge repository.
 * Not a file manager: every asset is indexed, related, versioned, and reusable.
 */

export type ResourceAssetType =
  | "lesson"
  | "worksheet"
  | "assessment"
  | "story"
  | "game"
  | "presentation"
  | "image"
  | "video"
  | "audio"
  | "pdf"
  | "office"
  | "template"
  | "ai_generated"
  | "teacher_upload"
  | "school_shared";

export type ResourceShareScope =
  | "personal"
  | "school"
  | "district"
  | "public"
  | "team";

export type ResourceSharePermission =
  | "read_only"
  | "collaborative"
  | "approval_required";

export type ResourceValidationStatus =
  | "unknown"
  | "draft"
  | "validated"
  | "needs_review"
  | "rejected";

export type ResourceActor = "teacher" | "ai" | "system";

export type ResourceRelationKind =
  | "belongs_to_project"
  | "belongs_to_lesson"
  | "derived_from"
  | "similar_to"
  | "supports_competency"
  | "covers_objective"
  | "uses_resource"
  | "version_of"
  | "shared_with"
  | "authored_by";

export type ResourceSectionId =
  | "browse"
  | "search"
  | "graph"
  | "detail"
  | "metadata"
  | "sharing"
  | "versions"
  | "analytics"
  | "ai"
  | "coverage";

export type ResourceCenterPanel =
  | "browse"
  | "search"
  | "graph"
  | "detail"
  | "ai"
  | "analytics"
  | "sharing"
  | "versions";

export type ResourceUsageStats = {
  readonly openCount: number;
  readonly reuseCount: number;
  readonly lastUsedAt?: string;
  readonly effectivenessScore?: number;
};

export type ResourceAiMetadata = {
  readonly summary?: string;
  readonly keywords: readonly string[];
  readonly embeddingsHint?: string;
  readonly suggestedTags: readonly string[];
  readonly duplicateOfId?: string;
  readonly similarityClusterId?: string;
  readonly lastAiAction?: string;
};

export type ResourceRelation = {
  readonly id: string;
  readonly kind: ResourceRelationKind;
  readonly targetId: string;
  readonly targetLabel: string;
  readonly strength: number;
};

export type KnowledgeResource = {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly assetType: ResourceAssetType;
  readonly projectId?: string;
  readonly projectTitle?: string;
  readonly lessonId?: string;
  readonly lessonTitle?: string;
  readonly subject: string;
  readonly grade: string;
  readonly competencies: readonly string[];
  readonly learningObjectives: readonly string[];
  readonly curriculumRefs: readonly string[];
  readonly tags: readonly string[];
  readonly language: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly author: string;
  readonly createdBy: ResourceActor;
  readonly version: number;
  readonly branchId?: string;
  readonly parentVersionId?: string;
  readonly usage: ResourceUsageStats;
  readonly relations: readonly ResourceRelation[];
  readonly validationStatus: ResourceValidationStatus;
  readonly ai: ResourceAiMetadata;
  readonly shareScope: ResourceShareScope;
  readonly sharePermission: ResourceSharePermission;
  readonly difficulty?: "easy" | "medium" | "hard";
  readonly estimatedMinutes?: number;
  readonly sourceBuilderId?: string;
  readonly sourceHref?: string;
  readonly contentPreview?: string;
  readonly archived: boolean;
  readonly favorite: boolean;
  readonly approvalState?: "none" | "pending" | "approved" | "rejected";
};

export type ResourceVersion = {
  readonly id: string;
  readonly resourceId: string;
  readonly version: number;
  readonly snapshot: KnowledgeResource;
  readonly createdAt: string;
  readonly actor: ResourceActor;
  readonly note?: string;
  readonly branchId?: string;
};

export type ResourceSearchFilters = {
  readonly query: string;
  readonly assetTypes: readonly ResourceAssetType[];
  readonly subjects: readonly string[];
  readonly grades: readonly string[];
  readonly projectId?: string;
  readonly lessonId?: string;
  readonly author?: string;
  readonly tags: readonly string[];
  readonly competency?: string;
  readonly objective?: string;
  readonly difficulty?: "easy" | "medium" | "hard";
  readonly shareScope?: ResourceShareScope;
  readonly dateFrom?: string;
  readonly dateTo?: string;
  readonly minMinutes?: number;
  readonly maxMinutes?: number;
  readonly naturalLanguage?: boolean;
  readonly semantic?: boolean;
};

export type ResourceSearchHit = {
  readonly resource: KnowledgeResource;
  readonly score: number;
  readonly reasons: readonly string[];
};

export type GraphNodeKind =
  | "project"
  | "lesson"
  | "worksheet"
  | "assessment"
  | "story"
  | "game"
  | "presentation"
  | "competency"
  | "resource"
  | "teacher";

export type GraphNode = {
  readonly id: string;
  readonly kind: GraphNodeKind;
  readonly label: string;
  readonly meta?: string;
};

export type GraphEdge = {
  readonly id: string;
  readonly from: string;
  readonly to: string;
  readonly kind: ResourceRelationKind | "contains";
  readonly weight: number;
};

export type KnowledgeGraph = {
  readonly nodes: readonly GraphNode[];
  readonly edges: readonly GraphEdge[];
};

export type ResourceAnalytics = {
  readonly mostUsed: readonly KnowledgeResource[];
  readonly mostEffective: readonly KnowledgeResource[];
  readonly recentlyCreated: readonly KnowledgeResource[];
  readonly recentlyUpdated: readonly KnowledgeResource[];
  readonly unused: readonly KnowledgeResource[];
  readonly curriculumCoverage: readonly {
    ref: string;
    count: number;
  }[];
  readonly teacherActivity: readonly {
    author: string;
    count: number;
  }[];
  readonly reuseStats: {
    readonly totalReuses: number;
    readonly avgReusePerAsset: number;
    readonly sharedCount: number;
  };
};

export type ResourceAiActionId =
  | "suggest_existing"
  | "recommend_similar"
  | "detect_missing"
  | "suggest_reuse"
  | "merge_similar"
  | "recommend_improvements"
  | "generate_metadata"
  | "auto_summarize"
  | "extract_keywords"
  | "identify_curriculum_coverage";
