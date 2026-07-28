/**
 * ValidationEngine — mandatory gate before teacher delivery.
 *
 * Pipeline: detect type → load profile → run validators → aggregate →
 * score → optional repair → approve/reject.
 */

import { ValidationAuditService } from './audit-service.js';
import { newId, nowIso } from './ids.js';
import { getProfile } from './profiles.js';
import { QualityScorer } from './quality-scorer.js';
import { RepairEngine } from './repair-engine.js';
import { createStaticRuleProvider, RuleEngine } from './rule-store.js';
import { DEFAULT_VALIDATION_RULES } from './rules/default-rules.js';
import { ValidatorRegistry } from './validator-registry.js';
import { createDefaultValidators } from './validators.js';
import type {
  OverallValidationStatus,
  QualityWeights,
  ValidationArtifact,
  ValidationContext,
  ValidationProfile,
  ValidationReport,
  ValidatorResult,
} from './types.js';
import { DEFAULT_QUALITY_WEIGHTS } from './types.js';

export type CreateValidationEngineOptions = {
  readonly registry?: ValidatorRegistry;
  readonly ruleEngine?: RuleEngine;
  readonly scorer?: QualityScorer;
  readonly repairEngine?: RepairEngine;
  readonly audit?: ValidationAuditService;
  readonly weights?: QualityWeights;
  readonly clock?: () => Date;
};

export class ValidationEngine {
  private readonly registry: ValidatorRegistry;
  private readonly ruleEngine: RuleEngine;
  private readonly scorer: QualityScorer;
  private readonly repairEngine: RepairEngine;
  private readonly audit: ValidationAuditService;
  private readonly clock: () => Date;

  constructor(options: CreateValidationEngineOptions = {}) {
    this.registry = options.registry ?? new ValidatorRegistry();
    if (!options.registry) {
      this.registry.registerAll(createDefaultValidators());
    }
    this.ruleEngine = options.ruleEngine ?? new RuleEngine();
    if (!options.ruleEngine) {
      this.ruleEngine.registerProvider(
        createStaticRuleProvider('default-ts', DEFAULT_VALIDATION_RULES),
      );
    }
    this.scorer =
      options.scorer ??
      new QualityScorer(options.weights ?? DEFAULT_QUALITY_WEIGHTS);
    this.repairEngine = options.repairEngine ?? new RepairEngine();
    this.audit = options.audit ?? new ValidationAuditService(options.clock);
    this.clock = options.clock ?? (() => new Date());
  }

  getAuditService(): ValidationAuditService {
    return this.audit;
  }

  getRegistry(): ValidatorRegistry {
    return this.registry;
  }

  /**
   * Validate an artifact. Nothing should reach the teacher without this gate
   * for Publication / Export profiles (CRITICAL blocks).
   */
  async validate(
    artifact: ValidationArtifact,
    context: ValidationContext,
  ): Promise<ValidationReport> {
    const started = Date.now();
    const profile = this.requireProfile(context.profileId);
    const rules = await this.ruleEngine.loadAll();

    const results: ValidatorResult[] = [];
    for (const validatorId of profile.validatorIds) {
      const validator = this.registry.tryGet(validatorId);
      if (!validator) {
        results.push({
          validatorId,
          status: 'skipped',
          severity: 'INFO',
          score: 100,
          message: `Validator ${validatorId} not registered — skipped.`,
          repairPossible: false,
          metadata: {},
        });
        continue;
      }
      const result = await validator.validate(artifact, context, rules);
      results.push(result);
      this.audit.record({
        workflowId: artifact.workflowId,
        teacherId: artifact.teacherId,
        artifactId: artifact.artifactId,
        artifactVersion: artifact.version,
        validatorId: result.validatorId,
        result: result.status,
        severity: result.severity,
        message: result.message,
      });
    }

    let workingArtifact = artifact;
    let repairSuggestions = this.repairEngine.repair({
      artifact,
      context,
      failed: results.filter((r) => r.status === 'failed'),
    });
    let repairedPayload: Record<string, unknown> | undefined;
    let finalResults = results;

    const allowRepair = context.allowRepair ?? profile.allowRepair;
    if (allowRepair && repairSuggestions.changed) {
      repairedPayload = repairSuggestions.payload;
      workingArtifact = {
        ...artifact,
        payload: repairedPayload,
      };
      // Re-run validators once after repair (deterministic second pass)
      const rerun: ValidatorResult[] = [];
      for (const validatorId of profile.validatorIds) {
        const validator = this.registry.tryGet(validatorId);
        if (!validator) continue;
        rerun.push(await validator.validate(workingArtifact, context, rules));
      }
      finalResults = rerun;
      repairSuggestions = this.repairEngine.repair({
        artifact: workingArtifact,
        context,
        failed: finalResults.filter((r) => r.status === 'failed'),
      });
    }

    const overallScore = this.scorer.score(finalResults);
    const overallStatus = this.resolveStatus(
      profile,
      finalResults,
      overallScore,
      Boolean(repairedPayload),
    );

    const reportId = newId('vrep');
    const report: ValidationReport = {
      reportId,
      artifactId: artifact.artifactId,
      artifactType: artifact.artifactType,
      profileId: profile.profileId,
      overallScore,
      overallStatus,
      executedValidators: Object.freeze(
        finalResults.map((r) => r.validatorId),
      ),
      passedValidators: Object.freeze(
        finalResults
          .filter((r) => r.status === 'passed')
          .map((r) => r.validatorId),
      ),
      failedValidators: Object.freeze(
        finalResults
          .filter((r) => r.status === 'failed')
          .map((r) => r.validatorId),
      ),
      warnings: Object.freeze(
        finalResults.filter(
          (r) => r.status === 'failed' && r.severity === 'WARNING',
        ),
      ),
      errors: Object.freeze(
        finalResults.filter(
          (r) =>
            r.status === 'failed' &&
            (r.severity === 'ERROR' || r.severity === 'CRITICAL'),
        ),
      ),
      results: Object.freeze(finalResults),
      repairSuggestions: repairSuggestions.suggestions,
      repairedPayload,
      executionTimeMs: Date.now() - started,
      timestamp: nowIso(this.clock),
    };

    this.audit.record({
      workflowId: artifact.workflowId,
      teacherId: artifact.teacherId,
      artifactId: artifact.artifactId,
      artifactVersion: artifact.version,
      validatorId: 'aggregate',
      result: overallStatus,
      reportId,
      message: `score=${overallScore}`,
    });

    return report;
  }

  private requireProfile(profileId: string): ValidationProfile {
    const profile = getProfile(profileId);
    if (!profile) {
      throw new Error(`Unknown validation profile: ${profileId}`);
    }
    return profile;
  }

  private resolveStatus(
    profile: ValidationProfile,
    results: readonly ValidatorResult[],
    score: number,
    repaired: boolean,
  ): OverallValidationStatus {
    const blocking = results.filter(
      (r) =>
        r.status === 'failed' &&
        profile.blockingSeverities.includes(r.severity),
    );
    if (blocking.length > 0) return 'rejected';

    if (typeof profile.minScore === 'number' && score < profile.minScore) {
      return 'rejected';
    }

    const hasWarnings = results.some(
      (r) =>
        r.status === 'failed' &&
        (r.severity === 'WARNING' || r.severity === 'ERROR' || r.severity === 'INFO'),
    );

    // Publication policy: only CRITICAL blocks — ERROR without CRITICAL still warns
    if (repaired && !hasWarnings) return 'repaired';
    if (repaired) return 'repaired';
    if (hasWarnings) return 'approved_with_warnings';
    return 'approved';
  }
}

export function createValidationEngine(
  options?: CreateValidationEngineOptions,
): ValidationEngine {
  return new ValidationEngine(options);
}

/** Integration helper: true when report may be shown / published per profile policy. */
export function isDeliverableToTeacher(report: ValidationReport): boolean {
  return (
    report.overallStatus === 'approved' ||
    report.overallStatus === 'approved_with_warnings' ||
    report.overallStatus === 'repaired'
  );
}
