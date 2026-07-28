import type { LongTermMemoryManager } from './long-term-memory-manager.js';
import type { MemoryRegistry } from './memory-registry.js';
import type {
  MemoryItem,
  MemorySource,
  ResourceMemoryPayload,
} from './types.js';

/**
 * ResourceHistory — track frequently used generated assets / templates.
 */
export class ResourceHistory {
  constructor(
    private readonly registry: MemoryRegistry,
    private readonly longTerm: LongTermMemoryManager,
  ) {}

  list(teacherId: string): MemoryItem<ResourceMemoryPayload>[] {
    return this.registry.list({
      teacherId,
      domain: 'resource_usage',
      status: 'active',
    }) as MemoryItem<ResourceMemoryPayload>[];
  }

  trackUse(
    teacherId: string,
    resource: Omit<ResourceMemoryPayload, 'lastUsedAt'> & {
      lastUsedAt?: string;
    },
    source: MemorySource,
  ): MemoryItem<ResourceMemoryPayload> | { error: string } {
    const existing = this.list(teacherId).find(
      (i) => i.payload.resourceId === resource.resourceId,
    );
    const payload: ResourceMemoryPayload = {
      ...resource,
      lastUsedAt: resource.lastUsedAt ?? new Date().toISOString(),
    };

    if (existing) {
      const updated = this.registry.update(existing.id, {
        title: resource.title,
        payload: payload as unknown as Record<string, unknown>,
        source,
        confidence: Math.min(1, existing.confidence + 0.05),
      });
      if ('error' in updated) return updated;
      this.registry.recordUse(existing.id);
      return updated as MemoryItem<ResourceMemoryPayload>;
    }

    return this.longTerm.store({
      teacherId,
      domain: 'resource_usage',
      title: resource.title,
      payload: payload as unknown as Record<string, unknown>,
      source,
      confidence: source.kind.startsWith('teacher') ? 0.9 : 0.5,
      canonicalKey: `res::${teacherId}::${resource.resourceId}`,
    }) as MemoryItem<ResourceMemoryPayload> | { error: string };
  }

  frequentlyUsed(teacherId: string, limit = 5): MemoryItem<ResourceMemoryPayload>[] {
    return this.list(teacherId)
      .sort((a, b) => b.usageCount - a.usageCount || b.lastUpdated.localeCompare(a.lastUpdated))
      .slice(0, limit);
  }

  rememberTemplate(
    teacherId: string,
    template: {
      templateId: string;
      title: string;
      subject?: string;
      grade?: string;
      structureHint?: string;
    },
    source: MemorySource,
  ): MemoryItem | { error: string } {
    const existing = this.registry
      .list({
        teacherId,
        domain: 'custom_templates',
        status: 'active',
      })
      .find(
        (i) =>
          (i.payload as { templateId?: string }).templateId === template.templateId,
      );
    if (existing) {
      return this.registry.update(existing.id, {
        title: template.title,
        payload: template as unknown as Record<string, unknown>,
        source,
        confidence: 1,
      });
    }
    return this.longTerm.store({
      teacherId,
      domain: 'custom_templates',
      title: template.title,
      payload: template as unknown as Record<string, unknown>,
      source,
      confidence: 1,
      canonicalKey: `tpl::${teacherId}::${template.templateId}`,
    });
  }
}
