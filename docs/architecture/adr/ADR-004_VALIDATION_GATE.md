---
Status: Accepted
Date: 2026-07-28
ADR: ADR-004
Title: Validation Gate
---

# ADR-004 — Validation Gate

## Status

Accepted

## Context

Multiple “validation” concepts existed (artifact gate, AI output check, conversation decision, quality review).

## Decision

- **Publication gate** = `@prima/engine-validation` producing canonical `ValidationReport` / `ValidationSummary` (`@prima/contracts`).
- **AI output check** = `AiOutputValidationReport` (AI Orchestrator only) — different type name.
- Conversation/quality validators remain outside Core Runtime freeze scope but must not reuse `ValidationReport` name for incompatible shapes going forward.

CRITICAL findings block Publication/Export deliverability.

## Alternatives Considered

1. One mega-validator — rejected (mixed authorities).
2. Keep colliding `ValidationReport` names — rejected (AFPRR H4).

## Consequences

Composition maps engine reports into canonical contracts before bag persistence.

## Trade-offs

Mapping layer vs immediate full rewrite of all local types.

## Future Impact

Local engine types should re-export or alias contracts in a follow-up debt sprint.

## Related Components

`@prima/engine-validation`, `@prima/contracts`, `@prima/composition`.
