import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  ALL_CONTEXT_DOMAINS,
  createContextPlatform,
  type ContextEvent,
  type RuntimeContextSnapshot,
} from '../index.js';

const sessionId = 'sess-ps003';
const teacherId = 'teacher-ana';

describe('PS-003 Context Engine — acceptance', () => {
  it('every service receives consistent context', () => {
    const ctx = createContextPlatform();
    const init = ctx.initialize({
      sessionId,
      teacherId,
      activeScreen: 'teacher-desk',
    });
    assert.ok(!('error' in init));

    const seen: RuntimeContextSnapshot[] = [];
    ctx.subscribe({
      sessionId,
      handler: (_e, snap) => {
        seen.push(snap);
      },
    });

    const published = ctx.publish('TeacherChanged', sessionId, {
      selectedSubject: 'Matematică',
      currentGrade: 'Clasa a III-a',
    });
    assert.ok(!('error' in published));

    const a = ctx.getCurrentContext(sessionId)!;
    const b = ctx.getTeacherContext(sessionId)!;
    assert.equal(a.version, published.snapshot.version);
    assert.equal(a.teacher.selectedSubject, b.selectedSubject);
    assert.equal(seen[0]?.version, a.version);
    assert.equal(seen[0]?.contextId, a.contextId);
  });

  it('context updates are event-driven', () => {
    const ctx = createContextPlatform();
    ctx.initialize({ sessionId: 's-evt', teacherId });

    const events: ContextEvent['type'][] = [];
    ctx.subscribe({
      sessionId: 's-evt',
      handler: (e) => {
        events.push(e.type);
      },
    });

    ctx.publish('ConversationAdvanced', 's-evt', {
      conversationState: 'active',
      lastTeacherIntent: 'create experience',
      previousAiQuestion: 'What grade?',
    });

    assert.deepEqual(events, ['ConversationAdvanced']);
    assert.ok(ctx.dispatcher.pending().length === 0, 'no polling queue left');
    assert.ok(
      ctx.dispatcher.recorded().some((e) => e.type === 'ConversationAdvanced'),
    );
  });

  it('no duplicated context exists', () => {
    const ctx = createContextPlatform();
    const first = ctx.initialize({ sessionId: 's-dup', teacherId });
    assert.ok(!('error' in first));
    const second = ctx.initialize({ sessionId: 's-dup', teacherId });
    assert.ok('error' in second);
    assert.match(second.error, /duplicate/i);
    assert.equal(ctx.registry.listActiveSessions().length, 1);
  });

  it('blueprint changes propagate automatically', () => {
    const ctx = createContextPlatform();
    ctx.initialize({ sessionId: 's-bp', teacherId });

    let notified = false;
    ctx.subscribe({
      sessionId: 's-bp',
      domains: ['blueprint'],
      eventTypes: ['BlueprintChanged'],
      handler: (_e, snap) => {
        notified = true;
        assert.equal(snap.blueprint.blueprintId, 'bp-1');
        assert.equal(snap.blueprint.currentVersion, '2');
      },
    });

    const result = ctx.publish('BlueprintChanged', 's-bp', {
      blueprintId: 'bp-1',
      currentVersion: '2',
      approvalStatus: 'draft',
      completedSections: ['objectives'],
      pendingSections: ['assessment'],
      validationStatus: 'needs_review',
      confidenceMap: { objectives: 0.8 },
      lastAction: 'blueprint-section-updated',
    });
    assert.ok(!('error' in result));
    assert.equal(notified, true);
    assert.equal(ctx.getBlueprintContext('s-bp')?.blueprintId, 'bp-1');
    assert.deepEqual(ctx.getBlueprintContext('s-bp')?.completedSections, [
      'objectives',
    ]);
  });

  it('session state survives navigation', () => {
    const ctx = createContextPlatform();
    ctx.initialize({
      sessionId: 's-nav',
      teacherId,
      activeScreen: 'desk',
      workflow: 'create-experience',
    });

    ctx.navigate('s-nav', 'create/experience');
    ctx.navigate('s-nav', 'blueprint/review');
    const session = ctx.getSessionContext('s-nav')!;
    assert.equal(session.activeScreen, 'blueprint/review');
    assert.deepEqual(session.navigationHistory, [
      'desk',
      'create/experience',
      'blueprint/review',
    ]);
    assert.equal(session.currentWorkflow, 'create-experience');
    assert.equal(ctx.getCurrentContext('s-nav')?.sessionId, 's-nav');
  });

  it('conversation context remains synchronized', () => {
    const ctx = createContextPlatform();
    ctx.initialize({ sessionId: 's-convo', teacherId });

    ctx.publish('ConversationAdvanced', 's-convo', {
      conversationState: 'waiting_teacher',
      currentPedagogicalGoal: 'clarify objectives',
      lastTeacherIntent: 'fractions lesson',
      previousAiQuestion: 'What duration?',
      openClarifications: ['duration', 'group size'],
      conversationSummary: 'Planning Grade III fractions',
    });

    const convo = ctx.getConversationContext('s-convo')!;
    assert.equal(convo.conversationState, 'waiting_teacher');
    assert.equal(convo.lastTeacherIntent, 'fractions lesson');
    assert.deepEqual(convo.openClarifications, ['duration', 'group size']);

    ctx.publish('ConversationAdvanced', 's-convo', {
      conversationState: 'active',
      openClarifications: ['group size'],
      lastTeacherIntent: '45 minutes',
    });
    assert.deepEqual(ctx.getConversationContext('s-convo')?.openClarifications, [
      'group size',
    ]);
  });

  it('generation context updates correctly', () => {
    const ctx = createContextPlatform();
    ctx.initialize({ sessionId: 's-gen', teacherId });

    ctx.publish('GenerationStarted', 's-gen', {
      selectedAssetId: 'asset-ws',
      generationQueue: ['asset-ws', 'asset-slides'],
      currentStage: 'running',
      dependencies: ['bp-1'],
      affectedAssets: ['asset-ws'],
      versionReferences: { 'asset-ws': 'v1' },
      lastAction: 'generation-started',
    });

    let gen = ctx.getGenerationContext('s-gen')!;
    assert.equal(gen.currentStage, 'running');
    assert.deepEqual(gen.generationQueue, ['asset-ws', 'asset-slides']);

    ctx.publish('GenerationCompleted', 's-gen', {
      currentStage: 'completed',
      generationQueue: [],
      affectedAssets: ['asset-ws', 'asset-slides'],
      versionReferences: { 'asset-ws': 'v1', 'asset-slides': 'v1' },
    });
    gen = ctx.getGenerationContext('s-gen')!;
    assert.equal(gen.currentStage, 'completed');
    assert.equal(gen.generationQueue.length, 0);

    ctx.publish('AssetModified', 's-gen', {
      selectedAssetId: 'asset-ws',
      lastModifiedAssetId: 'asset-ws',
      openAssetIds: ['asset-ws'],
      versionReferences: { 'asset-ws': 'v2' },
    });
    assert.equal(ctx.getAssetContext('s-gen')?.lastModifiedAssetId, 'asset-ws');
    assert.equal(
      ctx.getGenerationContext('s-gen')?.versionReferences['asset-ws'],
      'v2',
    );
  });

  it('context expiration is handled safely', () => {
    const ctx = createContextPlatform();
    ctx.initialize({
      sessionId: 's-exp',
      teacherId,
      ttlMs: 1,
    });

    // Force TTL elapsed
    const active = ctx.registry.getActive('s-exp')!;
    active.expiresAt = new Date(Date.now() - 1000).toISOString();
    ctx.registry.setActive(active);

    const snap = ctx.getCurrentContext('s-exp')!;
    assert.equal(snap.lifecycle, 'expired');

    const blocked = ctx.publish('TeacherChanged', 's-exp', {
      selectedSubject: 'Științe',
    });
    assert.ok('error' in blocked);

    const archived = ctx.archive('s-exp');
    assert.ok(!('error' in archived));
    assert.equal(archived.lifecycle, 'archived');
    assert.equal(ctx.getCurrentContext('s-exp'), undefined);
    assert.ok(ctx.registry.archived('s-exp').length >= 1);
  });

  it('approval granted updates blueprint and review domains only as mapped', () => {
    const ctx = createContextPlatform();
    ctx.initialize({ sessionId: 's-appr', teacherId });
    ctx.publish('BlueprintChanged', 's-appr', {
      blueprintId: 'bp-9',
      currentVersion: '1',
      approvalStatus: 'pending_review',
    });

    const touched: string[] = [];
    ctx.subscribe({
      sessionId: 's-appr',
      handler: (e) => {
        touched.push(...e.affects);
      },
    });

    const result = ctx.publish('ApprovalGranted', 's-appr', {
      blueprintId: 'bp-9',
      approvalStatus: 'approved',
      status: 'approved',
      reviewId: 'rev-1',
      validationStatus: 'valid',
    });
    assert.ok(!('error' in result));
    assert.equal(ctx.getBlueprintContext('s-appr')?.approvalStatus, 'approved');
    assert.equal(ctx.getCurrentContext('s-appr')?.review.status, 'approved');
    assert.ok(touched.includes('blueprint'));
    assert.ok(touched.includes('review'));
    assert.ok(!touched.includes('generation'));
  });

  it('architecture supports future services via platform context and ports', () => {
    assert.equal(ALL_CONTEXT_DOMAINS.length, 9);

    const ctx = createContextPlatform({
      knowledge: {
        listInstalledPacks: () => [{ packId: 'ro-primary', version: '1.0.0' }],
      },
      memory: {
        getTeacherProfileRef: () => 'mem-profile-1',
        getClassProfileRef: () => 'mem-class-1',
      },
    });

    const init = ctx.initialize({
      sessionId: 's-future',
      teacherId,
      teacher: { activeClassId: 'III-A', currentGrade: 'Clasa a III-a' },
      platform: {
        availableServices: [
          'knowledge',
          'memory',
          'recommendation',
          'quality',
        ],
        connectedEngines: ['ENG-01', 'ENG-02', 'ENG-10', 'ENG-08'],
        featureFlags: { recommendationV2: true },
        installedKnowledgePacks: [],
        systemStatus: 'healthy',
      },
    });
    assert.ok(!('error' in init));
    assert.equal(init.teacher.currentProfileRef, 'mem-profile-1');
    assert.equal(init.class.classProfileRef, 'mem-class-1');
    assert.ok(init.platform.availableServices.includes('recommendation'));
    assert.ok(init.platform.featureFlags.recommendationV2);

    // Extend services at runtime without new context instance
    ctx.publish('ContextUpdated', 's-future', {
      availableServices: [
        ...init.platform.availableServices,
        'analytics',
      ],
      connectedEngines: [...init.platform.connectedEngines, 'ENG-99'],
    });
    const platform = ctx.getCurrentContext('s-future')!.platform;
    assert.ok(platform.availableServices.includes('analytics'));
    assert.ok(platform.connectedEngines.includes('ENG-99'));
  });

  it('snapshots are immutable for consumers', () => {
    const ctx = createContextPlatform();
    const snap = ctx.initialize({
      sessionId: 's-imm',
      teacherId,
    });
    assert.ok(!('error' in snap));
    assert.throws(() => {
      // @ts-expect-error — runtime freeze
      snap.version = 999;
    });
    assert.throws(() => {
      // @ts-expect-error — runtime freeze
      snap.teacher.selectedSubject = 'hack';
    });
  });
});
