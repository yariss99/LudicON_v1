/**
 * PS-003 — Context Engine types.
 * Context = current working reality. Not Knowledge. Not Memory.
 * Never makes pedagogical decisions. Never generates assets.
 */

export type ContextDomain =
  | 'teacher'
  | 'blueprint'
  | 'conversation'
  | 'generation'
  | 'review'
  | 'asset'
  | 'class'
  | 'session'
  | 'platform';

export type ContextLifecycleState =
  | 'initialized'
  | 'updated'
  | 'validated'
  | 'distributed'
  | 'expired'
  | 'archived';

export type ContextEventType =
  | 'ContextUpdated'
  | 'BlueprintChanged'
  | 'TeacherChanged'
  | 'ConversationAdvanced'
  | 'GenerationStarted'
  | 'GenerationCompleted'
  | 'ApprovalGranted'
  | 'AssetModified';

export type TeacherContext = {
  teacherId: string;
  currentProfileRef?: string;
  preferencesRef?: string;
  activeClassId?: string;
  selectedSubject?: string;
  currentGrade?: string;
  teachingHistoryRef?: string;
};

export type SessionContext = {
  sessionId: string;
  activeScreen?: string;
  navigationHistory: string[];
  lastAction?: string;
  pendingTasks: string[];
  currentWorkflow?: string;
};

export type BlueprintContext = {
  blueprintId?: string;
  currentVersion?: string;
  approvalStatus: 'none' | 'draft' | 'pending_review' | 'approved' | 'rejected';
  completedSections: string[];
  pendingSections: string[];
  validationStatus: 'unknown' | 'valid' | 'invalid' | 'needs_review';
  confidenceMap: Record<string, number>;
};

export type ConversationContext = {
  conversationState: 'idle' | 'active' | 'waiting_teacher' | 'waiting_ai' | 'closed';
  currentPedagogicalGoal?: string;
  lastTeacherIntent?: string;
  previousAiQuestion?: string;
  openClarifications: string[];
  conversationSummary?: string;
};

export type GenerationContext = {
  selectedAssetId?: string;
  generationQueue: string[];
  currentStage: 'idle' | 'queued' | 'running' | 'completed' | 'failed';
  dependencies: string[];
  affectedAssets: string[];
  versionReferences: Record<string, string>;
};

export type ReviewContext = {
  reviewId?: string;
  status: 'none' | 'in_review' | 'changes_requested' | 'approved';
  openIssues: string[];
};

export type AssetContext = {
  openAssetIds: string[];
  selectedAssetId?: string;
  lastModifiedAssetId?: string;
};

export type ClassContext = {
  grade?: string;
  classProfileRef?: string;
  learningNeeds: string[];
  differentiationProfile?: string;
  accessibilityRequirements: string[];
};

export type PlatformContext = {
  availableServices: string[];
  connectedEngines: string[];
  featureFlags: Record<string, boolean>;
  installedKnowledgePacks: Array<{ packId: string; version: string }>;
  systemStatus: 'healthy' | 'degraded' | 'offline';
};

/** Mutable active runtime context (single source per session) */
export type ActiveRuntimeContext = {
  contextId: string;
  sessionId: string;
  version: number;
  lifecycle: ContextLifecycleState;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  teacher: TeacherContext;
  blueprint: BlueprintContext;
  conversation: ConversationContext;
  generation: GenerationContext;
  review: ReviewContext;
  asset: AssetContext;
  class: ClassContext;
  session: SessionContext;
  platform: PlatformContext;
};

/** Immutable snapshot for consumers — never mutated after creation */
export type RuntimeContextSnapshot = Readonly<{
  contextId: string;
  sessionId: string;
  version: number;
  lifecycle: ContextLifecycleState;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  teacher: Readonly<TeacherContext>;
  blueprint: Readonly<BlueprintContext>;
  conversation: Readonly<ConversationContext>;
  generation: Readonly<GenerationContext>;
  review: Readonly<ReviewContext>;
  asset: Readonly<AssetContext>;
  class: Readonly<ClassContext>;
  session: Readonly<SessionContext>;
  platform: Readonly<PlatformContext>;
}>;

export type ContextEvent = {
  id: string;
  type: ContextEventType;
  sessionId: string;
  at: string;
  /** Domains this event is allowed to touch */
  affects: ContextDomain[];
  payload: Record<string, unknown>;
};

export type ContextSubscription = {
  id: string;
  sessionId?: string;
  domains?: ContextDomain[];
  eventTypes?: ContextEventType[];
  handler: (event: ContextEvent, snapshot: RuntimeContextSnapshot) => void;
};

export type ValidationIssue = {
  code: string;
  message: string;
  severity: 'error' | 'warning';
  domain?: ContextDomain;
};

export type ValidationReport = {
  ok: boolean;
  issues: ValidationIssue[];
};

export type InitializeContextInput = {
  sessionId: string;
  teacherId: string;
  ttlMs?: number;
  teacher?: Partial<TeacherContext>;
  class?: Partial<ClassContext>;
  platform?: Partial<PlatformContext>;
  activeScreen?: string;
  workflow?: string;
};

/** Optional ports — Context consumes views, never peer engine internals */
export type KnowledgeContextPort = {
  listInstalledPacks(): Array<{ packId: string; version: string }>;
};

export type MemoryContextPort = {
  getTeacherProfileRef?(teacherId: string): string | undefined;
  getPreferencesRef?(teacherId: string): string | undefined;
  getClassProfileRef?(teacherId: string, classId: string): string | undefined;
  getTeachingHistoryRef?(teacherId: string): string | undefined;
};

export const ALL_CONTEXT_DOMAINS: ContextDomain[] = [
  'teacher',
  'blueprint',
  'conversation',
  'generation',
  'review',
  'asset',
  'class',
  'session',
  'platform',
];

export const EVENT_DOMAIN_MAP: Record<ContextEventType, ContextDomain[]> = {
  ContextUpdated: [...ALL_CONTEXT_DOMAINS],
  BlueprintChanged: ['blueprint', 'review', 'session'],
  TeacherChanged: ['teacher', 'class', 'session'],
  ConversationAdvanced: ['conversation', 'session'],
  GenerationStarted: ['generation', 'asset', 'session'],
  GenerationCompleted: ['generation', 'asset', 'session'],
  ApprovalGranted: ['blueprint', 'review', 'session'],
  AssetModified: ['asset', 'generation', 'session'],
};
