export function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function nowIso(clock: () => Date = () => new Date()): string {
  return clock().toISOString();
}
