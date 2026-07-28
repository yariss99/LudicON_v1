import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  createWorkflowEngine,
  LESSON_CREATION_WORKFLOW,
  resolveTransition,
  WORKFLOW_TRANSITIONS,
} from '../index.js';
import type { WorkflowActor } from '../types.js';

const teacher: WorkflowActor = { role: 'teacher', id: 'teacher-1' };
const system: WorkflowActor = { role: 'system', id: 'gen-adapter' };
const ai: WorkflowActor = { role: 'ai', id: 'assistant' };

describe('WorkflowEngine — state machine', () => {
  it('rejects Completed → Generate', () => {
    const engine = createWorkflowEngine();
    const session = engine.startWorkflow({
      definition: LESSON_CREATION_WORKFLOW,
      teacher: { teacherId: 'teacher-1' },
      actor: teacher,
    });

    // Drive to Completed
    engine.dispatch(session.workflowId, 'LoadContext', teacher);
    engine.dispatch(session.workflowId, 'PlanningCompleted', system);
    engine.dispatch(session.workflowId, 'Generate', teacher);
    engine.dispatch(session.workflowId, 'GenerationCompleted', system);
    engine.dispatch(session.workflowId, 'ValidationPassed', system);
    engine.dispatch(session.workflowId, 'ValidationPassed', teacher); // Reviewing → Ready
    engine.complete(session.workflowId, teacher);

    assert.equal(engine.getCurrentState(session.workflowId), 'Completed');
    assert.equal(resolveTransition('Completed', 'Generate'), undefined);
    assert.throws(
      () => engine.dispatch(session.workflowId, 'Generate', teacher),
      (err: Error & { code?: string }) => err.code === 'INVALID_TRANSITION',
    );
  });

  it('runs the happy path for lesson creation without kind-specific logic', () => {
    const engine = createWorkflowEngine();
    const emitted: string[] = [];
    engine.subscribe((e) => emitted.push(e.type));

    const session = engine.startWorkflow({
      definition: LESSON_CREATION_WORKFLOW,
      teacher: { teacherId: 'teacher-1', displayName: 'Ana' },
      actor: teacher,
      payload: {
        contextPatch: { projectId: 'proj-1', lessonId: 'lesson-1' },
      },
    });

    assert.equal(session.state, 'Initializing');
    assert.equal(session.context.projectId, 'proj-1');

    engine.dispatch(session.workflowId, 'LoadContext', teacher, {
      contextPatch: {
        temporaryMemory: { curriculumPack: 'ro-primary' },
      },
    });
    engine.dispatch(session.workflowId, 'PlanningCompleted', system);
    engine.dispatch(session.workflowId, 'Generate', teacher);
    engine.dispatch(session.workflowId, 'GenerationCompleted', system);
    engine.dispatch(session.workflowId, 'ValidationPassed', system);
    assert.equal(engine.getCurrentState(session.workflowId), 'Reviewing');

    engine.dispatch(session.workflowId, 'ValidationPassed', teacher);
    assert.equal(engine.getCurrentState(session.workflowId), 'Ready');

    engine.dispatch(session.workflowId, 'Publish', teacher);
    engine.complete(session.workflowId, teacher);
    assert.equal(engine.getCurrentState(session.workflowId), 'Completed');

    const final = engine.getSession(session.workflowId);
    assert.ok(final.history.entries.length >= 8);
    assert.equal(final.history.entries[0]?.event, 'CreateWorkflow');
    assert.ok(emitted.includes('completed'));
  });

  it('forbids AI from dispatching state changes', () => {
    const engine = createWorkflowEngine();
    const session = engine.startWorkflow({
      definition: LESSON_CREATION_WORKFLOW,
      teacher: { teacherId: 'teacher-1' },
      actor: teacher,
    });
    assert.throws(
      () => engine.dispatch(session.workflowId, 'LoadContext', ai),
      (err: Error & { code?: string }) => err.code === 'AI_FORBIDDEN',
    );
  });

  it('supports Edit → SaveDraft and rollback', () => {
    const engine = createWorkflowEngine();
    const session = engine.startWorkflow({
      definition: LESSON_CREATION_WORKFLOW,
      teacher: { teacherId: 'teacher-1' },
      actor: teacher,
    });
    engine.dispatch(session.workflowId, 'LoadContext', teacher);
    engine.dispatch(session.workflowId, 'PlanningCompleted', system);
    engine.dispatch(session.workflowId, 'Generate', teacher);
    engine.dispatch(session.workflowId, 'GenerationCompleted', system);
    engine.dispatch(session.workflowId, 'ValidationFailed', system);
    assert.equal(engine.getCurrentState(session.workflowId), 'Editing');

    engine.dispatch(session.workflowId, 'SaveDraft', teacher, {
      metadata: { draftRev: 1 },
    });
    assert.equal(engine.getCurrentState(session.workflowId), 'Editing');

    const before = engine.getCurrentState(session.workflowId);
    const rolled = engine.rollback(session.workflowId, teacher);
    assert.equal(before, 'Editing');
    assert.equal(rolled.entry.event, 'Restore');
    assert.ok(rolled.session.history.entries.length > 0);
  });

  it('exposes available actions from the transition table', () => {
    const engine = createWorkflowEngine();
    const session = engine.startWorkflow({
      definition: LESSON_CREATION_WORKFLOW,
      teacher: { teacherId: 'teacher-1' },
      actor: teacher,
    });
    const actions = engine.getAvailableActions(session.workflowId);
    assert.ok(actions.includes('LoadContext'));
    assert.ok(actions.includes('Cancel'));
    assert.ok(!actions.includes('Generate'));
  });

  it('keeps a single transition table for all workflow kinds', () => {
    assert.ok(WORKFLOW_TRANSITIONS.length > 10);
    assert.equal(resolveTransition('Idle', 'CreateWorkflow'), 'Initializing');
    assert.equal(resolveTransition('Completed', 'Generate'), undefined);
  });
});
