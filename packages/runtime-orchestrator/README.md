# @prima/runtime-orchestrator

**Runtime Orchestrator** — central coordinator of PRIMA Core.

It does **not** execute educational business logic.  
It **mediates** registered engines through declarative pipelines.

## Engines (ports)

| Port id | Typical package |
|---------|-----------------|
| `workflow` | `@prima/engine-workflow` |
| `context` | `@prima/engine-context` |
| `prompt` | Prompt builder / AI request assembly |
| `ai` | `@prima/ai-orchestrator` |
| `validation` | `@prima/engine-validation` |
| `memory` | `@prima/engine-memory` |
| `tools` | `@prima/engine-tools` |

Engines register dynamically via `registerEngine`. No hardcoded package imports.

## Default pipeline

```
Request
  → Workflow
  → Context
  → Prompt
  → AI
  → Validation
  → Repair (conditional)
  → Memory
  → Tools/Export (conditional)
  → Result
```

## Features

- Sequential & parallel steps (`parallelGroup`)
- Conditional steps (`when`)
- Per-step retry, timeout, cancellation
- Failure modes: `abort` | `continue` | `rollback` (bag snapshot)
- Runtime event bus (`WorkflowStarted`, `AICompleted`, `ValidationPassed`, …)
- Structured logging (`RuntimeLogger` / injectable sink)
- Observability (timings, cost, tokens, failures)

## Quick start (unit tests only)

```ts
import {
  createRuntimeOrchestrator,
  registerCoreStubs,
} from '@prima/runtime-orchestrator';

// Explicit stubs — NEVER the production path (AFPRR H2).
const runtime = createRuntimeOrchestrator();
registerCoreStubs((e) => runtime.registerEngine(e));
```

## Production

Use `@prima/composition` `createProductionComposition` — real engines, mandatory Prompt Builder, fail-closed transport.


## Composition root

Wire real engines with thin `RuntimeEnginePort` adapters (see `src/examples/integration-example.ts`).  
EOS Kernel (`@prima/eos`) remains responsible for process lifecycle; this package owns **execution pipelines**.

## Test

```bash
npm run test:runtime
```
