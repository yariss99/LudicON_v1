/**
 * Deterministic rule condition evaluator.
 */

import { getPath, isEmpty } from './ids.js';
import type { RuleCondition } from './types.js';

export function evaluateCondition(
  condition: RuleCondition,
  payload: Readonly<Record<string, unknown>>,
  context: Readonly<Record<string, unknown>>,
): boolean {
  const scope = { ...context, ...payload, payload, context };

  switch (condition.op) {
    case 'always':
      return true;
    case 'missing':
      return getPath(scope, condition.path) === undefined;
    case 'empty':
      return isEmpty(getPath(scope, condition.path));
    case 'eq': {
      const v = getPath(scope, condition.path);
      return v === condition.value;
    }
    case 'gt': {
      const v = getPath(scope, condition.path);
      return typeof v === 'number' && v > condition.value;
    }
    case 'and':
      return condition.conditions.every((c) =>
        evaluateCondition(c, payload, context),
      );
    case 'or':
      return condition.conditions.some((c) =>
        evaluateCondition(c, payload, context),
      );
    default: {
      const _exhaustive: never = condition;
      return _exhaustive;
    }
  }
}
