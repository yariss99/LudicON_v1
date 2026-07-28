import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  createPdfExportTool,
  createSearchTool,
  createToolEngine,
  createTranslationTool,
} from '../index.js';

describe('ToolEngine', () => {
  it('executes PDF export under permissions and returns structured output', async () => {
    const engine = createToolEngine({
      sandboxPolicy: { allowNetwork: false },
    });
    engine.register(createPdfExportTool());
    engine.bindCapability('export.pdf', 'export.pdf.v1');

    const result = await engine.executeCapability('export.pdf', {
      action: 'export',
      input: { artifactId: 'art-1', title: 'Fracții' },
      context: {
        teacherId: 't-1',
        projectId: 'p-1',
        workflowId: 'wf-1',
        permissions: ['read', 'export'],
      },
    });

    assert.equal(result.status, 'succeeded');
    assert.ok(result.output.uri);
    assert.ok(engine.getMonitorSnapshot().successCount >= 1);
  });

  it('denies tools when permissions are missing', async () => {
    const engine = createToolEngine();
    engine.register(createPdfExportTool());

    const result = await engine.execute({
      toolId: 'export.pdf.v1',
      action: 'export',
      input: { artifactId: 'art-1', title: 'X' },
      context: {
        teacherId: 't-1',
        projectId: 'p-1',
        permissions: ['read'],
      },
    });

    assert.equal(result.status, 'denied');
    assert.ok(result.errors[0]?.includes('export'));
  });

  it('sandbox blocks external-access tools when network is disallowed', async () => {
    const engine = createToolEngine({
      sandboxPolicy: { allowNetwork: false },
    });
    engine.register(createSearchTool());

    const result = await engine.execute({
      toolId: 'search.web.v1',
      action: 'search',
      input: { query: 'fractions' },
      context: {
        teacherId: 't-1',
        permissions: ['read', 'external-access'],
      },
    });

    assert.equal(result.status, 'denied');
  });

  it('retries recoverable network failures', async () => {
    const engine = createToolEngine({
      sandboxPolicy: { allowNetwork: true },
    });
    engine.register(createSearchTool({ failTimes: 2 }));

    const result = await engine.execute({
      toolId: 'search.web.v1',
      action: 'search',
      input: { query: 'fractions primary' },
      context: {
        teacherId: 't-1',
        permissions: ['read', 'external-access'],
      },
    });

    assert.equal(result.status, 'succeeded');
    assert.equal(result.attempts, 3);
  });

  it('discovers tools by category without coupling to vendors', () => {
    const engine = createToolEngine();
    engine.register(createPdfExportTool());
    engine.register(createTranslationTool());
    const found = engine.discover({ category: 'translation' });
    assert.equal(found.length, 1);
    assert.equal(found[0]?.toolId, 'translate.text.v1');
  });
});
