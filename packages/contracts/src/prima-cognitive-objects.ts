/**
 * Cognitive Objects Model (ES-007) — typed envelope and catalog.
 * No Engine behaviour. Aligns to PRIMA-CM-001 and Constitutional Language.
 */

export const PRIMA_COGNITIVE_OBJECT_SCHEMA_VERSION = '1.0.0';

export type CognitiveObjectId =
  | 'CO-01'
  | 'CO-02'
  | 'CO-03'
  | 'CO-04'
  | 'CO-05'
  | 'CO-06'
  | 'CO-07'
  | 'CO-08'
  | 'CO-09'
  | 'CO-10'
  | 'CO-11'
  | 'CO-12'
  | 'CO-13'
  | 'CO-14'
  | 'CO-15'
  | 'CO-16'
  | 'CO-17'
  | 'CO-18'
  | 'CO-19'
  | 'CO-20';

export type CognitiveAuthorityClass =
  | 'situational'
  | 'evidence'
  | 'interpretive'
  | 'commitmental'
  | 'authoritative'
  | 'critical'
  | 'realized'
  | 'reflective'
  | 'observational';

export type CognitiveConfidence = 'high' | 'medium' | 'low' | 'unknown';

export type CognitiveProducer =
  | 'ENG-00'
  | 'ENG-01'
  | 'ENG-02'
  | 'ENG-03'
  | 'ENG-04'
  | 'ENG-05'
  | 'ENG-06'
  | 'ENG-07'
  | 'ENG-08'
  | 'ENG-09'
  | 'ENG-10'
  | 'teacher'
  | 'system';

export interface CognitiveLineageRef {
  readonly objectType: CognitiveObjectId;
  readonly objectId: string;
}

export interface CognitiveObjectEnvelope {
  readonly objectType: CognitiveObjectId;
  readonly objectId: string;
  readonly schemaVersion: string;
  readonly correlationId: string;
  readonly causationId?: string;
  readonly producedBy: CognitiveProducer;
  readonly authorityClass: CognitiveAuthorityClass;
  readonly lifecycleState: string;
  readonly confidence: CognitiveConfidence;
  readonly lineage: readonly CognitiveLineageRef[];
  readonly createdAt: string;
  readonly unsupportedMarks?: readonly string[];
}

export interface CognitiveObjectValidationIssue {
  readonly code: string;
  readonly message: string;
  readonly severity: 'error' | 'warning';
}

export interface CognitiveObjectValidationResult {
  readonly ok: boolean;
  readonly issues: readonly CognitiveObjectValidationIssue[];
}

export interface CognitiveObjectCatalogEntry {
  readonly objectType: CognitiveObjectId;
  readonly constitutionalName: string;
  readonly authorityClass: CognitiveAuthorityClass;
  readonly ownerProducer: CognitiveProducer;
}

const AUTHORITATIVE_TYPES: ReadonlySet<CognitiveObjectId> = new Set(['CO-10', 'CO-11']);

const MATERIAL_TRACE_TYPES: ReadonlySet<CognitiveObjectId> = new Set([
  'CO-07',
  'CO-08',
  'CO-10',
  'CO-12',
  'CO-13',
]);

const CONFIDENCE_RANK: Readonly<Record<CognitiveConfidence, number>> = {
  unknown: 0,
  low: 1,
  medium: 2,
  high: 3,
};

const AUTHORITY_BY_TYPE: Readonly<Record<CognitiveObjectId, CognitiveAuthorityClass>> = {
  'CO-01': 'situational',
  'CO-02': 'interpretive',
  'CO-03': 'interpretive',
  'CO-04': 'commitmental',
  'CO-05': 'evidence',
  'CO-06': 'evidence',
  'CO-07': 'commitmental',
  'CO-08': 'commitmental',
  'CO-09': 'critical',
  'CO-10': 'authoritative',
  'CO-11': 'authoritative',
  'CO-12': 'realized',
  'CO-13': 'realized',
  'CO-14': 'reflective',
  'CO-15': 'reflective',
  'CO-16': 'reflective',
  'CO-17': 'observational',
  'CO-18': 'observational',
  'CO-19': 'observational',
  'CO-20': 'observational',
};

/** Normative catalog metadata (ES-007 §3). */
export const COGNITIVE_OBJECT_CATALOG: readonly CognitiveObjectCatalogEntry[] = [
  { objectType: 'CO-01', constitutionalName: 'Working Context', authorityClass: 'situational', ownerProducer: 'ENG-01' },
  { objectType: 'CO-02', constitutionalName: 'Educational Intent', authorityClass: 'interpretive', ownerProducer: 'ENG-03' },
  { objectType: 'CO-03', constitutionalName: 'Pedagogical Understanding', authorityClass: 'interpretive', ownerProducer: 'ENG-04' },
  { objectType: 'CO-04', constitutionalName: 'Instructional Strategy', authorityClass: 'commitmental', ownerProducer: 'ENG-05' },
  { objectType: 'CO-05', constitutionalName: 'Knowledge Package', authorityClass: 'evidence', ownerProducer: 'ENG-02' },
  { objectType: 'CO-06', constitutionalName: 'Unsupported Mark', authorityClass: 'evidence', ownerProducer: 'ENG-02' },
  { objectType: 'CO-07', constitutionalName: 'Instructional Blueprint', authorityClass: 'commitmental', ownerProducer: 'ENG-06' },
  { objectType: 'CO-08', constitutionalName: 'Blueprint Version', authorityClass: 'commitmental', ownerProducer: 'ENG-06' },
  { objectType: 'CO-09', constitutionalName: 'Validation Report', authorityClass: 'critical', ownerProducer: 'ENG-07' },
  { objectType: 'CO-10', constitutionalName: 'Teacher Approval', authorityClass: 'authoritative', ownerProducer: 'teacher' },
  { objectType: 'CO-11', constitutionalName: 'Generate Authorization', authorityClass: 'authoritative', ownerProducer: 'teacher' },
  { objectType: 'CO-12', constitutionalName: 'Generation Package', authorityClass: 'realized', ownerProducer: 'ENG-08' },
  { objectType: 'CO-13', constitutionalName: 'Generated Resource', authorityClass: 'realized', ownerProducer: 'ENG-08' },
  { objectType: 'CO-14', constitutionalName: 'Reflection Record', authorityClass: 'reflective', ownerProducer: 'ENG-09' },
  { objectType: 'CO-15', constitutionalName: 'Memory Proposal', authorityClass: 'reflective', ownerProducer: 'ENG-09' },
  { objectType: 'CO-16', constitutionalName: 'Memory Item', authorityClass: 'reflective', ownerProducer: 'ENG-10' },
  { objectType: 'CO-17', constitutionalName: 'Pipeline Position', authorityClass: 'observational', ownerProducer: 'ENG-00' },
  { objectType: 'CO-18', constitutionalName: 'Reasoning Trace', authorityClass: 'observational', ownerProducer: 'ENG-00' },
  { objectType: 'CO-19', constitutionalName: 'Confidence Record', authorityClass: 'observational', ownerProducer: 'system' },
  { objectType: 'CO-20', constitutionalName: 'Cognitive Act', authorityClass: 'observational', ownerProducer: 'ENG-00' },
] as const;

export function expectedAuthorityClass(
  objectType: CognitiveObjectId,
): CognitiveAuthorityClass {
  return AUTHORITY_BY_TYPE[objectType];
}

export function catalogEntry(
  objectType: CognitiveObjectId,
): CognitiveObjectCatalogEntry {
  const entry = COGNITIVE_OBJECT_CATALOG.find((e) => e.objectType === objectType);
  if (!entry) {
    throw new Error(`Unknown Cognitive Object ${objectType}`);
  }
  return entry;
}

function minConfidence(
  values: readonly CognitiveConfidence[],
): CognitiveConfidence {
  if (values.length === 0) return 'unknown';
  let min = values[0]!;
  for (const v of values) {
    if (CONFIDENCE_RANK[v] < CONFIDENCE_RANK[min]) min = v;
  }
  return min;
}

/** MVP envelope checks — pure, no I/O. COV-01, COV-02. */
export function validateCognitiveObjectEnvelopeMvp(
  obj: CognitiveObjectEnvelope,
): CognitiveObjectValidationResult {
  const issues: CognitiveObjectValidationIssue[] = [];

  if (!obj.objectType || !obj.objectId) {
    issues.push({
      code: 'COV-01',
      message: 'objectType and objectId are required',
      severity: 'error',
    });
  }
  if (!obj.schemaVersion || !obj.correlationId || !obj.producedBy) {
    issues.push({
      code: 'COV-01',
      message: 'schemaVersion, correlationId, and producedBy are required',
      severity: 'error',
    });
  }
  if (!obj.lifecycleState || !obj.confidence || !obj.createdAt) {
    issues.push({
      code: 'COV-01',
      message: 'lifecycleState, confidence, and createdAt are required',
      severity: 'error',
    });
  }
  if (!Array.isArray(obj.lineage)) {
    issues.push({
      code: 'COV-01',
      message: 'lineage must be an array',
      severity: 'error',
    });
  }

  if (
    obj.objectType &&
    obj.authorityClass !== expectedAuthorityClass(obj.objectType)
  ) {
    issues.push({
      code: 'COV-01',
      message: `authorityClass mismatch for ${obj.objectType}`,
      severity: 'error',
    });
  }

  if (AUTHORITATIVE_TYPES.has(obj.objectType) && obj.producedBy !== 'teacher') {
    issues.push({
      code: 'COV-02',
      message: `${obj.objectType} must be producedBy teacher`,
      severity: 'error',
    });
  }

  return { ok: issues.every((i) => i.severity !== 'error'), issues };
}

/** COV-03 — Generation Package requires Approval (+ Authorize when required). */
export function validateGenerationPackageCouplingMvp(
  generationPackage: CognitiveObjectEnvelope,
  requireGenerateAuthorization = true,
): CognitiveObjectValidationResult {
  const base = validateCognitiveObjectEnvelopeMvp(generationPackage);
  const issues = [...base.issues];

  if (generationPackage.objectType !== 'CO-12') {
    issues.push({
      code: 'COV-03',
      message: 'Expected CO-12 Generation Package',
      severity: 'error',
    });
  }

  const types = new Set(generationPackage.lineage.map((l) => l.objectType));
  if (!types.has('CO-08')) {
    issues.push({
      code: 'COV-03',
      message: 'CO-12 requires lineage to CO-08 Blueprint Version',
      severity: 'error',
    });
  }
  if (!types.has('CO-10')) {
    issues.push({
      code: 'COV-03',
      message: 'CO-12 requires lineage to CO-10 Teacher Approval',
      severity: 'error',
    });
  }
  if (requireGenerateAuthorization && !types.has('CO-11')) {
    issues.push({
      code: 'COV-03',
      message: 'CO-12 requires lineage to CO-11 Generate Authorization',
      severity: 'error',
    });
  }

  return { ok: issues.every((i) => i.severity !== 'error'), issues };
}

/** COV-04 — Blueprint compose requires Strategy lineage. */
export function validateBlueprintComposeCouplingMvp(
  blueprint: CognitiveObjectEnvelope,
): CognitiveObjectValidationResult {
  const base = validateCognitiveObjectEnvelopeMvp(blueprint);
  const issues = [...base.issues];
  if (blueprint.objectType !== 'CO-07' && blueprint.objectType !== 'CO-08') {
    issues.push({
      code: 'COV-04',
      message: 'Expected CO-07 or CO-08',
      severity: 'error',
    });
  }
  const types = new Set(blueprint.lineage.map((l) => l.objectType));
  if (!types.has('CO-04')) {
    issues.push({
      code: 'COV-04',
      message: 'Blueprint requires lineage to CO-04 Instructional Strategy',
      severity: 'error',
    });
  }
  return { ok: issues.every((i) => i.severity !== 'error'), issues };
}

/** COV-05 — Strategy confirm requires Understanding Ready lineage. */
export function validateStrategyConfirmCouplingMvp(
  strategy: CognitiveObjectEnvelope,
): CognitiveObjectValidationResult {
  const base = validateCognitiveObjectEnvelopeMvp(strategy);
  const issues = [...base.issues];
  if (strategy.objectType !== 'CO-04') {
    issues.push({
      code: 'COV-05',
      message: 'Expected CO-04 Instructional Strategy',
      severity: 'error',
    });
  }
  if (strategy.lifecycleState === 'confirmed') {
    const types = new Set(strategy.lineage.map((l) => l.objectType));
    if (!types.has('CO-03')) {
      issues.push({
        code: 'COV-05',
        message: 'Confirmed CO-04 requires lineage to CO-03 Pedagogical Understanding',
        severity: 'error',
      });
    }
    if (strategy.producedBy !== 'teacher') {
      issues.push({
        code: 'COV-05',
        message: 'Confirmed CO-04 must be producedBy teacher (Select)',
        severity: 'error',
      });
    }
  }
  return { ok: issues.every((i) => i.severity !== 'error'), issues };
}

/** COV-06 — Knowledge Package and Memory Item must not share objectId. */
export function validateKnowledgeMemorySeparationMvp(
  knowledgePackage: CognitiveObjectEnvelope,
  memoryItem: CognitiveObjectEnvelope,
): CognitiveObjectValidationResult {
  const issues: CognitiveObjectValidationIssue[] = [];
  const k = validateCognitiveObjectEnvelopeMvp(knowledgePackage);
  const m = validateCognitiveObjectEnvelopeMvp(memoryItem);
  issues.push(...k.issues, ...m.issues);

  if (knowledgePackage.objectType !== 'CO-05') {
    issues.push({
      code: 'COV-06',
      message: 'Expected CO-05 Knowledge Package',
      severity: 'error',
    });
  }
  if (memoryItem.objectType !== 'CO-16') {
    issues.push({
      code: 'COV-06',
      message: 'Expected CO-16 Memory Item',
      severity: 'error',
    });
  }
  if (
    knowledgePackage.objectId &&
    memoryItem.objectId &&
    knowledgePackage.objectId === memoryItem.objectId
  ) {
    issues.push({
      code: 'COV-06',
      message: 'CO-05 and CO-16 must not share objectId',
      severity: 'error',
    });
  }

  return { ok: issues.every((i) => i.severity !== 'error'), issues };
}

/** COV-07 — Validation Report cannot grant Approval. */
export function validateValidationDoesNotApproveMvp(
  validationReport: CognitiveObjectEnvelope,
  claimedApprovalTransition: boolean,
): CognitiveObjectValidationResult {
  const base = validateCognitiveObjectEnvelopeMvp(validationReport);
  const issues = [...base.issues];
  if (validationReport.objectType !== 'CO-09') {
    issues.push({
      code: 'COV-07',
      message: 'Expected CO-09 Validation Report',
      severity: 'error',
    });
  }
  if (claimedApprovalTransition) {
    issues.push({
      code: 'COV-07',
      message: 'CO-09 cannot transition any object to approved',
      severity: 'error',
    });
  }
  return { ok: issues.every((i) => i.severity !== 'error'), issues };
}

/**
 * COV-09 — Material objects require a Reasoning Trace ref in lineage
 * (or an accompanying trace object sharing correlationId).
 */
export function validateMaterialTraceCouplingMvp(
  material: CognitiveObjectEnvelope,
  reasoningTrace?: CognitiveObjectEnvelope,
): CognitiveObjectValidationResult {
  const base = validateCognitiveObjectEnvelopeMvp(material);
  const issues = [...base.issues];

  if (!MATERIAL_TRACE_TYPES.has(material.objectType)) {
    return { ok: issues.every((i) => i.severity !== 'error'), issues };
  }

  const lineageHasTrace = material.lineage.some((l) => l.objectType === 'CO-18');
  const companionOk =
    reasoningTrace !== undefined &&
    reasoningTrace.objectType === 'CO-18' &&
    reasoningTrace.correlationId === material.correlationId &&
    validateCognitiveObjectEnvelopeMvp(reasoningTrace).ok;

  if (!lineageHasTrace && !companionOk) {
    issues.push({
      code: 'COV-09',
      message: `${material.objectType} requires CO-18 Reasoning Trace lineage or companion`,
      severity: 'error',
    });
  }

  return { ok: issues.every((i) => i.severity !== 'error'), issues };
}

/** COV-10 — Downstream confidence ≤ min(upstream material confidences). */
export function validateConfidencePropagationMvp(
  downstream: CognitiveObjectEnvelope,
  upstream: readonly CognitiveObjectEnvelope[],
): CognitiveObjectValidationResult {
  const base = validateCognitiveObjectEnvelopeMvp(downstream);
  const issues = [...base.issues];

  for (const u of upstream) {
    const ur = validateCognitiveObjectEnvelopeMvp(u);
    issues.push(...ur.issues);
    if (u.correlationId !== downstream.correlationId) {
      issues.push({
        code: 'COV-10',
        message: 'Upstream and downstream correlationId must match',
        severity: 'error',
      });
    }
  }

  if (upstream.length > 0) {
    const ceiling = minConfidence(upstream.map((u) => u.confidence));
    if (CONFIDENCE_RANK[downstream.confidence] > CONFIDENCE_RANK[ceiling]) {
      issues.push({
        code: 'COV-10',
        message: `Downstream confidence ${downstream.confidence} exceeds upstream ceiling ${ceiling}`,
        severity: 'error',
      });
    }
  }

  return { ok: issues.every((i) => i.severity !== 'error'), issues };
}
