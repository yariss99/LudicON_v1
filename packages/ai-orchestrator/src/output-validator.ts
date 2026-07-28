/**
 * OutputValidator — schema, completeness, unsafe content, language heuristics.
 */

import type {
  AIRequest,
  EducationalContext,
  ValidationIssue,
  ValidationReport,
} from './types.js';

const UNSAFE_PATTERNS =
  /\b(kill yourself|how to make a bomb|child sexual|csam)\b/i;

export class OutputValidator {
  validate(input: {
    request: AIRequest;
    educationalContext: EducationalContext;
    structured: Readonly<Record<string, unknown>>;
    rawText: string;
  }): ValidationReport {
    const issues: ValidationIssue[] = [];
    const { request, structured, rawText, educationalContext } = input;

    for (const field of request.expectedOutputSchema.requiredFields) {
      const value = structured[field];
      if (value === undefined || value === null || value === '') {
        issues.push({
          code: 'MISSING_FIELD',
          message: `Required field "${field}" is missing.`,
          path: field,
          severity: 'error',
        });
      }
    }

    if (!rawText.trim() && Object.keys(structured).length === 0) {
      issues.push({
        code: 'EMPTY_RESPONSE',
        message: 'Response is empty.',
        severity: 'error',
      });
    }

    if (UNSAFE_PATTERNS.test(rawText)) {
      issues.push({
        code: 'UNSAFE_CONTENT',
        message: 'Response failed unsafe-content checks.',
        severity: 'error',
      });
    }

    if (
      educationalContext.subject &&
      typeof structured.subject === 'string' &&
      structured.subject.length > 0
    ) {
      const expected = educationalContext.subject.toLowerCase();
      const got = structured.subject.toLowerCase();
      if (!got.includes(expected) && !expected.includes(got)) {
        issues.push({
          code: 'CURRICULUM_SUBJECT_MISMATCH',
          message: `Output subject "${structured.subject}" does not align with context subject "${educationalContext.subject}".`,
          path: 'subject',
          severity: 'warning',
        });
      }
    }

    const lang = request.promptContext.outputLanguage;
    if (lang && typeof structured.language === 'string') {
      if (
        structured.language.toLowerCase() !== lang.toLowerCase() &&
        !structured.language.toLowerCase().startsWith(lang.toLowerCase().slice(0, 2))
      ) {
        issues.push({
          code: 'LANGUAGE_MISMATCH',
          message: `Expected language ${lang}, got ${structured.language}.`,
          path: 'language',
          severity: 'warning',
        });
      }
    }

    const errors = issues.filter((i) => i.severity === 'error');
    return {
      ok: errors.length === 0,
      issues: Object.freeze(issues),
      repaired: false,
    };
  }

  /**
   * Best-effort repair: fill missing required fields from educational context.
   */
  repair(input: {
    request: AIRequest;
    educationalContext: EducationalContext;
    structured: Readonly<Record<string, unknown>>;
    rawText: string;
  }): {
    structured: Record<string, unknown>;
    report: ValidationReport;
  } {
    const next: Record<string, unknown> = { ...input.structured };
    let repaired = false;

    for (const field of input.request.expectedOutputSchema.requiredFields) {
      if (next[field] !== undefined && next[field] !== null && next[field] !== '') {
        continue;
      }
      if (field === 'subject' && input.educationalContext.subject) {
        next.subject = input.educationalContext.subject;
        repaired = true;
      } else if (field === 'grade' && input.educationalContext.grade) {
        next.grade = input.educationalContext.grade;
        repaired = true;
      } else if (field === 'topic' && input.educationalContext.topic) {
        next.topic = input.educationalContext.topic;
        repaired = true;
      } else if (
        field === 'title' &&
        input.educationalContext.topic &&
        input.educationalContext.subject
      ) {
        next.title = `${input.educationalContext.subject}: ${input.educationalContext.topic}`;
        repaired = true;
      }
    }

    const report = this.validate({
      ...input,
      structured: next,
    });

    return {
      structured: next,
      report: { ...report, repaired: repaired || report.repaired },
    };
  }
}
