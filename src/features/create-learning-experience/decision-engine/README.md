# AI-002 — Pedagogical Decision Engine (MVP)

Rule-based. Deterministic. Isolated.

- Does **not** generate text
- Does **not** talk to the teacher
- Returns exactly **one** `PedagogicalDecision` per evaluation

```
Canvas Update → decidePedagogicalAction() → Conversation Engine verbalizes
```

## Files

| File | Role |
|------|------|
| `pedagogicalDecisionEngine.ts` | Public API + dev logging |
| `decisionRules.ts` | Ordered rules (first match wins) |
| `decisionEvaluator.ts` | Pure evaluator |
| `decisionTypes.ts` | Contracts |
| `index.ts` | Barrel |

## Tests

```bash
npm run test:ai002
```
