---
Status: Official — Engineering Specification ES-002
Version: 1.0
Owner: LUDI ON Engineering
Depends On: POSS, PAS, PDC, ES-001, AGR-001
Related Documents: COMPOSITION_ROOT.md, PAS_MODULE_PACKAGE_MAP.md
Last Updated: July 2026
---

# ES-002 — EOS Kernel

**Version:** 1.0  
**Status:** Official — Permanent execution foundation  
**Package:** `@prima/eos`  
**Contracts:** `@prima/contracts`  

> The EOS Kernel is ENG-00 runtime.  
> It orchestrates Engines. It never performs educational decisions or generates resources.

**AGR-001 conditions addressed in this delivery:** B-02 (workspace packages), B-04 (module map), B-05 (composition root), B-16 (honest status); B-03 deferred to follow-up CI (import conventions documented).

---

# 1. EOS Kernel Design

| Field | Content |
|-------|---------|
| **Mission** | Supervise Engine lifecycle, discovery, health, and execution coordination under POSS/PAS Policies |
| **Responsibilities** | Registry; lifecycle; discovery; startup/shutdown ordering; health; kernel events; failure isolation |
| **Non-responsibilities** | Pedagogy; Strategy; Blueprint; Generation; Approval; Knowledge truth; UI; persistence schemas |
| **Lifecycle** | Created → Configured → Starting → Running → Stopping → Stopped → Destroyed |
| **Dependencies** | `@prima/contracts` only (no Domain business aggregates required for Kernel runtime) |
| **Extension points** | `Engine` contract; `EngineDescriptor` registration; future Plugin registrar; `ConfigurationProvider`; event subscribers |
| **Future evolution** | Saga coordination for long Generation runs; Plugin Host registration; distributed health — without changing Kernel mission |

---

# 2–11. Detailed design

Implemented in code and summarized below. Normative behaviour lives in `@prima/contracts` + `@prima/eos`.

## Engine Registry

Register / remove / enable / disable / discover / resolve / validate / health / metadata / version / capabilities.

## Lifecycle

States: `unregistered` → `registered` → `initialized` → `configured` → `starting` → `running` ↔ `paused` → `stopping` → `stopped` → `shutting_down` → `shutdown` → `destroyed`, plus `failed` / `recovering`.

## Discovery

Manual registration (default). Automatic via descriptor providers. Plugin registration reserved (`RegistrationSource.plugin`). Version compatibility + capability matching.

## Execution

Startup: validate → topological order by declared engine dependencies → initialize → configure → start.  
Shutdown: reverse order stop → shutdown → optional destroy.  
Parallel startup: engines with no mutual edges may start concurrently after dependencies are running.  
Timeouts configurable per phase.

## Health

Aggregates per-engine status: availability, version, deps, init/runtime/recovery.

## Contracts

`Engine`, `EngineRegistry`, `LifecycleManager`, `HealthMonitor`, `KernelContext`, `ExecutionContext`, `ConfigurationProvider`, `ServiceLocator`.

## Errors

`RecoverableKernelError` vs `FatalKernelError`; retry policy; escalation via events; isolation (one Engine fail does not auto-destroy Kernel unless fatal policy).

## Kernel Events

See `KernelEventType` in `@prima/contracts`.

## Testing

Unit + lifecycle + failure recovery tests in `packages/eos`.

## Validation

Kernel has single responsibility (orchestration). Engines remain ignorant of each other. No business logic in Kernel.

---

# Diagrams

## Kernel architecture

```mermaid
flowchart TB
  K[EosKernel]
  R[EngineRegistry]
  L[LifecycleManager]
  H[HealthMonitor]
  E[EventBus]
  C[ConfigurationProvider]
  S[ServiceLocator]
  K --> R
  K --> L
  K --> H
  K --> E
  K --> C
  K --> S
  L --> R
  H --> R
  R -.registers.-> Eng[Engine instances]
  Eng -.do not know each other.-> Eng
```

## Engine lifecycle

```mermaid
stateDiagram-v2
  [*] --> registered
  registered --> initialized
  initialized --> configured
  configured --> starting
  starting --> running
  starting --> failed
  running --> paused
  paused --> running
  running --> stopping
  paused --> stopping
  stopping --> stopped
  stopped --> starting
  stopped --> shutting_down
  shutting_down --> shutdown
  shutdown --> registered
  shutdown --> destroyed
  running --> recovering
  failed --> recovering
  recovering --> running
  failed --> stopped
  destroyed --> [*]
```

## Startup flow

```mermaid
sequenceDiagram
  participant CR as Composition Root
  participant K as EosKernel
  participant R as Registry
  participant Eng as Engines
  CR->>K: register / registerDescriptor
  CR->>K: configure
  CR->>K: start
  K->>R: materializeDescriptors
  K->>R: validateAll
  K->>K: resolveStartupOrder
  loop dependency order
    K->>Eng: initialize
    K->>Eng: configure
  end
  loop start waves
    K->>Eng: start
  end
  K-->>CR: KernelStarted
```

## Shutdown flow

```mermaid
sequenceDiagram
  participant CR as Composition Root
  participant K as EosKernel
  participant Eng as Engines
  CR->>K: stop
  Note over K: reverse dependency order
  loop each engine
    K->>Eng: stop
    K->>Eng: shutdown
  end
  K-->>CR: KernelStopped
```

## Registration flow

```mermaid
flowchart LR
  M[Manual register] --> Reg[Registry]
  A[Automatic descriptor] --> Mat[materializeDescriptors]
  P[Plugin descriptor future] --> Mat
  Mat --> Reg
  Reg --> Val[validate]
  Val --> Ready[Enabled for startup]
```

## Dependency graph example

```mermaid
flowchart BT
  CTX[context]
  INT[intent]
  UND[understanding]
  STR[strategy]
  CTX --> INT
  CTX --> UND
  INT --> UND
  UND --> STR
```

---

# Error management

| Class | Behaviour |
|-------|-----------|
| RecoverableKernelError | Retry per policy; Engine → failed → retry start from configured |
| FatalKernelError | Fail Kernel start when `failKernelOnFatalEngineError` (default) |
| Isolation | One Engine failure during stop does not skip remaining Engines |
| Escalation | `EngineFailed` / `KernelFailed` / `KernelDegraded` events |
| Graceful shutdown | reverse-order stop → shutdown |

---

# Testing strategy

| Layer | Location |
|-------|----------|
| Unit | dependency order, version compare, registry |
| Lifecycle / integration | `packages/eos/src/tests/kernel.test.ts` |
| Failure recovery | retry start test |
| Compatibility | SemVer discovery filter |
| Stress | deferred (later ES) — Kernel API stable for load harnesses |

Run: `npm run test:eos`

---

# Architecture validation

| Criterion | Result |
|-----------|--------|
| Single responsibility | Pass — orchestration only |
| Replaceability | Pass — `createEosKernel` + contracts |
| Engine isolation | Pass — no peer APIs |
| Plugin support | Pass — `RegistrationSource.plugin` + descriptors |
| Scalability | Pass — parallel start waves |
| Maintainability | Pass — small modules |
| Cloud readiness | Pass — no vendor coupling |
