import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  createMemoryEngine,
  rememberAiDecision,
  rememberLesson,
  rememberWorkflow,
} from '../core/index.js';

describe('MemoryEngine — structured educational memory', () => {
  it('creates versioned workflow memory and retrieves by workflow', () => {
    const engine = createMemoryEngine();
    const events: string[] = [];
    engine.getEventBus().subscribe((e) => events.push(e.type));

    const created = rememberWorkflow(engine, {
      actorId: 'teacher-1',
      context: { teacherId: 'teacher-1', projectId: 'proj-1' },
      payload: {
        workflowId: 'wf-1',
        workflowKind: 'create-lesson',
        currentState: 'Planning',
        completedSteps: ['LoadContext'],
      },
    });

    assert.equal(created.version, 1);
    assert.equal(created.memoryType, 'workflow');

    const updated = engine.update(created.memoryId, {
      actorId: 'system',
      payload: { currentState: 'Generating' },
      reason: 'state-transition',
    });
    assert.equal(updated.version, 2);
    assert.equal(engine.history(created.memoryId).length, 2);

    const hits = engine.searchByWorkflow('wf-1');
    assert.ok(hits.length >= 1);
    assert.ok(events.includes('MemoryCreated'));
    assert.ok(events.includes('MemoryUpdated'));
  });

  it('stores lesson memory with competencies and finds by competency', () => {
    const engine = createMemoryEngine();
    rememberLesson(engine, {
      actorId: 'teacher-1',
      context: {
        teacherId: 'teacher-1',
        projectId: 'proj-1',
        subject: 'Matematică',
      },
      payload: {
        lessonId: 'lesson-1',
        competencies: ['comp-fractions'],
        objectives: ['Compare unit fractions'],
        activities: ['Fraction strips'],
      },
    });

    const hits = engine.searchByCompetency('comp-fractions');
    assert.equal(hits.length, 1);
    assert.equal(hits[0]?.record.context.lessonId, 'lesson-1');
  });

  it('records AI decisions without storing chat transcripts', () => {
    const engine = createMemoryEngine();
    const mem = rememberAiDecision(engine, {
      actorId: 'system',
      context: {
        teacherId: 'teacher-1',
        workflowId: 'wf-1',
        projectId: 'proj-1',
      },
      payload: {
        requestId: 'req-1',
        provider: 'openai',
        model: 'gpt-4o-mini',
        requestType: 'GenerateLesson',
        resultSummary: { title: 'Fracții' },
        validationStatus: 'approved',
        validationScore: 88,
      },
    });
    assert.equal(mem.memoryType, 'ai-decision');
    assert.equal(
      (mem.payload as { chat?: unknown }).chat,
      undefined,
    );
  });

  it('supports snapshots for rollback / replay', () => {
    const engine = createMemoryEngine();
    const w = rememberWorkflow(engine, {
      actorId: 't-1',
      context: { teacherId: 't-1', workflowId: 'wf-9' },
      payload: {
        workflowId: 'wf-9',
        workflowKind: 'create-lesson',
        currentState: 'Ready',
      },
    });
    const snap = engine.createSnapshot({
      label: 'before-publish',
      createdBy: 't-1',
      memoryIds: [w.memoryId],
    });
    engine.update(w.memoryId, {
      actorId: 't-1',
      payload: { currentState: 'Publishing' },
    });
    const restored = engine.restoreSnapshot(snap.snapshotId, 't-1');
    assert.equal(restored[0]?.payload.currentState, 'Ready');
  });

  it('full-text search over structured fields', () => {
    const engine = createMemoryEngine();
    rememberLesson(engine, {
      actorId: 't-1',
      context: { teacherId: 't-1', subject: 'Matematică' },
      payload: {
        lessonId: 'l-2',
        objectives: ['Explore fractions with number lines'],
      },
    });
    const hits = engine.query({ text: 'fractions', teacherId: 't-1' });
    assert.ok(hits.length >= 1);
  });
});
