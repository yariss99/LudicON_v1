# @prima/command-bus

**Purpose:** CQRS Command Bus — validate, authorize, dispatch to exactly one handler.  
**Owner:** Application / Platform  
**PAS mapping:** L1 Application write pipeline  

**Allowed dependencies:** `@prima/contracts` (and Event Bus at composition root).  
**Forbidden:** Domain rule bodies inside the bus; handler-to-handler calls; UI; Infrastructure SDKs.

```ts
import { createCommandBus, createAllowAllAuthorizer } from '@prima/command-bus';
import { createEventBus } from '@prima/event-bus';

const eventBus = createEventBus();
const commands = createCommandBus({ eventBus });
commands.registerAuthorizer(createAllowAllAuthorizer()); // replace with Teacher Authority in production
commands.registerHandler({
  commandType: 'ApproveBlueprint',
  async handle(cmd, ctx) {
    await ctx.publishDomainEvent('BlueprintApproved', cmd.payload);
    return { ok: true };
  },
});

const result = await commands.dispatch({
  commandType: 'ApproveBlueprint',
  source: 'teacher-workspace',
  payload: { blueprintId: 'bp-1' },
});
```

Spec: `docs/engineering/ES-004_COMMAND_BUS.md`.
