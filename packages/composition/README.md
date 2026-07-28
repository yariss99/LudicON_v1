# @prima/composition

**Production Composition Root** for PRIMA Core (AFPRR H2 / H3 / H7).

## Rules

- Registers **real** engine adapters only
- **Refuse stubs** (`useStubs: true` throws)
- Requires `CompletionTransport` (fail-closed)
- Mandatory Prompt Builder before AI

## Usage

```ts
import {
  createProductionComposition,
  createDeterministicCompletionTransport,
} from '@prima/composition';

const composition = createProductionComposition({
  completionTransport: myProviderTransport, // required
});

await composition.start();
const result = await composition.execute({
  workflowKind: 'create-lesson',
  teacherId: 't-1',
  projectId: 'p-1',
  intent: 'Draft a lesson',
  educationalContext: { subject: 'Matematică', topic: 'Fracții' },
});
await composition.stop();
```

## Kernel roles

See ADR-007: `@prima/core-kernel` is the **platform bootstrap kernel**; `@prima/eos` remains the **constitutional ENG-00** supervisor for PAS `Engine` contracts. Composition Root starts Core Kernel and wires Runtime ports.

## Test

```bash
npm run test:composition
```
