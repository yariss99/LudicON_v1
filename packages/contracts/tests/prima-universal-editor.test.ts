import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  PRIMA_UPE_SCHEMA_VERSION,
  UPE_OBJECT_PROFILES,
  defaultUpeWorkspaceChrome,
  getUpeObjectProfile,
} from '../dist/prima-universal-editor.js';

describe('Universal Pedagogical Editor contracts (FEATURE-004)', () => {
  it('registers open object profiles for the single editor', () => {
    assert.equal(PRIMA_UPE_SCHEMA_VERSION, '1.0.0');
    assert.ok(UPE_OBJECT_PROFILES.length >= 10);
    assert.ok(getUpeObjectProfile('worksheet'));
    assert.ok(getUpeObjectProfile('escape_room'));
  });

  it('provides default five-zone chrome state', () => {
    const chrome = defaultUpeWorkspaceChrome();
    assert.equal(chrome.leftTab, 'structure');
    assert.equal(chrome.previewMode, 'student');
    assert.equal(chrome.selection.blockId, null);
  });
});
