import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  KNOWLEDGE_NODE_KIND_LABELS_RO,
  PRIMA_KHPM_SCHEMA_VERSION,
} from '../dist/prima-knowledge-hub.js';

describe('Knowledge Hub contracts (FEATURE-007)', () => {
  it('exposes schema and Romanian kind labels', () => {
    assert.equal(PRIMA_KHPM_SCHEMA_VERSION, '1.0.0');
    assert.equal(KNOWLEDGE_NODE_KIND_LABELS_RO.lesson_design, 'Proiect de lecție');
    assert.equal(KNOWLEDGE_NODE_KIND_LABELS_RO.reflection_note, 'Notă de reflecție');
  });
});
