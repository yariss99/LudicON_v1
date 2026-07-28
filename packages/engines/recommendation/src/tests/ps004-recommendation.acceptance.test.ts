import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  ALL_RECOMMENDATION_CATEGORIES,
  createRecommendationEngine,
  DEFAULT_RECOMMENDATION_POLICIES,
  type EvaluationContext,
  type RecommendationPolicy,
} from '../index.js';

const base = (
  trigger: EvaluationContext['trigger'],
  patch: Partial<EvaluationContext> = {},
): EvaluationContext => ({
  sessionId: 'sess-rec',
  teacherId: 'teacher-ana',
  trigger,
  ...patch,
});

describe('PS-004 Recommendation Engine — acceptance', () => {
  it('recommendations are contextual', () => {
    const engine = createRecommendationEngine();
    const cards = engine.evaluatePolicies(
      base('BlueprintUpdated', {
        blueprint: {
          blueprintId: 'bp-1',
          objectives: [
            { id: 'O3', title: 'Identify unit fractions', hasAssessment: false },
            { id: 'O1', title: 'Count to 100', hasAssessment: true },
          ],
        },
      }),
    );

    assert.ok(cards.length > 0);
    const assessment = cards.find((c) => c.policyId === 'pol-missing-assessment');
    assert.ok(assessment);
    assert.match(assessment.description, /O3|Identify unit fractions/);
    assert.equal(assessment.contextRefs.objectiveId, 'O3');
  });

  it('recommendations are explainable', () => {
    const engine = createRecommendationEngine();
    const [card] = engine.evaluatePolicies(
      base('BlueprintUpdated', {
        blueprint: {
          objectives: [
            { id: 'O3', title: 'Identify unit fractions', hasAssessment: false },
          ],
        },
      }),
    );
    assert.ok(card);
    assert.ok(card.explanation.why.length > 0);
    assert.ok(card.explanation.improves.length > 0);
    assert.ok(card.explanation.expectedImpact.length > 0);
    assert.ok(card.explanation.relatedBlueprintSection);

    const explained = engine.explainRecommendation(card.recommendationId);
    assert.ok(!('error' in explained));
    assert.equal(explained.blueprintMutated, false);
    assert.equal(explained.explanation.why, card.explanation.why);
  });

  it('recommendations never modify the Blueprint automatically', () => {
    const engine = createRecommendationEngine();
    assert.equal(engine.mutatesBlueprint, false);

    const blueprint = {
      blueprintId: 'bp-1',
      objectives: [
        { id: 'O3', title: 'Identify unit fractions', hasAssessment: false },
      ],
      incompleteSections: ['assessment'],
    };
    const before = structuredClone(blueprint);

    const cards = engine.evaluatePolicies(
      base('BlueprintUpdated', { blueprint }),
    );
    assert.ok(cards.length > 0);
    engine.acceptRecommendation(cards[0]!.recommendationId);

    assert.deepEqual(blueprint, before);
    assert.equal(blueprint.objectives[0]!.hasAssessment, false);
  });

  it('recommendation policies are externalized', () => {
    const custom: RecommendationPolicy = {
      policyId: 'pol-custom-digital',
      trigger: 'KnowledgeUpdated',
      conditions: [{ type: 'preference_match', field: 'assessment' }],
      priority: 'idea',
      category: 'digital_integration',
      recommendation: {
        titleTemplate: 'Try digital tool',
        descriptionTemplate: 'Knowledge pack suggests a digital tool match.',
        suggestedAction: 'Browse digital tools in Knowledge',
      },
      explanation: {
        whyTemplate: 'External policy fired after KnowledgeUpdated.',
        improvesTemplate: 'Digital integration options',
        impactTemplate: 'Broader activity media choices',
        relatedSection: 'resources',
      },
      learningStrategy: 'reinforce_on_accept',
      confidenceBase: 0.55,
    };

    const engine = createRecommendationEngine({
      policies: [...DEFAULT_RECOMMENDATION_POLICIES, custom],
    });
    assert.ok(engine.policies.get('pol-custom-digital'));

    const cards = engine.evaluatePolicies(
      base('KnowledgeUpdated', {
        memory: { assessmentPreferences: ['formative assessment'] },
      }),
    );
    assert.ok(cards.some((c) => c.policyId === 'pol-custom-digital'));

    // Policies live in PolicyEngine cache — not UI components
    assert.ok(engine.policies.cacheSize() >= DEFAULT_RECOMMENDATION_POLICIES.length);
  });

  it('teacher decisions are learned over time', () => {
    const engine = createRecommendationEngine();
    const ctx = base('QualityScoreChanged', {
      quality: { differentiation: 0.2 },
      blueprint: { hasDifferentiation: false },
    });

    const first = engine.evaluatePolicies(ctx);
    const target = first.find((c) => c.policyId === 'pol-low-differentiation');
    assert.ok(target);

    engine.dismissRecommendation(target.recommendationId);
    // recreate session evaluation — first dismiss recorded
    engine.evaluatePolicies({ ...ctx, sessionId: 'sess-rec-2' });
    const again = engine
      .getRecommendations({ sessionId: 'sess-rec-2' })
      .find((c) => c.policyId === 'pol-low-differentiation');
    if (again) engine.dismissRecommendation(again.recommendationId);

    // After dismiss threshold, suppress
    const third = engine.evaluatePolicies({
      ...ctx,
      sessionId: 'sess-rec-3',
    });
    assert.ok(
      !third.some((c) => c.policyId === 'pol-low-differentiation'),
      'consistently dismissed policies must not repeat',
    );

    const model = engine.updateLearningModel('teacher-ana');
    assert.ok(
      model.records.some(
        (r) => r.policyId === 'pol-low-differentiation' && r.dismissed >= 2,
      ),
    );
  });

  it('recommendation priorities are respected', () => {
    const engine = createRecommendationEngine();
    engine.evaluatePolicies(
      base('BlueprintUpdated', {
        blueprint: {
          objectives: [
            { id: 'O3', title: 'Obj', hasAssessment: false },
          ],
          incompleteSections: ['methods'],
          hasDifferentiation: false,
        },
        quality: { differentiation: 0.1, accessibility: 0.2 },
      }),
    );

    const panel = engine.getRecommendationPanel('sess-rec');
    assert.equal(panel.presentation, 'contextual_cards');
    assert.equal(panel.allowsModal, false);

    const ordered = panel.active;
    for (let i = 1; i < ordered.length; i++) {
      assert.ok(
        engine.priority.weight(ordered[i - 1]!.priority) >=
          engine.priority.weight(ordered[i]!.priority),
      );
    }
    assert.ok(panel.grouped.critical.length + panel.grouped.important.length > 0);
  });

  it('recommendations are grouped and searchable', () => {
    const engine = createRecommendationEngine();
    engine.evaluatePolicies(
      base('NewBlueprintCreated', {
        memory: {
          similarBlueprints: [
            {
              id: 'bp-old',
              title: 'Fractions success lesson',
              rating: 5,
              topic: 'fractions',
            },
          ],
        },
      }),
    );
    engine.evaluatePolicies(
      base('ConversationAdvanced', {
        conversation: { openClarifications: ['duration', 'group size'] },
      }),
    );

    const panel = engine.getRecommendationPanel('sess-rec');
    assert.ok(Object.keys(panel.grouped).length === 4);

    const found = engine.getRecommendations({
      sessionId: 'sess-rec',
      query: 'fractions',
    });
    assert.ok(found.some((c) => c.policyId === 'pol-previous-success'));

    const byCategory = engine.getRecommendations({
      sessionId: 'sess-rec',
      category: 'workflow',
    });
    assert.ok(byCategory.every((c) => c.category === 'workflow'));
  });

  it('recommendation history is preserved', () => {
    const engine = createRecommendationEngine();
    const [card] = engine.evaluatePolicies(
      base('BlueprintUpdated', {
        blueprint: {
          objectives: [{ id: 'O1', title: 'A', hasAssessment: false }],
        },
      }),
    );
    assert.ok(card);
    engine.markDisplayed(card.recommendationId);
    engine.acceptRecommendation(card.recommendationId);

    const history = engine.history.list({
      recommendationId: card.recommendationId,
    });
    assert.ok(history.length >= 2);
    assert.ok(history.some((h) => h.to === 'accepted'));
    assert.ok(history.some((h) => h.to === 'displayed'));
  });

  it('recommendation engine is independent from UI', () => {
    const engine = createRecommendationEngine();
    let dispatched = 0;
    engine.dispatcher.subscribe(() => {
      dispatched += 1;
    });

    engine.evaluatePolicies(
      base('GenerationCompleted', {
        generation: {
          stage: 'completed',
          completedAssetIds: ['asset-1'],
        },
      }),
    );

    assert.ok(dispatched >= 1);
    const panel = engine.getRecommendationPanel('sess-rec');
    assert.equal(panel.allowsModal, false);
    assert.equal(panel.presentation, 'contextual_cards');
    // No React/DOM imports — pure service API
    assert.equal(typeof engine.getRecommendations, 'function');
    assert.equal(typeof engine.evaluatePolicies, 'function');
  });

  it('covers example policies: missing assessment, low differentiation, previous success', () => {
    const engine = createRecommendationEngine();

    const missing = engine.evaluatePolicies(
      base('BlueprintUpdated', {
        blueprint: {
          objectives: [
            { id: 'O3', title: 'Learning Objective O3', hasAssessment: false },
          ],
        },
      }),
    );
    assert.ok(
      missing.some((c) =>
        c.description.includes('not currently evaluated'),
      ),
    );
    assert.equal(
      missing.find((c) => c.policyId === 'pol-missing-assessment')?.priority,
      'important',
    );

    const lowDiff = engine.evaluatePolicies(
      base('QualityScoreChanged', {
        sessionId: 'sess-q',
        quality: { differentiation: 0.3 },
        blueprint: { hasDifferentiation: false },
      }),
    );
    assert.ok(
      lowDiff.some((c) =>
        c.description.includes('differentiated learning activities'),
      ),
    );
    assert.equal(
      lowDiff.find((c) => c.policyId === 'pol-low-differentiation')?.priority,
      'suggested',
    );

    const prev = engine.evaluatePolicies(
      base('NewBlueprintCreated', {
        sessionId: 'sess-m',
        memory: {
          similarBlueprints: [
            { id: 'bp-x', title: 'Highly rated fractions lesson', rating: 5 },
          ],
        },
      }),
    );
    assert.ok(
      prev.some((c) => c.description.includes('highly rated lesson')),
    );
    assert.equal(
      prev.find((c) => c.policyId === 'pol-previous-success')?.priority,
      'idea',
    );
  });

  it('exposes all recommendation categories in architecture', () => {
    assert.equal(ALL_RECOMMENDATION_CATEGORIES.length, 10);
    const cats = new Set(DEFAULT_RECOMMENDATION_POLICIES.map((p) => p.category));
    assert.ok(cats.has('assessment'));
    assert.ok(cats.has('differentiation'));
    assert.ok(cats.has('personalization'));
  });
});
