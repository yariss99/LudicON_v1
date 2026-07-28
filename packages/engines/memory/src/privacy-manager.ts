import type { MemoryRegistry } from './memory-registry.js';
import type { MemorySync } from './memory-sync.js';
import type {
  ForgetScope,
  MemoryItem,
  MemorySource,
} from './types.js';

const TEACHER_SOURCE = (label: string): MemorySource => ({
  kind: 'teacher_explicit',
  label,
});

/**
 * PrivacyManager — teacher owns memory; inspect, edit, delete, forget.
 */
export class PrivacyManager {
  constructor(
    private readonly registry: MemoryRegistry,
    private readonly sync: MemorySync,
  ) {}

  /** Teacher can inspect every stored memory */
  inspect(teacherId: string): MemoryItem[] {
    return this.registry.list({ teacherId }).filter((i) => i.status !== 'deleted');
  }

  /** Teacher can edit every stored memory */
  edit(
    itemId: string,
    teacherId: string,
    patch: { title?: string; payload?: Record<string, unknown> },
  ): MemoryItem | { error: string } {
    const item = this.registry.get(itemId);
    if (!item || item.teacherId !== teacherId) {
      return { error: 'Memory item not found for teacher' };
    }
    const updated = this.registry.update(itemId, {
      ...patch,
      source: TEACHER_SOURCE('Teacher edit'),
      confidence: 1,
      action: 'update',
      note: 'Teacher-edited memory',
    });
    if (!('error' in updated)) this.sync.recordUpsert(updated);
    return updated;
  }

  delete(itemId: string, teacherId: string): MemoryItem | { error: string } {
    const item = this.registry.get(itemId);
    if (!item || item.teacherId !== teacherId) {
      return { error: 'Memory item not found for teacher' };
    }
    const deleted = this.registry.softDelete(
      itemId,
      TEACHER_SOURCE('Teacher delete'),
    );
    if (!('error' in deleted)) this.sync.recordDelete(itemId, teacherId);
    return deleted;
  }

  archive(itemId: string, teacherId: string): MemoryItem | { error: string } {
    const item = this.registry.get(itemId);
    if (!item || item.teacherId !== teacherId) {
      return { error: 'Memory item not found for teacher' };
    }
    const archived = this.registry.archive(
      itemId,
      TEACHER_SOURCE('Teacher archive'),
    );
    if (!('error' in archived)) this.sync.recordUpsert(archived);
    return archived;
  }

  forget(scope: ForgetScope): { forgotten: string[]; error?: string } {
    if (scope.type === 'item') {
      const item = this.registry.get(scope.itemId);
      if (!item) return { forgotten: [], error: 'Item not found' };
      const r = this.delete(scope.itemId, item.teacherId);
      return 'error' in r
        ? { forgotten: [], error: r.error }
        : { forgotten: [scope.itemId] };
    }

    const teacherId = scope.teacherId;
    const active = this.registry
      .list({ teacherId })
      .filter((i) => i.status === 'active' || i.status === 'archived');

    let targets: MemoryItem[] = [];
    switch (scope.type) {
      case 'class':
        targets = active.filter(
          (i) =>
            i.domain === 'class_profiles' &&
            (i.payload as { classId?: string }).classId === scope.classId,
        );
        break;
      case 'preference':
        targets = active.filter((i) => {
          if (
            i.domain !== 'teaching_preferences' &&
            i.domain !== 'pedagogical_preferences' &&
            i.domain !== 'teacher_profile'
          ) {
            return false;
          }
          if (!scope.preferenceKey) return true;
          return scope.preferenceKey in i.payload;
        });
        break;
      case 'blueprint':
        targets = active.filter(
          (i) =>
            i.domain === 'blueprint_history' &&
            (i.payload as { blueprintId?: string }).blueprintId ===
              scope.blueprintId,
        );
        break;
      case 'everything':
        targets = active;
        break;
    }

    const forgotten: string[] = [];
    for (const item of targets) {
      const r = this.delete(item.id, teacherId);
      if (!('error' in r)) forgotten.push(item.id);
    }
    return { forgotten };
  }

  export(teacherId: string): {
    teacherId: string;
    exportedAt: string;
    items: MemoryItem[];
  } {
    return {
      teacherId,
      exportedAt: new Date().toISOString(),
      items: this.inspect(teacherId),
    };
  }
}
