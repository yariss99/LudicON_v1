---
Status: Accepted
Date: 2026-07-28
ADR: ADR-002
Title: Execution Graph
---

# ADR-002 — Execution Graph

## Status

Accepted

## Context

Runtime must execute Core stages in a deterministic order without skipping mandatory engines.

## Decision

Default Core pipeline (`prima.core.default`):

```
Workflow → Context → Prompt Builder → AI → Validation → Repair? → Memory → Tools/Export?
```

- Prompt compilation is **mandatory** before AI.
- Validation is **mandatory** before Memory persistence of deliverables.
- Repair is conditional on rejection.
- Export is conditional on `readyToExport`.

## Alternatives Considered

1. Free-form DAG per request — deferred (complexity).
2. Optional Prompt step — rejected (AFPRR H1).

## Consequences

Honest pipeline; AI cannot invent prompts when Runtime path is used.

## Trade-offs

Less flexibility per call vs stronger guarantees.

## Future Impact

Additional pipelines may be registered; default remains the freeze baseline.

## Related Components

`@prima/runtime-orchestrator`, `@prima/composition`, `@prima/engine-prompt`.
