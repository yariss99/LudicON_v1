# @prima/eos

**Purpose:** EOS Kernel (ENG-00) — Engine registry, lifecycle, discovery, health, execution coordination.  
**Owner:** EOS Maintainers  
**PAS mapping:** L2 / MOD-00  

**Allowed dependencies:** `@prima/contracts` only.  
**Forbidden:** UI, Domain pedagogy, Engine peer imports, Infrastructure adapters, educational decisions, resource generation.

## Usage

```ts
import { createEosKernel } from '@prima/eos';

const kernel = createEosKernel({ kernelId: 'prima-eos' });
kernel.register(myEngine);
await kernel.configure();
await kernel.start();
// ...
await kernel.stop();
```

Composition root: see `docs/engineering/COMPOSITION_ROOT.md`.  
Spec: `docs/engineering/ES-002_EOS_KERNEL.md`.
