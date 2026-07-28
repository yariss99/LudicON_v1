/**
 * @prima/engine-memory — ENG-10 / PS-002 Memory Engine
 * Teacher-controlled personalization + structured educational memory.
 * Never replaces teacher decisions. Not a chat log. Not a prompt cache.
 */

export { createTeacherMemoryPlatform } from './platform-api.js';
export type { TeacherMemoryPlatform } from './platform-api.js';

export { MemoryRegistry } from './memory-registry.js';
export { WorkingMemoryManager } from './working-memory-manager.js';
export { LongTermMemoryManager } from './long-term-memory-manager.js';
export { PreferenceManager } from './preference-manager.js';
export { BlueprintHistory } from './blueprint-history.js';
export { ResourceHistory } from './resource-history.js';
export { MemorySearch } from './memory-search.js';
export { MemorySync } from './memory-sync.js';
export { PrivacyManager } from './privacy-manager.js';
export { RetrievalPipeline } from './retrieval-pipeline.js';

export type {
  MemoryDomain,
  MemoryTier,
  MemoryItemStatus,
  MemorySourceKind,
  MemorySource,
  MemoryItem,
  MemoryUpdateRecord,
  TeacherProfilePayload,
  ClassProfilePayload,
  PedagogicalPreferencesPayload,
  BlueprintMemoryPayload,
  ResourceMemoryPayload,
  CustomTemplatePayload,
  SchoolContextPayload,
  InteractionPatternPayload,
  WorkingMemoryState,
  PersonalizationSuggestion,
  ExperienceRetrievalRequest,
  ExperienceRetrievalResult,
  MemorySearchRequest,
  MemorySearchHit,
  ForgetScope,
  StableProfileField,
} from './types.js';
export { ALL_MEMORY_DOMAINS, STABLE_PROFILE_FIELDS } from './types.js';

/** Structured Memory Engine (workflow / artifact / AI decision memory). */
export {
  createMemoryEngine,
  MemoryEngine,
  InMemoryMemoryRepository,
  VersionManager,
  SnapshotManager,
  MemoryQueryEngine,
  MemoryEventBus,
  rememberSession,
  rememberWorkflow,
  rememberTeacher,
  rememberProject,
  rememberLesson,
  rememberArtifact,
  rememberAiDecision,
  rememberPreference,
  rememberKnowledge,
} from './core/index.js';

export type {
  CreateMemoryEngineOptions,
  MemoryRepository,
  MemoryType,
  MemoryLifecycleStatus,
  MemoryEventType,
  MemoryEducationalContext,
  MemoryRecord,
  MemoryVersionEntry,
  MemorySnapshot,
  MemoryEvent,
  MemoryQuery,
  SessionMemoryPayload,
  WorkflowMemoryPayload,
  TeacherMemoryPayload,
  ProjectMemoryPayload,
  LessonMemoryPayload,
  ArtifactMemoryPayload,
  AiDecisionMemoryPayload,
  PreferenceMemoryPayload,
  KnowledgeMemoryPayload,
  MemoryEventListener,
  CreateMemoryInput,
} from './core/index.js';

export type { MemorySearchHit as StructuredMemorySearchHit } from './core/index.js';
