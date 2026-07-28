/**
 * Canonical PRIMA Knowledge Model (ES-008) — typed form.
 * No Knowledge Engine behaviour.
 */

export type KnowledgeSchemaVersion = string;

export type KnowledgeDomainId =
  | 'curriculum'
  | 'pedagogical'
  | 'assessment'
  | 'methodological'
  | 'institutional'
  | 'legal'
  | 'resource'
  | 'teacher'
  | 'project'
  | 'student'
  | 'school'
  | 'ai'
  | 'operational'
  | 'platform'
  | 'plugin';

export type KnowledgeTrustLevel =
  | 'authoritative'
  | 'derived'
  | 'advisory'
  | 'generated_candidate'
  | 'untrusted'
  | 'operational';

export type KnowledgeStructureClass =
  | 'structured'
  | 'semi_structured'
  | 'unstructured';

export type KnowledgeOrigin =
  | 'imported'
  | 'curated'
  | 'generated_candidate'
  | 'derived';

export type KnowledgePackLifecycleState =
  | 'quarantine'
  | 'validating'
  | 'rejected'
  | 'published'
  | 'deprecated'
  | 'retired';

export type KnowledgeRelationType =
  | 'contains'
  | 'depends_on'
  | 'specializes'
  | 'references'
  | 'derives_from';

export interface ProvenanceRecord {
  readonly sourceId: string;
  readonly sourceLabel?: string;
  readonly packId?: string;
  readonly packVersion?: string;
  readonly objectId?: string;
  readonly retrievedAt?: string;
  readonly note?: string;
}

export interface KnowledgeObjectRef {
  readonly objectId: string;
  readonly packId: string;
  readonly packVersion: string;
}

/** Atomic attributable knowledge unit (durable conceptually). */
export interface KnowledgeObject {
  readonly objectId: string;
  readonly domain: KnowledgeDomainId;
  readonly title: string;
  readonly structure: KnowledgeStructureClass;
  readonly origin: KnowledgeOrigin;
  readonly trustLevel: KnowledgeTrustLevel;
  readonly schemaVersion: KnowledgeSchemaVersion;
  readonly provenance: readonly ProvenanceRecord[];
  readonly payload: unknown;
  readonly relations?: readonly KnowledgeRelation[];
}

export interface KnowledgeRelation {
  readonly type: KnowledgeRelationType;
  readonly targetObjectId: string;
}

/** Versioned curated release. */
export interface KnowledgePack {
  readonly packId: string;
  readonly domain: KnowledgeDomainId;
  readonly version: string;
  readonly schemaVersion: KnowledgeSchemaVersion;
  readonly trustLevel: KnowledgeTrustLevel;
  readonly lifecycleState: KnowledgePackLifecycleState;
  readonly steward?: string;
  readonly objectIds: readonly string[];
  readonly publishedAt?: string;
  readonly deprecatedAt?: string;
}

/**
 * Ephemeral assembly for one cognitive act — not a Pack.
 */
export interface KnowledgePackage {
  readonly packageId: string;
  readonly correlationId: string;
  readonly pinnedPackVersions: readonly { packId: string; version: string }[];
  readonly objects: readonly KnowledgeObjectRef[];
  readonly provenanceComplete: boolean;
  readonly unsupportedMarked: boolean;
  readonly assembledAt: string;
  readonly domainScope: readonly KnowledgeDomainId[];
}

export interface KnowledgeValidationIssue {
  readonly code: string;
  readonly message: string;
  readonly severity: 'error' | 'warning';
  readonly targetId?: string;
}

export interface KnowledgeValidationResult {
  readonly ok: boolean;
  readonly issues: readonly KnowledgeValidationIssue[];
}

export const PRIMA_KNOWLEDGE_SCHEMA_VERSION = '1.0.0';

/** MVP constitutional checks — pure, no I/O. */
export function validateKnowledgePackMvp(pack: KnowledgePack): KnowledgeValidationResult {
  const issues: KnowledgeValidationIssue[] = [];
  if (!pack.packId || !pack.version) {
    issues.push({
      code: 'KP_ID_VERSION',
      message: 'packId and version are required',
      severity: 'error',
    });
  }
  if (pack.domain === 'student') {
    issues.push({
      code: 'KD_STUDENT_FORBIDDEN',
      message: 'Student Knowledge domain is forbidden in MVP',
      severity: 'error',
      targetId: pack.packId,
    });
  }
  if (
    pack.lifecycleState === 'published' &&
    pack.trustLevel === 'untrusted'
  ) {
    issues.push({
      code: 'KP_TRUST_STATE',
      message: 'Published pack cannot remain untrusted',
      severity: 'error',
      targetId: pack.packId,
    });
  }
  if (pack.lifecycleState === 'published' && pack.objectIds.length === 0) {
    issues.push({
      code: 'KP_EMPTY',
      message: 'Published pack must contain objects',
      severity: 'warning',
      targetId: pack.packId,
    });
  }
  return { ok: issues.every((i) => i.severity !== 'error'), issues };
}

export function validateKnowledgePackageMvp(
  pkg: KnowledgePackage,
): KnowledgeValidationResult {
  const issues: KnowledgeValidationIssue[] = [];
  if (!pkg.correlationId) {
    issues.push({
      code: 'KPKG_CORR',
      message: 'Knowledge Package requires correlationId',
      severity: 'error',
    });
  }
  if (pkg.domainScope.includes('student')) {
    issues.push({
      code: 'KPKG_STUDENT_FORBIDDEN',
      message: 'Student domain forbidden in MVP packages',
      severity: 'error',
    });
  }
  if (!pkg.provenanceComplete && !pkg.unsupportedMarked) {
    issues.push({
      code: 'KPKG_PROVENANCE',
      message: 'Package must be provenanceComplete or unsupportedMarked',
      severity: 'error',
    });
  }
  if (pkg.pinnedPackVersions.length === 0 && pkg.objects.length > 0) {
    issues.push({
      code: 'KPKG_PIN',
      message: 'Objects require pinned pack versions',
      severity: 'error',
    });
  }
  return { ok: issues.every((i) => i.severity !== 'error'), issues };
}

export function validateKnowledgeObjectMvp(
  object: KnowledgeObject,
): KnowledgeValidationResult {
  const issues: KnowledgeValidationIssue[] = [];
  if (object.domain === 'student') {
    issues.push({
      code: 'KO_STUDENT_FORBIDDEN',
      message: 'Student Knowledge objects forbidden in MVP',
      severity: 'error',
      targetId: object.objectId,
    });
  }
  if (
    (object.trustLevel === 'authoritative' || object.trustLevel === 'advisory') &&
    object.provenance.length === 0
  ) {
    issues.push({
      code: 'KO_PROVENANCE',
      message: 'Authoritative/advisory objects require provenance',
      severity: 'error',
      targetId: object.objectId,
    });
  }
  if (object.trustLevel === 'generated_candidate' && object.origin !== 'generated_candidate') {
    issues.push({
      code: 'KO_ORIGIN_TRUST',
      message: 'generated_candidate trust requires matching origin',
      severity: 'warning',
      targetId: object.objectId,
    });
  }
  return { ok: issues.every((i) => i.severity !== 'error'), issues };
}
