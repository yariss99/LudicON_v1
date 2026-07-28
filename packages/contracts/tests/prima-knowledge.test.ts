import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  PRIMA_KNOWLEDGE_SCHEMA_VERSION,
  validateKnowledgeObjectMvp,
  validateKnowledgePackMvp,
  validateKnowledgePackageMvp,
  type KnowledgeObject,
  type KnowledgePack,
  type KnowledgePackage,
} from '../dist/prima-knowledge.js';

describe('PrimaKnowledge MVP validation', () => {
  it('accepts a published curriculum pack', () => {
    const pack: KnowledgePack = {
      packId: 'ro-curriculum',
      domain: 'curriculum',
      version: '1.0.0',
      schemaVersion: PRIMA_KNOWLEDGE_SCHEMA_VERSION,
      trustLevel: 'authoritative',
      lifecycleState: 'published',
      objectIds: ['obj-1'],
    };
    const result = validateKnowledgePackMvp(pack);
    assert.equal(result.ok, true, result.issues.map((i) => i.message).join('; '));
  });

  it('rejects student domain packs', () => {
    const pack: KnowledgePack = {
      packId: 'students',
      domain: 'student',
      version: '1.0.0',
      schemaVersion: PRIMA_KNOWLEDGE_SCHEMA_VERSION,
      trustLevel: 'authoritative',
      lifecycleState: 'published',
      objectIds: ['x'],
    };
    const result = validateKnowledgePackMvp(pack);
    assert.equal(result.ok, false);
    assert.ok(result.issues.some((i) => i.code === 'KD_STUDENT_FORBIDDEN'));
  });

  it('requires provenance or unsupported on packages', () => {
    const pkg: KnowledgePackage = {
      packageId: 'pkg-1',
      correlationId: 'c1',
      pinnedPackVersions: [{ packId: 'ro-curriculum', version: '1.0.0' }],
      objects: [
        { objectId: 'obj-1', packId: 'ro-curriculum', packVersion: '1.0.0' },
      ],
      provenanceComplete: false,
      unsupportedMarked: false,
      assembledAt: new Date().toISOString(),
      domainScope: ['curriculum'],
    };
    const result = validateKnowledgePackageMvp(pkg);
    assert.equal(result.ok, false);
    assert.ok(result.issues.some((i) => i.code === 'KPKG_PROVENANCE'));
  });

  it('requires provenance on authoritative objects', () => {
    const object: KnowledgeObject = {
      objectId: 'obj-1',
      domain: 'curriculum',
      title: 'Competency A',
      structure: 'structured',
      origin: 'curated',
      trustLevel: 'authoritative',
      schemaVersion: PRIMA_KNOWLEDGE_SCHEMA_VERSION,
      provenance: [],
      payload: {},
    };
    const result = validateKnowledgeObjectMvp(object);
    assert.equal(result.ok, false);
    assert.ok(result.issues.some((i) => i.code === 'KO_PROVENANCE'));
  });
});
