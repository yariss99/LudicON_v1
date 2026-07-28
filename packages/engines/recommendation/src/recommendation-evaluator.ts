import type {
  EvaluationContext,
  PolicyCondition,
  PolicyMatch,
  RecommendationPolicy,
} from './types.js';

/**
 * RecommendationEvaluator — evaluates declarative policy conditions
 * against contextual inputs. No Blueprint writes.
 */
export class RecommendationEvaluator {
  evaluate(
    policies: RecommendationPolicy[],
    context: EvaluationContext,
  ): PolicyMatch[] {
    const matches: PolicyMatch[] = [];
    for (const policy of policies) {
      const result = this.matchPolicy(policy, context);
      if (result) matches.push(result);
    }
    return matches;
  }

  private matchPolicy(
    policy: RecommendationPolicy,
    context: EvaluationContext,
  ): PolicyMatch | undefined {
    // All conditions must be satisfiable; some emit multiple bindings (objectives)
    if (policy.conditions.some((c) => c.type === 'objective_without_assessment')) {
      const objectives =
        context.blueprint?.objectives?.filter((o) => !o.hasAssessment) ?? [];
      if (objectives.length === 0) return undefined;
      const other = policy.conditions.filter(
        (c) => c.type !== 'objective_without_assessment',
      );
      if (!other.every((c) => this.conditionHolds(c, context).ok)) return undefined;
      const objective = objectives[0]!;
      return {
        policy,
        bindings: {
          objectiveId: objective.id,
          objectiveTitle: objective.title,
        },
        confidence: policy.confidenceBase,
      };
    }

    if (policy.conditions.some((c) => c.type === 'section_incomplete')) {
      const sections = context.blueprint?.incompleteSections ?? [];
      if (sections.length === 0) return undefined;
      const section = sections[0]!;
      return {
        policy,
        bindings: { sectionName: section },
        confidence: policy.confidenceBase,
      };
    }

    const bindings: Record<string, string> = {};
    for (const condition of policy.conditions) {
      const held = this.conditionHolds(condition, context);
      if (!held.ok) return undefined;
      Object.assign(bindings, held.bindings);
    }

    return {
      policy,
      bindings,
      confidence: policy.confidenceBase,
    };
  }

  private conditionHolds(
    condition: PolicyCondition,
    context: EvaluationContext,
  ): { ok: boolean; bindings?: Record<string, string> } {
    switch (condition.type) {
      case 'objective_without_assessment': {
        const hit = context.blueprint?.objectives?.some((o) => !o.hasAssessment);
        return { ok: Boolean(hit) };
      }
      case 'quality_below': {
        const field = condition.field ?? 'overall';
        const score = context.quality?.[field as keyof NonNullable<EvaluationContext['quality']>];
        const threshold = condition.threshold ?? 0.5;
        if (typeof score !== 'number') return { ok: false };
        return {
          ok: score < threshold,
          bindings: {
            [`${field}Score`]: score.toFixed(2),
            threshold: String(threshold),
          },
        };
      }
      case 'similar_blueprint_exists': {
        const minRating = condition.minRating ?? 0;
        const similar = context.memory?.similarBlueprints?.find(
          (b) => (b.rating ?? 0) >= minRating,
        );
        if (!similar) return { ok: false };
        return {
          ok: true,
          bindings: {
            similarBlueprintId: similar.id,
            similarBlueprintTitle: similar.title,
            similarBlueprintRating: String(similar.rating ?? 0),
          },
        };
      }
      case 'section_incomplete': {
        const sections = context.blueprint?.incompleteSections ?? [];
        if (sections.length === 0) return { ok: false };
        return {
          ok: true,
          bindings: { sectionName: sections[0]! },
        };
      }
      case 'open_clarifications': {
        const list = context.conversation?.openClarifications ?? [];
        if (list.length === 0) return { ok: false };
        return {
          ok: true,
          bindings: { clarificationList: list.join(', ') },
        };
      }
      case 'missing_differentiation': {
        return {
          ok: context.blueprint?.hasDifferentiation === false,
          bindings: {},
        };
      }
      case 'accessibility_gap': {
        return {
          ok: context.blueprint?.hasAccessibilitySupports === false,
          bindings: {
            accessibilityScore: String(context.quality?.accessibility ?? 0),
          },
        };
      }
      case 'preference_match': {
        if (condition.field === 'assessment') {
          const pref = context.memory?.assessmentPreferences?.[0];
          if (!pref) return { ok: false };
          return {
            ok: true,
            bindings: { assessmentPreference: pref },
          };
        }
        if (condition.field === 'generation_complete') {
          const count = context.generation?.completedAssetIds?.length ?? 0;
          const done =
            context.generation?.stage === 'completed' || count > 0;
          if (!done) return { ok: false };
          return {
            ok: true,
            bindings: { completedAssetCount: String(count || 1) },
          };
        }
        return { ok: false };
      }
      default:
        return { ok: false };
    }
  }
}
