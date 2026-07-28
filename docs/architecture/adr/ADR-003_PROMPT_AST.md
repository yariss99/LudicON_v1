---
Status: Accepted
Date: 2026-07-28
ADR: ADR-003
Title: Prompt AST
---

# ADR-003 — Prompt AST

## Status

Accepted

## Context

Prompt construction was embedded in AI Orchestrator (`PromptDispatcher`) and Runtime stubs, violating single-compiler ownership.

## Decision

`@prima/engine-prompt` owns compilation to canonical `PromptPackage` / `PromptResult` / `PromptAstNode` in `@prima/contracts` (schema 1.0.0).

AST node kinds: `system` | `user` | `section` | `variable`.

AI Orchestrator accepts `compiledPrompt` and **must not** rebuild prompts on the Runtime path when the package is present.

## Alternatives Considered

1. Keep PromptDispatcher as sole builder — rejected (missing P-C-005).
2. Provider-specific prompt templates in apps — rejected (bypass risk).

## Consequences

Mandatory Prompt step; clearer audit of what was sent to providers.

## Trade-offs

Extra pipeline stage latency vs determinism and governance.

## Future Impact

Prompt AST can evolve with versioned schema without changing AI providers.

## Related Components

`@prima/engine-prompt`, `@prima/contracts`, `@prima/ai-orchestrator`.
