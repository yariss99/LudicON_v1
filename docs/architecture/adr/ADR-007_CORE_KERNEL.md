---
Status: Accepted
Date: 2026-07-28
ADR: ADR-007
Title: Core Kernel Architecture
---

# ADR-007 — Core Kernel Architecture

## Status

Accepted

## Context

AFPRR v1 identified dual kernels: `@prima/eos` (ENG-00) and `@prima/core-kernel` (platform bootstrap), overlapping lifecycle/DI/health without an ADR.

## Decision

**There is one platform bootstrap kernel for PRIMA Core product startup:** `@prima/core-kernel`.

**There is one constitutional Engine supervisor for PAS ENG-00 contracts:** `@prima/eos`.

| Concern | Owner |
|---------|-------|
| Load config, feature flags, Core diagnostics, start Runtime | `@prima/core-kernel` |
| Register/start/stop PAS `Engine` / `BasePrimaEngine` instances | `@prima/eos` |
| Execution pipelines across Core ports | `@prima/runtime-orchestrator` |
| Wire real adapters + fail-closed production | `@prima/composition` |

Overlap removed by policy:

- Core Kernel does **not** re-implement EOS Engine contract lifecycle for PAS engines.
- EOS does **not** own Runtime pipelines or Prompt/AI Core ports.
- Composition Root is the only production wiring point.

## Alternatives Considered

1. Delete Core Kernel; use EOS only — rejected (EOS forbids Core package deps; Runtime ports are not EOS Engines yet).
2. Delete EOS; use Core Kernel only — rejected (breaks ES-002 / PAS ENG-00).
3. Merge packages — deferred (high risk); roles split instead.

## Consequences

Clear dual-role documentation; Composition Root starts Core Kernel; EOS remains available for constitutional engines (e.g. Knowledge).

## Trade-offs

Two kernel packages remain, but with non-overlapping missions.

## Future Impact

Optional future: Core Kernel may *host* an EosKernel instance for PAS engines without duplicating registries.

## Related Components

`@prima/core-kernel`, `@prima/eos`, `@prima/composition`, ES-002.
