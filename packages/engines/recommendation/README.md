# @prima/engine-recommendation

**Purpose:** Recommendation Engine (PS-004) — contextual, explainable, optional suggestions.  
**Role:** Observe → analyze → recommend. Never decide. Never mutate Blueprints.

```ts
import { createRecommendationEngine } from '@prima/engine-recommendation';

const engine = createRecommendationEngine(); // loads external default policies

engine.dispatcher.subscribe((cards) => {
  // Non-intrusive contextual cards — never modals
});

const cards = engine.evaluatePolicies({
  sessionId: 'sess-1',
  teacherId: 'teacher-1',
  trigger: 'BlueprintUpdated',
  blueprint: {
    objectives: [{ id: 'O3', title: 'Identify unit fractions', hasAssessment: false }],
  },
});

engine.explainRecommendation(cards[0].recommendationId);
engine.acceptRecommendation(cards[0].recommendationId); // teacher decision only
```

## Principles

| Rule | Meaning |
|------|---------|
| Optional | Teacher always decides |
| Explainable | why / improves / impact / related section |
| External policies | Rules are configuration, not UI code |
| Adaptive | Suppress repeatedly dismissed/ignored policies |
| Non-intrusive | `presentation: 'contextual_cards'`, `allowsModal: false` |

## Services

`RecommendationEngine` · `RecommendationRegistry` · `RecommendationPolicyEngine` · `RecommendationEvaluator` · `PriorityCalculator` · `RecommendationExplainer` · `RecommendationHistory` · `RecommendationLearning` · `RecommendationDispatcher`

Policies: `src/policies/default-policies.ts`
