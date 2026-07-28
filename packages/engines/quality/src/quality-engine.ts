import { uid } from './ids.js';
import { DEFAULT_SCORING_MODEL } from './config/default-scoring.js';
import { DimensionAnalyzer } from './dimension-analyzer.js';
import { EvaluationQueue } from './evaluation-queue.js';
import { EvidenceCollector } from './evidence-collector.js';
import { QualityEvaluator } from './quality-evaluator.js';
import { QualityExplainer } from './quality-explainer.js';
import { QualityHistory } from './quality-history.js';
import { QualityPolicyEngine } from './quality-policy-engine.js';
import { QualityScorer } from './quality-scorer.js';
import { TrendAnalyzer } from './trend-analyzer.js';
import type {
  AssetQualityInput,
  BlueprintQualityInput,
  DimensionScore,
  LessonQualityInput,
  QualityDimension,
  QualityPolicy,
  QualityReport,
  QualityTrigger,
  ScoringModelConfig,
} from './types.js';
import { TRIGGER_AFFECTED_DIMENSIONS } from './types.js';

export type CreateQualityEngineOptions = {
  policies?: QualityPolicy[];
  scoring?: ScoringModelConfig;
};

/**
 * QualityEngine — pedagogical review authority (UI-independent).
 * Evaluates quality; never generates content; never rewrites Blueprints.
 */
export class QualityEngine {
  readonly policies: QualityPolicyEngine;
  readonly evaluator: QualityEvaluator;
  readonly scorer: QualityScorer;
  readonly evidence: EvidenceCollector;
  readonly dimensions: DimensionAnalyzer;
  readonly trends: TrendAnalyzer;
  readonly history: QualityHistory;
  readonly explainer: QualityExplainer;
  readonly queue: EvaluationQueue;

  readonly mutatesBlueprint = false as const;
  readonly generatesContent = false as const;

  private readonly state = new Map<string, QualityReport>();

  constructor(options: CreateQualityEngineOptions = {}) {
    this.policies = new QualityPolicyEngine(options.policies);
    this.evidence = new EvidenceCollector();
    this.evaluator = new QualityEvaluator(this.evidence);
    this.scorer = new QualityScorer(options.scoring ?? DEFAULT_SCORING_MODEL);
    this.dimensions = new DimensionAnalyzer();
    this.history = new QualityHistory();
    this.trends = new TrendAnalyzer(this.history);
    this.explainer = new QualityExplainer();
    this.queue = new EvaluationQueue();
  }

  configureScoring(config: ScoringModelConfig): void {
    this.scorer.configure(config);
  }

  evaluateBlueprint(
    input: BlueprintQualityInput,
    trigger: QualityTrigger = 'FullEvaluation',
  ): QualityReport {
    return this.evaluate('blueprint', input.blueprintId, input, trigger, {
      sessionId: input.sessionId,
      teacherId: input.teacherId,
    });
  }

  evaluateAsset(
    input: AssetQualityInput,
    trigger: QualityTrigger = 'AssetChanged',
  ): QualityReport {
    return this.evaluate('asset', input.assetId, input, trigger, {
      sessionId: input.sessionId,
      teacherId: input.teacherId,
    });
  }

  evaluateLesson(
    input: LessonQualityInput,
    trigger: QualityTrigger = 'FullEvaluation',
  ): QualityReport {
    return this.evaluate('lesson', input.lessonId, input, trigger, {
      sessionId: input.sessionId,
      teacherId: input.teacherId,
    });
  }

  getQualityReport(
    subjectType: 'blueprint' | 'asset' | 'lesson',
    subjectId: string,
  ): QualityReport | undefined {
    return (
      this.state.get(`${subjectType}::${subjectId}`) ??
      this.history.latest(subjectType, subjectId)
    );
  }

  getDimensionScore(
    subjectType: 'blueprint' | 'asset' | 'lesson',
    subjectId: string,
    dimension: QualityDimension,
  ): DimensionScore | undefined {
    const report = this.getQualityReport(subjectType, subjectId);
    return report?.dimensionScores.find((d) => d.dimension === dimension);
  }

  explainScore(
    subjectType: 'blueprint' | 'asset' | 'lesson',
    subjectId: string,
    dimension: QualityDimension,
  ) {
    const report = this.getQualityReport(subjectType, subjectId);
    if (!report) return { error: 'Report not found' as const };
    return this.explainer.explainScore(report, dimension);
  }

  compareReports(a: QualityReport, b: QualityReport) {
    const dims = new Set([
      ...a.dimensionScores.map((d) => d.dimension),
      ...b.dimensionScores.map((d) => d.dimension),
    ]);
    const deltas: Array<{
      dimension: QualityDimension;
      a: number;
      b: number;
      delta: number;
    }> = [];
    for (const dimension of dims) {
      const sa = a.dimensionScores.find((d) => d.dimension === dimension)?.score ?? 0;
      const sb = b.dimensionScores.find((d) => d.dimension === dimension)?.score ?? 0;
      deltas.push({ dimension, a: sa, b: sb, delta: sb - sa });
    }
    return {
      overallDelta: b.overallScore - a.overallScore,
      bandFrom: a.overallBand,
      bandTo: b.overallBand,
      dimensions: deltas.sort((x, y) => Math.abs(y.delta) - Math.abs(x.delta)),
    };
  }

  getQualityPanel(
    subjectType: 'blueprint' | 'asset' | 'lesson',
    subjectId: string,
  ) {
    const report = this.getQualityReport(subjectType, subjectId);
    if (!report) return { error: 'Report not found' as const };
    const history = this.history.list(subjectType, subjectId);
    const trend = report.teacherId
      ? this.trends.analyze(report.teacherId)
      : undefined;
    return {
      overallScore: report.overallScore,
      overallBand: report.overallBand,
      dimensionBreakdown: report.dimensionScores,
      strengths: report.dimensionScores.flatMap((d) => d.strengths),
      weaknesses: report.dimensionScores.flatMap((d) => d.weaknesses),
      improvementSuggestions: report.suggestedImprovements,
      evidence: report.evidence,
      history,
      trend,
      presentation: 'quality_panel' as const,
      allowsModal: false as const,
      teacherDecides: true as const,
    };
  }

  private evaluate(
    subjectType: 'blueprint' | 'asset' | 'lesson',
    subjectId: string,
    subject: BlueprintQualityInput | AssetQualityInput,
    trigger: QualityTrigger,
    meta: { sessionId?: string; teacherId?: string },
  ): QualityReport {
    const job = this.queue.enqueue({
      id: uid('qjob'),
      subjectType,
      subjectId,
      trigger,
    });
    this.queue.dequeue();

    const affected = new Set(TRIGGER_AFFECTED_DIMENSIONS[trigger]);
    const previous = this.getQualityReport(subjectType, subjectId);
    const subjectKey = `${subjectType}::${subjectId}`;

    const triggerPolicies = this.policies
      .forTrigger(trigger)
      .filter((p) => affected.has(p.category));

    this.evidence.clear(subjectKey);
    const results = this.evaluator.evaluatePolicies(
      triggerPolicies,
      subject,
      subjectKey,
    );
    const freshDimensions = this.dimensions.analyze(
      results,
      triggerPolicies,
    );

    // Only affected dimensions recalculated — merge prior unaffected scores
    const mergedDimensions = this.mergeDimensions(
      previous?.dimensionScores ?? [],
      freshDimensions,
      affected,
    );

    const { score, band } = this.scorer.overall(mergedDimensions);
    const evidence = mergedDimensions.flatMap((d) => d.evidence);
    const detectedRisks = results.flatMap((r) => (r.risk ? [r.risk] : []));
    const suggestedImprovements = [
      ...new Set(mergedDimensions.flatMap((d) => d.suggestedImprovements)),
    ];
    const warnings = detectedRisks
      .filter((r) => r.severity === 'important')
      .map((r) => r.message);

    const report: QualityReport = {
      reportId: uid('qrep'),
      subjectType,
      subjectId,
      sessionId: meta.sessionId,
      teacherId: meta.teacherId,
      overallScore: score,
      overallBand: band,
      dimensionScores: mergedDimensions,
      evidence,
      detectedRisks,
      suggestedImprovements,
      warnings,
      recommendations: suggestedImprovements.slice(0, 5),
      version: this.history.nextVersion(subjectType, subjectId),
      timestamp: new Date().toISOString(),
      scoringModelVersion: this.scorer.modelVersion,
      evaluatedDimensions: [...affected],
    };

    // Ensure every dimension score is explainable
    for (const dim of report.dimensionScores) {
      this.explainer.explainDimension(dim);
    }

    this.state.set(subjectKey, report);
    this.history.append(report);
    if (meta.teacherId) this.trends.analyze(meta.teacherId);

    void job;
    return structuredClone(report);
  }

  private mergeDimensions(
    previous: DimensionScore[],
    fresh: DimensionScore[],
    affected: Set<QualityDimension>,
  ): DimensionScore[] {
    const map = new Map<QualityDimension, DimensionScore>();
    for (const dim of previous) {
      if (!affected.has(dim.dimension)) {
        map.set(dim.dimension, dim);
      }
    }
    for (const dim of fresh) {
      map.set(dim.dimension, dim);
    }
    return [...map.values()];
  }
}

export function createQualityEngine(
  options: CreateQualityEngineOptions = {},
): QualityEngine {
  return new QualityEngine(options);
}
