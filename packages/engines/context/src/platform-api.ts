import { ContextAggregator } from './context-aggregator.js';
import { ContextPublisher } from './context-publisher.js';
import { ContextRegistry, freezeSnapshot } from './context-registry.js';
import { ContextSubscriber } from './context-subscriber.js';
import { ContextValidator } from './context-validator.js';
import { EventDispatcher } from './event-dispatcher.js';
import { SessionManager } from './session-manager.js';
import type {
  AssetContext,
  BlueprintContext,
  ClassContext,
  ContextDomain,
  ContextEventType,
  ConversationContext,
  GenerationContext,
  InitializeContextInput,
  KnowledgeContextPort,
  MemoryContextPort,
  RuntimeContextSnapshot,
  SessionContext,
  TeacherContext,
  ValidationReport,
} from './types.js';

export type CreateContextPlatformOptions = {
  knowledge?: KnowledgeContextPort;
  memory?: MemoryContextPort;
};

export interface ContextPlatform {
  readonly registry: ContextRegistry;
  readonly aggregator: ContextAggregator;
  readonly publisher: ContextPublisher;
  readonly subscribers: ContextSubscriber;
  readonly sessions: SessionManager;
  readonly dispatcher: EventDispatcher;
  readonly validator: ContextValidator;

  /** Lifecycle */
  initialize(input: InitializeContextInput): RuntimeContextSnapshot | { error: string };
  validate(sessionId: string): ValidationReport | { error: string };
  expire(sessionId: string): RuntimeContextSnapshot | { error: string };
  archive(sessionId: string): RuntimeContextSnapshot | { error: string };

  /** Context API */
  getCurrentContext(sessionId: string): RuntimeContextSnapshot | undefined;
  getBlueprintContext(sessionId: string): Readonly<BlueprintContext> | undefined;
  getTeacherContext(sessionId: string): Readonly<TeacherContext> | undefined;
  getConversationContext(
    sessionId: string,
  ): Readonly<ConversationContext> | undefined;
  getGenerationContext(
    sessionId: string,
  ): Readonly<GenerationContext> | undefined;
  getSessionContext(sessionId: string): Readonly<SessionContext> | undefined;
  getClassContext(sessionId: string): Readonly<ClassContext> | undefined;
  getAssetContext(sessionId: string): Readonly<AssetContext> | undefined;

  subscribe(input: {
    sessionId?: string;
    domains?: ContextDomain[];
    eventTypes?: ContextEventType[];
    handler: Parameters<ContextSubscriber['subscribe']>[0]['handler'];
  }): string;
  unsubscribe(subscriptionId: string): boolean;

  publish(
    type: ContextEventType,
    sessionId: string,
    payload: Record<string, unknown>,
    affects?: ContextDomain[],
  ): ReturnType<ContextPublisher['publish']>;

  /** Session helpers */
  navigate(sessionId: string, screen: string): RuntimeContextSnapshot | { error: string };
}

/**
 * Composition root / DI for PS-003 Context Engine.
 */
export function createContextPlatform(
  options: CreateContextPlatformOptions = {},
): ContextPlatform {
  const registry = new ContextRegistry();
  const validator = new ContextValidator();
  const dispatcher = new EventDispatcher();
  const subscribers = new ContextSubscriber();
  const aggregator = new ContextAggregator(
    registry,
    options.knowledge,
    options.memory,
  );
  const publisher = new ContextPublisher(
    registry,
    aggregator,
    dispatcher,
    subscribers,
    validator,
  );
  const sessions = new SessionManager(registry);

  const requireSnap = (
    sessionId: string,
  ): RuntimeContextSnapshot | { error: string } => {
    const snap = registry.snapshot(sessionId);
    if (!snap) return { error: 'No active context for session' };
    return snap;
  };

  return {
    registry,
    aggregator,
    publisher,
    subscribers,
    sessions,
    dispatcher,
    validator,

    initialize(input) {
      const result = aggregator.initialize(input);
      if ('error' in result) return result;
      const validation = validator.validate(result);
      if (!validation.ok) {
        registry.removeActive(input.sessionId);
        return { error: validation.issues.map((i) => i.message).join('; ') };
      }
      result.lifecycle = 'validated';
      const snapshot = freezeSnapshot(result);
      result.lifecycle = 'distributed';
      registry.setActive(result);

      // Notify listeners of initial context
      const event = dispatcher.enqueue(
        'ContextUpdated',
        input.sessionId,
        ['teacher', 'session', 'platform', 'class'],
        { initialized: true },
      );
      dispatcher.dequeue();
      subscribers.notify(event, snapshot);
      return snapshot;
    },

    validate(sessionId) {
      const ctx = registry.getActive(sessionId);
      if (!ctx) return { error: 'No active context for session' };
      return validator.validate(ctx);
    },

    expire(sessionId) {
      const ctx = registry.getActive(sessionId);
      if (!ctx) return { error: 'No active context for session' };
      ctx.lifecycle = 'expired';
      ctx.updatedAt = new Date().toISOString();
      ctx.version += 1;
      registry.setActive(ctx);
      const snapshot = freezeSnapshot(ctx);
      const event = dispatcher.enqueue(
        'ContextUpdated',
        sessionId,
        ['session'],
        { expired: true },
      );
      dispatcher.dequeue();
      subscribers.notify(event, snapshot);
      return snapshot;
    },

    archive(sessionId) {
      const ctx = registry.getActive(sessionId);
      if (!ctx) return { error: 'No active context for session' };
      ctx.lifecycle = 'archived';
      ctx.updatedAt = new Date().toISOString();
      ctx.version += 1;
      registry.archive(ctx);
      registry.removeActive(sessionId);
      return freezeSnapshot(ctx);
    },

    getCurrentContext(sessionId) {
      const ctx = registry.getActive(sessionId);
      if (!ctx) return undefined;
      if (
        ctx.expiresAt &&
        Date.parse(ctx.expiresAt) < Date.now() &&
        ctx.lifecycle !== 'expired' &&
        ctx.lifecycle !== 'archived'
      ) {
        ctx.lifecycle = 'expired';
        ctx.updatedAt = new Date().toISOString();
        ctx.version += 1;
        registry.setActive(ctx);
      }
      return registry.snapshot(sessionId);
    },

    getBlueprintContext(sessionId) {
      return registry.snapshot(sessionId)?.blueprint;
    },

    getTeacherContext(sessionId) {
      return registry.snapshot(sessionId)?.teacher;
    },

    getConversationContext(sessionId) {
      return registry.snapshot(sessionId)?.conversation;
    },

    getGenerationContext(sessionId) {
      return registry.snapshot(sessionId)?.generation;
    },

    getSessionContext(sessionId) {
      return registry.snapshot(sessionId)?.session;
    },

    getClassContext(sessionId) {
      return registry.snapshot(sessionId)?.class;
    },

    getAssetContext(sessionId) {
      return registry.snapshot(sessionId)?.asset;
    },

    subscribe(input) {
      return subscribers.subscribe(input);
    },

    unsubscribe(id) {
      return subscribers.unsubscribe(id);
    },

    publish(type, sessionId, payload, affects) {
      return publisher.publish(type, sessionId, payload, affects);
    },

    navigate(sessionId, screen) {
      const result = sessions.navigate(sessionId, screen);
      if ('error' in result) return result;
      return requireSnap(sessionId);
    },
  };
}
