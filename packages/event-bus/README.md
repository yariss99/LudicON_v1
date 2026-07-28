# @prima/event-bus

**Purpose:** PRIMA Event Bus — immutable event transport (ES-003).  
**Owner:** Platform Engineering  
**PAS mapping:** Integration / messaging backbone (L5 ports + L6 in-memory adapter)

**Allowed dependencies:** `@prima/contracts` only.  
**Forbidden:** Domain business rules, Engine pedagogy, UI, concrete cloud SDKs.

```ts
import { createEventBus } from '@prima/event-bus';

const bus = createEventBus();
bus.subscribe((e) => { /* ... */ }, { filter: { patterns: ['Domain.*'] } });
await bus.publishAsync({
  eventType: 'Domain.Example',
  category: 'domain',
  source: 'example',
  payload: {},
});
```

Spec: `docs/engineering/ES-003_EVENT_BUS.md`.
