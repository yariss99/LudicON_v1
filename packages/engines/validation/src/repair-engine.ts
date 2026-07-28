/**
 * Repair Engine — formatting / schema / metadata only.
 * Never invents curriculum. Never changes teacher decisions.
 */

import { newId } from './ids.js';
import type {
  RepairSuggestion,
  ValidationArtifact,
  ValidationContext,
  ValidatorResult,
} from './types.js';

export type RepairOutcome = {
  readonly payload: Record<string, unknown>;
  readonly suggestions: readonly RepairSuggestion[];
  readonly changed: boolean;
};

export class RepairEngine {
  repair(input: {
    artifact: ValidationArtifact;
    context: ValidationContext;
    failed: readonly ValidatorResult[];
  }): RepairOutcome {
    const payload: Record<string, unknown> = {
      ...input.artifact.payload,
    };
    const suggestions: RepairSuggestion[] = [];
    let changed = false;

    for (const fail of input.failed) {
      if (!fail.repairPossible) {
        suggestions.push({
          suggestionId: newId('rep'),
          validatorId: fail.validatorId,
          description: fail.recommendation ?? fail.message,
          autoApplied: false,
        });
        continue;
      }

      if (fail.validatorId === 'schema') {
        if (isEmpty(payload.title) && input.context.expectedSubject) {
          payload.title = `${input.context.expectedSubject} draft`;
          changed = true;
          suggestions.push({
            suggestionId: newId('rep'),
            validatorId: 'schema',
            description: 'Filled missing title from subject context.',
            autoApplied: true,
            fieldPath: 'title',
          });
        }
        if (isEmpty(payload.subject) && input.context.expectedSubject) {
          payload.subject = input.context.expectedSubject;
          changed = true;
          suggestions.push({
            suggestionId: newId('rep'),
            validatorId: 'schema',
            description: 'Filled missing subject from validation context.',
            autoApplied: true,
            fieldPath: 'subject',
          });
        }
      }

      if (fail.validatorId === 'curriculum' || fail.validatorId === 'consistency') {
        if (isEmpty(payload.grade) && input.context.expectedGrade) {
          payload.grade = input.context.expectedGrade;
          changed = true;
          suggestions.push({
            suggestionId: newId('rep'),
            validatorId: fail.validatorId,
            description: 'Filled missing grade from validation context.',
            autoApplied: true,
            fieldPath: 'grade',
          });
        }
      }

      if (fail.validatorId === 'language' && isEmpty(payload.language)) {
        payload.language = input.artifact.locale ?? 'ro';
        changed = true;
        suggestions.push({
          suggestionId: newId('rep'),
          validatorId: 'language',
          description: 'Set language metadata from artifact locale.',
          autoApplied: true,
          fieldPath: 'language',
        });
      }

      if (
        fail.validatorId === 'accessibility' &&
        isEmpty(payload.accessibilityNote)
      ) {
        payload.accessibilityNote =
          'Ensure text alternatives and readable contrast in classroom use.';
        changed = true;
        suggestions.push({
          suggestionId: newId('rep'),
          validatorId: 'accessibility',
          description: 'Added default accessibility note (metadata only).',
          autoApplied: true,
          fieldPath: 'accessibilityNote',
        });
      }

      if (fail.validatorId === 'formatting') {
        if (typeof payload.content === 'string') {
          const trimmed = payload.content.trim();
          if (trimmed !== payload.content) {
            payload.content = trimmed;
            changed = true;
            suggestions.push({
              suggestionId: newId('rep'),
              validatorId: 'formatting',
              description: 'Trimmed content whitespace.',
              autoApplied: true,
              fieldPath: 'content',
            });
          }
        }
      }
    }

    return {
      payload,
      suggestions: Object.freeze(suggestions),
      changed,
    };
  }
}

function isEmpty(value: unknown): boolean {
  return value === undefined || value === null || value === '';
}
