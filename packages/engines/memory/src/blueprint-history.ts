import { blueprintCanonicalKey } from './ids.js';
import type { LongTermMemoryManager } from './long-term-memory-manager.js';
import type { MemoryRegistry } from './memory-registry.js';
import type {
  BlueprintMemoryPayload,
  MemoryItem,
  MemorySource,
} from './types.js';

/**
 * BlueprintHistory — approved Blueprints become long-term memory.
 * Never duplicate similar Blueprints.
 */
export class BlueprintHistory {
  constructor(
    private readonly registry: MemoryRegistry,
    private readonly longTerm: LongTermMemoryManager,
  ) {}

  list(teacherId: string): MemoryItem<BlueprintMemoryPayload>[] {
    return this.registry.list({
      teacherId,
      domain: 'blueprint_history',
      status: 'active',
    }) as MemoryItem<BlueprintMemoryPayload>[];
  }

  rememberApproved(
    teacherId: string,
    blueprint: Omit<BlueprintMemoryPayload, 'approvedAt'> & {
      approvedAt?: string;
    },
    source: MemorySource,
  ): MemoryItem<BlueprintMemoryPayload> | { error: string } {
    const key = blueprintCanonicalKey(
      blueprint.subject,
      blueprint.grade,
      blueprint.topic,
    );
    const duplicate = this.list(teacherId).find((i) => i.canonicalKey === key);
    if (duplicate) {
      // Reinforce existing memory instead of duplicating
      const merged: BlueprintMemoryPayload = {
        ...duplicate.payload,
        ...blueprint,
        approvedAt: blueprint.approvedAt ?? new Date().toISOString(),
        generatedAssetIds: [
          ...new Set([
            ...(duplicate.payload.generatedAssetIds ?? []),
            ...(blueprint.generatedAssetIds ?? []),
          ]),
        ],
      };
      const updated = this.registry.update(duplicate.id, {
        payload: merged as unknown as Record<string, unknown>,
        source,
        confidence: Math.max(duplicate.confidence, 0.9),
        note: 'Reinforced similar approved Blueprint',
      });
      if ('error' in updated) return updated;
      this.registry.recordUse(duplicate.id);
      return updated as MemoryItem<BlueprintMemoryPayload>;
    }

    const payload: BlueprintMemoryPayload = {
      ...blueprint,
      approvedAt: blueprint.approvedAt ?? new Date().toISOString(),
    };
    return this.longTerm.store({
      teacherId,
      domain: 'blueprint_history',
      title: `${blueprint.topic} · ${blueprint.subject} · ${blueprint.grade}`,
      payload: payload as unknown as Record<string, unknown>,
      source,
      confidence: 1,
      canonicalKey: key,
    }) as MemoryItem<BlueprintMemoryPayload> | { error: string };
  }

  findSimilar(
    teacherId: string,
    query: { subject?: string; grade?: string; topic?: string },
    limit = 5,
  ): MemoryItem<BlueprintMemoryPayload>[] {
    const topic = query.topic?.toLowerCase() ?? '';
    const subject = query.subject?.toLowerCase() ?? '';
    const grade = query.grade?.toLowerCase() ?? '';

    return this.list(teacherId)
      .map((item) => {
        let score = 0;
        const p = item.payload;
        if (subject && p.subject.toLowerCase().includes(subject)) score += 4;
        if (grade && p.grade.toLowerCase().includes(grade)) score += 3;
        if (topic && p.topic.toLowerCase().includes(topic)) score += 5;
        return { item, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((x) => x.item);
  }
}
