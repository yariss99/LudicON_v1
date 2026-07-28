---
Status: Official — AFPRR v1.1 Precheck
Version: 1.0
Owner: Chief Software Architect
Depends On: AFPRR_PRIMA_CORE_V1.md, docs/architecture/adr/*
Date: 2026-07-28
---

# AFPRR v1.1 Precheck — Stabilization Sprint Report

## Recommendation for AFPRR v1.1

**Proceed to AFPRR v1.1 audit.** Stabilization sprint resolved declared blockers H1–H5 (and original H2 stub-default / H3 adapters via Composition Root).

Estimated scores after stabilization (pending independent re-audit):

| Score | AFPRR v1 | Precheck estimate |
|-------|----------|-------------------|
| Architecture | 47 | **72–78** |
| Production readiness | 34 | **65–72** |
| Likely certification | NOT READY | **CERTIFIED WITH RECOMMENDATIONS** (if re-audit confirms) |

---

## Resolved blockers

| ID | Blocker | Resolution | Evidence |
|----|---------|------------|----------|
| H1 | Prompt Builder missing | `@prima/engine-prompt` (P-C-005) + Runtime `prompt.compile` adapter | `packages/engines/prompt`, composition adapters |
| H2 | Stub-default composition | Fail-closed Composition Root; `createRuntimeBridge` defaults to **no stubs**; `useStubs: true` explicit / refused in composition | `packages/composition`, `core-kernel/src/runtime/runtime-bridge.ts` |
| H3 | Dual kernel | ADR-007: Core Kernel = platform bootstrap; EOS = ENG-00 constitutional supervisor; Composition wires Core | `docs/architecture/adr/ADR-007_CORE_KERNEL.md` |
| H4 | Fragmented contracts | Canonical Core DTOs in `@prima/contracts` (`prima-core-runtime.ts` schema 1.0.0) | `packages/contracts/src/prima-core-runtime.ts` |
| H5 | Missing ADRs | ADR-001…008 accepted under `docs/architecture/adr/` | ADR index |

Also delivered:

- Real `RuntimeEnginePort` adapters for workflow/context/prompt/ai/validation/memory/tools
- AI Orchestrator `compiledPrompt` gate (no Runtime bypass)
- Integration tests proving full pipeline + prompt-before-AI ordering
- Contract serialization compatibility tests

---

## Updated dependency graph

```
@prima/contracts
      ↑
@prima/engine-prompt
@prima/eos ───────────────────── (ENG-00; unchanged deps)
@prima/runtime-orchestrator
      ↑
@prima/core-kernel
      ↑
@prima/composition ←── workflow, context, prompt, ai, validation, memory, tools, runtime, core-kernel, contracts, eos
```

No engine↔engine imports. Composition is the sole production wiring package.

---

## Updated contract map

Canonical (`@prima/contracts` / `prima-core-runtime`):

- WorkflowContext, ExecutionContext, ContextSnapshot
- PromptPackage, PromptResult, PromptAstNode
- ValidationReport, ValidationSummary, AiOutputValidationReport
- MemorySnapshot, ToolExecutionResult, RuntimeExecution, ArtifactMetadata

Schema version: **1.0.0**

---

## Updated runtime diagram

```
Composition Root
  → Core Kernel.start()
  → RuntimeOrchestrator.execute()
       Workflow → Context → Prompt Builder → AI → Validation → Repair? → Memory → Tools?
```

Prompt compilation is mandatory; AI adapter fails closed without `compiledPrompt`.

---

## Remaining issues / technical debt

| Item | Priority | Notes |
|------|----------|-------|
| Local engine types not fully deleted/aliased to contracts | Medium | Validation/Context still have local shapes; Composition maps to canonical |
| Memory PS-002 dual surface still in same package | Medium | ADR-005 documents Runtime uses structured engine |
| Tool builtins are deterministic handlers (not cloud exporters) | Low | Real ToolEngine path; infra swap later |
| EOS not yet hosting Core ports as BasePrimaEngine | Medium | ADR-007 accepts split roles |
| Observability exporters (OTel) | Medium | Still in-process |
| Secret vault | Medium | Transport injection only |
| Package CHANGELOGs / Known Limitations | Low | Still incomplete vs AFPRR docs checklist |
| Context `ValidationReport` local name | Low | Rename debt |

---

## Architecture improvements

1. Honest production Composition Root
2. Mandatory Prompt Builder
3. Canonical contract schema
4. Documented single platform bootstrap kernel + constitutional EOS
5. Fail-closed stub policy
6. Full ADR freeze set

---

## Production readiness estimate

Operable as an **integrated in-process Core** with injected `CompletionTransport`. Not yet a multi-node/cloud production deployment (persistence adapters, secret vault, metrics exporters remain debt).

---

## Test commands

```bash
npm run test:prompt
npm run test:composition
npm run test:contracts
npm run test:core-kernel
npm run test:runtime
```

---

## AFPRR v1.1 entry criteria checklist

- [x] Prompt Builder package exists and is on default pipeline
- [x] Production path does not default to Runtime stubs
- [x] Canonical contracts published in `@prima/contracts`
- [x] Dual-kernel ADR accepted
- [x] ADR-001…008 present
- [x] Integration test runs real adapters end-to-end
- [ ] Independent auditor re-scores (this precheck is not the certification)

**Precheck owner recommendation:** Schedule AFPRR v1.1 immediately.
