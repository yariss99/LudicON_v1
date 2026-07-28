---
Status: Accepted
Date: 2026-07-28
ADR: ADR-006
Title: Capability Architecture
---

# ADR-006 — Capability Architecture

## Status

Accepted

## Context

External side-effects (export, translate, search) must not be hard-wired into workflows.

## Decision

`@prima/engine-tools` provides capability aliases (`export.pdf`, …) resolved to tool handlers behind permissions + sandbox policy.

Canonical result DTO: `ToolExecutionResult` (`@prima/contracts`).

Workflows/Runtime call capabilities, never vendor SDKs.

## Alternatives Considered

1. Direct SDK calls from engines — rejected.
2. One tool per workflow hardcode — rejected (inflexible).

## Consequences

Replaceable exporters; sandbox policy enforced at Tool Engine.

## Trade-offs

Builtin handlers may remain deterministic placeholders until infra adapters land — but they are real ToolEngine registrations, not Runtime stubs.

## Future Impact

Infrastructure adapters swap handlers without pipeline changes.

## Related Components

`@prima/engine-tools`, `@prima/composition`.
