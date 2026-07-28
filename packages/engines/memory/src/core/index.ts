/**
 * Structured Memory Engine (core) — educational memory, not chat history.
 */

export type {
  MemoryType,
  MemoryLifecycleStatus,
  MemoryEventType,
  MemoryEducationalContext,
  MemoryRecord,
  MemoryVersionEntry,
  MemorySnapshot,
  MemoryEvent,
  MemoryQuery,
  MemorySearchHit,
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
} from './types.js';

export { MemoryEngine, createMemoryEngine } from './memory-engine.js';
export type { CreateMemoryEngineOptions } from './memory-engine.js';

export {
  InMemoryMemoryRepository,
  type MemoryRepository,
} from './repository.js';
export { VersionManager } from './version-manager.js';
export { SnapshotManager } from './snapshot-manager.js';
export { MemoryQueryEngine } from './query-engine.js';
export { MemoryEventBus } from './event-bus.js';

export {
  rememberSession,
  rememberWorkflow,
  rememberTeacher,
  rememberProject,
  rememberLesson,
  rememberArtifact,
  rememberAiDecision,
  rememberPreference,
  rememberKnowledge,
} from './providers.js';
