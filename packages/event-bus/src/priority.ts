import type { EventPriority } from '@prima/contracts';

export const PRIORITY_RANK: Record<EventPriority, number> = {
  critical: 400,
  high: 300,
  normal: 200,
  low: 100,
};

export function meetsMinPriority(
  eventPriority: EventPriority,
  minPriority: EventPriority | undefined,
): boolean {
  if (!minPriority) return true;
  return PRIORITY_RANK[eventPriority] >= PRIORITY_RANK[minPriority];
}
