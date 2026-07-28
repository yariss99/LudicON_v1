import type { ActiveRuntimeContext, ValidationReport } from './types.js';

/**
 * ContextValidator — structural consistency only; no pedagogy.
 */
export class ContextValidator {
  validate(context: ActiveRuntimeContext): ValidationReport {
    const issues: ValidationReport['issues'] = [];

    if (!context.sessionId) {
      issues.push({
        code: 'SESSION',
        message: 'sessionId is required',
        severity: 'error',
        domain: 'session',
      });
    }
    if (!context.teacher.teacherId) {
      issues.push({
        code: 'TEACHER',
        message: 'teacherId is required',
        severity: 'error',
        domain: 'teacher',
      });
    }
    if (context.lifecycle === 'expired') {
      issues.push({
        code: 'EXPIRED',
        message: 'Context has expired',
        severity: 'error',
      });
    }
    if (
      context.expiresAt &&
      Date.parse(context.expiresAt) < Date.now() &&
      context.lifecycle !== 'archived'
    ) {
      issues.push({
        code: 'TTL',
        message: 'Context TTL elapsed',
        severity: 'error',
      });
    }
    if (
      context.blueprint.approvalStatus === 'approved' &&
      !context.blueprint.blueprintId
    ) {
      issues.push({
        code: 'BLUEPRINT',
        message: 'Approved blueprint requires blueprintId',
        severity: 'error',
        domain: 'blueprint',
      });
    }
    if (
      context.generation.currentStage === 'running' &&
      context.generation.generationQueue.length === 0 &&
      !context.generation.selectedAssetId
    ) {
      issues.push({
        code: 'GENERATION',
        message: 'Running generation requires queue or selected asset',
        severity: 'warning',
        domain: 'generation',
      });
    }

    for (const [section, conf] of Object.entries(
      context.blueprint.confidenceMap,
    )) {
      if (conf < 0 || conf > 1) {
        issues.push({
          code: 'CONFIDENCE',
          message: `Invalid confidence for ${section}`,
          severity: 'error',
          domain: 'blueprint',
        });
      }
    }

    return { ok: issues.every((i) => i.severity !== 'error'), issues };
  }
}
