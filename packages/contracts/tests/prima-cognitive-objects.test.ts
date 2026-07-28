import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  COGNITIVE_OBJECT_CATALOG,
  PRIMA_COGNITIVE_OBJECT_SCHEMA_VERSION,
  expectedAuthorityClass,
  validateBlueprintComposeCouplingMvp,
  validateCognitiveObjectEnvelopeMvp,
  validateConfidencePropagationMvp,
  validateGenerationPackageCouplingMvp,
  validateKnowledgeMemorySeparationMvp,
  validateMaterialTraceCouplingMvp,
  validateStrategyConfirmCouplingMvp,
  validateValidationDoesNotApproveMvp,
  type CognitiveObjectEnvelope,
} from '../dist/prima-cognitive-objects.js';

function base(
  partial: Partial<CognitiveObjectEnvelope> &
    Pick<
      CognitiveObjectEnvelope,
      'objectType' | 'objectId' | 'producedBy' | 'authorityClass' | 'lifecycleState'
    >,
): CognitiveObjectEnvelope {
  return {
    schemaVersion: PRIMA_COGNITIVE_OBJECT_SCHEMA_VERSION,
    correlationId: 'corr-1',
    confidence: 'medium',
    lineage: [],
    createdAt: new Date().toISOString(),
    ...partial,
  };
}

describe('Cognitive Objects MVP validation', () => {
  it('catalog covers CO-01…CO-20', () => {
    assert.equal(COGNITIVE_OBJECT_CATALOG.length, 20);
    assert.equal(expectedAuthorityClass('CO-10'), 'authoritative');
  });

  it('accepts a valid Working Context envelope', () => {
    const obj = base({
      objectType: 'CO-01',
      objectId: 'ctx-1',
      producedBy: 'ENG-01',
      authorityClass: expectedAuthorityClass('CO-01'),
      lifecycleState: 'sufficient',
    });
    const r = validateCognitiveObjectEnvelopeMvp(obj);
    assert.equal(r.ok, true, r.issues.map((i) => i.message).join('; '));
  });

  it('rejects AI-produced Teacher Approval', () => {
    const obj = base({
      objectType: 'CO-10',
      objectId: 'appr-1',
      producedBy: 'ENG-06',
      authorityClass: 'authoritative',
      lifecycleState: 'granted',
    });
    const r = validateCognitiveObjectEnvelopeMvp(obj);
    assert.equal(r.ok, false);
    assert.ok(r.issues.some((i) => i.code === 'COV-02'));
  });

  it('rejects Generation Package without Approval lineage', () => {
    const obj = base({
      objectType: 'CO-12',
      objectId: 'gen-1',
      producedBy: 'ENG-08',
      authorityClass: 'realized',
      lifecycleState: 'produced',
      lineage: [{ objectType: 'CO-08', objectId: 'bv-1' }],
    });
    const r = validateGenerationPackageCouplingMvp(obj);
    assert.equal(r.ok, false);
    assert.ok(r.issues.some((i) => i.code === 'COV-03'));
  });

  it('accepts Generation Package with Approval and Authorize lineage', () => {
    const obj = base({
      objectType: 'CO-12',
      objectId: 'gen-2',
      producedBy: 'ENG-08',
      authorityClass: 'realized',
      lifecycleState: 'produced',
      lineage: [
        { objectType: 'CO-08', objectId: 'bv-1' },
        { objectType: 'CO-10', objectId: 'appr-1' },
        { objectType: 'CO-11', objectId: 'auth-1' },
      ],
    });
    const r = validateGenerationPackageCouplingMvp(obj);
    assert.equal(r.ok, true, r.issues.map((i) => i.message).join('; '));
  });

  it('rejects Blueprint without Strategy lineage', () => {
    const obj = base({
      objectType: 'CO-07',
      objectId: 'bp-1',
      producedBy: 'ENG-06',
      authorityClass: 'commitmental',
      lifecycleState: 'draft',
      lineage: [{ objectType: 'CO-03', objectId: 'u-1' }],
    });
    const r = validateBlueprintComposeCouplingMvp(obj);
    assert.equal(r.ok, false);
    assert.ok(r.issues.some((i) => i.code === 'COV-04'));
  });

  it('rejects confirmed Strategy without Understanding lineage', () => {
    const obj = base({
      objectType: 'CO-04',
      objectId: 'st-1',
      producedBy: 'teacher',
      authorityClass: 'commitmental',
      lifecycleState: 'confirmed',
      lineage: [],
    });
    const r = validateStrategyConfirmCouplingMvp(obj);
    assert.equal(r.ok, false);
    assert.ok(r.issues.some((i) => i.code === 'COV-05'));
  });

  it('rejects Knowledge Package and Memory Item sharing objectId', () => {
    const k = base({
      objectType: 'CO-05',
      objectId: 'same-id',
      producedBy: 'ENG-02',
      authorityClass: 'evidence',
      lifecycleState: 'assembled',
    });
    const m = base({
      objectType: 'CO-16',
      objectId: 'same-id',
      producedBy: 'ENG-10',
      authorityClass: 'reflective',
      lifecycleState: 'active',
    });
    const r = validateKnowledgeMemorySeparationMvp(k, m);
    assert.equal(r.ok, false);
    assert.ok(r.issues.some((i) => i.code === 'COV-06'));
  });

  it('rejects Validation Report used as Approval transition', () => {
    const obj = base({
      objectType: 'CO-09',
      objectId: 'vr-1',
      producedBy: 'ENG-07',
      authorityClass: 'critical',
      lifecycleState: 'succeeded',
    });
    const r = validateValidationDoesNotApproveMvp(obj, true);
    assert.equal(r.ok, false);
    assert.ok(r.issues.some((i) => i.code === 'COV-07'));
  });

  it('requires Reasoning Trace for material Blueprint Version', () => {
    const obj = base({
      objectType: 'CO-08',
      objectId: 'bv-1',
      producedBy: 'ENG-06',
      authorityClass: 'commitmental',
      lifecycleState: 'minted',
      lineage: [{ objectType: 'CO-04', objectId: 'st-1' }],
    });
    const r = validateMaterialTraceCouplingMvp(obj);
    assert.equal(r.ok, false);
    assert.ok(r.issues.some((i) => i.code === 'COV-09'));
  });

  it('rejects confidence inflation downstream', () => {
    const up = base({
      objectType: 'CO-05',
      objectId: 'kp-1',
      producedBy: 'ENG-02',
      authorityClass: 'evidence',
      lifecycleState: 'assembled',
      confidence: 'low',
    });
    const down = base({
      objectType: 'CO-03',
      objectId: 'u-1',
      producedBy: 'ENG-04',
      authorityClass: 'interpretive',
      lifecycleState: 'ready',
      confidence: 'high',
      lineage: [{ objectType: 'CO-05', objectId: 'kp-1' }],
    });
    const r = validateConfidencePropagationMvp(down, [up]);
    assert.equal(r.ok, false);
    assert.ok(r.issues.some((i) => i.code === 'COV-10'));
  });
});
