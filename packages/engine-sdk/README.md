# @prima/engine-sdk

**Purpose:** Mandatory Engine SDK — `BasePrimaEngine` + contract tests for every PRIMA Engine.  
**Owner:** EOS / Engine maintainers  
**PAS mapping:** L3 Engine  

**Allowed dependencies:** `@prima/contracts` only.  
**Forbidden:** Peer Engine imports; Domain pedagogy inside the SDK; Infrastructure SDKs.

```ts
import { BasePrimaEngine } from '@prima/engine-sdk';

export class ContextEngine extends BasePrimaEngine {
  getConfigurationSchema() {
    return { keys: [{ key: 'strict', required: true }] };
  }
  protected async onInitialize() {}
  protected async onConfigure() {}
  protected async onStart() {}
}
```

Register instances with EOS Kernel (`createEosKernel().register(engine)`).

Spec: `docs/engineering/ES-006_ENGINE_SDK.md`.
