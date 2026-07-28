---
Status: Accepted
Date: 2026-07-28
ADR: ADR-008
Title: Architecture Freeze Policy
---

# ADR-008 — Architecture Freeze Policy

## Status

Accepted

## Context

AFPRR v1 returned NOT READY. Stabilization sprint targets AFPRR v1.1 certification.

## Decision

Architecture Freeze for PRIMA Core v1.0 requires:

1. Prompt Builder integrated and mandatory in default pipeline
2. Production Composition Root with no default stubs
3. Canonical Core contracts in `@prima/contracts` schema 1.0.0
4. ADR-001…007 accepted
5. Runtime integration proof with real adapters
6. Fail-closed startup when required engines/transport missing

After Freeze:

- No new Core engines without ADR
- No duplicate shared DTOs
- No silent stub fallbacks in production paths

## Alternatives Considered

1. Soft freeze with stubs allowed — rejected.
2. Freeze only libraries, not Runtime — rejected (incomplete Core).

## Consequences

AFPRR v1.1 can certify Ready when precheck gates pass.

## Trade-offs

Slower feature velocity vs architectural honesty.

## Future Impact

Phase II builds on frozen Core contracts and Composition Root.

## Related Components

`docs/engineering/AFPRR_PRIMA_CORE_V1.md`, `docs/engineering/AFPRR_v1_1_PRECHECK.md`.
