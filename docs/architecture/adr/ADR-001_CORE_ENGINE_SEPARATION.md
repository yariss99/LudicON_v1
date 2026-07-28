---
Status: Accepted
Date: 2026-07-28
ADR: ADR-001
Title: Core Engine Separation
---

# ADR-001 — Core Engine Separation

## Status

Accepted

## Context

AFPRR v1 found Core engines implemented as isolated packages but without a shared boundary policy. Engines must not call each other directly, and Runtime must coordinate via ports.

## Decision

Each Core concern is a separate package with a single responsibility:

| ID | Package | Responsibility |
|----|---------|----------------|
| P-C-002 | `@prima/engine-workflow` | Workflow FSM |
| P-C-003 | `@prima/ai-orchestrator` | Sole AI provider gateway |
| P-C-004 | `@prima/engine-context` | Session context platform |
| P-C-005 | `@prima/engine-prompt` | Prompt compilation |
| P-C-006 | `@prima/engine-validation` | Artifact publication gate |
| P-C-007 | `@prima/engine-memory` | Structured educational memory |
| P-C-008 | `@prima/engine-tools` | Capability execution |
| P-C-009 | `@prima/runtime-orchestrator` | Pipeline coordination |
| P-C-010 | `@prima/core-kernel` | Platform bootstrap |

Engines communicate only through `@prima/composition` adapters and `@prima/contracts` DTOs.

## Alternatives Considered

1. Monolithic Core package — rejected (poor isolation).
2. Engines importing peer engines — rejected (layer violation).

## Consequences

- Clear ownership and testability.
- Requires Composition Root for wiring.
- Slight adapter boilerplate.

## Trade-offs

More packages vs stronger boundaries.

## Future Impact

New engines register as Runtime ports; no peer imports.

## Related Components

All P-C-001…P-C-010 packages; `@prima/composition`.
