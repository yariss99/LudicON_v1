import { uid, renderTemplate } from './ids.js';
import { PriorityCalculator } from './priority-calculator.js';
import { RecommendationDispatcher } from './recommendation-dispatcher.js';
import { RecommendationEvaluator } from './recommendation-evaluator.js';
import { RecommendationExplainer } from './recommendation-explainer.js';
import { RecommendationHistory } from './recommendation-history.js';
import { RecommendationLearning } from './recommendation-learning.js';
import { RecommendationPolicyEngine } from './recommendation-policy-engine.js';
import { RecommendationRegistry } from './recommendation-registry.js';
import type {
  EvaluationContext,
  RecommendationCard,
  RecommendationCategory,
  RecommendationPolicy,
  RecommendationPriority,
} from './types.js';

export type CreateRecommendationEngineOptions = {
  policies?: RecommendationPolicy[];
};

/**
 * RecommendationEngine — orchestration facade (UI-independent).
 * Observes → evaluates policies → recommends. Never mutates Blueprints.
 */
export class RecommendationEngine {
  readonly registry: RecommendationRegistry;
  readonly policies: RecommendationPolicyEngine;
  readonly evaluator: RecommendationEvaluator;
  readonly priority: PriorityCalculator;
  readonly explainer: RecommendationExplainer;
  readonly history: RecommendationHistory;
  readonly learning: RecommendationLearning;
  readonly dispatcher: RecommendationDispatcher;

  /** Guard: engine must never expose Blueprint mutation APIs */
  readonly mutatesBlueprint = false as const;

  constructor(options: CreateRecommendationEngineOptions = {}) {
    this.registry = new RecommendationRegistry();
    this.policies = new RecommendationPolicyEngine(options.policies);
    this.evaluator = new RecommendationEvaluator();
    this.priority = new PriorityCalculator();
    this.explainer = new RecommendationExplainer();
    this.history = new RecommendationHistory();
    this.learning = new RecommendationLearning();
    this.dispatcher = new RecommendationDispatcher();
  }

  evaluatePolicies(context: EvaluationContext): RecommendationCard[] {
    const candidates = this.policies.forTrigger(context.trigger);
    const matches = this.evaluator.evaluate(candidates, context);
    const sessionCounts = new Map<string, number>();
    const created: RecommendationCard[] = [];

    for (const match of matches) {
      if (
        this.learning.shouldSuppress(context.teacherId, match.policy.policyId)
      ) {
        continue;
      }

      // Deduplicate active cards for same policy + primary binding
      const fingerprint = `${match.policy.policyId}:${Object.values(match.bindings).join('|')}`;
      const existing = this.registry
        .active(context.sessionId)
        .find(
          (c) =>
            c.policyId === match.policy.policyId &&
            Object.values(c.contextRefs).join('|') ===
              Object.values(match.bindings).join('|'),
        );
      if (existing) continue;

      const explanation = this.explainer.explain(match);
      const adj = this.learning.confidenceAdjustment(
        context.teacherId,
        match.policy.policyId,
      );
      const confidence = Math.max(
        0,
        Math.min(1, match.confidence + adj),
      );
      const now = new Date().toISOString();
      const card: RecommendationCard = {
        recommendationId: uid('rec'),
        policyId: match.policy.policyId,
        category: match.policy.category,
        priority: match.policy.priority,
        title: renderTemplate(
          match.policy.recommendation.titleTemplate,
          match.bindings,
        ),
        description: renderTemplate(
          match.policy.recommendation.descriptionTemplate,
          match.bindings,
        ),
        explanation,
        suggestedAction: renderTemplate(
          match.policy.recommendation.suggestedAction,
          match.bindings,
        ),
        alternativeActions: (
          match.policy.recommendation.alternativeActions ?? []
        ).map((a) => renderTemplate(a, match.bindings)),
        confidenceScore: Number(confidence.toFixed(2)),
        triggerSource: context.trigger,
        timestamp: now,
        status: 'new',
        sessionId: context.sessionId,
        teacherId: context.teacherId,
        contextRefs: { ...match.bindings, fingerprint },
        expiresAt: match.policy.expirationMs
          ? new Date(Date.now() + match.policy.expirationMs).toISOString()
          : undefined,
      };

      // Enforce explanation completeness
      if (
        !card.explanation.why ||
        !card.explanation.improves ||
        !card.explanation.expectedImpact
      ) {
        continue;
      }

      this.registry.upsert(card);
      this.history.record(card, 'new', 'new', 'created');
      created.push(card);
    }

    const capped = this.priority.applyFrequencyCap(created, sessionCounts);
    if (capped.length) this.dispatcher.dispatch(capped);
    return this.priority.sort(capped);
  }

  getRecommendations(filter?: {
    sessionId?: string;
    teacherId?: string;
    category?: RecommendationCategory;
    priority?: RecommendationPriority;
    query?: string;
  }): RecommendationCard[] {
    this.expireStale(filter?.sessionId);
    let cards = filter?.sessionId
      ? this.registry.active(filter.sessionId)
      : this.registry.list({
          teacherId: filter?.teacherId,
          status: ['new', 'displayed', 'saved_for_later'],
        });

    if (filter?.category) {
      cards = cards.filter((c) => c.category === filter.category);
    }
    if (filter?.priority) {
      cards = cards.filter((c) => c.priority === filter.priority);
    }
    if (filter?.query) {
      const q = filter.query.toLowerCase();
      cards = cards.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.category.includes(q) ||
          c.explanation.why.toLowerCase().includes(q),
      );
    }
    return this.priority.sort(cards);
  }

  /** Panel model: grouped by priority, newest first — UI-independent */
  getRecommendationPanel(sessionId: string) {
    const active = this.getRecommendations({ sessionId });
    return {
      active,
      grouped: this.priority.groupByPriority(active),
      /** Explicit non-intrusive contract for UI consumers */
      presentation: 'contextual_cards' as const,
      allowsModal: false as const,
    };
  }

  markDisplayed(recommendationId: string): RecommendationCard | { error: string } {
    return this.transition(recommendationId, 'displayed');
  }

  acceptRecommendation(
    recommendationId: string,
  ): RecommendationCard | { error: string } {
    const result = this.transition(recommendationId, 'accepted');
    if (!('error' in result)) {
      this.learning.update(result.teacherId, result.policyId, 'accepted');
      this.updateLearningModel(result.teacherId);
    }
    return result;
  }

  dismissRecommendation(
    recommendationId: string,
  ): RecommendationCard | { error: string } {
    const result = this.transition(recommendationId, 'dismissed');
    if (!('error' in result)) {
      this.learning.update(result.teacherId, result.policyId, 'dismissed');
      this.updateLearningModel(result.teacherId);
    }
    return result;
  }

  ignoreRecommendation(
    recommendationId: string,
  ): RecommendationCard | { error: string } {
    const result = this.transition(recommendationId, 'ignored');
    if (!('error' in result)) {
      this.learning.update(result.teacherId, result.policyId, 'ignored');
      this.updateLearningModel(result.teacherId);
    }
    return result;
  }

  saveForLater(
    recommendationId: string,
  ): RecommendationCard | { error: string } {
    return this.transition(recommendationId, 'saved_for_later');
  }

  explainRecommendation(recommendationId: string) {
    const card = this.registry.get(recommendationId);
    if (!card) return { error: 'Recommendation not found' as const };
    return {
      recommendationId: card.recommendationId,
      explanation: card.explanation,
      suggestedAction: card.suggestedAction,
      alternativeActions: card.alternativeActions,
      confidenceScore: card.confidenceScore,
      /** Blueprint remains untouched */
      blueprintMutated: false as const,
    };
  }

  updateLearningModel(teacherId: string) {
    return {
      teacherId,
      records: this.learning.list(teacherId),
      updatedAt: new Date().toISOString(),
    };
  }

  private transition(
    recommendationId: string,
    status: RecommendationCard['status'],
  ): RecommendationCard | { error: string } {
    const current = this.registry.get(recommendationId);
    if (!current) return { error: 'Recommendation not found' };
    const updated = this.registry.updateStatus(recommendationId, status);
    if ('error' in updated) return updated;
    this.history.record(current, current.status, status);
    return updated;
  }

  private expireStale(sessionId?: string): void {
    const cards = this.registry.list({
      sessionId,
      status: ['new', 'displayed', 'saved_for_later'],
    });
    const now = Date.now();
    for (const card of cards) {
      if (card.expiresAt && Date.parse(card.expiresAt) < now) {
        this.registry.updateStatus(card.recommendationId, 'expired');
        this.history.record(card, card.status, 'expired', 'ttl');
      }
    }
  }
}

export function createRecommendationEngine(
  options: CreateRecommendationEngineOptions = {},
): RecommendationEngine {
  return new RecommendationEngine(options);
}
