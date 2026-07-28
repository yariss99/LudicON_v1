import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  ALL_QUALITY_DIMENSIONS,
  createQualityEngine,
  DEFAULT_QUALITY_POLICIES,
  DEFAULT_SCORING_MODEL,
  type BlueprintQualityInput,
  type QualityPolicy,
  type ScoringModelConfig,
} from '../index.js';

const strongBlueprint = (): BlueprintQualityInput => ({
  blueprintId: 'bp-strong',
  teacherId: 'teacher-ana',
  sessionId: 'sess-q',
  subject: 'Matematică',
  grade: 'Clasa a III-a',
  durationMinutes: 45,
  objectives: [
    {
      id: 'O1',
      title: 'Identify unit fractions',
      activityIds: ['A1'],
      assessmentIds: ['S1'],
    },
    {
      id: 'O2',
      title: 'Show one third',
      activityIds: ['A2'],
      assessmentIds: ['S2'],
    },
  ],
  activities: [
    { id: 'A1', title: 'Fraction tiles', durationMinutes: 15, differentiated: true },
    { id: 'A2', title: 'Pair exploration', durationMinutes: 15 },
  ],
  assessments: [
    { id: 'S1', title: 'Exit ticket', strategy: 'formative' },
    { id: 'S2', title: 'Observation', strategy: 'performance' },
  ],
  competencies: ['Numerație'],
  curriculumRefs: ['ro-men-primary'],
  hasDifferentiation: true,
  hasAccessibility: true,
  digitalToolIds: ['board'],
  resourceIds: ['tiles'],
  hasReflection: true,
  engagementSignals: ['hands-on', 'collaborative'],
  innovationSignals: ['manipulatives'],
  practicalityNotes: ['works with 24 students'],
});

const weakBlueprint = (): BlueprintQualityInput => ({
  blueprintId: 'bp-weak',
  teacherId: 'teacher-ana',
  sessionId: 'sess-q',
  durationMinutes: 45,
  objectives: [
    { id: 'O3', title: 'Unassessed objective' },
  ],
  activities: [],
  assessments: [],
  hasDifferentiation: false,
  hasAccessibility: false,
});

describe('PS-005 Quality Engine — acceptance', () => {
  it('every evaluation is explainable', () => {
    const engine = createQualityEngine();
    const report = engine.evaluateBlueprint(strongBlueprint());
    const explained = engine.explainer.explainReport(report);

    assert.ok(explained.overall.why.length > 0);
    for (const dim of explained.dimensions) {
      assert.ok(dim.why.length > 0);
      assert.ok(dim.evidence.length > 0);
      assert.ok(dim.policies.length > 0);
      assert.ok(dim.howToImprove.length > 0);
    }
    assert.equal(explained.mutatesBlueprint, false);
    assert.equal(explained.generatesContent, false);
  });

  it('every score is evidence-based', () => {
    const engine = createQualityEngine();
    const report = engine.evaluateBlueprint(weakBlueprint());
    assert.ok(report.evidence.length > 0);
    for (const dim of report.dimensionScores) {
      assert.ok(dim.evidence.length > 0);
      assert.ok(
        dim.strengths.length + dim.weaknesses.length > 0,
        `dimension ${dim.dimension} needs evidence`,
      );
    }
    const assessment = engine.explainScore(
      'blueprint',
      'bp-weak',
      'assessment_alignment',
    );
    assert.ok(!('error' in assessment));
    assert.ok(assessment.evidence.length > 0);
  });

  it('policies are externalized', () => {
    const custom: QualityPolicy = {
      policyId: 'qp-custom-engagement',
      category: 'student_engagement',
      description: 'Custom engagement policy',
      trigger: 'TeacherFeedbackUpdated',
      evaluationLogic: 'engagement_signals',
      thresholds: { passScore: 50, warnScore: 20 },
      weight: 1,
      evidenceRules: {
        strengthWhenPass: 'Custom pass',
        weaknessWhenFail: 'Custom fail',
      },
      improvementSuggestions: ['Add a custom engagement hook'],
      severity: 'idea',
    };

    const engine = createQualityEngine({
      policies: [...DEFAULT_QUALITY_POLICIES, custom],
    });
    assert.ok(engine.policies.get('qp-custom-engagement'));
    assert.ok(engine.policies.cacheSize() > DEFAULT_QUALITY_POLICIES.length - 1);

    const report = engine.evaluateBlueprint(
      {
        ...strongBlueprint(),
        blueprintId: 'bp-custom',
        engagementSignals: [],
      },
      'TeacherFeedbackUpdated',
    );
    assert.ok(
      report.dimensionScores.some((d) =>
        d.policyIds.includes('qp-custom-engagement'),
      ),
    );
  });

  it('only affected dimensions are re-evaluated', () => {
    const engine = createQualityEngine();
    const full = engine.evaluateBlueprint(strongBlueprint(), 'FullEvaluation');
    const differentiationBefore = full.dimensionScores.find(
      (d) => d.dimension === 'differentiation',
    );
    assert.ok(differentiationBefore);

    const afterAssessment = engine.evaluateBlueprint(
      {
        ...strongBlueprint(),
        assessments: [{ id: 'S1', title: 'Only one', strategy: 'formative' }],
        objectives: [
          {
            id: 'O1',
            title: 'Identify unit fractions',
            activityIds: ['A1'],
            assessmentIds: ['S1'],
          },
          {
            id: 'O2',
            title: 'Show one third',
            activityIds: ['A2'],
            // missing assessment on purpose
          },
        ],
      },
      'AssessmentChanged',
    );

    assert.ok(afterAssessment.evaluatedDimensions.includes('assessment_alignment'));
    assert.ok(
      !afterAssessment.evaluatedDimensions.includes('differentiation'),
    );

    const differentiationAfter = afterAssessment.dimensionScores.find(
      (d) => d.dimension === 'differentiation',
    );
    assert.ok(differentiationAfter);
    assert.equal(differentiationAfter.score, differentiationBefore.score);
    assert.equal(afterAssessment.version, full.version + 1);
  });

  it('trend analysis is preserved', () => {
    const engine = createQualityEngine();
    engine.evaluateBlueprint(weakBlueprint(), 'FullEvaluation');
    engine.evaluateBlueprint(
      { ...strongBlueprint(), blueprintId: 'bp-weak' },
      'FullEvaluation',
    );

    const trend = engine.trends.analyze('teacher-ana');
    assert.ok(trend.historyCount >= 2);
    assert.ok(trend.averageQuality > 0);
    assert.ok(typeof trend.teacherGrowth === 'number');
    assert.ok(trend.comparedToPrevious);
    assert.ok(engine.trends.getCached('teacher-ana'));
  });

  it('quality history is versioned', () => {
    const engine = createQualityEngine();
    const r1 = engine.evaluateBlueprint(weakBlueprint());
    const r2 = engine.evaluateBlueprint({
      ...weakBlueprint(),
      hasDifferentiation: true,
      activities: [
        { id: 'A1', title: 'Activity', durationMinutes: 20, differentiated: true },
      ],
      objectives: [
        {
          id: 'O3',
          title: 'Unassessed objective',
          activityIds: ['A1'],
        },
      ],
    });

    assert.equal(r1.version, 1);
    assert.equal(r2.version, 2);
    const history = engine.history.list('blueprint', 'bp-weak');
    assert.ok(history.length >= 2);
    assert.equal(history[0]!.version, 2);
  });

  it('teachers receive actionable improvement suggestions', () => {
    const engine = createQualityEngine();
    const report = engine.evaluateBlueprint(weakBlueprint());
    assert.ok(report.suggestedImprovements.length > 0);
    assert.ok(
      report.suggestedImprovements.some((s) =>
        /assessment|activity|differentiat|accessib/i.test(s),
      ),
    );

    const panel = engine.getQualityPanel('blueprint', 'bp-weak');
    assert.ok(!('error' in panel));
    assert.ok(panel.improvementSuggestions.length > 0);
    assert.equal(panel.teacherDecides, true);
  });

  it('quality engine is independent of UI', () => {
    const engine = createQualityEngine();
    assert.equal(engine.mutatesBlueprint, false);
    assert.equal(engine.generatesContent, false);

    const panel = engine.getQualityPanel(
      'blueprint',
      engine.evaluateBlueprint(strongBlueprint()).subjectId,
    );
    assert.ok(!('error' in panel));
    assert.equal(panel.presentation, 'quality_panel');
    assert.equal(panel.allowsModal, false);
    assert.equal(typeof engine.evaluateBlueprint, 'function');
    assert.equal(typeof engine.evaluateAsset, 'function');
    assert.equal(typeof engine.evaluateLesson, 'function');
  });

  it('scoring model is configurable', () => {
    const customScoring: ScoringModelConfig = {
      dimensionWeights: {
        ...DEFAULT_SCORING_MODEL.dimensionWeights,
        assessment_alignment: 5,
        differentiation: 0.1,
      },
      bandThresholds: {
        excellent: 95,
        veryGood: 85,
        good: 70,
        needsImprovement: 50,
      },
    };

    const engine = createQualityEngine({ scoring: customScoring });
    assert.deepEqual(
      engine.scorer.getConfig().bandThresholds,
      customScoring.bandThresholds,
    );

    const report = engine.evaluateBlueprint(strongBlueprint());
    engine.configureScoring({
      ...customScoring,
      bandThresholds: { ...customScoring.bandThresholds, excellent: 50 },
    });
    assert.equal(engine.scorer.bandFor(60), 'excellent');
    assert.ok(report.scoringModelVersion.length > 0);
  });

  it('covers example policies and never rewrites blueprints', () => {
    const engine = createQualityEngine();
    const input = weakBlueprint();
    const before = structuredClone(input);
    const report = engine.evaluateBlueprint(input);

    assert.deepEqual(input, before);
    assert.ok(
      report.detectedRisks.some((r) => r.policyId === 'qp-assessment-coverage'),
    );
    assert.ok(
      report.dimensionScores.some((d) =>
        d.policyIds.includes('qp-objectives-alignment'),
      ),
    );
    assert.ok(
      report.dimensionScores.some((d) =>
        d.policyIds.includes('qp-differentiation'),
      ),
    );
    assert.ok(
      report.dimensionScores.some((d) =>
        d.policyIds.includes('qp-cognitive-load'),
      ),
    );
  });

  it('supports asset/lesson evaluation and report comparison', () => {
    const engine = createQualityEngine();
    const bp = engine.evaluateBlueprint(strongBlueprint());
    const asset = engine.evaluateAsset({
      assetId: 'asset-1',
      blueprintId: 'bp-strong',
      teacherId: 'teacher-ana',
      alignedObjectiveIds: ['O1'],
      hasAccessibility: true,
      digitalIntegration: true,
      resourceQualityHints: ['worksheet'],
    });
    const lesson = engine.evaluateLesson({
      ...strongBlueprint(),
      lessonId: 'lesson-1',
      assetIds: ['asset-1'],
    });

    assert.equal(asset.subjectType, 'asset');
    assert.equal(lesson.subjectType, 'lesson');
    const comparison = engine.compareReports(bp, lesson);
    assert.ok(typeof comparison.overallDelta === 'number');
    assert.ok(comparison.dimensions.length > 0);
  });

  it('exposes all quality dimensions in architecture', () => {
    assert.equal(ALL_QUALITY_DIMENSIONS.length, 18);
    const covered = new Set(DEFAULT_QUALITY_POLICIES.map((p) => p.category));
    for (const dim of ALL_QUALITY_DIMENSIONS) {
      assert.ok(covered.has(dim), `missing policy coverage for ${dim}`);
    }
  });
});
