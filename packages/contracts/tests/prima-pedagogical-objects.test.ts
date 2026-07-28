import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  PEDAGOGICAL_OBJECT_TYPE_CATALOG,
  PRIMA_PEDAGOGICAL_OBJECT_SCHEMA_VERSION,
  assertExportIsDerivative,
  createPedagogicalBlock,
  emptyPedagogicalMetadata,
  rendererSupports,
  validatePedagogicalObjectMvp,
  type PedagogicalObject,
} from '../dist/prima-pedagogical-objects.js';

function sampleObject(
  overrides: Partial<PedagogicalObject> = {},
): PedagogicalObject {
  const now = new Date().toISOString();
  return {
    id: 'pom_1',
    schemaVersion: PRIMA_PEDAGOGICAL_OBJECT_SCHEMA_VERSION,
    objectType: 'worksheet',
    title: 'Fișă — Fracții echivalente',
    description: '',
    subject: 'Matematică',
    grade: 'Clasa a IV-a',
    lessonReference: {
      lessonProjectId: 'lesson_1',
      lessonVersionId: 'v3',
    },
    competencies: [{ id: 'c1', label: 'Operarea cu fracții' }],
    learningObjectives: [{ id: 'o1', statement: 'Recunoaște fracții echivalente' }],
    difficulty: 'medium',
    estimatedTime: 15,
    author: { id: 't1', displayName: 'Profesor', kind: 'teacher' },
    createdAt: now,
    updatedAt: now,
    tags: ['fracții'],
    language: 'ro',
    status: 'draft',
    version: '1',
    blocks: [
      createPedagogicalBlock({
        id: 'b1',
        type: 'heading',
        content: { text: 'Fracții echivalente' },
        layout: { order: 0 },
      }),
      createPedagogicalBlock({
        id: 'b2',
        type: 'exercise',
        content: { prompt: 'Completează perechile.' },
        layout: { order: 1 },
        pedagogicalPurpose: 'practice',
      }),
    ],
    pedagogy: emptyPedagogicalMetadata(),
    relationships: [{ kind: 'lesson', targetId: 'lesson_1' }],
    validation: null,
    ...overrides,
  };
}

describe('Pedagogical Object Model (FEATURE-002)', () => {
  it('catalog covers the v1 object types', () => {
    assert.equal(PEDAGOGICAL_OBJECT_TYPE_CATALOG.length, 15);
    assert.ok(PEDAGOGICAL_OBJECT_TYPE_CATALOG.some((e) => e.objectType === 'worksheet'));
  });

  it('accepts a valid draft worksheet', () => {
    const result = validatePedagogicalObjectMvp(sampleObject());
    assert.equal(result.ok, true, result.issues.map((i) => i.message).join('; '));
    assert.equal(result.exportReady, true);
  });

  it('rejects missing title and empty blocks', () => {
    const result = validatePedagogicalObjectMvp(
      sampleObject({ title: '  ', blocks: [] }),
    );
    assert.equal(result.ok, false);
    assert.ok(result.issues.some((i) => i.code === 'POM-V-002'));
    assert.ok(result.issues.some((i) => i.code === 'POM-V-004'));
  });

  it('rejects unresolved block dependencies', () => {
    const result = validatePedagogicalObjectMvp(
      sampleObject({
        blocks: [
          createPedagogicalBlock({
            id: 'b1',
            type: 'hint',
            dependencies: [{ blockId: 'missing' }],
          }),
        ],
      }),
    );
    assert.equal(result.ok, false);
    assert.ok(result.issues.some((i) => i.code === 'POM-V-007'));
  });

  it('warns on image without alt text', () => {
    const result = validatePedagogicalObjectMvp(
      sampleObject({
        blocks: [
          createPedagogicalBlock({
            id: 'img1',
            type: 'image',
            content: { src: 'media://x' },
          }),
        ],
      }),
    );
    assert.equal(result.ok, true);
    assert.ok(result.issues.some((i) => i.code === 'POM-V-008'));
  });

  it('requires subject/grade/language when ready', () => {
    const result = validatePedagogicalObjectMvp(
      sampleObject({ status: 'ready', subject: '', grade: '', language: '' }),
    );
    assert.equal(result.ok, false);
    assert.ok(result.issues.some((i) => i.code === 'POM-V-011'));
    assert.ok(result.issues.some((i) => i.code === 'POM-V-012'));
    assert.ok(result.issues.some((i) => i.code === 'POM-V-013'));
  });

  it('treats export artifacts as derivatives of object versions', () => {
    const issues = assertExportIsDerivative({
      format: 'pdf',
      rendererId: 'pdf-v1',
      objectId: 'pom_1',
      objectVersionId: 'ver_1',
      createdAt: new Date().toISOString(),
      contentType: 'application/pdf',
      locator: 'blob://tmp/out.pdf',
    });
    assert.equal(issues.length, 0);
  });

  it('allows open object types for future resources', () => {
    const result = validatePedagogicalObjectMvp(
      sampleObject({ objectType: 'future_lab_sheet' }),
    );
    assert.equal(result.ok, true);
  });

  it('checks renderer support against object type', () => {
    assert.equal(
      rendererSupports(
        { id: 'docx', formats: ['docx'], supportedObjectTypes: ['worksheet', 'rubric'] },
        'worksheet',
      ),
      true,
    );
    assert.equal(
      rendererSupports(
        { id: 'docx', formats: ['docx'], supportedObjectTypes: ['worksheet'] },
        'escape_room',
      ),
      false,
    );
    assert.equal(
      rendererSupports({ id: 'html', formats: ['html'], supportedObjectTypes: '*' }, 'mind_map'),
      true,
    );
  });
});
