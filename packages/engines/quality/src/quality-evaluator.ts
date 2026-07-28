import { clamp, uid } from './ids.js';
import type { EvidenceCollector } from './evidence-collector.js';
import type {
  AssetQualityInput,
  BlueprintQualityInput,
  PolicyEvaluationResult,
  QualityPolicy,
  ScoreConfidence,
} from './types.js';

type EvalSubject = BlueprintQualityInput | AssetQualityInput;

/**
 * QualityEvaluator — executes declarative evaluation logic from policies.
 * Never rewrites Blueprints or generates content.
 */
export class QualityEvaluator {
  constructor(private readonly evidence: EvidenceCollector) {}

  evaluatePolicies(
    policies: QualityPolicy[],
    subject: EvalSubject,
    subjectKey: string,
  ): PolicyEvaluationResult[] {
    return policies.map((policy) => this.evaluateOne(policy, subject, subjectKey));
  }

  private evaluateOne(
    policy: QualityPolicy,
    subject: EvalSubject,
    subjectKey: string,
  ): PolicyEvaluationResult {
    const { score, confidence, refs, passed } = this.runLogic(policy, subject);
    const evidenceItem = this.evidence.collect(
      subjectKey,
      policy,
      passed,
      refs,
    );

    const result: PolicyEvaluationResult = {
      policyId: policy.policyId,
      dimension: policy.category,
      passed,
      score: clamp(score),
      confidence,
      evidence: [evidenceItem],
      improvements: passed ? [] : [...policy.improvementSuggestions],
    };

    if (!passed && (policy.severity === 'critical' || policy.severity === 'important')) {
      result.risk = {
        id: uid('risk'),
        severity: policy.severity,
        dimension: policy.category,
        message: policy.evidenceRules.weaknessWhenFail,
        policyId: policy.policyId,
      };
    }

    return result;
  }

  private runLogic(
    policy: QualityPolicy,
    subject: EvalSubject,
  ): {
    score: number;
    confidence: ScoreConfidence;
    refs: string[];
    passed: boolean;
  } {
    const bp = isBlueprint(subject) ? subject : undefined;
    const asset = !isBlueprint(subject) ? subject : undefined;

    switch (policy.evaluationLogic) {
      case 'objectives_supported_by_activities': {
        const objectives = bp?.objectives ?? [];
        if (objectives.length === 0) {
          return {
            score: policy.thresholds.warnScore,
            confidence: 'low',
            refs: [],
            passed: false,
          };
        }
        const unsupported = objectives.filter(
          (o) => !o.activityIds || o.activityIds.length === 0,
        );
        const ratio = (objectives.length - unsupported.length) / objectives.length;
        const score = Math.round(ratio * 100);
        return {
          score,
          confidence: 'high',
          refs: unsupported.map((o) => o.id),
          passed: score >= policy.thresholds.passScore,
        };
      }
      case 'objectives_have_assessment': {
        const objectives = bp?.objectives ?? [];
        if (objectives.length === 0) {
          return {
            score: policy.thresholds.warnScore,
            confidence: 'low',
            refs: [],
            passed: false,
          };
        }
        const uncovered = objectives.filter(
          (o) => !o.assessmentIds || o.assessmentIds.length === 0,
        );
        const ratio = (objectives.length - uncovered.length) / objectives.length;
        const score = Math.round(ratio * 100);
        return {
          score,
          confidence: 'high',
          refs: uncovered.map((o) => o.id),
          passed: score >= policy.thresholds.passScore,
        };
      }
      case 'has_differentiation': {
        const flagged =
          bp?.hasDifferentiation === true ||
          (bp?.activities?.some((a) => a.differentiated) ?? false);
        const score = flagged ? 85 : 30;
        return {
          score,
          confidence: 'medium',
          refs: flagged ? ['differentiation'] : [],
          passed: score >= policy.thresholds.passScore,
        };
      }
      case 'cognitive_load_vs_duration': {
        const duration = bp?.durationMinutes ?? 45;
        const activityLoad =
          bp?.activities?.reduce((s, a) => s + (a.durationMinutes ?? 10), 0) ?? 0;
        if (!bp?.activities?.length) {
          return {
            score: 40,
            confidence: 'low',
            refs: [],
            passed: false,
          };
        }
        const ratio = activityLoad / duration;
        // Ideal band ~0.7–1.1 of duration
        let score = 90;
        if (ratio > 1.25 || ratio < 0.5) score = 35;
        else if (ratio > 1.1 || ratio < 0.7) score = 55;
        return {
          score,
          confidence: 'medium',
          refs: [`load:${activityLoad}`, `duration:${duration}`],
          passed: score >= policy.thresholds.passScore,
        };
      }
      case 'has_accessibility': {
        const ok =
          bp?.hasAccessibility === true || asset?.hasAccessibility === true;
        const score = ok ? 80 : 35;
        return {
          score,
          confidence: 'medium',
          refs: ok ? ['accessibility'] : [],
          passed: score >= policy.thresholds.passScore,
        };
      }
      case 'curriculum_refs_present': {
        const refs = bp?.curriculumRefs ?? [];
        const score = refs.length > 0 ? 85 : 25;
        return {
          score,
          confidence: refs.length ? 'high' : 'medium',
          refs,
          passed: score >= policy.thresholds.passScore,
        };
      }
      case 'competencies_covered': {
        const comps = bp?.competencies ?? [];
        const score = comps.length >= 1 ? 80 : comps.length === 0 ? 30 : 60;
        return {
          score,
          confidence: 'medium',
          refs: comps,
          passed: score >= policy.thresholds.passScore,
        };
      }
      case 'assessment_diversity': {
        const strategies = new Set(
          (bp?.assessments ?? []).map((a) => a.strategy ?? a.title),
        );
        const score =
          strategies.size >= 2 ? 85 : strategies.size === 1 ? 55 : 25;
        return {
          score,
          confidence: 'medium',
          refs: [...strategies],
          passed: score >= policy.thresholds.passScore,
        };
      }
      case 'digital_tools_present': {
        const tools = bp?.digitalToolIds?.length
          ? bp.digitalToolIds
          : asset?.digitalIntegration
            ? [asset.assetId]
            : [];
        const score = tools.length > 0 ? 75 : 40;
        return {
          score,
          confidence: 'medium',
          refs: tools,
          passed: score >= policy.thresholds.passScore,
        };
      }
      case 'engagement_signals': {
        const signals = bp?.engagementSignals ?? [];
        const score = signals.length >= 2 ? 80 : signals.length === 1 ? 60 : 30;
        return {
          score,
          confidence: 'low',
          refs: signals,
          passed: score >= policy.thresholds.passScore,
        };
      }
      case 'coherence_objective_activity_assessment': {
        const objectives = bp?.objectives ?? [];
        if (!objectives.length) {
          return { score: 40, confidence: 'low', refs: [], passed: false };
        }
        const coherent = objectives.filter(
          (o) =>
            (o.activityIds?.length ?? 0) > 0 &&
            (o.assessmentIds?.length ?? 0) > 0,
        );
        const score = Math.round((coherent.length / objectives.length) * 100);
        return {
          score,
          confidence: 'high',
          refs: coherent.map((o) => o.id),
          passed: score >= policy.thresholds.passScore,
        };
      }
      case 'resource_present': {
        const resources =
          bp?.resourceIds ??
          asset?.resourceQualityHints ??
          [];
        const score = resources.length > 0 ? 75 : 35;
        return {
          score,
          confidence: 'medium',
          refs: resources,
          passed: score >= policy.thresholds.passScore,
        };
      }
      case 'reflection_present': {
        const ok = bp?.hasReflection === true;
        const score = ok ? 80 : 35;
        return {
          score,
          confidence: 'medium',
          refs: ok ? ['reflection'] : [],
          passed: score >= policy.thresholds.passScore,
        };
      }
      case 'time_feasibility': {
        const duration = bp?.durationMinutes ?? 45;
        const load =
          bp?.activities?.reduce((s, a) => s + (a.durationMinutes ?? 10), 0) ??
          0;
        if (!bp?.activities?.length) {
          return { score: 40, confidence: 'low', refs: [], passed: false };
        }
        const score = load <= duration * 1.15 ? 85 : 40;
        return {
          score,
          confidence: 'medium',
          refs: [`load:${load}`, `duration:${duration}`],
          passed: score >= policy.thresholds.passScore,
        };
      }
      case 'innovation_signal': {
        const signals = bp?.innovationSignals ?? [];
        const score = signals.length > 0 ? 70 : 40;
        return {
          score,
          confidence: 'low',
          refs: signals,
          passed: score >= policy.thresholds.passScore,
        };
      }
      case 'classroom_practicality': {
        const notes = bp?.practicalityNotes ?? [];
        const rating = bp?.teacherFeedback?.rating ?? asset?.teacherFeedback?.rating;
        let score = notes.length > 0 ? 70 : 45;
        if (typeof rating === 'number') {
          score = Math.round((rating / 5) * 100);
        }
        return {
          score,
          confidence: typeof rating === 'number' ? 'high' : 'low',
          refs: notes,
          passed: score >= policy.thresholds.passScore,
        };
      }
      case 'activity_quality_signal': {
        if (asset) {
          const aligned = asset.alignedObjectiveIds?.length ?? 0;
          const score = aligned > 0 ? 80 : 45;
          return {
            score,
            confidence: 'medium',
            refs: asset.alignedObjectiveIds ?? [],
            passed: score >= policy.thresholds.passScore,
          };
        }
        const activities = bp?.activities ?? [];
        const titled = activities.filter((a) => a.title.trim().length > 0);
        const score =
          activities.length === 0
            ? 25
            : Math.round((titled.length / activities.length) * 100);
        return {
          score,
          confidence: 'high',
          refs: titled.map((a) => a.id),
          passed: score >= policy.thresholds.passScore,
        };
      }
      default:
        return {
          score: 50,
          confidence: 'low',
          refs: [],
          passed: false,
        };
    }
  }
}

function isBlueprint(
  subject: EvalSubject,
): subject is BlueprintQualityInput {
  return 'blueprintId' in subject;
}
