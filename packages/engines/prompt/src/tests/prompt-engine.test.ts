import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createPromptEngine } from '../prompt-engine.js';
import { PRIMA_CORE_CONTRACT_SCHEMA_VERSION } from '@prima/contracts';

describe('PromptEngine', () => {
  it('compiles a canonical PromptPackage with AST', () => {
    const engine = createPromptEngine();
    const result = engine.compile({
      intent: 'Draft a fractions lesson',
      educationalContext: {
        subject: 'Matematică',
        grade: 'Clasa a III-a',
        topic: 'Fracții',
        locale: 'ro-RO',
      },
      requestType: 'GenerateLesson',
    });
    assert.equal(result.ok, true);
    assert.equal(result.promptPackage.schemaVersion, PRIMA_CORE_CONTRACT_SCHEMA_VERSION);
    assert.ok(result.promptPackage.system.includes('PRIMA'));
    assert.ok(result.promptPackage.user.includes('Fracții'));
    assert.ok(result.promptPackage.ast.length >= 2);
  });

  it('fails closed without intent', () => {
    const engine = createPromptEngine();
    const result = engine.compile({
      intent: '  ',
      educationalContext: { topic: 'x' },
    });
    assert.equal(result.ok, false);
    assert.ok(result.errors.some((e) => e.includes('intent')));
  });
});
