/**
 * PromptDispatcher — builds provider-facing PromptPackage from structured context.
 * Application never supplies a finished provider prompt.
 */

import { AIOrchestratorError } from './errors.js';
import type {
  AIRequest,
  EducationalContext,
  PromptPackage,
} from './types.js';

export class PromptDispatcher {
  build(request: AIRequest, educationalContext: EducationalContext): PromptPackage {
    if (!request.promptContext.intent.trim()) {
      throw new AIOrchestratorError(
        'INVALID_PROMPT',
        'Cannot build prompt without intent.',
      );
    }

    const system = [
      'You are an educational assistant inside PRIMA.',
      'Pedagogy first. Teacher authority is absolute.',
      'Never diagnose or label learners.',
      'Return structured content matching the requested schema fields.',
      educationalContext.locale
        ? `Prefer locale: ${educationalContext.locale}.`
        : undefined,
      request.promptContext.tone
        ? `Tone: ${request.promptContext.tone}.`
        : undefined,
      request.promptContext.outputLanguage
        ? `Output language: ${request.promptContext.outputLanguage}.`
        : undefined,
    ]
      .filter(Boolean)
      .join('\n');

    const eduLines = [
      educationalContext.subject && `Subject: ${educationalContext.subject}`,
      educationalContext.grade && `Grade: ${educationalContext.grade}`,
      educationalContext.topic && `Topic: ${educationalContext.topic}`,
      educationalContext.curriculumRef &&
        `Curriculum: ${educationalContext.curriculumRef}`,
      educationalContext.learningObjectives?.length &&
        `Objectives: ${educationalContext.learningObjectives.join('; ')}`,
      educationalContext.competencies?.length &&
        `Competencies: ${educationalContext.competencies.join('; ')}`,
      educationalContext.constraints?.length &&
        `Constraints: ${educationalContext.constraints.join('; ')}`,
      educationalContext.teacherNotes &&
        `Teacher notes: ${educationalContext.teacherNotes}`,
    ].filter(Boolean);

    const instructions = (request.promptContext.instructions ?? [])
      .map((i) => `- ${i}`)
      .join('\n');

    const vars = request.promptContext.variables
      ? Object.entries(request.promptContext.variables)
          .map(([k, v]) => `${k}=${v}`)
          .join(', ')
      : '';

    const user = [
      `Request type: ${request.requestType}`,
      `Intent: ${request.promptContext.intent}`,
      eduLines.length ? `Educational context:\n${eduLines.join('\n')}` : '',
      instructions ? `Instructions:\n${instructions}` : '',
      vars ? `Variables: ${vars}` : '',
      `Required output fields: ${request.expectedOutputSchema.requiredFields.join(', ')}`,
      request.expectedOutputSchema.description
        ? `Schema note: ${request.expectedOutputSchema.description}`
        : '',
      'Respond as a JSON object containing at least the required fields.',
    ]
      .filter(Boolean)
      .join('\n\n');

    return {
      system,
      user,
      requestType: request.requestType,
      schemaId: request.expectedOutputSchema.schemaId,
      locale: educationalContext.locale ?? request.promptContext.outputLanguage,
    };
  }
}
