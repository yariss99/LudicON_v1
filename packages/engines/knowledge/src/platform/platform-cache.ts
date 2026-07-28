/**
 * Graph/search cache — version changes invalidate affected entries.
 */
export class PlatformKnowledgeCache {
  private readonly store = new Map<string, { value: unknown; versionToken: string }>();
  private versionToken = 'v0';

  get<T>(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (entry.versionToken !== this.versionToken) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value as T;
  }

  set(key: string, value: unknown): void {
    this.store.set(key, { value, versionToken: this.versionToken });
  }

  /** Call when registry/graph mutates */
  invalidateAll(): void {
    this.versionToken = `v${Date.now().toString(36)}`;
    this.store.clear();
  }

  size(): number {
    return this.store.size;
  }
}
