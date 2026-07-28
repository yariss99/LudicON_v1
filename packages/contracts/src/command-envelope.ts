/**
 * Command envelope — intention to change state (ES-004).
 * No business logic in the bus; payload is opaque.
 */

import type { UserContext, EventExecutionContext } from './event-envelope.js';

export type CommandId = string;
export type CommandType = string;
export type CommandPriority = 'low' | 'normal' | 'high' | 'critical';

export interface CommandMetadata {
  readonly [key: string]: unknown;
}

/**
 * Immutable command intention once accepted by the bus.
 */
export interface Command<TPayload = unknown> {
  readonly commandId: CommandId;
  readonly commandType: CommandType;
  readonly payload: TPayload;
  readonly metadata: CommandMetadata;
  readonly priority: CommandPriority;
  readonly correlationId: string;
  readonly causationId?: string;
  readonly timestamp: string;
  readonly version: string;
  readonly tenantId?: string;
  readonly userContext?: UserContext;
  readonly executionContext?: EventExecutionContext;
  readonly aggregateId?: string;
  readonly source: string;
}

export type CommandDraft<TPayload = unknown> = {
  readonly commandType: CommandType;
  readonly payload: TPayload;
  readonly source: string;
  readonly commandId?: CommandId;
  readonly metadata?: CommandMetadata;
  readonly priority?: CommandPriority;
  readonly correlationId?: string;
  readonly causationId?: string;
  readonly timestamp?: string;
  readonly version?: string;
  readonly tenantId?: string;
  readonly userContext?: UserContext;
  readonly executionContext?: EventExecutionContext;
  readonly aggregateId?: string;
};

export interface CommandContext {
  readonly command: Command;
  readonly correlationId: string;
  readonly causationId?: string;
  readonly startedAt: string;
  readonly deadlineAt?: string;
  readonly signal?: AbortSignal;
  readonly services: import('./context.js').ServiceLocator;
  /** Publish Domain Events after successful handler execution */
  readonly publishDomainEvent: (
    eventType: string,
    payload: unknown,
    extras?: {
      aggregateId?: string;
      category?: import('./event-envelope.js').EventCategory;
      metadata?: Record<string, unknown>;
    },
  ) => Promise<void>;
}

export type DispatchOptions = {
  readonly timeoutMs?: number;
  readonly priority?: CommandPriority;
  readonly signal?: AbortSignal;
  /** Skip named pipeline stages (tests only — never skip auth in production roots) */
  readonly skipStages?: readonly PipelineStageName[];
};

export type PipelineStageName =
  | 'received'
  | 'structuralValidation'
  | 'authorization'
  | 'preconditions'
  | 'policyValidation'
  | 'businessValidation'
  | 'blueprintValidation'
  | 'execution'
  | 'completed';
