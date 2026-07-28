# @prima/core-kernel

**PRIMA Core Kernel** — single entry point that bootstraps PRIMA Core.

It initializes configuration, DI, engine discovery/lifecycle, health, diagnostics, and starts the Runtime Orchestrator.

It does **not** execute educational business logic.

## Relationship to other packages

| Package | Role |
|---------|------|
| `@prima/core-kernel` | **Platform bootstrap entry** (this package) |
| `@prima/eos` | PAS ENG-00 constitutional Engine supervisor (process/engine contract lifecycle) |
| `@prima/runtime-orchestrator` | Execution pipelines across Core engine ports |

```
createPrimaCoreKernel()
  → Load / validate config
  → DI container
  → Discover / register / initialize engines
  → Health checks
  → Start Runtime Orchestrator
  → Platform Ready
```

## Boot process

1. Load Configuration  
2. Validate Configuration  
3. Initialize Dependency Container  
4. Discover Engines  
5. Register Engines  
6. Resolve Dependencies  
7. Initialize Engines  
8. Run Health Checks  
9. Start Runtime  
10. Platform Ready  

## Quick start

```ts
import { createPrimaCoreKernel } from '@prima/core-kernel';
import { createProductionComposition, createDeterministicCompletionTransport } from '@prima/composition';

// Production / integration: Composition Root (real engines)
const composition = createProductionComposition({
  completionTransport: createDeterministicCompletionTransport(),
});
await composition.start();
```

Isolated Core Kernel unit tests may pass an explicit `createRuntimeBridge({ useStubs: true })` — never the default.


## Configuration

Supports environment + overrides for:

- Platform / environment  
- Feature flags (`PRIMA_FEATURE_*`)  
- Experimental flags (`PRIMA_EXPERIMENTAL_*`)  
- Engine & provider config  
- Localization, logging, security  

## Engine lifecycle

`Discovered → Registered → Configured → Initialized → Ready → Running → Paused → Stopping → Stopped`

## Platform events

`PlatformStarting`, `PlatformReady`, `PlatformStopping`, `PlatformStopped`,  
`EngineRegistered`, `EngineInitialized`, `EngineFailed`,  
`HealthChanged`, `ConfigurationReloaded`

## Test

```bash
npm run test:core-kernel
```
