/**
 * Structured Memory Engine types.
 * Educational knowledge, workflow state, and decisions — not chat logs.
 */

export type MemoryType =
  | 'session'
  | 'workflow'
  | 'teacher'
  | 'project'
  | 'lesson'
  | 'artifact'
  | 'ai-decision'
  | 'preference'
  | 'knowledge'
  | (string & {});

export type MemoryLifecycleStatus =
  | 'active'
  | 'archived'
  | 'deleted';

export type MemoryEventType =
  | 'MemoryCreated'
  | 'MemoryUpdated'
  | 'MemoryArchived'
  | 'MemoryRestored'
  | 'MemoryDeleted';

/** Educational context every memory must belong to. */
export type MemoryEducationalContext = {
  readonly teacherId?: string;
  readonly projectId?: string;
  readonly workflowId?: string;
  readonly lessonId?: string;
  readonly artifactId?: string;
  readonly subject?: string;
  readonly grade?: string;
  readonly competencyIds?: readonly string[];
  readonly locale?: string;
  readonly extra?: Readonly<Record<string, unknown>>;
};

export type MemoryRecord<TPayload = Readonly<Record<string, unknown>>> = {
  readonly memoryId: string;
  readonly memoryType: MemoryType;
  readonly version: number;
  readonly status: MemoryLifecycleStatus;
  readonly context: MemoryEducationalContext;
  readonly payload: TPayload;
  readonly tags: readonly string[];
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly createdBy: string;
  /** Full-text index material (structured fields flattened). */
  readonly searchText: string;
  readonly metadata: Readonly<Record<string, unknown>>;
};

export type MemoryVersionEntry = {
  readonly memoryId: string;
  readonly version: number;
  readonly recordedAt: string;
  readonly actorId: string;
  readonly reason?: string;
  readonly snapshot: MemoryRecord;
};

export type MemorySnapshot = {
  readonly snapshotId: string;
  readonly label: string;
  readonly createdAt: string;
  readonly createdBy: string;
  readonly memoryIds: readonly string[];
  readonly records: readonly MemoryRecord[];
  readonly metadata: Readonly<Record<string, unknown>>;
};

export type MemoryEvent = {
  readonly eventId: string;
  readonly type: MemoryEventType;
  readonly timestamp: string;
  readonly memoryId: string;
  readonly memoryType: MemoryType;
  readonly version: number;
  readonly actorId: string;
  readonly workflowId?: string;
  readonly metadata: Readonly<Record<string, unknown>>;
};

export type MemoryQuery = {
  readonly memoryType?: MemoryType | readonly MemoryType[];
  readonly teacherId?: string;
  readonly projectId?: string;
  readonly workflowId?: string;
  readonly lessonId?: string;
  readonly competencyId?: string;
  readonly artifactId?: string;
  readonly tags?: readonly string[];
  readonly status?: MemoryLifecycleStatus | readonly MemoryLifecycleStatus[];
  readonly text?: string;
  /** Simple semantic-ish token overlap against searchText + tags. */
  readonly semanticText?: string;
  readonly limit?: number;
};

export type MemorySearchHit = {
  readonly record: MemoryRecord;
  readonly score: number;
};

/** Typed payload shapes (structured — never raw chat transcripts). */
export type SessionMemoryPayload = {
  readonly activeWorkflowId?: string;
  readonly currentLessonId?: string;
  readonly selectedResourceIds?: readonly string[];
  readonly temporaryDecisions?: Readonly<Record<string, unknown>>;
  readonly pendingActions?: readonly string[];
  readonly currentContext?: Readonly<Record<string, unknown>>;
};

export type WorkflowMemoryPayload = {
  readonly workflowId: string;
  readonly workflowKind: string;
  readonly currentState: string;
  readonly completedSteps?: readonly string[];
  readonly failedSteps?: readonly string[];
  readonly rollbackPoints?: readonly number[];
  readonly executionHistory?: readonly Readonly<Record<string, unknown>>[];
};

export type TeacherMemoryPayload = {
  readonly preferredStrategies?: readonly string[];
  readonly preferredLessonStructures?: readonly string[];
  readonly favoriteActivityTypes?: readonly string[];
  readonly preferredOutputFormats?: readonly string[];
  readonly languagePreferences?: readonly string[];
  readonly feedbackHistory?: readonly Readonly<Record<string, unknown>>[];
};

export type ProjectMemoryPayload = {
  readonly projectId: string;
  readonly timeline?: readonly Readonly<Record<string, unknown>>[];
  readonly lessonIds?: readonly string[];
  readonly worksheetIds?: readonly string[];
  readonly exportIds?: readonly string[];
  readonly historyNotes?: readonly string[];
};

export type LessonMemoryPayload = {
  readonly lessonId: string;
  readonly competencies?: readonly string[];
  readonly objectives?: readonly string[];
  readonly activities?: readonly string[];
  readonly assessments?: readonly string[];
  readonly resources?: readonly string[];
  readonly teacherEdits?: readonly Readonly<Record<string, unknown>>[];
};

export type ArtifactMemoryPayload = {
  readonly artifactId: string;
  readonly artifactType: string;
  readonly versionLabel?: string;
  readonly contentRef?: string;
  readonly summary?: string;
};

export type AiDecisionMemoryPayload = {
  readonly requestId: string;
  readonly provider?: string;
  readonly model?: string;
  readonly requestType?: string;
  readonly resultSummary?: Readonly<Record<string, unknown>>;
  readonly validationStatus?: string;
  readonly validationScore?: number;
  readonly repairHistory?: readonly Readonly<Record<string, unknown>>[];
  readonly teacherFeedback?: string;
};

export type PreferenceMemoryPayload = {
  readonly key: string;
  readonly value: unknown;
  readonly scope?: 'teacher' | 'project' | 'school';
};

export type KnowledgeMemoryPayload = {
  readonly patternId: string;
  readonly patternKind:
    | 'lesson-pattern'
    | 'activity-template'
    | 'assessment-pattern'
    | 'story-structure'
    | 'teaching-scenario'
    | (string & {});
  readonly title: string;
  readonly body: Readonly<Record<string, unknown>>;
  readonly successScore?: number;
};

export type MemoryEventListener = (event: MemoryEvent) => void;

export type CreateMemoryInput<T = Readonly<Record<string, unknown>>> = {
  readonly memoryType: MemoryType;
  readonly context: MemoryEducationalContext;
  readonly payload: T;
  readonly tags?: readonly string[];
  readonly actorId: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
  readonly memoryId?: string;
};
