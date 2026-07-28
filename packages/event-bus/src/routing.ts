import type { PrimaEvent, SubscriptionFilter } from '@prima/contracts';
import { meetsMinPriority } from './priority.js';

/** Glob: `*` any; `Kernel.*` prefix; exact otherwise. */
export function matchPattern(pattern: string, eventType: string): boolean {
  if (pattern === '*') return true;
  if (pattern.endsWith('.*')) {
    const p = pattern.slice(0, -2);
    return eventType === p || eventType.startsWith(`${p}.`);
  }
  if (pattern.includes('*')) {
    const escaped = pattern
      .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
      .replace(/\*/g, '.*');
    return new RegExp(`^${escaped}$`).test(eventType);
  }
  return pattern === eventType;
}

export function matchEventFilter(
  event: PrimaEvent,
  filter: SubscriptionFilter | undefined,
): boolean {
  if (!filter) return true;

  if (filter.eventTypes && filter.eventTypes.length > 0) {
    if (!filter.eventTypes.includes(event.eventType)) return false;
  }

  if (filter.patterns && filter.patterns.length > 0) {
    if (!filter.patterns.some((p) => matchPattern(p, event.eventType))) return false;
  }

  if (filter.categories && filter.categories.length > 0) {
    if (!filter.categories.includes(event.category)) return false;
  }

  if (filter.sources && filter.sources.length > 0) {
    if (!filter.sources.includes(event.source)) return false;
  }

  if (filter.aggregateIds && filter.aggregateIds.length > 0) {
    if (!event.aggregateId || !filter.aggregateIds.includes(event.aggregateId)) return false;
  }

  if (filter.engineIds && filter.engineIds.length > 0) {
    const engineId = event.executionContext?.engineId;
    if (!engineId || !filter.engineIds.includes(engineId)) return false;
  }

  if (!meetsMinPriority(event.priority, filter.minPriority)) return false;

  if (filter.custom && !filter.custom(event)) return false;

  return true;
}

/**
 * Routing lanes for observability / future distributed routers.
 */
export type RoutingLane =
  | 'domain'
  | 'kernel'
  | 'engine'
  | 'plugin'
  | 'external'
  | 'system'
  | 'audit'
  | 'telemetry';

export function resolveRoutingLane(event: PrimaEvent): RoutingLane {
  switch (event.category) {
    case 'domain':
      return 'domain';
    case 'kernel':
      return 'kernel';
    case 'engine':
      return 'engine';
    case 'integration':
      return event.source.startsWith('plugin:') ? 'plugin' : 'external';
    case 'audit':
      return 'audit';
    case 'telemetry':
      return 'telemetry';
    case 'system':
    default:
      return 'system';
  }
}
