# @prima/engine-context

**Purpose:** Context Engine (ENG-01 / PS-003) — single source of runtime context.  
**PAS mapping:** L3 / ENG-01  

**Forbidden:** Pedagogical decisions; educational asset generation; inventing school/curriculum facts; peer Engine internals.

Context is **dynamic working reality**. Knowledge is permanent. Memory is persistent.

```ts
import { createContextPlatform } from '@prima/engine-context';

const ctx = createContextPlatform({
  knowledge: { listInstalledPacks: () => [{ packId: 'ro-primary', version: '1.0.0' }] },
  memory: { getTeacherProfileRef: (id) => `profile:${id}` },
});

const snap = ctx.initialize({
  sessionId: 'sess-1',
  teacherId: 'teacher-1',
  activeScreen: 'desk',
});

ctx.subscribe({
  sessionId: 'sess-1',
  domains: ['blueprint'],
  handler: (event, snapshot) => {
    // event-driven — no polling
  },
});

ctx.publish('BlueprintChanged', 'sess-1', {
  blueprintId: 'bp-1',
  currentVersion: '1',
  approvalStatus: 'draft',
  completedSections: ['objectives'],
});

ctx.getCurrentContext('sess-1');
ctx.getBlueprintContext('sess-1');
```

## Lifecycle

`Initialize → Update → Validate → Distribute → Expire → Archive`

## Services

| Service | Role |
|---------|------|
| `ContextRegistry` | Single active context per session |
| `ContextAggregator` | Patch only affected domains |
| `ContextPublisher` | Validate + distribute snapshots |
| `ContextSubscriber` | Domain/event filtered handlers |
| `SessionManager` | Navigation / workflow survival |
| `EventDispatcher` | Event queue (no polling) |
| `ContextValidator` | Structural consistency |

Normative model: `docs/engineering/ES-007_CONTEXT_MODEL.md` (CO-01 Working Context).
