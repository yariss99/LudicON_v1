import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  assertCatalogWorkflow,
  createDefaultWorkflowRegistry,
  createWorkflowEngine,
  PRIMA_WORKFLOW_CATALOG,
  toEngineDefinition,
  validateCatalogWorkflow,
  WF_CREATE_LESSON,
  ALL_CATALOG_WORKFLOWS,
} from '../index.js';

describe('Workflow Catalog', () => {
  it('contains unique executable workflow ids', () => {
    const registry = createDefaultWorkflowRegistry();
    const executable = registry.listExecutable();
    assert.ok(executable.length >= 15);
    const ids = new Set(executable.map((w) => w.id));
    assert.equal(ids.size, executable.length);
  });

  it('validates every executable workflow against the engine transition table', () => {
    for (const wf of ALL_CATALOG_WORKFLOWS) {
      if (wf.version === '0.0.0') continue;
      const issues = validateCatalogWorkflow(wf);
      assert.deepEqual(issues, [], `${wf.id}: ${JSON.stringify(issues)}`);
      assertCatalogWorkflow(wf);
    }
  });

  it('starts Create Lesson on the Workflow Engine via catalog definition', () => {
    const engine = createWorkflowEngine();
    const teacher = { role: 'teacher' as const, id: 't-1' };
    const definition = toEngineDefinition(WF_CREATE_LESSON);
    const session = engine.startWorkflow({
      definition,
      teacher: { teacherId: 't-1' },
      actor: teacher,
      payload: {
        contextPatch: {
          projectId: 'proj-1',
          temporaryMemory: {
            subject: 'Matematică',
            grade: 'Clasa a III-a',
          },
        },
      },
    });
    assert.equal(session.kind, 'create-lesson');
    assert.equal(session.state, 'Initializing');
    assert.equal(PRIMA_WORKFLOW_CATALOG.catalogVersion, '1.0.0');
  });

  it('resolves create-lesson from the registry', () => {
    const registry = createDefaultWorkflowRegistry();
    const wf = registry.get('create-lesson');
    assert.equal(wf.displayName, 'Create Lesson');
    assert.ok(wf.phases.some((p) => p.phaseId === 'select-subject'));
    assert.ok(wf.producedObjects.includes('Lesson'));
  });
});
