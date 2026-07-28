/**
 * @prima/engine-context — ENG-01 / PS-003 Context Engine
 * Single source of runtime context. No pedagogy. No generation.
 */

export { createContextPlatform } from './platform-api.js';
export type {
  ContextPlatform,
  CreateContextPlatformOptions,
} from './platform-api.js';

export { ContextRegistry, freezeSnapshot } from './context-registry.js';
export { ContextAggregator } from './context-aggregator.js';
export { ContextPublisher } from './context-publisher.js';
export { ContextSubscriber } from './context-subscriber.js';
export { SessionManager } from './session-manager.js';
export { EventDispatcher } from './event-dispatcher.js';
export { ContextValidator } from './context-validator.js';

export type {
  ContextDomain,
  ContextLifecycleState,
  ContextEventType,
  TeacherContext,
  SessionContext,
  BlueprintContext,
  ConversationContext,
  GenerationContext,
  ReviewContext,
  AssetContext,
  ClassContext,
  PlatformContext,
  ActiveRuntimeContext,
  RuntimeContextSnapshot,
  ContextEvent,
  ContextSubscription,
  ValidationIssue,
  ValidationReport,
  InitializeContextInput,
  KnowledgeContextPort,
  MemoryContextPort,
} from './types.js';
export { ALL_CONTEXT_DOMAINS, EVENT_DOMAIN_MAP } from './types.js';
