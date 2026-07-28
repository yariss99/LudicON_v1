import { BlueprintHistory } from './blueprint-history.js';
import { LongTermMemoryManager } from './long-term-memory-manager.js';
import { MemoryRegistry } from './memory-registry.js';
import { MemorySearch } from './memory-search.js';
import { MemorySync } from './memory-sync.js';
import { PreferenceManager } from './preference-manager.js';
import { PrivacyManager } from './privacy-manager.js';
import { ResourceHistory } from './resource-history.js';
import { RetrievalPipeline } from './retrieval-pipeline.js';
import { WorkingMemoryManager } from './working-memory-manager.js';
import type {
  BlueprintMemoryPayload,
  ExperienceRetrievalRequest,
  ExperienceRetrievalResult,
  ForgetScope,
  MemoryItem,
  MemorySearchHit,
  MemorySearchRequest,
  MemorySource,
  PedagogicalPreferencesPayload,
  ResourceMemoryPayload,
  StableProfileField,
  TeacherProfilePayload,
  WorkingMemoryState,
} from './types.js';

export interface TeacherMemoryPlatform {
  readonly registry: MemoryRegistry;
  readonly working: WorkingMemoryManager;
  readonly longTerm: LongTermMemoryManager;
  readonly preferences: PreferenceManager;
  readonly blueprints: BlueprintHistory;
  readonly resources: ResourceHistory;
  readonly search: MemorySearch;
  readonly sync: MemorySync;
  readonly privacy: PrivacyManager;
  readonly retrieval: RetrievalPipeline;

  /** Working memory session lifecycle */
  beginSession(teacherId: string, sessionId?: string): WorkingMemoryState;
  endSession(sessionId: string): boolean;
  getWorkingMemory(sessionId: string): WorkingMemoryState | undefined;

  /** Stable knowledge — never re-ask */
  isKnown(teacherId: string, field: StableProfileField): boolean;
  knownStableFields(teacherId: string): StableProfileField[];

  upsertProfile(
    teacherId: string,
    payload: TeacherProfilePayload,
    source: MemorySource,
  ): MemoryItem<TeacherProfilePayload> | { error: string };
  upsertPedagogicalPreferences(
    teacherId: string,
    payload: PedagogicalPreferencesPayload,
    source: MemorySource,
  ): MemoryItem<PedagogicalPreferencesPayload> | { error: string };
  upsertClassProfile(
    ...args: Parameters<PreferenceManager['upsertClassProfile']>
  ): ReturnType<PreferenceManager['upsertClassProfile']>;

  rememberBlueprint(
    teacherId: string,
    blueprint: Omit<BlueprintMemoryPayload, 'approvedAt'> & {
      approvedAt?: string;
    },
    source: MemorySource,
  ): MemoryItem<BlueprintMemoryPayload> | { error: string };

  trackResource(
    teacherId: string,
    resource: Omit<ResourceMemoryPayload, 'lastUsedAt'> & {
      lastUsedAt?: string;
    },
    source: MemorySource,
  ): MemoryItem<ResourceMemoryPayload> | { error: string };

  retrieveForExperience(
    request: ExperienceRetrievalRequest,
  ): ExperienceRetrievalResult;

  searchMemory(request: MemorySearchRequest): MemorySearchHit[];

  inspect(teacherId: string): MemoryItem[];
  editMemory(
    ...args: Parameters<PrivacyManager['edit']>
  ): ReturnType<PrivacyManager['edit']>;
  deleteMemory(
    ...args: Parameters<PrivacyManager['delete']>
  ): ReturnType<PrivacyManager['delete']>;
  forget(scope: ForgetScope): ReturnType<PrivacyManager['forget']>;
  flushSync(): ReturnType<MemorySync['flush']>;
}

/**
 * Composition root / DI for PS-002 Memory Engine.
 */
export function createTeacherMemoryPlatform(): TeacherMemoryPlatform {
  const registry = new MemoryRegistry();
  const working = new WorkingMemoryManager();
  const longTerm = new LongTermMemoryManager(registry);
  const preferences = new PreferenceManager(registry, longTerm);
  const blueprints = new BlueprintHistory(registry, longTerm);
  const resources = new ResourceHistory(registry, longTerm);
  const search = new MemorySearch(registry);
  const sync = new MemorySync();
  const privacy = new PrivacyManager(registry, sync);
  const retrieval = new RetrievalPipeline(
    registry,
    preferences,
    blueprints,
    resources,
  );

  const track = <T extends MemoryItem | { error: string }>(result: T): T => {
    if (result && typeof result === 'object' && 'id' in result && !('error' in result)) {
      sync.recordUpsert(result as MemoryItem);
    }
    return result;
  };

  return {
    registry,
    working,
    longTerm,
    preferences,
    blueprints,
    resources,
    search,
    sync,
    privacy,
    retrieval,

    beginSession(teacherId, sessionId) {
      return working.start(teacherId, sessionId);
    },

    endSession(sessionId) {
      return working.end(sessionId);
    },

    getWorkingMemory(sessionId) {
      return working.get(sessionId);
    },

    isKnown(teacherId, field) {
      return preferences.isKnown(teacherId, field);
    },

    knownStableFields(teacherId) {
      return preferences.knownStableFields(teacherId);
    },

    upsertProfile(teacherId, payload, source) {
      return track(preferences.upsertTeacherProfile(teacherId, payload, source));
    },

    upsertPedagogicalPreferences(teacherId, payload, source) {
      return track(
        preferences.upsertPedagogicalPreferences(teacherId, payload, source),
      );
    },

    upsertClassProfile(...args) {
      return track(preferences.upsertClassProfile(...args));
    },

    rememberBlueprint(teacherId, blueprint, source) {
      return track(blueprints.rememberApproved(teacherId, blueprint, source));
    },

    trackResource(teacherId, resource, source) {
      return track(resources.trackUse(teacherId, resource, source));
    },

    retrieveForExperience(request) {
      return retrieval.retrieve(request);
    },

    searchMemory(request) {
      return search.search(request);
    },

    inspect(teacherId) {
      return privacy.inspect(teacherId);
    },

    editMemory(...args) {
      return privacy.edit(...args);
    },

    deleteMemory(...args) {
      return privacy.delete(...args);
    },

    forget(scope) {
      return privacy.forget(scope);
    },

    flushSync() {
      return sync.flush();
    },
  };
}
