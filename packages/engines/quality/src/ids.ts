export function uid(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export function clamp(score: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, score));
}
