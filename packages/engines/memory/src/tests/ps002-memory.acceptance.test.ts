import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  ALL_MEMORY_DOMAINS,
  createTeacherMemoryPlatform,
} from '../index.js';

const teacherId = 'teacher-ana';
const source = {
  kind: 'teacher_explicit' as const,
  label: 'Teacher settings',
};

describe('PS-002 Memory Engine — acceptance', () => {
  it('teacher is never asked twice for stable information', () => {
    const mem = createTeacherMemoryPlatform();
    assert.equal(mem.isKnown(teacherId, 'preferredLanguage'), false);

    const profile = mem.upsertProfile(
      teacherId,
      {
        preferredLanguage: 'ro',
        preferredTone: 'warm',
        teachingStyle: 'collaborative',
        experienceLevel: 'experienced',
        preferredDigitalTools: ['proiector'],
        accessibilityPreferences: ['large text'],
      },
      source,
    );
    assert.ok(!('error' in profile));

    const known = mem.knownStableFields(teacherId);
    assert.ok(known.includes('preferredLanguage'));
    assert.ok(known.includes('teachingStyle'));
    assert.equal(mem.isKnown(teacherId, 'preferredLanguage'), true);
  });

  it('class profiles are reused automatically', () => {
    const mem = createTeacherMemoryPlatform();
    const created = mem.upsertClassProfile(
      teacherId,
      {
        classId: 'III-A',
        grade: 'Clasa a III-a',
        className: 'III A',
        numberOfStudents: 24,
        learningPace: 'steady',
        strengths: ['visual activities'],
        challenges: ['attention span'],
        differentiationNeeds: ['support tier'],
      },
      source,
    );
    assert.ok(!('error' in created));

    const retrieval = mem.retrieveForExperience({
      teacherId,
      classId: 'III-A',
      grade: 'Clasa a III-a',
      subject: 'Matematică',
    });
    assert.ok(retrieval.classProfile);
    assert.equal(retrieval.classProfile.payload.classId, 'III-A');
    assert.ok(
      retrieval.suggestions.some((s) =>
        s.message.includes('visual activities'),
      ),
    );
    assert.equal(retrieval.suggestions[0]?.optional, true);
    assert.equal(retrieval.suggestions[0]?.teacherDecides, true);
  });

  it('previous Blueprints are suggested when relevant', () => {
    const mem = createTeacherMemoryPlatform();
    const bp = mem.rememberBlueprint(
      teacherId,
      {
        blueprintId: 'bp-1',
        topic: 'Fracții unitare',
        subject: 'Matematică',
        grade: 'Clasa a III-a',
        competencies: ['Numerație'],
        objectives: ['Identifică o treime'],
        teachingStrategy: 'collaborative learning',
        generatedAssetIds: ['ws-1'],
        teacherFeedback: 'Worked well',
      },
      source,
    );
    assert.ok(!('error' in bp));

    const dup = mem.rememberBlueprint(
      teacherId,
      {
        blueprintId: 'bp-2',
        topic: 'Fracții unitare',
        subject: 'Matematică',
        grade: 'Clasa a III-a',
        teachingStrategy: 'stations',
      },
      source,
    );
    assert.ok(!('error' in dup));
    assert.equal(dup.id, bp.id, 'similar Blueprints must not duplicate');

    const retrieval = mem.retrieveForExperience({
      teacherId,
      subject: 'Matematică',
      grade: 'Clasa a III-a',
      topic: 'fracții',
    });
    assert.ok(retrieval.similarBlueprints.length > 0);
    assert.ok(
      retrieval.suggestions.some((s) => s.message.includes('similar Blueprint')),
    );
  });

  it('preferences improve generation quality signals', () => {
    const mem = createTeacherMemoryPlatform();
    const prefs = mem.upsertPedagogicalPreferences(
      teacherId,
      {
        instructionalModels: ['collaborative learning'],
        assessmentPreferences: ['formative assessment'],
        lessonDurationMinutes: 45,
        favoriteActivityTypes: ['hands-on'],
        preferredDigitalPlatforms: ['tablă interactivă'],
        differentiationHabits: ['support + extension'],
        feedbackStyle: 'encouraging',
      },
      source,
    );
    assert.ok(!('error' in prefs));

    const retrieval = mem.retrieveForExperience({
      teacherId,
      grade: 'Clasa a III-a',
      subject: 'Matematică',
    });
    assert.ok(retrieval.pedagogicalPreferences.length > 0);
    assert.ok(
      retrieval.suggestions.some((s) =>
        s.message.includes('formative assessment'),
      ),
    );
    assert.ok(
      retrieval.suggestions.some((s) =>
        s.message.includes('collaborative learning'),
      ),
    );
  });

  it('Working Memory and Long-Term Memory are clearly separated', () => {
    const mem = createTeacherMemoryPlatform();
    const session = mem.beginSession(teacherId);
    mem.working.update(session.sessionId, {
      currentBlueprintId: 'draft-1',
      conversationState: { step: 'objectives' },
      unsavedChanges: true,
    });
    mem.working.pushDecision(session.sessionId, 'Chose collaborative strategy');

    mem.upsertProfile(teacherId, { preferredLanguage: 'ro' }, source);

    const working = mem.getWorkingMemory(session.sessionId);
    assert.ok(working);
    assert.equal(working.currentBlueprintId, 'draft-1');
    assert.ok(working.recentDecisions.length > 0);

    const longTerm = mem.longTerm.list(teacherId);
    assert.ok(longTerm.every((i) => i.tier === 'long_term'));
    assert.ok(!longTerm.some((i) => 'scratchpad' in i.payload));

    assert.equal(mem.endSession(session.sessionId), true);
    assert.equal(mem.getWorkingMemory(session.sessionId), undefined);
    assert.ok(mem.longTerm.list(teacherId).length > 0);
  });

  it('teacher can inspect every stored memory', () => {
    const mem = createTeacherMemoryPlatform();
    mem.upsertProfile(teacherId, { preferredLanguage: 'ro' }, source);
    mem.upsertClassProfile(
      teacherId,
      { classId: 'II-B', grade: 'Clasa a II-a', className: 'II B' },
      source,
    );
    const items = mem.inspect(teacherId);
    assert.ok(items.length >= 2);
    for (const item of items) {
      assert.ok(item.source);
      assert.ok(typeof item.confidence === 'number');
      assert.ok(item.lastUpdated);
      assert.ok(typeof item.usageCount === 'number');
      assert.ok(item.updateLog.length > 0);
    }
  });

  it('teacher can delete any memory item and forget scopes', () => {
    const mem = createTeacherMemoryPlatform();
    const profile = mem.upsertProfile(
      teacherId,
      { preferredLanguage: 'ro' },
      source,
    );
    assert.ok(!('error' in profile));
    const cls = mem.upsertClassProfile(
      teacherId,
      { classId: 'IV-A', grade: 'Clasa a IV-a', className: 'IV A' },
      source,
    );
    assert.ok(!('error' in cls));
    const bp = mem.rememberBlueprint(
      teacherId,
      {
        blueprintId: 'bp-sci',
        topic: 'Water cycle',
        subject: 'Științe',
        grade: 'Clasa a IV-a',
      },
      source,
    );
    assert.ok(!('error' in bp));

    const deleted = mem.deleteMemory(profile.id, teacherId);
    assert.ok(!('error' in deleted));
    assert.equal(deleted.status, 'deleted');

    const forgetClass = mem.forget({
      type: 'class',
      teacherId,
      classId: 'IV-A',
    });
    assert.ok(forgetClass.forgotten.includes(cls.id));

    const forgetBp = mem.forget({
      type: 'blueprint',
      teacherId,
      blueprintId: 'bp-sci',
    });
    assert.ok(forgetBp.forgotten.includes(bp.id));

    mem.upsertProfile(teacherId, { preferredTone: 'calm' }, source);
    const wipe = mem.forget({ type: 'everything', teacherId });
    assert.ok(wipe.forgotten.length > 0);
    assert.equal(
      mem.inspect(teacherId).filter((i) => i.status === 'active').length,
      0,
    );
  });

  it('all memory updates are traceable', () => {
    const mem = createTeacherMemoryPlatform();
    const created = mem.upsertProfile(
      teacherId,
      { preferredLanguage: 'ro' },
      source,
    );
    assert.ok(!('error' in created));

    const corrected = mem.preferences.upsertTeacherProfile(
      teacherId,
      { preferredLanguage: 'en' },
      { kind: 'teacher_correction', label: 'Teacher corrected language' },
    );
    assert.ok(!('error' in corrected));
    assert.equal(corrected.payload.preferredLanguage, 'en');
    assert.equal(corrected.confidence, 1);
    assert.equal(corrected.source.kind, 'teacher_correction');
    assert.ok(corrected.updateLog.some((u) => u.action === 'correct'));

    const batch = mem.flushSync();
    assert.ok(batch.length >= 1);
  });

  it('semantic search across memory works', () => {
    const mem = createTeacherMemoryPlatform();
    mem.rememberBlueprint(
      teacherId,
      {
        blueprintId: 'bp-frac',
        topic: 'Fracții',
        subject: 'Matematică',
        grade: 'Clasa a III-a',
      },
      source,
    );
    mem.trackResource(
      teacherId,
      {
        resourceId: 'game-1',
        kind: 'game',
        title: 'Fraction matching game',
        grade: 'Clasa a II-a',
        subject: 'Matematică',
        topic: 'fractions',
      },
      source,
    );
    mem.trackResource(
      teacherId,
      {
        resourceId: 'assess-sci',
        kind: 'assessment',
        title: 'Science exit ticket',
        subject: 'Științe',
        grade: 'Clasa a III-a',
      },
      source,
    );
    // bump usage
    mem.trackResource(
      teacherId,
      {
        resourceId: 'assess-sci',
        kind: 'assessment',
        title: 'Science exit ticket',
        subject: 'Științe',
      },
      source,
    );

    const fractions = mem.searchMemory({
      teacherId,
      text: 'previous fractions lessons',
    });
    assert.ok(fractions.some((h) => h.item.domain === 'blueprint_history'));

    const games = mem.searchMemory({
      teacherId,
      text: 'games Grade II',
    });
    assert.ok(games.some((h) => h.item.payload.kind === 'game'));

    const science = mem.searchMemory({
      teacherId,
      text: 'science assessment',
    });
    assert.ok(science.some((h) => h.item.payload.kind === 'assessment'));
  });

  it('observed memory cannot assume high confidence without evidence', () => {
    const mem = createTeacherMemoryPlatform();
    const bad = mem.longTerm.store({
      teacherId,
      domain: 'interaction_patterns',
      title: 'Guessed preference',
      payload: { pattern: 'likes quizzes', evidence: 'weak', occurrences: 1 },
      source: { kind: 'system_observed', label: 'weak signal' },
      confidence: 0.95,
    });
    assert.ok('error' in bad);

    const ok = mem.longTerm.store({
      teacherId,
      domain: 'interaction_patterns',
      title: 'Observed pattern',
      payload: {
        pattern: 'uses projector',
        evidence: 'stated twice',
        occurrences: 2,
      },
      source: { kind: 'system_observed', label: 'session distilled' },
      confidence: 0.5,
    });
    assert.ok(!('error' in ok));
  });

  it('covers all memory domains in architecture', () => {
    assert.equal(ALL_MEMORY_DOMAINS.length, 10);
    const mem = createTeacherMemoryPlatform();
    assert.ok(mem.registry);
    assert.ok(mem.working);
    assert.ok(mem.longTerm);
    assert.ok(mem.preferences);
    assert.ok(mem.blueprints);
    assert.ok(mem.resources);
    assert.ok(mem.search);
    assert.ok(mem.sync);
    assert.ok(mem.privacy);
    assert.ok(mem.retrieval);
  });
});
