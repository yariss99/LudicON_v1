# @prima/engine-workflow

Generic **Workflow Engine & State Machine** for PRIMA.

Controls every teacher workflow (lesson, worksheet, quiz, story, presentation, …)
through one shared transition table. Workflow *kinds* are metadata only — the engine
never branches on lesson vs quiz logic.

## Principles

- Single source of truth per `WorkflowSessionSnapshot`
- Explicit, table-driven transitions (`WORKFLOW_TRANSITIONS`)
- Event-driven `dispatch` + `subscribe`
- Recoverable via `rollback` / `restore`
- Immutable transition history
- **AI cannot dispatch** state changes (`AI_FORBIDDEN`)
- Teacher (or system after teacher approval) completes work

## Install (workspace)

```bash
npm install
npm run build -w @prima/engine-workflow
npm run test -w @prima/engine-workflow
```

## Quick start

```ts
import {
  createWorkflowEngine,
  LESSON_CREATION_WORKFLOW,
} from '@prima/engine-workflow';

const engine = createWorkflowEngine();
const teacher = { role: 'teacher' as const, id: 't-1' };

const session = engine.startWorkflow({
  definition: LESSON_CREATION_WORKFLOW,
  teacher: { teacherId: 't-1' },
  actor: teacher,
});

engine.dispatch(session.workflowId, 'LoadContext', teacher);
engine.dispatch(session.workflowId, 'PlanningCompleted', {
  role: 'system',
  id: 'planner',
});
// … Generate → GenerationCompleted → ValidationPassed → Reviewing
// Teacher confirms: ValidationPassed → Ready → Publish → Complete
```

## Folder structure

```
packages/engines/workflow/
  package.json
  tsconfig.json
  README.md
  src/
    types.ts              # WorkflowState, Event, Context, History, …
    transition-map.ts     # Legal edges
    history.ts            # Immutable history append
    session.ts            # WorkflowSession
    errors.ts
    workflow-engine.ts    # WorkflowEngine API
    examples.ts           # Example WorkflowDefinition kinds
    store-bind.ts         # Optional UI store projection (Zustand-ready)
    index.ts
    tests/workflow-engine.test.ts
```

## API

| Method | Purpose |
|--------|---------|
| `startWorkflow` | Create session (Idle → Initializing by default) |
| `dispatch` | Apply event if legal |
| `getCurrentState` | Current state |
| `getAvailableActions` | Legal events (+ Restore when history exists) |
| `rollback` | Undo last transition via Restore entry |
| `restore` | Jump to history index |
| `complete` | Teacher/system completion from Ready/Publishing |
| `subscribe` | Observe transitions |

Invalid transitions throw `WorkflowEngineError` with code `INVALID_TRANSITION`
(e.g. `Completed` + `Generate`).

## Workflow catalog

Product workflows (Create Lesson, Adapt Lesson, Publish Resource, …) live in `src/catalog/`.
See [`docs/WORKFLOW_CATALOG.md`](./docs/WORKFLOW_CATALOG.md).

```ts
import {
  createDefaultWorkflowRegistry,
  createWorkflowEngine,
} from '@prima/engine-workflow';

const registry = createDefaultWorkflowRegistry();
const engine = createWorkflowEngine();
engine.startWorkflow({
  definition: registry.toEngineDefinition('create-lesson'),
  teacher: { teacherId: 't-1' },
  actor: { role: 'teacher', id: 't-1' },
});
```

