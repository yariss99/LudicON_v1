---
Status: Accepted
Date: 2026-07-28
ADR: ADR-005
Title: Educational Memory Graph
---

# ADR-005 — Educational Memory Graph

## Status

Accepted

## Context

`@prima/engine-memory` exposes PS-002 personalization and structured Core memory. Runtime needs one persistence contract for pipeline artifacts.

## Decision

For Core Runtime freeze:

- Structured `MemoryEngine` is the Runtime persistence surface.
- Canonical DTO: `MemorySnapshot` in `@prima/contracts`.
- PS-002 remains available for teacher personalization features but is **not** the default Runtime port.

## Alternatives Considered

1. Dual-write both surfaces — rejected (privacy/consistency risk).
2. Delete PS-002 — deferred (product still uses it).

## Consequences

Clear Runtime contract; PS-002 coexistence documented.

## Trade-offs

Two APIs in one package remain until a later split.

## Future Impact

Optional package split: `@prima/engine-memory-core` vs `@prima/engine-memory-personalization`.

## Related Components

`@prima/engine-memory`, `@prima/composition`, `@prima/contracts`.
