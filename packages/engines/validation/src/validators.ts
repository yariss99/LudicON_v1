/**
 * Built-in validators — one concern each (Strategy + Chain of Responsibility).
 */

import { evaluateCondition } from './rule-engine.js';
import type {
  ValidationArtifact,
  ValidationContext,
  ValidationRule,
  Validator,
  ValidatorResult,
} from './types.js';

const UNSAFE =
  /\b(kill yourself|how to make a bomb|child sexual|csam)\b/i;
const LABELING =
  /\b(stupid kids?|low[- ]ability|diagnos(e|is|ed)|deficit learner)\b/i;

function baseResult(
  id: Validator['id'],
  partial: Omit<ValidatorResult, 'validatorId'>,
): ValidatorResult {
  return { validatorId: id, ...partial, metadata: Object.freeze(partial.metadata ?? {}) };
}

function applyRules(
  validatorId: Validator['id'],
  artifact: ValidationArtifact,
  context: ValidationContext,
  rules: readonly ValidationRule[],
  extraFail?: () => ValidatorResult | undefined,
): ValidatorResult {
  const applicable = rules.filter(
    (r) =>
      r.validatorId === validatorId &&
      r.enabled &&
      (r.artifactTypes.includes(artifact.artifactType) ||
        (r.artifactTypes as readonly string[]).includes('*')) &&
      (r.profiles.includes(context.profileId) ||
        (r.profiles as readonly string[]).includes('*')),
  );

  const ctxBag = {
    expectedGrade: context.expectedGrade,
    expectedSubject: context.expectedSubject,
    curriculumRef: context.curriculumRef,
  };

  let worst = baseResult(validatorId, {
    status: 'passed',
    severity: 'INFO',
    score: 100,
    message: `${validatorId} passed.`,
    repairPossible: false,
    metadata: { rulesEvaluated: applicable.length },
  });

  const severityRank = { INFO: 0, WARNING: 1, ERROR: 2, CRITICAL: 3 };

  for (const rule of applicable) {
    // PED-NO-LABELING and SAFE use payload text scan, not only declarative when
    if (rule.ruleId === 'PED-NO-LABELING') {
      const text = JSON.stringify(artifact.payload);
      if (LABELING.test(text)) {
        return baseResult(validatorId, {
          status: 'failed',
          severity: 'CRITICAL',
          score: 0,
          message: rule.message,
          recommendation: rule.recommendation,
          repairPossible: false,
          metadata: { ruleId: rule.ruleId },
        });
      }
      continue;
    }
    if (rule.ruleId === 'SAFE-UNSAFE-CONTENT') {
      const text = JSON.stringify(artifact.payload);
      if (UNSAFE.test(text)) {
        return baseResult(validatorId, {
          status: 'failed',
          severity: 'CRITICAL',
          score: 0,
          message: rule.message,
          recommendation: rule.recommendation,
          repairPossible: false,
          metadata: { ruleId: rule.ruleId },
        });
      }
      continue;
    }

    if (evaluateCondition(rule.when, artifact.payload, ctxBag)) {
      const score = rule.scoreImpact ?? severityToScore(rule.severity);
      if (severityRank[rule.severity] >= severityRank[worst.severity]) {
        worst = baseResult(validatorId, {
          status: 'failed',
          severity: rule.severity,
          score,
          message: rule.message,
          recommendation: rule.recommendation,
          repairPossible: Boolean(rule.repairPossible),
          metadata: { ruleId: rule.ruleId },
        });
      }
    }
  }

  const extra = extraFail?.();
  if (extra && severityRank[extra.severity] > severityRank[worst.severity]) {
    return extra;
  }
  if (extra && worst.status === 'passed' && extra.status === 'failed') {
    return extra;
  }

  return worst;
}

function severityToScore(severity: ValidatorResult['severity']): number {
  switch (severity) {
    case 'INFO':
      return 95;
    case 'WARNING':
      return 70;
    case 'ERROR':
      return 40;
    case 'CRITICAL':
      return 0;
  }
}

export function createSchemaValidator(): Validator {
  return {
    id: 'schema',
    displayName: 'Schema Validator',
    validate: (a, c, rules) => applyRules('schema', a, c, rules),
  };
}

export function createCurriculumValidator(): Validator {
  return {
    id: 'curriculum',
    displayName: 'Curriculum Validator',
    validate: (a, c, rules) =>
      applyRules('curriculum', a, c, rules, () => {
        if (
          c.expectedSubject &&
          typeof a.payload.subject === 'string' &&
          a.payload.subject.length > 0 &&
          a.payload.subject.toLowerCase() !== c.expectedSubject.toLowerCase()
        ) {
          return baseResult('curriculum', {
            status: 'failed',
            severity: 'WARNING',
            score: 65,
            message: `Subject "${a.payload.subject}" differs from expected "${c.expectedSubject}".`,
            recommendation: 'Align subject with curriculum context.',
            repairPossible: true,
            metadata: { expectedSubject: c.expectedSubject },
          });
        }
        return undefined;
      }),
  };
}

export function createCompetencyValidator(): Validator {
  return {
    id: 'competency',
    displayName: 'Competency Validator',
    validate: (a, c, rules) =>
      applyRules('competency', a, c, rules, () => {
        if (
          c.profileId === 'Publication' &&
          (!Array.isArray(a.payload.competencies) ||
            a.payload.competencies.length === 0)
        ) {
          return baseResult('competency', {
            status: 'failed',
            severity: 'WARNING',
            score: 60,
            message: 'Competencies missing for publication profile.',
            recommendation: 'Attach competencies before publish.',
            repairPossible: false,
            metadata: {},
          });
        }
        return undefined;
      }),
  };
}

export function createLearningObjectiveValidator(): Validator {
  return {
    id: 'learning-objective',
    displayName: 'Learning Objective Validator',
    validate: (a, c, rules) => applyRules('learning-objective', a, c, rules),
  };
}

export function createPedagogicalValidator(): Validator {
  return {
    id: 'pedagogical',
    displayName: 'Pedagogical Validator',
    validate: (a, c, rules) => applyRules('pedagogical', a, c, rules),
  };
}

export function createAccessibilityValidator(): Validator {
  return {
    id: 'accessibility',
    displayName: 'Accessibility Validator',
    validate: (a, c, rules) => applyRules('accessibility', a, c, rules),
  };
}

export function createLanguageValidator(): Validator {
  return {
    id: 'language',
    displayName: 'Language Validator',
    validate: (a, c, rules) => applyRules('language', a, c, rules),
  };
}

export function createFormattingValidator(): Validator {
  return {
    id: 'formatting',
    displayName: 'Formatting Validator',
    validate: (a, c, rules) => applyRules('formatting', a, c, rules),
  };
}

export function createSafetyValidator(): Validator {
  return {
    id: 'safety',
    displayName: 'Safety Validator',
    validate: (a, c, rules) => applyRules('safety', a, c, rules),
  };
}

export function createDuplicateValidator(): Validator {
  return {
    id: 'duplicate',
    displayName: 'Duplicate Validator',
    validate: (a, c) => {
      const fp = JSON.stringify({
        type: a.artifactType,
        title: a.payload.title,
        subject: a.payload.subject,
      });
      if (c.knownArtifactFingerprints?.includes(fp)) {
        return baseResult('duplicate', {
          status: 'failed',
          severity: 'WARNING',
          score: 55,
          message: 'Possible duplicate artifact detected.',
          recommendation: 'Confirm this is not an unintended duplicate.',
          repairPossible: false,
          metadata: { fingerprint: fp },
        });
      }
      return baseResult('duplicate', {
        status: 'passed',
        severity: 'INFO',
        score: 100,
        message: 'No duplicate fingerprint match.',
        repairPossible: false,
        metadata: {},
      });
    },
  };
}

export function createConsistencyValidator(): Validator {
  return {
    id: 'consistency',
    displayName: 'Consistency Validator',
    validate: (a, c) => {
      if (
        c.expectedGrade &&
        typeof a.payload.grade === 'string' &&
        a.payload.grade.length > 0 &&
        !String(a.payload.grade).includes(String(c.expectedGrade)) &&
        String(c.expectedGrade) !== String(a.payload.grade)
      ) {
        return baseResult('consistency', {
          status: 'failed',
          severity: 'WARNING',
          score: 70,
          message: 'Grade is inconsistent with validation context.',
          recommendation: 'Align grade with teacher-declared context.',
          repairPossible: true,
          metadata: {},
        });
      }
      return baseResult('consistency', {
        status: 'passed',
        severity: 'INFO',
        score: 100,
        message: 'Consistency checks passed.',
        repairPossible: false,
        metadata: {},
      });
    },
  };
}

export function createAiOutputValidator(): Validator {
  return {
    id: 'ai-output',
    displayName: 'AI Output Validator',
    validate: (a) => {
      if (a.payload.providerNote === 'stub-generation' && !a.payload.content) {
        return baseResult('ai-output', {
          status: 'failed',
          severity: 'ERROR',
          score: 40,
          message: 'AI output lacks educational content body.',
          recommendation: 'Regenerate or complete content before delivery.',
          repairPossible: false,
          metadata: {},
        });
      }
      return baseResult('ai-output', {
        status: 'passed',
        severity: 'INFO',
        score: 100,
        message: 'AI output structure acceptable.',
        repairPossible: false,
        metadata: {},
      });
    },
  };
}

export function createReferenceValidator(): Validator {
  return {
    id: 'reference',
    displayName: 'Reference Validator',
    validate: (a, c) => {
      if (
        c.curriculumRef &&
        typeof a.payload.curriculumRef === 'string' &&
        a.payload.curriculumRef !== c.curriculumRef
      ) {
        return baseResult('reference', {
          status: 'failed',
          severity: 'WARNING',
          score: 75,
          message: 'Curriculum reference mismatch.',
          recommendation: 'Verify curriculum pack identity.',
          repairPossible: false,
          metadata: {},
        });
      }
      return baseResult('reference', {
        status: 'passed',
        severity: 'INFO',
        score: 100,
        message: 'References consistent.',
        repairPossible: false,
        metadata: {},
      });
    },
  };
}

export function createDefaultValidators(): readonly Validator[] {
  return [
    createSchemaValidator(),
    createCurriculumValidator(),
    createCompetencyValidator(),
    createLearningObjectiveValidator(),
    createPedagogicalValidator(),
    createAccessibilityValidator(),
    createLanguageValidator(),
    createFormattingValidator(),
    createSafetyValidator(),
    createDuplicateValidator(),
    createConsistencyValidator(),
    createAiOutputValidator(),
    createReferenceValidator(),
  ];
}
