import type {
  KnowledgeImportRequest,
  KnowledgeObject,
  KnowledgePack,
  KnowledgeValidationResult,
} from '@prima/contracts';
import {
  validateKnowledgeObjectMvp,
  validateKnowledgePackMvp,
} from '@prima/contracts';

export interface KnowledgeConflict {
  readonly objectId: string;
  readonly existingPackVersion: string;
  readonly incomingPackVersion: string;
  readonly reason: string;
}

export function validateImport(
  request: KnowledgeImportRequest,
  existing?: { pack: KnowledgePack; objects: ReadonlyMap<string, KnowledgeObject> },
): {
  result: KnowledgeValidationResult;
  conflicts: KnowledgeConflict[];
} {
  const issues = [
    ...validateKnowledgePackMvp(request.pack).issues,
  ];
  const conflicts: KnowledgeConflict[] = [];

  const objectIds = new Set(request.objects.map((o) => o.objectId));
  for (const id of request.pack.objectIds) {
    if (!objectIds.has(id)) {
      issues.push({
        code: 'IMPORT_MISSING_OBJECT',
        message: `Pack lists object ${id} but object payload missing`,
        severity: 'error',
        targetId: id,
      });
    }
  }

  for (const obj of request.objects) {
    if (obj.domain !== request.pack.domain && request.pack.domain !== 'platform') {
      issues.push({
        code: 'IMPORT_DOMAIN_MISMATCH',
        message: `Object ${obj.objectId} domain ${obj.domain} != pack domain ${request.pack.domain}`,
        severity: 'error',
        targetId: obj.objectId,
      });
    }
    issues.push(...validateKnowledgeObjectMvp(obj).issues);

    if (existing?.objects.has(obj.objectId)) {
      const prev = existing.objects.get(obj.objectId)!;
      if (JSON.stringify(prev.payload) !== JSON.stringify(obj.payload)) {
        conflicts.push({
          objectId: obj.objectId,
          existingPackVersion: existing.pack.version,
          incomingPackVersion: request.pack.version,
          reason: 'payload differs across versions — require new pack version (ok) or same-version conflict',
        });
        if (existing.pack.version === request.pack.version) {
          issues.push({
            code: 'IMPORT_SAME_VERSION_CONFLICT',
            message: `Object ${obj.objectId} conflicts within same pack version`,
            severity: 'error',
            targetId: obj.objectId,
          });
        }
      }
    }
  }

  // External / plugin / connector may claim published — Engine remaps to quarantine.
  // Emit a warning so stewards see the remap without failing the import.
  if (
    (request.source === 'plugin' ||
      request.source === 'external' ||
      request.source === 'connector') &&
    request.pack.lifecycleState === 'published'
  ) {
    issues.push({
      code: 'IMPORT_EXTERNAL_WILL_QUARANTINE',
      message:
        'External/plugin/connector imports claiming published are remapped to quarantine until publishPack',
      severity: 'warning',
    });
  }

  return {
    result: {
      ok: issues.every((i) => i.severity !== 'error'),
      issues,
    },
    conflicts,
  };
}

export function assertPublishedReadable(pack: KnowledgePack): string | undefined {
  if (pack.lifecycleState === 'retired') {
    return 'Pack is retired';
  }
  if (pack.lifecycleState === 'rejected' || pack.lifecycleState === 'quarantine') {
    return `Pack not readable in state ${pack.lifecycleState}`;
  }
  return undefined;
}
