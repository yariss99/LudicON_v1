import { renderTemplate } from './ids.js';
import type {
  PolicyMatch,
  RecommendationExplanation,
} from './types.js';

/**
 * RecommendationExplainer — every recommendation must explain why/improves/impact.
 */
export class RecommendationExplainer {
  explain(match: PolicyMatch): RecommendationExplanation {
    const { policy, bindings } = match;
    const why = renderTemplate(policy.explanation.whyTemplate, bindings).trim();
    const improves = renderTemplate(
      policy.explanation.improvesTemplate,
      bindings,
    ).trim();
    const expectedImpact = renderTemplate(
      policy.explanation.impactTemplate,
      bindings,
    ).trim();
    const related = policy.explanation.relatedSection
      ? renderTemplate(policy.explanation.relatedSection, bindings).trim()
      : undefined;

    if (!why || !improves || !expectedImpact) {
      throw new Error(
        `Policy ${policy.policyId} produced an incomplete explanation`,
      );
    }

    return {
      why,
      improves,
      expectedImpact,
      relatedBlueprintSection: related,
    };
  }
}
