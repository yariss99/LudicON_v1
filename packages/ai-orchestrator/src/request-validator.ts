/**
 * Request validation — Context Before Prompt.
 * Rejects raw-prompt-only or incomplete educational requests.
 */

import { AIOrchestratorError } from './errors.js';
import type { AIRequest, ValidationIssue } from './types.js';

export class RequestValidator {
  validate(request: AIRequest): void {
    const issues: ValidationIssue[] = [];

    if (!request.requestId?.trim()) {
      issues.push({
        code: 'MISSING_REQUEST_ID',
        message: 'requestId is required.',
        severity: 'error',
      });
    }
    if (!request.workflowId?.trim()) {
      issues.push({
        code: 'MISSING_WORKFLOW_ID',
        message: 'workflowId is required.',
        severity: 'error',
      });
    }
    if (!request.teacherId?.trim()) {
      issues.push({
        code: 'MISSING_TEACHER_ID',
        message: 'teacherId is required.',
        severity: 'error',
      });
    }
    if (!request.projectId?.trim()) {
      issues.push({
        code: 'MISSING_PROJECT_ID',
        message: 'projectId is required.',
        severity: 'error',
      });
    }
    if (!request.requestType?.trim()) {
      issues.push({
        code: 'MISSING_REQUEST_TYPE',
        message: 'requestType is required.',
        severity: 'error',
      });
    }
    if (!request.promptContext?.intent?.trim()) {
      issues.push({
        code: 'MISSING_INTENT',
        message: 'promptContext.intent is required.',
        severity: 'error',
      });
    }
    if (!request.expectedOutputSchema?.schemaId?.trim()) {
      issues.push({
        code: 'MISSING_SCHEMA',
        message: 'expectedOutputSchema.schemaId is required.',
        severity: 'error',
      });
    }
    if (
      !request.expectedOutputSchema?.requiredFields ||
      request.expectedOutputSchema.requiredFields.length === 0
    ) {
      issues.push({
        code: 'MISSING_REQUIRED_FIELDS',
        message: 'expectedOutputSchema.requiredFields must be non-empty.',
        severity: 'error',
      });
    }

    const edu = request.educationalContext;
    const hasEducationalSignal = Boolean(
      edu?.subject ||
        edu?.grade ||
        edu?.topic ||
        edu?.curriculumRef ||
        (edu?.learningObjectives && edu.learningObjectives.length > 0) ||
        (edu?.competencies && edu.competencies.length > 0),
    );
    if (!hasEducationalSignal) {
      issues.push({
        code: 'MISSING_EDUCATIONAL_CONTEXT',
        message:
          'educationalContext must include at least one pedagogical signal (subject, grade, topic, curriculum, objectives, or competencies). Raw prompts alone are rejected.',
        severity: 'error',
      });
    }

    // Reject "raw user prompt" smuggled as the only content without structure
    const rawOnly =
      typeof request.metadata?.rawUserPrompt === 'string' &&
      !request.promptContext.instructions?.length &&
      !hasEducationalSignal;
    if (rawOnly) {
      issues.push({
        code: 'RAW_PROMPT_FORBIDDEN',
        message: 'Raw user prompts cannot be sent without educational context.',
        severity: 'error',
      });
    }

    const errors = issues.filter((i) => i.severity === 'error');
    if (errors.length > 0) {
      throw new AIOrchestratorError(
        'INVALID_REQUEST',
        `AI request validation failed: ${errors.map((e) => e.code).join(', ')}`,
        { details: { issues } },
      );
    }
  }
}
