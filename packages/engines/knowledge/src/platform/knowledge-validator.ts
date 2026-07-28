import type { KnowledgeRegistry } from './knowledge-registry.js';
import type { RelationshipEngine } from './relationship-engine.js';
import { ALL_KNOWLEDGE_DOMAINS } from './types.js';
import type { ValidationQuery, ValidationReport } from './types.js';

/**
 * KnowledgeValidator — versioned, verified, traceable, non-duplicated.
 */
export class KnowledgeValidator {
  constructor(
    private readonly registry: KnowledgeRegistry,
    private readonly relationships: RelationshipEngine,
  ) {}

  validate(q: ValidationQuery = { all: true }): ValidationReport {
    if (q.entityId) return this.validateEntity(q.entityId);
    if (q.relationships && !q.all) return this.validateRelationships();
    return this.validateAll();
  }

  validateEntity(id: string): ValidationReport {
    const issues: ValidationReport['issues'] = [];
    const entity = this.registry.get(id);
    if (!entity) {
      return {
        ok: false,
        issues: [{ code: 'MISSING', message: 'Entity not found', severity: 'error' }],
      };
    }

    if (!ALL_KNOWLEDGE_DOMAINS.includes(entity.category)) {
      issues.push({
        code: 'DOMAIN',
        message: 'Entity category is not a validated knowledge domain',
        severity: 'error',
        targetId: id,
      });
    }
    if (!entity.evidenceSource?.sourceId || !entity.evidenceSource.label) {
      issues.push({
        code: 'SOURCE',
        message: 'Evidence source must be traceable',
        severity: 'error',
        targetId: id,
      });
    }
    if (!entity.version) {
      issues.push({
        code: 'VERSION',
        message: 'Version is required',
        severity: 'error',
        targetId: id,
      });
    }
    if (entity.status === 'draft') {
      issues.push({
        code: 'UNVERIFIED',
        message: 'Entity is not verified',
        severity: 'warning',
        targetId: id,
      });
    }

    const dupes = this.registry
      .list()
      .filter(
        (e) =>
          e.id !== id &&
          e.canonicalKey === entity.canonicalKey &&
          e.status !== 'archived' &&
          e.status !== 'merged',
      );
    if (dupes.length > 0) {
      issues.push({
        code: 'DUPLICATE',
        message: `Duplicate of ${dupes[0].id}`,
        severity: 'error',
        targetId: id,
      });
    }

    return { ok: issues.every((i) => i.severity !== 'error'), issues };
  }

  validateRelationships(): ValidationReport {
    const issues: ValidationReport['issues'] = [];
    for (const edge of this.relationships.list()) {
      const from = this.registry.get(edge.fromId);
      const to = this.registry.get(edge.toId);
      if (!from || !to) {
        issues.push({
          code: 'ORPHAN_EDGE',
          message: `Relationship ${edge.id} references missing entity`,
          severity: 'error',
          targetId: edge.id,
        });
      }
      if (!edge.type) {
        issues.push({
          code: 'UNTYPED',
          message: `Relationship ${edge.id} must be typed`,
          severity: 'error',
          targetId: edge.id,
        });
      }
    }
    return { ok: issues.every((i) => i.severity !== 'error'), issues };
  }

  validateAll(): ValidationReport {
    const issues: ValidationReport['issues'] = [];
    for (const entity of this.registry.list()) {
      issues.push(...this.validateEntity(entity.id).issues);
    }
    issues.push(...this.validateRelationships().issues);
    return { ok: issues.every((i) => i.severity !== 'error'), issues };
  }
}
