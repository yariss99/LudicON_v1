export function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function nowIso(clock: () => Date = () => new Date()): string {
  return clock().toISOString();
}

export function buildSearchText(
  payload: Readonly<Record<string, unknown>>,
  tags: readonly string[],
  context: Readonly<Record<string, unknown>>,
): string {
  const parts = [
    ...tags,
    ...Object.values(context).flatMap((v) => flattenValue(v)),
    ...Object.values(payload).flatMap((v) => flattenValue(v)),
  ];
  return parts.join(' ').toLowerCase();
}

function flattenValue(value: unknown): string[] {
  if (value === null || value === undefined) return [];
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return [String(value)];
  }
  if (Array.isArray(value)) {
    return value.flatMap((v) => flattenValue(v));
  }
  if (typeof value === 'object') {
    return Object.values(value as Record<string, unknown>).flatMap((v) =>
      flattenValue(v),
    );
  }
  return [];
}

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-zăâîșț0-9]+/i)
    .filter((t) => t.length > 1);
}
