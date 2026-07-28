# @prima/engine-validation

**Mandatory Validation Engine** — no AI-generated artifact reaches the teacher without this gate.

Distinct from `@prima/engine-quality` (pedagogical quality review) and from conversation-time decision validation in `src/engines/validation`.

## Principles

| Principle | Enforcement |
|-----------|-------------|
| Validation before delivery | `isDeliverableToTeacher(report)` |
| One concern per validator | Strategy validators in registry |
| Deterministic | Pure rules + same input → same result |
| Explainable | Every failure has `message` + `recommendation` |
| Recoverable | `RepairEngine` (metadata/schema only; never invents curriculum) |

## Pipeline

```
Artifact → Profile → Validators (rules) → Aggregate → Score → Repair? → Approve/Reject
```

**Publication policy:** only **CRITICAL** severities block delivery (plus optional `minScore`).

## Profiles

`Draft` · `InternalReview` · `Publication` · `Export` · `AIDebug`

## Validators

schema · curriculum · competency · learning-objective · pedagogical · accessibility · language · formatting · safety · duplicate · consistency · ai-output · reference

## Rules

Externalized in `src/rules/default-rules.ts` and `rules/default-rules.json`.  
Register more via `RuleEngine.registerProvider` (JSON / YAML / TS providers).

## Integration

| System | Hook |
|--------|------|
| AI Orchestrator | Validate `structuredResult` before teacher UI |
| Workflow Engine | `ValidationPassed` / `ValidationFailed` from report |
| Context Engine | Supply `expectedSubject` / `expectedGrade` / curriculum |
| Memory / Export | Use `Export` profile before package leave |

```ts
import {
  createValidationEngine,
  isDeliverableToTeacher,
} from '@prima/engine-validation';

const engine = createValidationEngine();
const report = await engine.validate(artifact, { profileId: 'Publication' });
if (!isDeliverableToTeacher(report)) {
  // workflow.dispatch(id, 'ValidationFailed', teacher)
}
```

## Test

```bash
npm run test:validation-engine
```
