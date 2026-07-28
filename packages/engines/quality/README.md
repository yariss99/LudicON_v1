# @prima/engine-quality

**Purpose:** Quality Engine (PS-005) — explainable pedagogical review authority.  
**Forbidden:** Generating educational content; rewriting Blueprints; blocking teacher creativity.

```ts
import { createQualityEngine } from '@prima/engine-quality';

const quality = createQualityEngine(); // external policies + configurable scoring

const report = quality.evaluateBlueprint({
  blueprintId: 'bp-1',
  teacherId: 'teacher-1',
  objectives: [
    { id: 'O1', title: 'Identify fractions', activityIds: ['A1'], assessmentIds: ['S1'] },
  ],
  activities: [{ id: 'A1', title: 'Tiles', durationMinutes: 15, differentiated: true }],
  assessments: [{ id: 'S1', title: 'Exit ticket', strategy: 'formative' }],
  hasDifferentiation: true,
  hasAccessibility: true,
});

quality.explainScore('blueprint', 'bp-1', 'assessment_alignment');
quality.getQualityPanel('blueprint', 'bp-1');
```

## Principles

| Rule | Meaning |
|------|---------|
| Explainable | Every score has why / evidence / policies / how to improve |
| External policies | `src/policies/default-policies.ts` |
| Configurable scoring | Weights & bands via `ScoringModelConfig` |
| Incremental | Only affected dimensions recalculated per trigger |
| Teacher decides | Advisory panel; never auto-rewrites |

## Services

`QualityEngine` · `QualityPolicyEngine` · `QualityEvaluator` · `QualityScorer` · `EvidenceCollector` · `DimensionAnalyzer` · `TrendAnalyzer` · `QualityHistory` · `QualityExplainer` · `EvaluationQueue`
