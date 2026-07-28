/**
 * PRIMA Event envelope — immutable fact transport (ES-003).
 * No business logic. Payload is opaque to the bus.
 */

export type EventCategory =
  | 'domain'
  | 'kernel'
  | 'engine'
  | 'system'
  | 'integration'
  | 'audit'
  | 'telemetry';

export type EventPriority = 'low' | 'normal' | 'high' | 'critical';

export type DeliveryGuarantee = 'at-most-once' | 'at-least-once' | 'exactly-once';

export type EventId = string;
export type EventType = string;
export type AggregateId = string;
export type CorrelationId = string;
export type CausationId = string;

export interface UserContext {
  readonly userId?: string;
  readonly roles?: readonly string[];
  readonly teacherId?: string;
}

export interface EventExecutionContext {
  readonly kernelId?: string;
  readonly engineId?: string;
  readonly sessionId?: string;
  readonly pipelinePosition?: string;
  readonly correlationId?: CorrelationId;
}

export interface EventMetadata {
  readonly [key: string]: unknown;
}

/**
 * Canonical immutable event. Once published, fields must not change.
 */
export interface PrimaEvent<TPayload = unknown> {
  readonly eventId: EventId;
  readonly eventType: EventType;
  readonly category: EventCategory;
  readonly aggregateId?: AggregateId;
  readonly correlationId: CorrelationId;
  readonly causationId?: CausationId;
  readonly timestamp: string;
  readonly source: string;
  readonly version: string;
  /** Reserved for multi-tenant future */
  readonly tenantId?: string;
  readonly userContext?: UserContext;
  readonly executionContext?: EventExecutionContext;
  readonly priority: EventPriority;
  readonly payload: TPayload;
  readonly metadata: EventMetadata;
}

export type EventDraft<TPayload = unknown> = {
  readonly eventType: EventType;
  readonly category: EventCategory;
  readonly source: string;
  readonly payload: TPayload;
  readonly aggregateId?: AggregateId;
  readonly correlationId?: CorrelationId;
  readonly causationId?: CausationId;
  readonly version?: string;
  readonly tenantId?: string;
  readonly userContext?: UserContext;
  readonly executionContext?: EventExecutionContext;
  readonly priority?: EventPriority;
  readonly metadata?: EventMetadata;
  readonly eventId?: EventId;
  readonly timestamp?: string;
};
